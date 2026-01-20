/**
 * ===================================================================
 * CONTROLLER: MƯỢN TRẢ (Borrow Controller)
 * ===================================================================
 * Xử lý nghiệp vụ mượn - trả sách:
 * - Tạo phiếu mượn
 * - Duyệt/Từ chối phiếu mượn
 * - Gia hạn phiếu mượn
 * - Trả sách
 * - Tính tiền phạt
 * ===================================================================
 */

const {
    BorrowRequest, BorrowDetail, BookCopy, BookEdition, Book,
    LibraryCard, Reader, Account, Staff, Fine, Publisher,
    sequelize
} = require('../models');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');
const { fineRatePercent } = require('../config/auth');
const { Op } = require('sequelize');

// ===================================================================
// BORROW REQUEST (Phiếu mượn) CONTROLLERS
// ===================================================================

/**
 * @desc    Lấy danh sách phiếu mượn (cho nhân viên)
 * @route   GET /api/borrow-requests
 * @access  Admin, Librarian
 */
const getBorrowRequests = asyncHandler(async (req, res) => {
    const {
        status, library_card_id, from_date, to_date,
        page = 1, limit = 10
    } = req.query;

    const where = {};

    if (status) where.status = status;
    if (library_card_id) where.library_card_id = library_card_id;

    if (from_date || to_date) {
        where.request_date = {};
        if (from_date) where.request_date[Op.gte] = from_date;
        if (to_date) where.request_date[Op.lte] = to_date;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await BorrowRequest.findAndCountAll({
        where,
        include: [
            {
                model: LibraryCard,
                as: 'libraryCard',
                include: [{
                    model: Reader,
                    as: 'reader',
                    attributes: ['id', 'full_name', 'id_card_number']
                }]
            },
            {
                model: BorrowDetail,
                as: 'details',
                include: [{
                    model: BookCopy,
                    as: 'bookCopy',
                    include: [{
                        model: BookEdition,
                        as: 'bookEdition',
                        include: [{ model: Book, as: 'book', attributes: ['id', 'code', 'title'] }]
                    }]
                }]
            },
            {
                model: Staff,
                as: 'approver',
                attributes: ['id', 'full_name']
            }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset
    });

    res.json({
        success: true,
        data: rows,
        pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
        }
    });
});

/**
 * @desc    Lấy phiếu mượn của tôi (độc giả)
 * @route   GET /api/borrow-requests/my
 * @access  Reader
 */
const getMyBorrowRequests = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 10 } = req.query;

    // Lấy library_card của độc giả
    const reader = await Reader.findOne({
        where: { account_id: req.user.id },
        include: [{ model: LibraryCard, as: 'libraryCard' }]
    });

    if (!reader || !reader.libraryCard) {
        return res.json({
            success: true,
            data: [],
            pagination: { total: 0, page: 1, limit: 10, totalPages: 0 }
        });
    }

    const where = { library_card_id: reader.libraryCard.id };
    if (status) where.status = status;

    const offset = (page - 1) * limit;

    const { count, rows } = await BorrowRequest.findAndCountAll({
        where,
        include: [
            {
                model: BorrowDetail,
                as: 'details',
                include: [{
                    model: BookCopy,
                    as: 'bookCopy',
                    include: [{
                        model: BookEdition,
                        as: 'bookEdition',
                        include: [{ model: Book, as: 'book', attributes: ['id', 'code', 'title'] }]
                    }]
                }]
            },
            {
                model: Fine,
                as: 'fines'
            }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset
    });

    res.json({
        success: true,
        data: rows,
        pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
        }
    });
});

/**
 * @desc    Lấy chi tiết phiếu mượn
 * @route   GET /api/borrow-requests/:id
 * @access  Admin, Librarian, Reader (self)
 */
