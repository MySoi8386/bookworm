/**
 * ===================================================================
 * VALIDATORS: XÁC THỰC (Authentication Validators)
 * ===================================================================
 * Các rules validation cho authentication APIs
 * ===================================================================
 */

const { body } = require('express-validator');

/**
 * Validation rules cho đăng nhập
 */
const loginValidator = [
    body('username')
        .trim()
        .notEmpty()
        .withMessage('Vui lòng nhập tên đăng nhập'),

    body('password')
        .notEmpty()
        .withMessage('Vui lòng nhập mật khẩu')
];

/**
 * Validation rules cho đăng ký độc giả
 */
const registerValidator = [
    body('username')
        .trim()
        .notEmpty()
        .withMessage('Vui lòng nhập tên đăng nhập')
        .isLength({ min: 4, max: 50 })
        .withMessage('Tên đăng nhập phải từ 4-50 ký tự')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Tên đăng nhập chỉ chứa chữ, số và dấu gạch dưới'),

    body('password')
        .notEmpty()
        .withMessage('Vui lòng nhập mật khẩu')
        .isLength({ min: 6 })
        .withMessage('Mật khẩu phải có ít nhất 6 ký tự'),

    body('confirmPassword')
        .notEmpty()
        .withMessage('Vui lòng xác nhận mật khẩu')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Mật khẩu xác nhận không khớp');
            }
            return true;
        }),

    body('email')
        .optional()
        .isEmail()
        .withMessage('Email không hợp lệ')
        .normalizeEmail(),

    body('full_name')
        .trim()
        .notEmpty()
        .withMessage('Vui lòng nhập họ tên')
        .isLength({ max: 100 })
        .withMessage('Họ tên không quá 100 ký tự'),

    body('id_card_number')
        .trim()
        .notEmpty()
        .withMessage('Vui lòng nhập số CMND/CCCD')
        .isLength({ min: 9, max: 12 })
        .withMessage('Số CMND/CCCD phải từ 9-12 ký tự'),

    body('phone')
        .optional()
        .matches(/^[0-9]{10,11}$/)
        .withMessage('Số điện thoại không hợp lệ')
];

/**
 * Validation rules cho đổi mật khẩu
 */
const changePasswordValidator = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Vui lòng nhập mật khẩu hiện tại'),

    body('newPassword')
        .notEmpty()
        .withMessage('Vui lòng nhập mật khẩu mới')
        .isLength({ min: 6 })
        .withMessage('Mật khẩu mới phải có ít nhất 6 ký tự')
        .custom((value, { req }) => {
            if (value === req.body.currentPassword) {
                throw new Error('Mật khẩu mới phải khác mật khẩu hiện tại');
            }
            return true;
        }),

    body('confirmPassword')
        .notEmpty()
        .withMessage('Vui lòng xác nhận mật khẩu mới')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Mật khẩu xác nhận không khớp');
            }
            return true;
        })
];

module.exports = {
    loginValidator,
    registerValidator,
    changePasswordValidator
};
