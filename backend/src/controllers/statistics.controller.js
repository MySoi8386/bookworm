/**
 * ===================================================================
 * CONTROLLER: THỐNG KÊ BÁO CÁO (Statistics Controller)
 * ===================================================================
 * Xử lý các API thống kê và báo cáo:
 * - Dashboard tổng quan
 * - Sách quá hạn
 * - Sách mượn nhiều
 * - Phiếu nhắc trả hàng tuần
 * - Báo cáo 6 tháng
 * ===================================================================
 */

const {
    Book, BookCopy, BookEdition, BorrowRequest, BorrowDetail,
    Reader, LibraryCard, Fine, Reminder, Field, Genre, Author,
    sequelize
} = require('../models');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');
const { fineRatePercent } = require('../config/auth');
const { Op } = require('sequelize');

// ===================================================================
// DASHBOARD & STATISTICS
// ===================================================================

/**
 * @desc    Lấy thống kê tổng quan cho dashboard
 * @route   GET /api/statistics/dashboard
 * @access  Admin, Librarian
 */
const getDashboardStats = asyncHandler(async (req, res) => {
    // Tổng số đầu sách
    const totalBooks = await Book.count();

    // Tổng số bản sách
    const totalCopies = await BookCopy.count();

    // Số bản sách theo trạng thái
    const copiesByStatus = await BookCopy.findAll({
        attributes: [
            'status',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status'],
        raw: true
    });

    // Tổng số độc giả
    const totalReaders = await Reader.count();

    // Số thẻ thư viện đang hoạt động
    const activeCards = await LibraryCard.count({ where: { status: 'active' } });

    // Số phiếu mượn theo trạng thái
    const borrowsByStatus = await BorrowRequest.findAll({
        attributes: [
            'status',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status'],
        raw: true
    });

    // Số phiếu mượn quá hạn
    const overdueBorrows = await BorrowRequest.count({
        where: {
            status: 'borrowed',
            due_date: { [Op.lt]: new Date() }
        }
    });

    // Số phiếu đang mượn (không quá hạn)
    const activeBorrows = await BorrowRequest.count({
        where: {
            status: 'borrowed',
            due_date: { [Op.gte]: new Date() }
        }
    });

    // Số sách đã trả (từ các phiếu có status = 'returned')
    const returnedBooks = await BorrowDetail.count({
        include: [{
            model: BorrowRequest,
            as: 'borrowRequest',
            where: { status: 'returned' },
            attributes: []
        }]
    });

    // Tổng tiền phạt chưa thu
    const pendingFines = await Fine.sum('amount', { where: { status: 'pending' } }) || 0;

    // Tổng tiền phạt đã thu (tháng này)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const collectedFinesThisMonth = await Fine.sum('amount', {
        where: {
            status: 'paid',
            paid_date: { [Op.gte]: startOfMonth }
        }
    }) || 0;

    // Số phiếu mượn hôm nay
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const borrowsToday = await BorrowRequest.count({
        where: {
            created_at: { [Op.gte]: today, [Op.lt]: tomorrow }
        }
    });

    res.json({
        success: true,
        data: {
            books: {
                totalBooks,
                totalCopies,
                copiesByStatus: copiesByStatus.reduce((acc, item) => {
                    acc[item.status] = parseInt(item.count);
                    return acc;
                }, {})
            },
            readers: {
                totalReaders,
                activeCards
            },
            borrows: {
                borrowsByStatus: borrowsByStatus.reduce((acc, item) => {
                    acc[item.status] = parseInt(item.count);
                    return acc;
                }, {}),
                overdueBorrows,
                activeBorrows,
                returnedBooks,
                borrowsToday
            },
            finances: {
                pendingFines,
                collectedFinesThisMonth
            }
        }
    });
});

/**
 * @desc    Lấy danh sách sách quá hạn
 * @route   GET /api/statistics/overdue
 * @access  Admin, Librarian
 */
const getOverdueBooks = asyncHandler(async (req, res) => {
    const overdueRequests = await BorrowRequest.findAll({
        where: {
            status: 'borrowed',
            due_date: { [Op.lt]: new Date() }
        },
        include: [
            {
                model: LibraryCard,
                as: 'libraryCard',
                include: [{
                    model: Reader,
                    as: 'reader',
                    attributes: ['id', 'full_name', 'phone', 'id_card_number']
                }]
            },
            {
                model: BorrowDetail,
                as: 'details',
                where: { actual_return_date: null },
                include: [{
                    model: BookCopy,
                    as: 'bookCopy',
                    include: [{
                        model: BookEdition,
                        as: 'bookEdition',
                        include: [{ model: Book, as: 'book', attributes: ['id', 'code', 'title'] }]
                    }]
                }]
            }
        ],
        order: [['due_date', 'ASC']]
    });

    // Tính số ngày quá hạn và tiền phạt dự kiến
    const today = new Date();
    const result = overdueRequests.map(request => {
        const daysOverdue = Math.ceil((today - new Date(request.due_date)) / (1000 * 60 * 60 * 24));

        let estimatedFine = 0;
        request.details.forEach(detail => {
            const price = parseFloat(detail.bookCopy.price) || 0;
            estimatedFine += (price * fineRatePercent / 100) * daysOverdue;
        });

        return {
            ...request.toJSON(),
            daysOverdue,
            estimatedFine
        };
    });

    res.json({
        success: true,
        data: result,
        total: result.length
    });
});

