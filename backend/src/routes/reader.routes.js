/**
 * ===================================================================
 * ROUTES: ĐỘC GIẢ (Reader Routes)
 * ===================================================================
 * Định nghĩa các routes cho Reader và LibraryCard
 * ===================================================================
 */

const express = require('express');
const router = express.Router();
const { readerController } = require('../controllers');
const { authenticate } = require('../middlewares/auth');
const { staffOnly, adminOnly, authenticated } = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const {
    createReaderValidator, updateReaderValidator,
    idParamValidator
} = require('../validators');

// ===================================================================
// READER (Độc giả) ROUTES
// ===================================================================

/**
 * @route   GET /api/readers
 * @desc    Lấy danh sách độc giả
 * @access  Admin, Librarian
 */
router.get('/', authenticate, staffOnly, readerController.getReaders);

/**
 * @route   GET /api/readers/:id
 * @desc    Lấy chi tiết độc giả
 * @access  Admin, Librarian, Reader (self)
 */
router.get('/:id', authenticate, authenticated, idParamValidator, validate, readerController.getReaderById);

/**
 * @route   POST /api/readers
 * @desc    Thêm độc giả mới
 * @access  Admin, Librarian
 */
router.post('/', authenticate, staffOnly, createReaderValidator, validate, readerController.createReader);

/**
 * @route   PUT /api/readers/:id
 * @desc    Cập nhật thông tin độc giả
 * @access  Admin, Librarian, Reader (limited)
 */
router.put('/:id', authenticate, authenticated, updateReaderValidator, validate, readerController.updateReader);

/**
 * @route   PUT /api/readers/:id/lock
 * @desc    Khóa tài khoản độc giả
 * @access  Admin, Librarian
 */
router.put('/:id/lock', authenticate, staffOnly, idParamValidator, validate, readerController.lockReader);

/**
 * @route   PUT /api/readers/:id/unlock
 * @desc    Mở khóa tài khoản độc giả
 * @access  Admin, Librarian
 */
router.put('/:id/unlock', authenticate, staffOnly, idParamValidator, validate, readerController.unlockReader);

/**
 * @route   DELETE /api/readers/:id
 * @desc    Xóa độc giả vĩnh viễn - DISABLED
 * @access  KHÔNG CHO PHÉP
 */
router.delete('/:id', authenticate, adminOnly, idParamValidator, validate, readerController.deleteReader);

/**
 * @route   GET /api/readers/:id/borrowed-books
 * @desc    Lấy danh sách sách đang mượn của độc giả
 * @access  Admin, Librarian, Reader (self)
 */
router.get('/:id/borrowed-books', authenticate, authenticated, idParamValidator, validate, readerController.getReaderBorrowedBooks);

module.exports = router;
