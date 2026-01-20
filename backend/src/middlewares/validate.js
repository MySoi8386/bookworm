/**
 * ===================================================================
 * MIDDLEWARE: VALIDATE REQUEST (Input Validation)
 * ===================================================================
 * Middleware xử lý kết quả validation từ express-validator
 * - Kiểm tra lỗi validation
 * - Trả về response lỗi chi tiết
 * ===================================================================
 */

const { validationResult } = require('express-validator');

/**
 * Middleware xử lý kết quả validation
 * Sử dụng sau các validation rules của express-validator
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(err => ({
            field: err.path || err.param,
            message: err.msg,
            value: err.value
        }));

        return res.status(400).json({
            success: false,
            message: 'Dữ liệu không hợp lệ',
            errors: formattedErrors
        });
    }

    next();
};

module.exports = validate;
