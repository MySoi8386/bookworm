/**
 * ===================================================================
 * ROUTES: SÁCH (Book Routes)
 * ===================================================================
 * Định nghĩa các routes cho Book, BookEdition, BookCopy
 * ===================================================================
 */

const express = require('express');
const router = express.Router();
const { bookController } = require('../controllers');
const { authenticate } = require('../middlewares/auth');
const { staffOnly, adminOnly } = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const {
    createBookValidator, updateBookValidator, searchBookValidator,
    createEditionValidator, updateEditionValidator,
    createCopyValidator, updateCopyValidator,
    idParamValidator
} = require('../validators');

// ===================================================================
// BOOK (Đầu sách) ROUTES
// ===================================================================

/**
 * @route   GET /api/books
 * @desc    Lấy danh sách sách (có tìm kiếm, lọc, phân trang)
 * @access  Public
 */
router.get('/', searchBookValidator, validate, bookController.getBooks);

/**
 * @route   GET /api/books/:id
 * @desc    Lấy chi tiết sách
 * @access  Public
 */
router.get('/:id', idParamValidator, validate, bookController.getBookById);

/**
 * @route   POST /api/books
 * @desc    Tạo đầu sách mới
 * @access  Admin, Librarian
 */
router.post('/', authenticate, staffOnly, createBookValidator, validate, bookController.createBook);

/**
 * @route   PUT /api/books/:id
 * @desc    Cập nhật đầu sách
 * @access  Admin, Librarian
 */
router.put('/:id', authenticate, staffOnly, updateBookValidator, validate, bookController.updateBook);

/**
 * @route   DELETE /api/books/:id
 * @desc    Xóa đầu sách
 * @access  Admin only
 */
router.delete('/:id', authenticate, adminOnly, idParamValidator, validate, bookController.deleteBook);

// ===================================================================
// BOOK EDITION (Phiên bản xuất bản) ROUTES
// ===================================================================

/**
 * @route   GET /api/books/:bookId/editions
 * @desc    Lấy danh sách editions của một sách
 * @access  Public
 */
router.get('/:bookId/editions', bookController.getEditions);

/**
 * @route   POST /api/books/:bookId/editions
 * @desc    Thêm edition mới cho sách
 * @access  Admin, Librarian
 */
router.post('/:bookId/editions', authenticate, staffOnly, createEditionValidator, validate, bookController.createEdition);

module.exports = router;
