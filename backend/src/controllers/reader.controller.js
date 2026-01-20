/**
 * ===================================================================
 * CONTROLLER: ĐỘC GIẢ (Reader Controller)
 * ===================================================================
 * Xử lý CRUD cho:
 * - Reader (Độc giả)
 * - LibraryCard (Thẻ thư viện)
 * ===================================================================
 */

const {
    Reader, Account, UserGroup, LibraryCard,
    BorrowRequest, DepositTransaction, Staff,
    sequelize
} = require('../models');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');
const { defaultDepositAmount, defaultMaxBooks, defaultBorrowDays } = require('../config/auth');
const { Op } = require('sequelize');

// ===================================================================
// READER (Độc giả) CONTROLLERS
// ===================================================================

/**
 * @desc    Lấy danh sách độc giả
 * @route   GET /api/readers
 * @access  Admin, Librarian
 */
const getReaders = asyncHandler(async (req, res) => {
    const { keyword, status, account_status, page = 1, limit = 10 } = req.query;

    const where = {};

    if (keyword) {
        where[Op.or] = [
            { full_name: { [Op.like]: `%${keyword}%` } },
            { id_card_number: { [Op.like]: `%${keyword}%` } },
            { phone: { [Op.like]: `%${keyword}%` } }
        ];
    }

    const includeLibraryCard = {
        model: LibraryCard,
        as: 'libraryCard',
        required: false
    };

    if (status) {
        includeLibraryCard.where = { status };
        includeLibraryCard.required = true;
    }

    // Include Account với filter theo account_status
    const includeAccount = {
        model: Account,
        as: 'account',
        attributes: ['id', 'username', 'email', 'status'],
        required: account_status ? true : false
    };

    if (account_status) {
        includeAccount.where = { status: account_status };
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Reader.findAndCountAll({
        where,
        include: [
            includeAccount,
            includeLibraryCard
        ],
        order: [['full_name', 'ASC']],
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
 * @desc    Lấy chi tiết độc giả
 * @route   GET /api/readers/:id
 * @access  Admin, Librarian, Reader (self)
 */
const getReaderById = asyncHandler(async (req, res) => {
    const readerId = req.params.id;

    // Kiểm tra quyền: độc giả chỉ xem được thông tin của mình
    if (req.user.role === 'reader') {
        if (!req.user.reader || req.user.reader.id !== parseInt(readerId)) {
            throw new AppError('Bạn không có quyền xem thông tin này', 403);
        }
    }

    const reader = await Reader.findByPk(readerId, {
        include: [
            {
                model: Account,
                as: 'account',
                attributes: ['id', 'username', 'email', 'status', 'created_at']
            },
            {
                model: LibraryCard,
                as: 'libraryCard'
            }
        ]
    });

    if (!reader) {
        throw new AppError('Không tìm thấy độc giả', 404);
    }

    res.json({
        success: true,
        data: reader
    });
});

/**
 * @desc    Thêm độc giả mới (bởi nhân viên)
 * @route   POST /api/readers
 * @access  Admin, Librarian
 */
const createReader = asyncHandler(async (req, res) => {
    const {
        username, password, email,
        full_name, id_card_number, phone, birth_date, address, title
    } = req.body;

    const transaction = await sequelize.transaction();

    try {
        // Kiểm tra username
        const existingAccount = await Account.findOne({ where: { username } });
        if (existingAccount) {
            throw new AppError('Tên đăng nhập đã tồn tại', 400);
        }

        // Kiểm tra CMND/CCCD
        const existingReader = await Reader.findOne({ where: { id_card_number } });
        if (existingReader) {
            throw new AppError('Số CMND/CCCD đã được đăng ký', 400);
        }

        // Lấy hoặc tạo nhóm reader
        let readerGroup = await UserGroup.findOne({ where: { name: 'reader' } });
        if (!readerGroup) {
            readerGroup = await UserGroup.create({
                name: 'reader',
                description: 'Độc giả thư viện'
            }, { transaction });
        }

        // Tạo token xác nhận email
        const crypto = require('crypto');
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const hashedVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 giờ

        // Tạo account (chưa kích hoạt, cần xác nhận email)
        const account = await Account.create({
            group_id: readerGroup.id,
            username,
            password,
            email,
            status: 'inactive',
            email_verification_token: hashedVerificationToken,
            email_verification_expires: verificationExpires
        }, { transaction });

        // Tạo reader
        const reader = await Reader.create({
            account_id: account.id,
            id_card_number,
            full_name,
            phone,
            birth_date,
            address,
            title
        }, { transaction });

        await transaction.commit();

        // Lấy lại reader với đầy đủ thông tin
        const createdReader = await Reader.findByPk(reader.id, {
            include: [
                { model: Account, as: 'account', attributes: { exclude: ['password'] } }
            ]
        });

        // Gửi email xác nhận (không block response nếu gửi email thất bại)
        if (email) {
            try {
                const { sendWelcomeEmail } = require('../config/email.config');
                // Đảm bảo luôn dùng port 3000, không phụ thuộc vào FRONTEND_URL có thể sai
                let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
                // Nếu FRONTEND_URL có port 5173, thay thế bằng 3000
                if (frontendUrl.includes(':5173')) {
                    frontendUrl = frontendUrl.replace(':5173', ':3000');
                }
                const verificationLink = `${frontendUrl}/verify-email/${verificationToken}`;
                await sendWelcomeEmail(email, full_name, username, verificationLink);
            } catch (emailError) {
                // Log lỗi nhưng không throw để không ảnh hưởng đến response
                console.error('Error sending welcome email:', emailError);
            }
        }

        res.status(201).json({
            success: true,
            message: 'Tạo độc giả thành công',
            data: createdReader
        });

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
});

/**
 * @desc    Cập nhật thông tin độc giả
 * @route   PUT /api/readers/:id
 * @access  Admin, Librarian, Reader (limited)
 */
const updateReader = asyncHandler(async (req, res) => {
    const readerId = req.params.id;
    const { full_name, phone, birth_date, address, title } = req.body;

    const reader = await Reader.findByPk(readerId);
    if (!reader) {
        throw new AppError('Không tìm thấy độc giả', 404);
    }

    // Độc giả chỉ được sửa SĐT của mình
    if (req.user.role === 'reader') {
        if (!req.user.reader || req.user.reader.id !== parseInt(readerId)) {
            throw new AppError('Bạn không có quyền sửa thông tin này', 403);
        }
        // Chỉ cho phép sửa phone
        await reader.update({ phone });
    } else {
        // Admin/Librarian sửa tất cả
        await reader.update({ full_name, phone, birth_date, address, title });
    }

    res.json({
        success: true,
        message: 'Cập nhật thông tin thành công',
        data: reader
    });
});

/**
 * @desc    Khóa tài khoản độc giả
 * @route   PUT /api/readers/:id/lock
 * @access  Admin, Librarian
 * 
 * Lưu ý: Khi khóa tài khoản, thẻ thư viện cũng tự động bị khóa (không cần validate điều kiện).
 * Đây là hành động khóa toàn bộ, khác với lockLibraryCard() chỉ khóa thẻ riêng biệt.
 * Nếu cần khóa thẻ với validation đầy đủ, sử dụng PUT /api/library-cards/:id/lock
 */
const lockReader = asyncHandler(async (req, res) => {
    const reader = await Reader.findByPk(req.params.id, {
        include: [{ model: Account, as: 'account' }]
    });

    if (!reader) {
        throw new AppError('Không tìm thấy độc giả', 404);
    }

    // Khóa tài khoản
    await reader.account.update({ status: 'locked' });

    // Khóa thẻ thư viện (nếu có) - Không cần validate vì đây là khóa toàn bộ tài khoản
    if (reader.libraryCard) {
        await reader.libraryCard.update({ status: 'locked' });
    }

    res.json({
        success: true,
        message: 'Khóa tài khoản thành công'
    });
});

/**
 * @desc    Mở khóa tài khoản độc giả
 * @route   PUT /api/readers/:id/unlock
 * @access  Admin, Librarian
 */
const unlockReader = asyncHandler(async (req, res) => {
    const reader = await Reader.findByPk(req.params.id, {
        include: [
            { model: Account, as: 'account' },
            { model: LibraryCard, as: 'libraryCard' }
        ]
    });

    if (!reader) {
        throw new AppError('Không tìm thấy độc giả', 404);
    }

    await reader.account.update({ status: 'active' });

    // Mở khóa thẻ nếu còn hạn
    if (reader.libraryCard && new Date(reader.libraryCard.expiry_date) > new Date()) {
        await reader.libraryCard.update({ status: 'active' });
    }

    res.json({
        success: true,
        message: 'Mở khóa tài khoản thành công'
    });
});

/**
 * @desc    Xóa vĩnh viễn độc giả - DISABLED
 * @route   DELETE /api/readers/:id
 * @access  KHÔNG CHO PHÉP - Trả về lỗi
 */
const deleteReader = asyncHandler(async (req, res) => {
    throw new AppError('Không cho phép xóa tài khoản người dùng. Vui lòng khóa tài khoản nếu cần thiết.', 403);
});

// ===================================================================
// LIBRARY CARD (Thẻ thư viện) CONTROLLERS
// ===================================================================

/**
 * @desc    Cấp thẻ thư viện cho độc giả
 * @route   POST /api/library-cards
 * @access  Admin, Librarian
 */
const createLibraryCard = asyncHandler(async (req, res) => {
    const {
        reader_id, expiry_date,
        max_books = defaultMaxBooks,
        max_borrow_days = defaultBorrowDays,
        deposit_amount = defaultDepositAmount
    } = req.body;

    // Kiểm tra độc giả
    const reader = await Reader.findByPk(reader_id, {
        include: [{ model: LibraryCard, as: 'libraryCard' }]
    });

    if (!reader) {
        throw new AppError('Không tìm thấy độc giả', 404);
    }

    if (reader.libraryCard) {
        throw new AppError('Độc giả đã có thẻ thư viện', 400);
    }

    // Kiểm tra số tiền cọc tối thiểu từ SystemSetting
    const { SystemSetting } = require('../models');
    const minDepositSetting = await SystemSetting.findOne({ where: { setting_key: 'min_deposit_amount' } });
    const minDepositAmount = minDepositSetting ? parseInt(minDepositSetting.setting_value) : defaultDepositAmount;

    if (deposit_amount < minDepositAmount) {
        throw new AppError(`Tiền cọc tối thiểu là ${minDepositAmount.toLocaleString('vi-VN')} VNĐ`, 400);
    }

    const transaction = await sequelize.transaction();

    try {
        // Tạo mã thẻ tự động (VD: TV2024001)
        const year = new Date().getFullYear();
        const lastCard = await LibraryCard.findOne({
            where: {
                card_number: { [Op.like]: `TV${year}%` }
            },
            order: [['card_number', 'DESC']]
        });

        let nextNumber = 1;
        if (lastCard) {
            const lastNumber = parseInt(lastCard.card_number.slice(-4));
            nextNumber = lastNumber + 1;
        }
        const card_number = `TV${year}${nextNumber.toString().padStart(4, '0')}`;

        // Tạo thẻ
        const libraryCard = await LibraryCard.create({
            card_number,
            reader_id,
            issue_date: new Date(),
            expiry_date,
            max_books,
            max_borrow_days,
            deposit_amount,
            status: 'active'
        }, { transaction });

        // Tạo giao dịch đặt cọc
        // Lấy staff_id từ user hiện tại
        const staff = await Staff.findOne({ where: { account_id: req.user.id } });

        if (staff && deposit_amount > 0) {
            await DepositTransaction.create({
                library_card_id: libraryCard.id,
                staff_id: staff.id,
                amount: deposit_amount,
                type: 'deposit',
                transaction_date: new Date(),
                notes: 'Đặt cọc khi làm thẻ'
            }, { transaction });
        }

        await transaction.commit();

        res.status(201).json({
            success: true,
            message: 'Cấp thẻ thư viện thành công',
            data: libraryCard
        });

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
});

/**
 * @desc    Cập nhật thẻ thư viện
 * @route   PUT /api/library-cards/:id
 * @access  Admin, Librarian
 */
const updateLibraryCard = asyncHandler(async (req, res) => {
    const libraryCard = await LibraryCard.findByPk(req.params.id);

    if (!libraryCard) {
        throw new AppError('Không tìm thấy thẻ thư viện', 404);
    }

    const { expiry_date, max_books, max_borrow_days, status } = req.body;
    await libraryCard.update({ expiry_date, max_books, max_borrow_days, status });

    res.json({
        success: true,
        message: 'Cập nhật thẻ thành công',
        data: libraryCard
    });
});

/**
 * @desc    Gia hạn thẻ thư viện
 * @route   PUT /api/library-cards/:id/renew
 * @access  Admin, Librarian
 */
const renewLibraryCard = asyncHandler(async (req, res) => {
    const libraryCard = await LibraryCard.findByPk(req.params.id);

    if (!libraryCard) {
        throw new AppError('Không tìm thấy thẻ thư viện', 404);
    }

    const { new_expiry_date } = req.body;

    if (!new_expiry_date) {
        throw new AppError('Vui lòng nhập ngày hết hạn mới', 400);
    }

    await libraryCard.update({
        expiry_date: new_expiry_date,
        status: 'active'
    });

    res.json({
        success: true,
        message: 'Gia hạn thẻ thành công',
        data: libraryCard
    });
});

/**
 * @desc    Khóa thẻ thư viện
 * @route   PUT /api/library-cards/:id/lock
 * @access  Admin, Librarian
 * 
 * Điều kiện khóa:
 * - Thẻ chưa hết hạn
 * - Không có phiếu mượn đang xử lý (pending, approved) hoặc đang mượn (borrowed)
 *   NHƯNG cho phép khóa nếu chỉ có phiếu mượn quá hạn (overdue)
 * - Thẻ đang ở trạng thái hoạt động
 */
const lockLibraryCard = asyncHandler(async (req, res) => {
    const libraryCard = await LibraryCard.findByPk(req.params.id);

    if (!libraryCard) {
        throw new AppError('Không tìm thấy thẻ thư viện', 404);
    }

    // Kiểm tra thẻ còn hạn
    if (libraryCard.status === 'expired' || new Date(libraryCard.expiry_date) < new Date()) {
        throw new AppError('Không thể khóa thẻ đã hết hạn', 400);
    }

    // Kiểm tra thẻ đang hoạt động
    if (libraryCard.status !== 'active') {
        throw new AppError('Chỉ có thể khóa thẻ đang hoạt động', 400);
    }

    // Kiểm tra phiếu mượn
    const activeBorrows = await BorrowRequest.count({
        where: {
            library_card_id: libraryCard.id,
            status: { [Op.in]: ['pending', 'approved', 'borrowed'] }
        }
    });

    if (activeBorrows > 0) {
        throw new AppError('Không thể khóa thẻ vì còn sách đang mượn. Chỉ có thể khóa nếu sách đã quá hạn.', 400);
    }

    await libraryCard.update({ status: 'locked' });

    res.json({
        success: true,
        message: 'Khóa thẻ thành công'
    });
});

/**
 * @desc    Mở khóa thẻ thư viện
 * @route   PUT /api/library-cards/:id/unlock
 * @access  Admin, Librarian
 */
const unlockLibraryCard = asyncHandler(async (req, res) => {
    const libraryCard = await LibraryCard.findByPk(req.params.id);

    if (!libraryCard) {
        throw new AppError('Không tìm thấy thẻ thư viện', 404);
    }

    // Chỉ mở khóa nếu thẻ còn hạn
    if (new Date(libraryCard.expiry_date) > new Date()) {
        await libraryCard.update({ status: 'active' });
    } else {
        await libraryCard.update({ status: 'expired' });
    }

    res.json({
        success: true,
        message: 'Mở khóa thẻ thành công'
    });
});

/**
 * @desc    Lấy danh sách sách đang mượn của độc giả
 * @route   GET /api/readers/:id/borrowed-books
 * @access  Admin, Librarian, Reader (self)
 */
const getReaderBorrowedBooks = asyncHandler(async (req, res) => {
    const readerId = req.params.id;

    // Kiểm tra quyền
    if (req.user.role === 'reader') {
        if (!req.user.reader || req.user.reader.id !== parseInt(readerId)) {
            throw new AppError('Bạn không có quyền xem thông tin này', 403);
        }
    }

    const reader = await Reader.findByPk(readerId, {
        include: [{ model: LibraryCard, as: 'libraryCard' }]
    });

    if (!reader || !reader.libraryCard) {
        return res.json({ success: true, data: [] });
    }

    // Lấy phiếu mượn đang borrowed hoặc overdue
    const BorrowDetail = require('../models').BorrowDetail;
    const BookCopy = require('../models').BookCopy;
    const BookEdition = require('../models').BookEdition;
    const Book = require('../models').Book;

    const borrowRequests = await BorrowRequest.findAll({
        where: {
            library_card_id: reader.libraryCard.id,
            status: { [Op.in]: ['borrowed', 'overdue'] }
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
                    include: [{ model: Book, as: 'book' }]
                }]
            }]
        }]
    });

    // Transform data
    const borrowedBooks = [];
    borrowRequests.forEach(req => {
        req.details.forEach(detail => {
            borrowedBooks.push({
                borrow_request_id: req.id,
                borrow_date: req.borrow_date,
                due_date: req.due_date,
                status: req.status,
                book_title: detail.bookCopy?.bookEdition?.book?.title,
                book_code: detail.bookCopy?.bookEdition?.book?.code,
                copy_id: detail.book_copy_id
            });
        });
    });

    res.json({ success: true, data: borrowedBooks });
});

module.exports = {
    // Reader
    getReaders,
    getReaderById,
    createReader,
    updateReader,
    lockReader,
    unlockReader,
    deleteReader,
    getReaderBorrowedBooks,

    // Library Card
    createLibraryCard,
    updateLibraryCard,
    renewLibraryCard,
    lockLibraryCard,
    unlockLibraryCard
};
