/**
 * ===================================================================
 * ROUTES: PHIÊN BẢN & BẢN SÁCH (Edition & Copy Routes)
 * ===================================================================
 * Định nghĩa các routes cho BookEdition và BookCopy
 * ===================================================================
 */

const express = require('express');
const router = express.Router();
const { bookController } = require('../controllers');
const { authenticate } = require('../middlewares/auth');
const { staffOnly, adminOnly } = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const {
    updateEditionValidator, createCopyValidator, updateCopyValidator,
    idParamValidator
} = require('../validators');

// ===================================================================
// EDITION ROUTES
// ===================================================================

/**
 * @route   PUT /api/editions/:id
 * @desc    Cập nhật edition
 * @access  Admin, Librarian
 */
router.put('/:id', authenticate, staffOnly, updateEditionValidator, validate, bookController.updateEdition);

/**
 * @route   DELETE /api/editions/:id
 * @desc    Xóa edition
 * @access  Admin only
 */
router.delete('/:id', authenticate, adminOnly, idParamValidator, validate, bookController.deleteEdition);

/**
 * @route   GET /api/editions/:editionId/copies
 * @desc    Lấy danh sách bản sách của một edition
 * @access  Admin, Librarian
 */
router.get('/:editionId/copies', authenticate, staffOnly, bookController.getCopies);

/**
 * @route   POST /api/editions/:editionId/copies
 * @desc    Thêm bản sách mới
 * @access  Admin, Librarian
 */
router.post('/:editionId/copies', authenticate, staffOnly, createCopyValidator, validate, bookController.createCopies);

module.exports = router;
