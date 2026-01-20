/**
 * ===================================================================
 * MIDDLEWARE: XỬ LÝ LỖI (Error Handler)
 * ===================================================================
 * Middleware xử lý lỗi tập trung cho toàn bộ ứng dụng
 * - Log lỗi để debug
 * - Trả về response lỗi chuẩn hóa
 * - Ẩn chi tiết lỗi trong production
 * ===================================================================
 */

/**
 * Error handler middleware
 * Phải đặt sau tất cả routes
 */
const errorHandler = (err, req, res, next) => {
    // Log lỗi để debug
    console.error('=== ERROR ===');
    console.error('Time:', new Date().toISOString());
    console.error('URL:', req.originalUrl);
    console.error('Method:', req.method);
    console.error('Error:', err);
    console.error('Stack:', err.stack);
    console.error('=============');

    // Xác định status code
    let statusCode = err.statusCode || err.status || 500;
    let message = err.message || 'Đã có lỗi xảy ra';

    // Xử lý các loại lỗi cụ thể

    // Lỗi Sequelize Validation
    if (err.name === 'SequelizeValidationError') {
        statusCode = 400;
        const errors = err.errors.map(e => ({
            field: e.path,
            message: e.message
        }));
        return res.status(statusCode).json({
            success: false,
            message: 'Dữ liệu không hợp lệ',
            errors
        });
    }

    // Lỗi Sequelize Unique Constraint
    if (err.name === 'SequelizeUniqueConstraintError') {
        statusCode = 400;
        const field = err.errors[0]?.path || 'field';
        return res.status(statusCode).json({
            success: false,
            message: `Giá trị ${field} đã tồn tại trong hệ thống`
        });
    }

    // Lỗi Sequelize Foreign Key
    if (err.name === 'SequelizeForeignKeyConstraintError') {
        statusCode = 400;
        return res.status(statusCode).json({
            success: false,
            message: 'Dữ liệu tham chiếu không tồn tại hoặc đang được sử dụng'
        });
    }

    // Lỗi JWT
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Token không hợp lệ';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token đã hết hạn';
    }

    // Lỗi express-validator
    if (err.array && typeof err.array === 'function') {
        statusCode = 400;
        return res.status(statusCode).json({
            success: false,
            message: 'Dữ liệu không hợp lệ',
            errors: err.array()
        });
    }

    // Response lỗi
    const response = {
        success: false,
        message
    };

    // Thêm stack trace trong development
    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};

/**
 * Wrapper để bắt lỗi async/await
 * Sử dụng: router.get('/', asyncHandler(async (req, res) => {...}))
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Custom Error class với status code
 */
class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = errorHandler;
module.exports.asyncHandler = asyncHandler;
module.exports.AppError = AppError;
