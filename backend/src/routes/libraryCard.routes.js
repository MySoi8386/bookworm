/**
 * ===================================================================
 * ROUTES: THẺ THƯ VIỆN (Library Card Routes)
 * ===================================================================
 * Định nghĩa các routes cho LibraryCard
 * ===================================================================
 */

const express = require('express');
const router = express.Router();
const { readerController } = require('../controllers');
const { authenticate } = require('../middlewares/auth');
const { staffOnly } = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const {
    createLibraryCardValidator, updateLibraryCardValidator,
    idParamValidator
} = require('../validators');

/**
 * @route   POST /api/library-cards
 * @desc    Cấp thẻ thư viện cho độc giả
 * @access  Admin, Librarian
 */
router.post('/', authenticate, staffOnly, createLibraryCardValidator, validate, readerController.createLibraryCard);

/**
 * @route   PUT /api/library-cards/:id
 * @desc    Cập nhật thẻ thư viện
 * @access  Admin, Librarian
 */
router.put('/:id', authenticate, staffOnly, updateLibraryCardValidator, validate, readerController.updateLibraryCard);

/**
 * @route   PUT /api/library-cards/:id/renew
 * @desc    Gia hạn thẻ thư viện
 * @access  Admin, Librarian
 */
router.put('/:id/renew', authenticate, staffOnly, idParamValidator, validate, readerController.renewLibraryCard);

/**
 * @route   PUT /api/library-cards/:id/lock
 * @desc    Khóa thẻ thư viện
 * @access  Admin, Librarian
 */
router.put('/:id/lock', authenticate, staffOnly, idParamValidator, validate, readerController.lockLibraryCard);

/**
 * @route   PUT /api/library-cards/:id/unlock
 * @desc    Mở khóa thẻ thư viện
 * @access  Admin, Librarian
 */
router.put('/:id/unlock', authenticate, staffOnly, idParamValidator, validate, readerController.unlockLibraryCard);

module.exports = router;