const getBorrowRequestById = asyncHandler(async (req, res) => {
    const borrowRequest = await BorrowRequest.findByPk(req.params.id, {
        include: [
            {
                model: LibraryCard,
                as: 'libraryCard',
                include: [{
                    model: Reader,
                    as: 'reader',
                    attributes: ['id', 'full_name', 'id_card_number', 'phone']
                }]
            },
            {
                model: BorrowDetail,
                as: 'details',
                include: [{
                    model: BookCopy,
                    as: 'bookCopy',
                    include: [{
                        model: BookEdition,
                        as: 'bookEdition',
                        include: [
                            { model: Book, as: 'book' },
                            { model: Publisher, as: 'publisher', attributes: ['id', 'name'] }
                        ]
                    }]
                }]
            },
            {
                model: Fine,
                as: 'fines'
            },
            {
                model: Staff,
                as: 'approver',
                attributes: ['id', 'full_name']
            },
            {
                model: Account,
                as: 'account',
                attributes: ['id', 'username']
            }
        ]
    });

    if (!borrowRequest) {
        throw new AppError('Không tìm thấy phiếu mượn', 404);
    }

    // Kiểm tra quyền với độc giả
    if (req.user.role === 'reader') {
        const reader = await Reader.findOne({
            where: { account_id: req.user.id },
            include: [{ model: LibraryCard, as: 'libraryCard' }]
        });

        if (!reader || !reader.libraryCard ||
            borrowRequest.library_card_id !== reader.libraryCard.id) {
            throw new AppError('Bạn không có quyền xem phiếu mượn này', 403);
        }
    }

    res.json({
        success: true,
        data: borrowRequest
    });
});

/**
 * @desc    Tạo phiếu mượn mới
 * @route   POST /api/borrow-requests
 * @access  Admin, Librarian, Reader
 */
/**
 * @desc    Tạo phiếu mượn mới
 * @route   POST /api/borrow-requests
 * @access  Admin, Librarian, Reader
 */