/**
 * @desc    Lấy danh sách sách mượn nhiều nhất
 * @route   GET /api/statistics/popular-books
 * @access  Admin, Librarian
 */
const getPopularBooks = asyncHandler(async (req, res) => {
    const { limit = 10, period } = req.query;

    // Xây dựng điều kiện thời gian
    const dateCondition = {};
    if (period) {
        const now = new Date();
        switch (period) {
            case 'week':
                now.setDate(now.getDate() - 7);
                break;
            case 'month':
                now.setMonth(now.getMonth() - 1);
                break;
            case '6months':
                now.setMonth(now.getMonth() - 6);
                break;
            case 'year':
                now.setFullYear(now.getFullYear() - 1);
                break;
        }
        dateCondition.created_at = { [Op.gte]: now };
    }

    // Thống kê số lần mượn theo đầu sách
    const popularBooks = await BorrowDetail.findAll({
        attributes: [
            [sequelize.fn('COUNT', sequelize.col('BorrowDetail.id')), 'borrow_count']
        ],
        include: [
            {
                model: BorrowRequest,
                as: 'borrowRequest',
                attributes: [],
                where: dateCondition
            },
            {
                model: BookCopy,
                as: 'bookCopy',
                attributes: [],
                include: [{
                    model: BookEdition,
                    as: 'bookEdition',
                    attributes: [],
                    include: [{
                        model: Book,
                        as: 'book',
                        attributes: ['id', 'code', 'title']
                    }]
                }]
            }
        ],
        group: ['bookCopy.bookEdition.book.id'],
        order: [[sequelize.fn('COUNT', sequelize.col('BorrowDetail.id')), 'DESC']],
        limit: parseInt(limit),
        raw: true,
        nest: true
    });

    res.json({
        success: true,
        data: popularBooks
    });
});

/**
 * @desc    Lấy xu hướng mượn sách
 * @route   GET /api/statistics/borrowing-trend
 * @access  Admin, Librarian
 */
const getBorrowingTrend = asyncHandler(async (req, res) => {
    const { period = 'month' } = req.query;

    let groupFormat, startDate;
    const now = new Date();

    switch (period) {
        case 'week':
            startDate = new Date(now.setDate(now.getDate() - 7));
            groupFormat = '%Y-%m-%d';
            break;
        case 'month':
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            groupFormat = '%Y-%m-%d';
            break;
        case '6months':
            startDate = new Date(now.setMonth(now.getMonth() - 6));
            groupFormat = '%Y-%m';
            break;
        default:
            startDate = new Date(now.setMonth(now.getMonth() - 1));
            groupFormat = '%Y-%m-%d';
    }

    const trend = await BorrowRequest.findAll({
        attributes: [
            [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), groupFormat), 'date'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where: {
            created_at: { [Op.gte]: startDate }
        },
        group: [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), groupFormat)],
        order: [[sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), groupFormat), 'ASC']],
        raw: true
    });

    res.json({
        success: true,
        data: trend
    });
});

/**
 * @desc    Tạo phiếu nhắc trả (chạy vào thứ 6 hàng tuần)
 * @route   POST /api/reports/weekly-reminders
 * @access  Admin, Librarian
 */
const generateWeeklyReminders = asyncHandler(async (req, res) => {
    const today = new Date();

    // Lấy các phiếu mượn quá hạn
    const overdueRequests = await BorrowRequest.findAll({
        where: {
            status: 'borrowed',
            due_date: { [Op.lt]: today }
        },
        include: [
            {
                model: LibraryCard,
                as: 'libraryCard',
                include: [{
                    model: Reader,
                    as: 'reader',
                    attributes: ['id', 'full_name', 'phone']
                }]
            },
            {
                model: BorrowDetail,
                as: 'details',
                where: { actual_return_date: null },
                include: [{
                    model: BookCopy,
                    as: 'bookCopy',
                    include: [{
                        model: BookEdition,
                        as: 'bookEdition',
                        include: [{ model: Book, as: 'book', attributes: ['title'] }]
                    }]
                }]
            }
        ]
    });

    const reminders = [];

    for (const request of overdueRequests) {
        const daysOverdue = Math.ceil((today - new Date(request.due_date)) / (1000 * 60 * 60 * 24));

        // Tạo nội dung phiếu nhắc
        let content = `Kính gửi ${request.libraryCard?.reader?.full_name || 'Độc giả'},\n\n`;
        content += `Thư viện xin thông báo các sách sau đã quá hạn trả:\n\n`;

        let estimatedFine = 0;
        request.details.forEach((detail, index) => {
            const bookTitle = detail.bookCopy?.bookEdition?.book?.title || 'Không xác định';
            const price = parseFloat(detail.bookCopy?.price) || 0;
            const fine = (price * fineRatePercent / 100) * daysOverdue;
            estimatedFine += fine;

            content += `${index + 1}. ${bookTitle} - Phạt dự kiến: ${fine.toLocaleString('vi-VN')} VND\n`;
        });

        content += `\nTổng tiền phạt dự kiến: ${estimatedFine.toLocaleString('vi-VN')} VND`;
        content += `\n\nVui lòng đến thư viện để trả sách và thanh toán tiền phạt.`;
        content += `\n\nTrân trọng,\nThư viện`;

        const reminder = await Reminder.create({
            borrow_request_id: request.id,
            sent_date: today,
            content,
            estimated_fine: estimatedFine
        });

        reminders.push(reminder);
    }

    // Cập nhật trạng thái phiếu mượn thành overdue
    await BorrowRequest.update(
        { status: 'overdue' },
        {
            where: {
                status: 'borrowed',
                due_date: { [Op.lt]: today }
            }
        }
    );

    res.json({
        success: true,
        message: `Đã tạo ${reminders.length} phiếu nhắc trả`,
        data: reminders
    });
});

