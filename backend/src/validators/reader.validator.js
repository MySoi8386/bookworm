/**
 * ===================================================================
 * VALIDATORS: ĐỘC GIẢ (Reader Validators)
 * ===================================================================
 * Các rules validation cho Reader, LibraryCard APIs
 * ===================================================================
 */

const { body, param } = require('express-validator');

// ===================================================================
// READER (Độc giả) VALIDATORS
// ===================================================================

const createReaderValidator = [
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
        .withMessage('Số điện thoại không hợp lệ'),

    body('birth_date')
        .optional()
        .isDate()
        .withMessage('Ngày sinh không hợp lệ'),

    body('address')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Địa chỉ không quá 500 ký tự'),

    body('title')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Chức danh không quá 100 ký tự')
];

const updateReaderValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('ID độc giả không hợp lệ'),

    body('full_name')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Họ tên không quá 100 ký tự'),

    body('phone')
        .optional()
        .matches(/^[0-9]{10,11}$/)
        .withMessage('Số điện thoại không hợp lệ'),

    body('birth_date')
        .optional()
        .isDate()
        .withMessage('Ngày sinh không hợp lệ'),

    body('address')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Địa chỉ không quá 500 ký tự'),

    body('title')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Chức danh không quá 100 ký tự')
];

// ===================================================================
// LIBRARY CARD (Thẻ thư viện) VALIDATORS
// ===================================================================

const createLibraryCardValidator = [
    body('reader_id')
        .notEmpty()
        .withMessage('Vui lòng chọn độc giả')
        .isInt({ min: 1 })
        .withMessage('ID độc giả không hợp lệ'),

    body('expiry_date')
        .notEmpty()
        .withMessage('Vui lòng nhập ngày hết hạn')
        .isDate()
        .withMessage('Ngày hết hạn không hợp lệ')
        .custom((value) => {
            if (new Date(value) <= new Date()) {
                throw new Error('Ngày hết hạn phải sau ngày hiện tại');
            }
            return true;
        }),

    body('max_books')
        .optional()
        .isInt({ min: 1, max: 20 })
        .withMessage('Số sách tối đa từ 1-20'),

    body('max_borrow_days')
        .optional()
        .isInt({ min: 1, max: 60 })
        .withMessage('Số ngày mượn từ 1-60'),

    body('deposit_amount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Tiền đặt cọc không hợp lệ')
];

const updateLibraryCardValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('ID thẻ thư viện không hợp lệ'),

    body('expiry_date')
        .optional()
        .isDate()
        .withMessage('Ngày hết hạn không hợp lệ'),

    body('max_books')
        .optional()
        .isInt({ min: 1, max: 20 })
        .withMessage('Số sách tối đa từ 1-20'),

    body('max_borrow_days')
        .optional()
        .isInt({ min: 1, max: 60 })
        .withMessage('Số ngày mượn từ 1-60'),

    body('status')
        .optional()
        .isIn(['active', 'expired', 'locked'])
        .withMessage('Trạng thái không hợp lệ')
];

module.exports = {
    createReaderValidator,
    updateReaderValidator,
    createLibraryCardValidator,
    updateLibraryCardValidator
};
