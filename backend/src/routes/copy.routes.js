/**
 * ===================================================================
 * ROUTES: BẢN SÁCH (Copy Routes)
 * ===================================================================
 * Định nghĩa các routes cho BookCopy
 * ===================================================================
 */

const express = require('express');
const router = express.Router();
const { bookController } = require('../controllers');
const { authenticate } = require('../middlewares/auth');
const { staffOnly, adminOnly } = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { updateCopyValidator, idParamValidator } = require('../validators');

/**
 * @route   GET /api/copies
 * @desc    Lấy danh sách bản sách (có filter theo edition_id, status)
 * @access  Admin, Librarian, Reader (chỉ xem available copies)
 */
router.get('/', authenticate, bookController.getAllCopies);

/**
 * @route   PUT /api/copies/:id
 * @desc    Cập nhật bản sách (trạng thái, giá, ghi chú)
 * @access  Admin, Librarian
 */
router.put('/:id', authenticate, staffOnly, updateCopyValidator, validate, bookController.updateCopy);

/**
 * @route   DELETE /api/copies/:id
 * @desc    Xóa bản sách (chỉ khi không đang mượn)
 * @access  Admin, Librarian
 */
router.delete('/:id', authenticate, staffOnly, idParamValidator, validate, bookController.deleteCopy);

/**
 * @route   PUT /api/copies/:id/dispose
 * @desc    Thanh lý bản sách
 * @access  Admin only
 */
router.put('/:id/dispose', authenticate, adminOnly, idParamValidator, validate, bookController.disposeCopy);

module.exports = router;