const createBorrowRequest = asyncHandler(async (req, res) => {
    const { library_card_id, due_date, book_copy_ids, notes } = req.body;

    let cardId = library_card_id;

    // Nếu là độc giả, lấy thẻ của chính họ (bỏ qua library_card_id từ request)
    if (req.user.role === 'reader') {
        const reader = await Reader.findOne({
            where: { account_id: req.user.id },
            include: [{ model: LibraryCard, as: 'libraryCard' }]
        });

        if (!reader || !reader.libraryCard) {
            throw new AppError('Bạn chưa có thẻ thư viện. Vui lòng liên hệ thủ thư để được cấp thẻ.', 400);
        }
        cardId = reader.libraryCard.id;
    } else {
        // Admin/Librarian phải cung cấp library_card_id
        if (!library_card_id) {
            throw new AppError('Vui lòng chọn thẻ thư viện', 400);
        }
        cardId = library_card_id;
    }

    // Kiểm tra thẻ thư viện
    const libraryCard = await LibraryCard.findByPk(cardId);
    if (!libraryCard) {
        throw new AppError('Không tìm thấy thẻ thư viện', 404);
    }

    if (libraryCard.status !== 'active') {
        throw new AppError('Thẻ thư viện không hoạt động hoặc đã hết hạn', 400);
    }

    if (new Date(libraryCard.expiry_date) < new Date()) {
        throw new AppError('Thẻ thư viện đã hết hạn', 400);
    }

    // --- LẤY CẤU HÌNH HỆ THỐNG ---
    const { SystemSetting } = require('../models');
    const { defaultMaxBooks, defaultDepositAmount } = require('../config/auth');

    // Helper fetch setting
    const getSetting = async (key, defaultVal) => {
        const setting = await SystemSetting.findOne({ where: { setting_key: key } });
        return setting ? parseInt(setting.setting_value) : defaultVal;
    };

    const maxBooksPerUser = await getSetting('max_books_per_user', defaultMaxBooks);
    const minDepositAmount = await getSetting('min_deposit_amount', defaultDepositAmount);

    // --- KIỂM TRA TIỀN CỌC ---
    // Kiểm tra số dư cọc hiện tại có đủ mức tối thiểu không
    // Lưu ý: Logic này có thể tùy chỉnh:
    // Option A: Tổng tiền cọc trong thẻ >= minDepositAmount (Một cục cọc chung)
    // Option B: Mỗi cuốn sách cần cọc X đồng (Logic phức tạp hơn)
    // Ở đây dùng Option A: Phải có đủ cọc tối thiểu mới được mượn
    if (parseFloat(libraryCard.deposit_amount) < minDepositAmount) {
        throw new AppError(`Số dư tiền cọc không đủ. Cần tối thiểu ${minDepositAmount.toLocaleString()}đ để mượn sách.`, 400);
    }

    // --- KIỂM TRA NGÀY TRẢ ---
    const maxBorrowDays = await getSetting('max_borrow_days', 14);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDateTime = new Date(due_date);
    dueDateTime.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((dueDateTime - today) / (1000 * 60 * 60 * 24));

    if (diffDays > maxBorrowDays) {
        throw new AppError(`Ngày trả vượt quá số ngày mượn tối đa (${maxBorrowDays} ngày). Vui lòng chọn ngày trả sớm hơn.`, 400);
    }
    if (diffDays < 1) {
        throw new AppError('Ngày trả phải sau ngày hôm nay', 400);
    }

    // Validation: 1 phiếu = 1 sách
    if (!book_copy_ids || book_copy_ids.length !== 1) {
        throw new AppError('Mỗi phiếu mượn chỉ được chọn 1 cuốn sách', 400);
    }

    // Validation: 1 quyển chỉ mượn 1 NXB (không cho mượn cùng đầu sách từ NXB khác)
    // Lấy thông tin copy được chọn
    const selectedCopy = await BookCopy.findByPk(book_copy_ids[0], {
        include: [{
            model: BookEdition,
            as: 'bookEdition',
            include: [{ model: require('../models').Book, as: 'book' }]
        }]
    });

    if (!selectedCopy) {
        throw new AppError('Không tìm thấy bản sách', 404);
    }

    const selectedBookId = selectedCopy.bookEdition?.book_id;

    // Kiểm tra xem độc giả đã mượn/đang chờ duyệt đầu sách này chưa
    // Tách query thành 2 bước để tránh lỗi nested include với alias
    // Bước 1: Tìm tất cả book_copy_ids thuộc đầu sách này
    const editionsOfSameBook = await BookEdition.findAll({
        where: { book_id: selectedBookId },
        attributes: ['id']
    });
    const editionIds = editionsOfSameBook.map(e => e.id);
    
    const copiesOfSameBook = await BookCopy.findAll({
        where: { book_edition_id: { [Op.in]: editionIds } },
        attributes: ['id']
    });
    const copyIdsOfSameBook = copiesOfSameBook.map(c => c.id);

    // Bước 2: Kiểm tra xem có BorrowDetail nào đang mượn các copy này không
    const existingBorrowOfSameBook = copyIdsOfSameBook.length > 0 ? await BorrowRequest.findOne({
        where: {
            library_card_id: cardId,
            status: { [Op.in]: ['pending', 'approved', 'borrowed'] }
        },
        include: [{
            model: BorrowDetail,
            as: 'details',
            where: {
                actual_return_date: null,
                book_copy_id: { [Op.in]: copyIdsOfSameBook }
            },
            required: true
        }]
    }) : null;

    if (existingBorrowOfSameBook) {
        throw new AppError('Bạn đã mượn/đang chờ duyệt đầu sách này. Không thể mượn thêm từ NXB khác.', 400);
    }

    // Kiểm tra số sách đang mượn
    const currentBorrowed = await BorrowDetail.count({
        include: [{
            model: BorrowRequest,
            as: 'borrowRequest',
            where: {
                library_card_id: cardId,
                status: { [Op.in]: ['borrowed', 'approved'] }
            }
        }],
        where: { actual_return_date: null }
    });

    if (currentBorrowed + book_copy_ids.length > maxBooksPerUser) {
        throw new AppError(
            `Vượt quá số sách tối đa được mượn (${maxBooksPerUser}). Đang mượn: ${currentBorrowed}`,
            400
        );
    }

    // Kiểm tra các bản sách có tồn tại không
    const copies = await BookCopy.findAll({
        where: {
            id: { [Op.in]: book_copy_ids }
        }
    });

    if (copies.length !== book_copy_ids.length) {
        throw new AppError('Một số bản sách không tồn tại', 400);
    }

    // Đối với độc giả: chỉ cho mượn sách có status = 'available'
    // Đối với admin/thủ thư: cho mượn bất kỳ sách nào (trừ disposed)
    if (req.user.role === 'reader') {
        const availableCopies = copies.filter(c => c.status === 'available');
        if (availableCopies.length !== book_copy_ids.length) {
            throw new AppError('Một số bản sách không còn sẵn sàng để mượn', 400);
        }
    } else {
        // Admin/thủ thư: không cho mượn sách đã thanh lý
        const disposedCopies = copies.filter(c => c.status === 'disposed');
        if (disposedCopies.length > 0) {
            throw new AppError('Không thể mượn sách đã thanh lý', 400);
        }
    }

    const transaction = await sequelize.transaction();

    try {
        // Xác định trạng thái: độc giả tạo -> pending, nhân viên tạo -> approved
        const status = req.user.role === 'reader' ? 'pending' : 'approved';

        // Tạo phiếu mượn
        const borrowRequest = await BorrowRequest.create({
            library_card_id: cardId,
            account_id: req.user.id,
            approved_by: req.user.role !== 'reader' ? req.user.staff?.id : null,
            request_date: new Date(),
            borrow_date: status === 'approved' ? new Date() : null,
            due_date,
            status,
            notes
        }, { transaction });

        // Tạo chi tiết mượn
        const details = book_copy_ids.map(book_copy_id => ({
            borrow_request_id: borrowRequest.id,
            book_copy_id
        }));
        await BorrowDetail.bulkCreate(details, { transaction });

        // Nếu được duyệt ngay, cập nhật trạng thái sách
        if (status === 'approved') {
            await BookCopy.update(
                { status: 'borrowed' },
                { where: { id: { [Op.in]: book_copy_ids } }, transaction }
            );
            borrowRequest.status = 'borrowed';
            await borrowRequest.save({ transaction });
        }

        await transaction.commit();

        // Lấy lại phiếu với đầy đủ thông tin
        const createdRequest = await BorrowRequest.findByPk(borrowRequest.id, {
            include: [
                { model: LibraryCard, as: 'libraryCard' },
                {
                    model: BorrowDetail,
                    as: 'details',
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
            ]
        });

        res.status(201).json({
            success: true,
            message: status === 'pending'
                ? 'Tạo phiếu mượn thành công. Vui lòng chờ duyệt.'
                : 'Tạo phiếu mượn và duyệt thành công',
            data: createdRequest
        });

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
});

/**
 * @desc    Duyệt phiếu mượn
 * @route   PUT /api/borrow-requests/:id/approve
 * @access  Admin, Librarian
 */
const approveBorrowRequest = asyncHandler(async (req, res) => {
    const borrowRequest = await BorrowRequest.findByPk(req.params.id, {
        include: [{ model: BorrowDetail, as: 'details' }]
    });

    if (!borrowRequest) {
        throw new AppError('Không tìm thấy phiếu mượn', 404);
    }

    if (borrowRequest.status !== 'pending') {
        throw new AppError('Phiếu mượn không ở trạng thái chờ duyệt', 400);
    }

    const transaction = await sequelize.transaction();

    try {
        // Lấy staff_id
        const staff = await Staff.findOne({ where: { account_id: req.user.id } });

        // Cập nhật phiếu mượn - chỉ chuyển sang approved, chưa xuất sách
        await borrowRequest.update({
            status: 'approved',
            approved_by: staff?.id,
            notes: req.body.notes || borrowRequest.notes
        }, { transaction });

        // KHÔNG cập nhật trạng thái sách ở đây - sách vẫn available cho đến khi xuất sách

        await transaction.commit();

        res.json({
            success: true,
            message: 'Duyệt phiếu mượn thành công'
        });

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
});

/**
 * @desc    Xuất sách (chuyển từ approved sang borrowed)
 * @route   PUT /api/borrow-requests/:id/issue
 * @access  Admin, Librarian
 */
const issueBooks = asyncHandler(async (req, res) => {
    const borrowRequest = await BorrowRequest.findByPk(req.params.id, {
        include: [{ model: BorrowDetail, as: 'details' }]
    });

    if (!borrowRequest) {
        throw new AppError('Không tìm thấy phiếu mượn', 404);
    }

    if (borrowRequest.status !== 'approved') {
        throw new AppError('Chỉ có thể xuất sách cho phiếu đã được duyệt', 400);
    }

    const transaction = await sequelize.transaction();

    try {
        // Cập nhật phiếu mượn - chuyển sang borrowed và ghi nhận ngày mượn
        await borrowRequest.update({
            status: 'borrowed',
            borrow_date: new Date(),
            notes: req.body.notes || borrowRequest.notes
        }, { transaction });

        // Cập nhật trạng thái sách - chuyển sang borrowed
        const bookCopyIds = borrowRequest.details.map(d => d.book_copy_id);
        await BookCopy.update(
            { status: 'borrowed' },
            { where: { id: { [Op.in]: bookCopyIds } }, transaction }
        );

        await transaction.commit();

        res.json({
            success: true,
            message: 'Xuất sách thành công'
        });

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
});

/**
 * @desc    Từ chối phiếu mượn
 * @route   PUT /api/borrow-requests/:id/reject
 * @access  Admin, Librarian
 */
const rejectBorrowRequest = asyncHandler(async (req, res) => {
    const borrowRequest = await BorrowRequest.findByPk(req.params.id);

    if (!borrowRequest) {
        throw new AppError('Không tìm thấy phiếu mượn', 404);
    }

    if (borrowRequest.status !== 'pending') {
        throw new AppError('Phiếu mượn không ở trạng thái chờ duyệt', 400);
    }

    const staff = await Staff.findOne({ where: { account_id: req.user.id } });

    await borrowRequest.update({
        status: 'rejected',
        approved_by: staff?.id,
        notes: req.body.reason
    });

    res.json({
        success: true,
        message: 'Từ chối phiếu mượn thành công'
    });
});

/**
 * @desc    Gia hạn phiếu mượn
 * @route   PUT /api/borrow-requests/:id/extend
 * @access  Admin, Librarian
 */
const extendBorrowRequest = asyncHandler(async (req, res) => {
    const borrowRequest = await BorrowRequest.findByPk(req.params.id);

    if (!borrowRequest) {
        throw new AppError('Không tìm thấy phiếu mượn', 404);
    }

    if (!['borrowed', 'overdue'].includes(borrowRequest.status)) {
        throw new AppError('Không thể gia hạn phiếu mượn ở trạng thái này', 400);
    }

    const { new_due_date, notes } = req.body;

    // Validate: ngày hạn mới phải sau ngày hạn hiện tại
    const currentDueDate = new Date(borrowRequest.due_date);
    const newDueDate = new Date(new_due_date);

    if (newDueDate <= currentDueDate) {
        throw new AppError('Ngày hẹn trả mới phải sau ngày hạn hiện tại', 400);
    }

    // Validate: ngày hạn mới phải sau ngày hiện tại
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    newDueDate.setHours(0, 0, 0, 0);

    if (newDueDate <= today) {
        throw new AppError('Ngày hẹn trả mới phải sau ngày hiện tại', 400);
    }

    await borrowRequest.update({
        due_date: new_due_date,
        status: 'borrowed', // Chuyển về borrowed nếu đang overdue
        notes: notes || borrowRequest.notes
    });

    res.json({
        success: true,
        message: 'Gia hạn phiếu mượn thành công',
        data: borrowRequest
    });
});

/**
 * @desc    Trả sách
 * @route   PUT /api/borrow-requests/:id/return
 * @access  Admin, Librarian
 */
/**
 * @desc    Trả sách
 * @route   PUT /api/borrow-requests/:id/return
 * @access  Admin, Librarian
 */
const returnBooks = asyncHandler(async (req, res) => {
    const { returns } = req.body;

    const borrowRequest = await BorrowRequest.findByPk(req.params.id, {
        include: [{ model: BorrowDetail, as: 'details' }]
    });

    if (!borrowRequest) {
        throw new AppError('Không tìm thấy phiếu mượn', 404);
    }

    if (!['borrowed', 'overdue'].includes(borrowRequest.status)) {
        throw new AppError('Phiếu mượn không ở trạng thái đang mượn', 400);
    }

    // --- LẤY CẤU HÌNH HỆ THỐNG (FINE RATE) ---
    const { SystemSetting } = require('../models');
    const { fineRatePercent: defaultFineRate } = require('../config/auth');

    const settings = await SystemSetting.findOne({ where: { setting_key: 'fine_rate_percent' } });
    const currentFineRate = settings ? parseInt(settings.setting_value) : defaultFineRate;

    const transaction = await sequelize.transaction();

    try {
        const staff = await Staff.findOne({ where: { account_id: req.user.id } });
        const today = new Date();
        const finesCreated = [];

        for (const returnItem of returns) {
            const { book_copy_id, return_condition, notes } = returnItem;

            // Tìm detail tương ứng
            const detail = borrowRequest.details.find(d => d.book_copy_id === book_copy_id);
            if (!detail) {
                throw new AppError(`Bản sách ${book_copy_id} không thuộc phiếu mượn này`, 400);
            }

            if (detail.actual_return_date) {
                continue; // Đã trả rồi, bỏ qua
            }

            // Cập nhật chi tiết mượn
            await detail.update({
                actual_return_date: today,
                return_condition,
                notes
            }, { transaction });

            // Lấy thông tin bản sách để tính phạt và cập nhật trạng thái
            const bookCopy = await BookCopy.findByPk(book_copy_id);

            // Tính tiền phạt quá hạn
            const dueDate = new Date(borrowRequest.due_date);
            const diffTime = today - dueDate;
            const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (daysOverdue > 0) {
                const fineAmount = (bookCopy.price * currentFineRate / 100) * daysOverdue;
                const fine = await Fine.create({
                    borrow_request_id: borrowRequest.id,
                    book_copy_id,
                    reason: `Trả quá hạn ${daysOverdue} ngày (Phí ${currentFineRate}%)`,
                    amount: fineAmount,
                    status: 'pending'
                }, { transaction });
                finesCreated.push(fine);
            }

            // Xác định trạng thái mới của sách và phạt (nếu có)
            let newStatus = 'available'; // Mặc định: trả về available (tăng lại số lượng)

            if (return_condition === 'damaged') {
                // Sách hỏng → status = 'damaged' (không tăng available)
                newStatus = 'damaged';
                const damageAmount = bookCopy.price * 0.5; // Phạt 50% giá sách
                const fine = await Fine.create({
                    borrow_request_id: borrowRequest.id,
                    book_copy_id,
                    reason: 'Sách bị hư hỏng',
                    amount: damageAmount,
                    status: 'pending'
                }, { transaction });
                finesCreated.push(fine);
            } else if (return_condition === 'lost') {
                // Sách mất → status = 'disposed' (không tăng available)
                newStatus = 'disposed';
                const lostAmount = bookCopy.price; // Phạt 100% giá sách
                const fine = await Fine.create({
                    borrow_request_id: borrowRequest.id,
                    book_copy_id,
                    reason: 'Mất sách',
                    amount: lostAmount,
                    status: 'pending'
                }, { transaction });
                finesCreated.push(fine);
            }

            // Cập nhật trạng thái sách (available/damaged/disposed)
            await bookCopy.update({ status: newStatus }, { transaction });
        }

        // Kiểm tra xem đã trả hết chưa
        const unreturned = await BorrowDetail.count({
            where: {
                borrow_request_id: borrowRequest.id,
                actual_return_date: null
            },
            transaction
        });

        if (unreturned === 0) {
            await borrowRequest.update({ status: 'returned' }, { transaction });
        }

        await transaction.commit();

        res.json({
            success: true,
            message: 'Trả sách thành công',
            data: {
                fines: finesCreated,
                allReturned: unreturned === 0
            }
        });

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
});

/**
 * @desc    Hủy phiếu mượn
 * @route   DELETE /api/borrow-requests/:id
 * @access  Admin, Librarian, Reader (pending only)
 */
const cancelBorrowRequest = asyncHandler(async (req, res) => {
    const borrowRequest = await BorrowRequest.findByPk(req.params.id, {
        include: [{ model: LibraryCard, as: 'libraryCard' }]
    });

    if (!borrowRequest) {
        throw new AppError('Không tìm thấy phiếu mượn', 404);
    }

    // Độc giả chỉ được hủy phiếu pending của mình
    if (req.user.role === 'reader') {
        const reader = await Reader.findOne({
            where: { account_id: req.user.id },
            include: [{ model: LibraryCard, as: 'libraryCard' }]
        });

        if (!reader || !reader.libraryCard ||
            borrowRequest.library_card_id !== reader.libraryCard.id) {
            throw new AppError('Bạn không có quyền hủy phiếu mượn này', 403);
        }

        if (borrowRequest.status !== 'pending') {
            throw new AppError('Chỉ được hủy phiếu mượn đang chờ duyệt', 400);
        }
    }

    // Admin/Librarian không được hủy phiếu đang mượn
    if (['borrowed', 'overdue'].includes(borrowRequest.status)) {
        throw new AppError('Không thể hủy phiếu mượn đang trong quá trình mượn', 400);
    }

    await borrowRequest.destroy();

    res.json({
        success: true,
        message: 'Hủy phiếu mượn thành công'
    });
});

module.exports = {
    getBorrowRequests,
    getMyBorrowRequests,
    getBorrowRequestById,
    createBorrowRequest,
    approveBorrowRequest,
    issueBooks,
    rejectBorrowRequest,
    extendBorrowRequest,
    returnBooks,
    cancelBorrowRequest
};
