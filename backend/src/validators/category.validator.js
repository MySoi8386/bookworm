/**
 * ===================================================================
 * VALIDATORS: DANH MỤC (Category Validators)
 * ===================================================================
 * Các rules validation cho Field, Genre, Author, Publisher APIs
 * ===================================================================
 */

const { body, param } = require('express-validator');

// ===================================================================
// FIELD (Lĩnh vực) VALIDATORS
// ===================================================================

const createFieldValidator = [
    body('code')
        .trim()
        .notEmpty()
        .withMessage('Vui lòng nhập mã lĩnh vực')
        .isLength({ max: 20 })
        .withMessage('Mã lĩnh vực không quá 20 ký tự'),

    body('name')
        .trim()
        .notEmpty()
        .withMessage('Vui lòng nhập tên lĩnh vực')
        .isLength({ max: 100 })
        .withMessage('Tên lĩnh vực không quá 100 ký tự'),

    body('description')
        .optional()
        .trim()
];

const updateFieldValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('ID lĩnh vực không hợp lệ'),

    body('code')
        .optional()
        .trim()
        .isLength({ max: 20 })
        .withMessage('Mã lĩnh vực không quá 20 ký tự'),

    body('name')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Tên lĩnh vực không quá 100 ký tự'),

    body('description')
        .optional()
        .trim()
];

// ===================================================================
// GENRE (Thể loại) VALIDATORS
// ===================================================================

const createGenreValidator = [
    body('code')
        .trim()
        .notEmpty()
        .withMessage('Vui lòng nhập mã thể loại')
        .isLength({ max: 20 })
        .withMessage('Mã thể loại không quá 20 ký tự'),

    body('name')
        .trim()
        .notEmpty()
        .withMessage('Vui lòng nhập tên thể loại')
        .isLength({ max: 100 })
        .withMessage('Tên thể loại không quá 100 ký tự'),

    body('description')
        .optional()
        .trim()
];

const updateGenreValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('ID thể loại không hợp lệ'),

    body('code')
        .optional()
        .trim()
        .isLength({ max: 20 })
        .withMessage('Mã thể loại không quá 20 ký tự'),

    body('name')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Tên thể loại không quá 100 ký tự'),

    body('description')
        .optional()
        .trim()
];

// ===================================================================
// AUTHOR (Tác giả) VALIDATORS
// ===================================================================

const createAuthorValidator = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Vui lòng nhập tên tác giả')
        .isLength({ max: 100 })
        .withMessage('Tên tác giả không quá 100 ký tự'),

    body('title')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Chức danh không quá 100 ký tự'),

    body('workplace')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Nơi làm việc không quá 200 ký tự'),

    body('bio')
        .optional()
        .trim()
];

const updateAuthorValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('ID tác giả không hợp lệ'),

    body('name')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Tên tác giả không quá 100 ký tự'),

    body('title')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Chức danh không quá 100 ký tự'),

    body('workplace')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Nơi làm việc không quá 200 ký tự'),

    body('bio')
        .optional()
        .trim()
];

// ===================================================================
// PUBLISHER (Nhà xuất bản) VALIDATORS
// ===================================================================

const createPublisherValidator = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Vui lòng nhập tên nhà xuất bản')
        .isLength({ max: 150 })
        .withMessage('Tên NXB không quá 150 ký tự'),

    body('address')
        .optional()
        .trim(),

    body('established_date')
        .optional()
        .isDate()
        .withMessage('Ngày thành lập không hợp lệ'),

    body('phone')
        .optional()
        .matches(/^[0-9]{10,11}$/)
        .withMessage('Số điện thoại không hợp lệ'),

    body('email')
        .optional()
        .isEmail()
        .withMessage('Email không hợp lệ')
        .normalizeEmail()
];

const updatePublisherValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('ID nhà xuất bản không hợp lệ'),

    body('name')
        .optional()
        .trim()
        .isLength({ max: 150 })
        .withMessage('Tên NXB không quá 150 ký tự'),

    body('address')
        .optional()
        .trim(),

    body('established_date')
        .optional()
        .isDate()
        .withMessage('Ngày thành lập không hợp lệ'),

    body('phone')
        .optional()
        .matches(/^[0-9]{10,11}$/)
        .withMessage('Số điện thoại không hợp lệ'),

    body('email')
        .optional()
        .isEmail()
        .withMessage('Email không hợp lệ')
        .normalizeEmail()
];

// ===================================================================
// COMMON
// ===================================================================

const idParamValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('ID không hợp lệ')
];

module.exports = {
    // Field
    createFieldValidator,
    updateFieldValidator,

    // Genre
    createGenreValidator,
    updateGenreValidator,

    // Author
    createAuthorValidator,
    updateAuthorValidator,

    // Publisher
    createPublisherValidator,
    updatePublisherValidator,

    // Common
    idParamValidator
};
