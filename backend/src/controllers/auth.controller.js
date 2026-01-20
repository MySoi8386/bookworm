/**
 * ===================================================================
 * CONTROLLER: XÁC THỰC (Auth Controller)
 * ===================================================================
 * Xử lý các API liên quan đến authentication:
 * - Đăng nhập
 * - Đăng ký độc giả
 * - Đổi mật khẩu
 * - Lấy thông tin user hiện tại
 * ===================================================================
 */

const jwt = require('jsonwebtoken');
const { Account, UserGroup, Staff, Reader, LibraryCard, sequelize } = require('../models');
const { jwtSecret, jwtExpiresIn, defaultDepositAmount, defaultMaxBooks, defaultBorrowDays } = require('../config/auth');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');

/**
 * Tạo JWT token
 */
const generateToken = (account) => {
    return jwt.sign(
        {
            id: account.id,
            username: account.username,
            role: account.userGroup?.name || 'reader'
        },
        jwtSecret,
        { expiresIn: jwtExpiresIn }
    );
};

/**
 * @desc    Đăng nhập
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    // Tìm account theo username
    const account = await Account.findOne({
        where: { username },
        include: [
            {
                model: UserGroup,
                as: 'userGroup',
                attributes: ['id', 'name']
            },
            {
                model: Staff,
                as: 'staff',
                attributes: ['id', 'full_name', 'position']
            },
            {
                model: Reader,
                as: 'reader',
                attributes: ['id', 'full_name', 'id_card_number'],
                include: [
                    {
                        model: LibraryCard,
                        as: 'libraryCard',
                        attributes: ['id', 'card_number', 'status', 'expiry_date']
                    }
                ]
            }
        ]
    });

    if (!account) {
        throw new AppError('Tên đăng nhập hoặc mật khẩu không đúng', 401);
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await account.comparePassword(password);
    if (!isPasswordValid) {
        throw new AppError('Tên đăng nhập hoặc mật khẩu không đúng', 401);
    }

    // Kiểm tra trạng thái tài khoản
    if (account.status === 'locked') {
        throw new AppError('Tài khoản đã bị khóa. Vui lòng liên hệ thủ thư.', 403);
    }

    if (account.status === 'inactive') {
        throw new AppError('Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email để xác nhận tài khoản.', 403);
    }

    // Tạo token
    const token = generateToken(account);

    // Response
    res.json({
        success: true,
        message: 'Đăng nhập thành công',
        data: {
            token,
            user: {
                id: account.id,
                username: account.username,
                email: account.email,
                role: account.userGroup?.name || 'reader',
                staff: account.staff,
                reader: account.reader
            }
        }
    });
});

/**
 * @desc    Đăng ký tài khoản độc giả
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
    const {
        username, password, email,
        full_name, id_card_number, phone, title
    } = req.body;

    // Bắt đầu transaction
    const transaction = await sequelize.transaction();

    try {
        // Kiểm tra username đã tồn tại
        const existingAccount = await Account.findOne({ where: { username } });
        if (existingAccount) {
            throw new AppError('Tên đăng nhập đã tồn tại', 400);
        }

        // Kiểm tra email đã tồn tại (nếu có)
        if (email) {
            const existingEmail = await Account.findOne({ where: { email } });
            if (existingEmail) {
                throw new AppError('Email đã được sử dụng', 400);
            }
        }

        // Kiểm tra CMND/CCCD đã tồn tại
        const existingReader = await Reader.findOne({ where: { id_card_number } });
        if (existingReader) {
            throw new AppError('Số CMND/CCCD đã được đăng ký', 400);
        }

        // Lấy nhóm reader
        let readerGroup = await UserGroup.findOne({ where: { name: 'reader' } });
        if (!readerGroup) {
            // Tạo nhóm reader nếu chưa có
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
            title
        }, { transaction });

        await transaction.commit();

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
            message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác nhận tài khoản.',
            data: {
                id: reader.id,
                full_name: reader.full_name,
                id_card_number: reader.id_card_number,
                username: account.username
            }
        });

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
});

/**
 * @desc    Lấy thông tin user hiện tại
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
    const account = await Account.findByPk(req.user.id, {
        attributes: { exclude: ['password'] },
        include: [
            {
                model: UserGroup,
                as: 'userGroup',
                attributes: ['id', 'name', 'description']
            },
            {
                model: Staff,
                as: 'staff',
                attributes: ['id', 'full_name', 'position', 'phone', 'address']
            },
            {
                model: Reader,
                as: 'reader',
                attributes: ['id', 'full_name', 'id_card_number', 'phone', 'birth_date', 'address', 'title'],
                include: [
                    {
                        model: LibraryCard,
                        as: 'libraryCard'
                    }
                ]
            }
        ]
    });

    if (!account) {
        throw new AppError('Không tìm thấy tài khoản', 404);
    }

    res.json({
        success: true,
        data: account
    });
});

/**
 * @desc    Đổi mật khẩu
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const account = await Account.findByPk(req.user.id);

    if (!account) {
        throw new AppError('Không tìm thấy tài khoản', 404);
    }

    // Kiểm tra mật khẩu hiện tại
    const isPasswordValid = await account.comparePassword(currentPassword);
    if (!isPasswordValid) {
        throw new AppError('Mật khẩu hiện tại không đúng', 400);
    }

    // Cập nhật mật khẩu mới
    account.password = newPassword;
    await account.save();

    res.json({
        success: true,
        message: 'Đổi mật khẩu thành công'
    });
});

/**
 * @desc    Cập nhật thông tin cá nhân
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
    const {
        full_name,
        phone,
        address,
        title // For reader
    } = req.body;

    const account = await Account.findByPk(req.user.id, {
        include: [
            { model: Staff, as: 'staff' },
            { model: Reader, as: 'reader' }
        ]
    });

    if (!account) {
        throw new AppError('Không tìm thấy tài khoản', 404);
    }

    const transaction = await sequelize.transaction();

    try {
        // Update Staff Info
        if (account.staff) {
            await account.staff.update({
                full_name: full_name || account.staff.full_name,
                phone: phone || account.staff.phone,
                address: address || account.staff.address
            }, { transaction });
        }

        // Update Reader Info
        if (account.reader) {
            await account.reader.update({
                full_name: full_name || account.reader.full_name,
                phone: phone || account.reader.phone,
                address: address || account.reader.address,
                title: title || account.reader.title
            }, { transaction });
        }

        await transaction.commit();

        res.json({
            success: true,
            message: 'Cập nhật thông tin thành công'
        });

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
});

/**
 * @desc    Đăng xuất (client-side, chỉ trả về success)
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
    // JWT là stateless, việc logout xử lý ở client bằng cách xóa token
    res.json({
        success: true,
        message: 'Đăng xuất thành công'
    });
});

/**
 * @desc    Quên mật khẩu - Gửi email reset
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new AppError('Vui lòng nhập email', 400);
    }

    // Tìm tài khoản theo email
    const account = await Account.findOne({ where: { email } });

    if (!account) {
        throw new AppError('Không tìm thấy tài khoản với email này', 404);
    }

    // Tạo token reset (sử dụng crypto)
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token trước khi lưu vào database
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Lưu token và thời gian hết hạn (1 giờ)
    account.reset_password_token = hashedToken;
    account.reset_password_expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await account.save();

    // Tạo link reset
    // Đảm bảo luôn dùng port 3000
    let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    // Nếu FRONTEND_URL có port 5173, thay thế bằng 3000
    if (frontendUrl.includes(':5173')) {
        frontendUrl = frontendUrl.replace(':5173', ':3000');
    }
    const resetLink = `${frontendUrl}/reset-password/${resetToken}`;

    // Gửi email
    try {
        const { sendPasswordResetEmail } = require('../config/email.config');
        await sendPasswordResetEmail(email, resetLink);

        res.json({
            success: true,
            message: 'Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư.'
        });
    } catch (error) {
        // Nếu gửi email thất bại, xóa token
        account.reset_password_token = null;
        account.reset_password_expires = null;
        await account.save();

        console.error('Error sending email:', error);
        throw new AppError('Không thể gửi email. Vui lòng thử lại sau.', 500);
    }
});

/**
 * @desc    Xác nhận email và kích hoạt tài khoản
 * @route   GET /api/auth/verify-email/:token
 * @access  Public
 */
