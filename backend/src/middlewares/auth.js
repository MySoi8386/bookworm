/**
 * ===================================================================
 * MIDDLEWARE: XÁC THỰC JWT (Authentication)
 * ===================================================================
 * Middleware kiểm tra token JWT trong header Authorization
 * - Xác thực người dùng đã đăng nhập
 * - Gắn thông tin user vào request
 * ===================================================================
 */

const jwt = require('jsonwebtoken');
const { Account, UserGroup, Staff, Reader } = require('../models');
const { jwtSecret } = require('../config/auth');

/**
 * Middleware xác thực JWT
 * Yêu cầu header: Authorization: Bearer <token>
 */
const authenticate = async (req, res, next) => {
    try {
        // Lấy token từ header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Vui lòng đăng nhập để tiếp tục'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, jwtSecret);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại'
                });
            }
            return res.status(401).json({
                success: false,
                message: 'Token không hợp lệ'
            });
        }

        // Tìm account trong database
        const account = await Account.findByPk(decoded.id, {
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
                    attributes: ['id', 'full_name', 'id_card_number']
                }
            ],
            attributes: { exclude: ['password'] }
        });

        if (!account) {
            return res.status(401).json({
                success: false,
                message: 'Tài khoản không tồn tại'
            });
        }

        // Kiểm tra trạng thái tài khoản
        if (account.status === 'locked') {
            return res.status(403).json({
                success: false,
                message: 'Tài khoản đã bị khóa'
            });
        }

        if (account.status === 'inactive') {
            return res.status(403).json({
                success: false,
                message: 'Tài khoản chưa được kích hoạt'
            });
        }

        // Gắn thông tin user vào request
        req.user = {
            id: account.id,
            username: account.username,
            email: account.email,
            role: account.userGroup?.name || 'reader',
            groupId: account.group_id,
            staff: account.staff,
            reader: account.reader
        };

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi xác thực, vui lòng thử lại'
        });
    }
};

/**
 * Middleware xác thực tùy chọn (optional)
 * Không bắt buộc phải có token, nhưng nếu có thì verify
 */
const optionalAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        req.user = null;
        return next();
    }

    // Nếu có token thì thực hiện xác thực
    return authenticate(req, res, next);
};

module.exports = {
    authenticate,
    optionalAuth
};
