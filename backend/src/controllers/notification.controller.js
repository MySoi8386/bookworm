/**
 * ===================================================================
 * CONTROLLER: THÔNG BÁO (Notification Controller)
 * ===================================================================
 * Xử lý các API liên quan đến thông báo:
 * - Lấy danh sách người dùng có sách quá hạn
 * - Gửi email thông báo nhắc nhở
 * ===================================================================
 */

const {
    BorrowRequest, BorrowDetail, BookCopy, BookEdition, Book,
    LibraryCard, Reader, Account, sequelize
} = require('../models');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');
const { Op } = require('sequelize');
const { sendOverdueNotificationEmail } = require('../config/email.config');

/**
 * @desc    Lấy danh sách người dùng có sách quá hạn
 * @route   GET /api/notifications/overdue-users
 * @access  Admin, Librarian
 */
const getOverdueUsers = asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Tìm các phiếu mượn quá hạn (borrowed hoặc overdue và due_date < today)
    const overdueRequests = await BorrowRequest.findAll({
        where: {
            status: { [Op.in]: ['borrowed', 'overdue'] },
            due_date: { [Op.lt]: today }
        },
        include: [
            {
                model: LibraryCard,
                as: 'libraryCard',
                include: [{
                    model: Reader,
                    as: 'reader',
                    attributes: ['id', 'full_name', 'phone'],
                    include: [{
                        model: Account,
                        as: 'account',
                        attributes: ['id', 'email']
                    }]
                }]
            },
            {
                model: BorrowDetail,
                as: 'details',
                where: { actual_return_date: null }, // Chưa trả
                required: true,
                include: [{
                    model: BookCopy,
                    as: 'bookCopy',
                    include: [{
                        model: BookEdition,
                        as: 'bookEdition',
                        include: [{
                            model: Book,
                            as: 'book',
                            attributes: ['id', 'code', 'title']
                        }]
                    }]
                }]
            }
        ],
        order: [['due_date', 'ASC']]
    });

    // Nhóm theo độc giả
    const userMap = new Map();

    overdueRequests.forEach(request => {
        const reader = request.libraryCard?.reader;
        if (!reader) return;

        const readerId = reader.id;
        const dueDate = new Date(request.due_date);
        const daysOverdue = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));

        if (!userMap.has(readerId)) {
            userMap.set(readerId, {
                id: readerId,
                fullName: reader.full_name,
                phone: reader.phone,
                email: reader.account?.email,
                overdueBooks: [],
                totalDaysOverdue: 0
            });
        }

        const user = userMap.get(readerId);

        request.details.forEach(detail => {
            const book = detail.bookCopy?.bookEdition?.book;
            if (book) {
                user.overdueBooks.push({
                    bookId: book.id,
                    title: book.title,
                    code: book.code,
                    dueDate: request.due_date,
                    daysOverdue
                });
            }
        });

        user.totalDaysOverdue = Math.max(user.totalDaysOverdue, daysOverdue);
    });

    const overdueUsers = Array.from(userMap.values())
        .filter(user => user.email) // Chỉ lấy user có email
        .sort((a, b) => b.totalDaysOverdue - a.totalDaysOverdue);

    res.json({
        success: true,
        data: overdueUsers,
        count: overdueUsers.length
    });
});

/**
 * @desc    Gửi email thông báo sách quá hạn
 * @route   POST /api/notifications/send
 * @access  Admin, Librarian
 */
const sendOverdueNotifications = asyncHandler(async (req, res) => {
    const { userIds, message } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        throw new AppError('Vui lòng chọn ít nhất một người dùng', 400);
    }

    if (!message || message.trim() === '') {
        throw new AppError('Vui lòng nhập nội dung thông báo', 400);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Lấy thông tin các độc giả được chọn
    const readers = await Reader.findAll({
        where: { id: { [Op.in]: userIds } },
        include: [{
            model: Account,
            as: 'account',
            attributes: ['id', 'email']
        }]
    });

    const results = {
        success: [],
        failed: []
    };

    for (const reader of readers) {
        if (!reader.account?.email) {
            results.failed.push({
                readerId: reader.id,
                name: reader.full_name,
                reason: 'Không có email'
            });
            continue;
        }

        // Lấy sách quá hạn của người này
        const libraryCard = await LibraryCard.findOne({
            where: { reader_id: reader.id }
        });

        if (!libraryCard) {
            results.failed.push({
                readerId: reader.id,
                name: reader.full_name,
                reason: 'Không có thẻ thư viện'
            });
            continue;
        }

        const overdueRequests = await BorrowRequest.findAll({
            where: {
                library_card_id: libraryCard.id,
                status: { [Op.in]: ['borrowed', 'overdue'] },
                due_date: { [Op.lt]: today }
            },
            include: [{
                model: BorrowDetail,
                as: 'details',
                where: { actual_return_date: null },
                required: true,
                include: [{
                    model: BookCopy,
                    as: 'bookCopy',
                    include: [{
                        model: BookEdition,
                        as: 'bookEdition',
                        include: [{
                            model: Book,
                            as: 'book',
                            attributes: ['title']
                        }]
                    }]
                }]
            }]
        });

        const overdueBooks = [];
        overdueRequests.forEach(request => {
            const dueDate = new Date(request.due_date);
            const daysOverdue = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));

            request.details.forEach(detail => {
                const book = detail.bookCopy?.bookEdition?.book;
                if (book) {
                    overdueBooks.push({
                        title: book.title,
                        dueDate: request.due_date,
                        daysOverdue
                    });
                }
            });
        });

        try {
            await sendOverdueNotificationEmail(
                reader.account.email,
                reader.full_name,
                overdueBooks,
                message
            );

            results.success.push({
                readerId: reader.id,
                name: reader.full_name,
                email: reader.account.email
            });
        } catch (error) {
            console.error(`Failed to send email to ${reader.account.email}:`, error);
            results.failed.push({
                readerId: reader.id,
                name: reader.full_name,
                reason: 'Gửi email thất bại'
            });
        }
    }

    res.json({
        success: true,
        message: `Đã gửi thông báo cho ${results.success.length}/${readers.length} người dùng`,
        data: results
    });
});

module.exports = {
    getOverdueUsers,
    sendOverdueNotifications
};