/**
 * @desc    Báo cáo tổng hợp 6 tháng
 * @route   GET /api/reports/semi-annual
 * @access  Admin
 */
const getSemiAnnualReport = asyncHandler(async (req, res) => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // 1. Số lượng đầu sách đang quản lý
    const totalBooks = await Book.count();

    // 2. Số lượng độc giả được phục vụ
    const activeReadersCount = await BorrowRequest.count({
        where: {
            created_at: { [Op.gte]: sixMonthsAgo }
        },
        distinct: true,
        col: 'library_card_id'
    });

    // 3. Thống kê số lần mượn của từng đầu sách
    const bookBorrowStats = await sequelize.query(`
    SELECT 
      b.id,
      b.code,
      b.title,
      COUNT(bd.id) as borrow_count
    FROM books b
    LEFT JOIN book_editions be ON be.book_id = b.id
    LEFT JOIN book_copies bc ON bc.book_edition_id = be.id
    LEFT JOIN borrow_details bd ON bd.book_copy_id = bc.id
    LEFT JOIN borrow_requests br ON br.id = bd.borrow_request_id
      AND br.created_at >= :sixMonthsAgo
    GROUP BY b.id, b.code, b.title
    ORDER BY borrow_count DESC
  `, {
        replacements: { sixMonthsAgo },
        type: sequelize.QueryTypes.SELECT
    });

    // 4. Sách có nhu cầu cao (top 20)
    const highDemandBooks = bookBorrowStats.filter(b => b.borrow_count > 0).slice(0, 20);

    // 5. Sách ít được sử dụng (chưa được mượn trong 6 tháng)
    const lowDemandBooks = bookBorrowStats.filter(b => b.borrow_count === 0);

    // 6. Thống kê theo lĩnh vực
    const fieldStats = await sequelize.query(`
    SELECT 
      f.id,
      f.name,
      COUNT(DISTINCT b.id) as book_count,
      COUNT(bd.id) as borrow_count
    FROM fields f
    LEFT JOIN books b ON b.field_id = f.id
    LEFT JOIN book_editions be ON be.book_id = b.id
    LEFT JOIN book_copies bc ON bc.book_edition_id = be.id
    LEFT JOIN borrow_details bd ON bd.book_copy_id = bc.id
    LEFT JOIN borrow_requests br ON br.id = bd.borrow_request_id
      AND br.created_at >= :sixMonthsAgo
    GROUP BY f.id, f.name
    ORDER BY borrow_count DESC
  `, {
        replacements: { sixMonthsAgo },
        type: sequelize.QueryTypes.SELECT
    });

    // 7. Doanh thu tiền phạt
    const fineRevenue = await Fine.sum('amount', {
        where: {
            status: 'paid',
            paid_date: { [Op.gte]: sixMonthsAgo }
        }
    }) || 0;

    res.json({
        success: true,
        data: {
            period: {
                from: sixMonthsAgo,
                to: new Date()
            },
            summary: {
                totalBooks,
                activeReadersCount,
                fineRevenue
            },
            bookStats: {
                total: bookBorrowStats.length,
                highDemandBooks,
                lowDemandBooksCount: lowDemandBooks.length,
                lowDemandBooks: lowDemandBooks.slice(0, 50) // Giới hạn 50
            },
            fieldStats,
            recommendations: {
                booksToAdd: highDemandBooks.slice(0, 10).map(b => ({
                    ...b,
                    reason: 'Sách có nhu cầu mượn cao'
                })),
                booksToRemove: lowDemandBooks.slice(0, 10).map(b => ({
                    ...b,
                    reason: 'Sách không được mượn trong 6 tháng'
                }))
            }
        }
    });
});

module.exports = {
    getDashboardStats,
    getOverdueBooks,
    getPopularBooks,
    getBorrowingTrend,
    generateWeeklyReminders,
    getSemiAnnualReport
};
