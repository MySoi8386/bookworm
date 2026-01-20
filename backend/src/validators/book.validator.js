/**
 * ===================================================================
 * VALIDATORS: SÁCH (Book Validators)
 * ===================================================================
 * Các rules validation cho Book, BookEdition, BookCopy APIs
 * ===================================================================
 */

const { body, param, query } = require('express-validator');

// ===================================================================
// BOOK (Đầu sách) VALIDATORS
// ===================================================================

const createBookValidator = [
    body('code')
        .trim()
        .notEmpty()
        .withMessage('Vui lòng nhập mã sách')
        .isLength({ max: 20 })
        .withMessage('Mã sách không quá 20 ký tự'),

    body('title')
        .trim()
        .notEmpty()
        .withMessage('Vui lòng nhập tên sách')
        .isLength({ max: 255 })
        .withMessage('Tên sách không quá 255 ký tự'),

    body('field_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Mã lĩnh vực không hợp lệ'),

    body('genre_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Mã thể loại không hợp lệ'),

    body('page_count')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Số trang phải là số dương'),

    body('size')
        .optional()
        .trim()
        .isLength({ max: 20 })
        .withMessage('Khổ sách không quá 20 ký tự'),

    body('description')
        .optional()
        .trim(),

    body('author_ids')
        .optional()
        .isArray()
        .withMessage('Danh sách tác giả phải là mảng'),

    body('author_ids.*')
        .isInt({ min: 1 })
        .withMessage('ID tác giả không hợp lệ')
];

const updateBookValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('ID sách không hợp lệ'),

    body('code')
        .optional()
        .trim()
        .isLength({ max: 20 })
        .withMessage('Mã sách không quá 20 ký tự'),

    body('title')
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage('Tên sách không quá 255 ký tự'),

    body('field_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Mã lĩnh vực không hợp lệ'),

    body('genre_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Mã thể loại không hợp lệ'),

    body('page_count')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Số trang phải là số dương'),

    body('size')
        .optional()
        .trim()
        .isLength({ max: 20 })
        .withMessage('Khổ sách không quá 20 ký tự'),

    body('description')
        .optional()
        .trim(),

    body('author_ids')
        .optional()
        .isArray()
        .withMessage('Danh sách tác giả phải là mảng'),

    body('author_ids.*')
        .isInt({ min: 1 })
        .withMessage('ID tác giả không hợp lệ')
];

const searchBookValidator = [
    query('keyword')
        .optional()
        .trim(),

    query('field_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Mã lĩnh vực không hợp lệ'),

    query('genre_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Mã thể loại không hợp lệ'),

    query('author_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Mã tác giả không hợp lệ'),

    query('publisher_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Mã NXB không hợp lệ'),

    query('publish_year')
        .optional()
        .isInt({ min: 1900, max: 2100 })
        .withMessage('Năm xuất bản không hợp lệ'),

    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Số trang không hợp lệ'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Số lượng mỗi trang từ 1-100')
];

// ===================================================================
// BOOK EDITION (Phiên bản xuất bản) VALIDATORS
// ===================================================================

const createEditionValidator = [
    param('bookId')
        .isInt({ min: 1 })
        .withMessage('ID sách không hợp lệ'),

    body('publisher_id')
        .notEmpty()
        .withMessage('Vui lòng chọn nhà xuất bản')
        .isInt({ min: 1 })
        .withMessage('Mã NXB không hợp lệ'),

    body('publish_year')
        .notEmpty()
        .withMessage('Vui lòng nhập năm xuất bản')
        .isInt({ min: 1900, max: 2100 })
        .withMessage('Năm xuất bản không hợp lệ'),

    body('isbn')
        .optional()
        .trim()
        .isLength({ max: 20 })
        .withMessage('ISBN không quá 20 ký tự')
];

const updateEditionValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('ID phiên bản không hợp lệ'),

    body('publisher_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Mã NXB không hợp lệ'),

    body('publish_year')
        .optional()
        .isInt({ min: 1900, max: 2100 })
        .withMessage('Năm xuất bản không hợp lệ'),

    body('isbn')
        .optional()
        .trim()
        .isLength({ max: 20 })
        .withMessage('ISBN không quá 20 ký tự')
];

// ===================================================================
// BOOK COPY (Bản sách) VALIDATORS
// ===================================================================

const createCopyValidator = [
    param('editionId')
        .isInt({ min: 1 })
        .withMessage('ID phiên bản không hợp lệ'),

    body('quantity')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Số lượng từ 1-100'),

    body('price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Giá sách phải là số dương'),

    body('condition_notes')
        .optional()
        .trim()
];

const updateCopyValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('ID bản sách không hợp lệ'),

    body('status')
        .optional()
        .isIn(['available', 'borrowed', 'damaged', 'disposed'])
        .withMessage('Trạng thái không hợp lệ'),

    body('price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Giá sách phải là số dương'),

    body('condition_notes')
        .optional()
        .trim()
];

module.exports = {
    // Book
    createBookValidator,
    updateBookValidator,
    searchBookValidator,

    // Edition
    createEditionValidator,
    updateEditionValidator,

    // Copy
    createCopyValidator,
    updateCopyValidator
};