const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.params;

    if (!token) {
        throw new AppError('Token không hợp lệ', 400);
    }

    // Hash token để so sánh với database
    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Tìm tài khoản với token hợp lệ và chưa hết hạn
    const account = await Account.findOne({
        where: {
            email_verification_token: hashedToken,
            email_verification_expires: {
                [require('sequelize').Op.gt]: new Date()
            }
        }
    });

    // Nếu không tìm thấy với token và chưa hết hạn, kiểm tra xem có phải đã verify rồi không
    if (!account) {
        // Kiểm tra xem có account nào đã active và token đã bị xóa chưa (đã verify rồi)
        const alreadyVerified = await Account.findOne({
            where: {
                email_verification_token: null,
                status: 'active'
            }
        });

        // Nếu token không hợp lệ nhưng không phải do đã verify, thì báo lỗi
        throw new AppError('Token không hợp lệ hoặc đã hết hạn', 400);
    }

    // Kiểm tra nếu đã được kích hoạt rồi (trường hợp hiếm khi token còn nhưng status đã active)
    if (account.status === 'active') {
        // Xóa token để tránh verify lại
        account.email_verification_token = null;
        account.email_verification_expires = null;
        await account.save();
        
        return res.json({
            success: true,
            message: 'Tài khoản đã được kích hoạt trước đó'
        });
    }

    // Kích hoạt tài khoản
    account.status = 'active';
    account.email_verification_token = null;
    account.email_verification_expires = null;
    await account.save();

    res.json({
        success: true,
        message: 'Email đã được xác nhận thành công. Tài khoản của bạn đã được kích hoạt.'
    });
});

/**
 * @desc    Đặt lại mật khẩu
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.body;

    if (!token) {
        throw new AppError('Token không hợp lệ', 400);
    }

    // Hash token để so sánh với database
    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Tìm tài khoản với token hợp lệ và chưa hết hạn
    const account = await Account.findOne({
        where: {
            reset_password_token: hashedToken,
            reset_password_expires: {
                [require('sequelize').Op.gt]: new Date()
            }
        }
    });

    if (!account) {
        throw new AppError('Token không hợp lệ hoặc đã hết hạn', 400);
    }

    // Đặt lại mật khẩu về "reader123"
    account.password = 'reader123';
    account.reset_password_token = null;
    account.reset_password_expires = null;
    await account.save();

    res.json({
        success: true,
        message: 'Mật khẩu đã được đặt lại thành công. Mật khẩu mới là: reader123'
    });
});

module.exports = {
    login,
    register,
    getMe,
    changePassword,
    updateProfile,
    logout,
    forgotPassword,
    verifyEmail,
    resetPassword
};
