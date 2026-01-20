/**
 * ===================================================================
 * ROUTES: MƯỢN TRẢ (Borrow Routes)
 * ===================================================================
 * Định nghĩa các routes cho BorrowRequest
 * ===================================================================
 */

const express = require('express');
const router = express.Router();
const { borrowController } = require('../controllers');
const { authenticate } = require('../middlewares/auth');
const { staffOnly, authenticated } = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const {
    createBorrowRequestValidator,
    approveBorrowRequestValidator,
    rejectBorrowRequestValidator,
    extendBorrowRequestValidator,
    returnBooksValidator,
    searchBorrowRequestValidator,
    idParamValidator
} = require('../validators');

/**
 * @route   GET /api/borrow-requests
 * @desc    Lấy danh sách phiếu mượn (cho nhân viên)
 * @access  Admin, Librarian
 */
router.get('/', authenticate, staffOnly, searchBorrowRequestValidator, validate, borrowController.getBorrowRequests);

/**
 * @route   GET /api/borrow-requests/my
 * @desc    Lấy phiếu mượn của tôi (độc giả)
 * @access  Reader
 */
router.get('/my', authenticate, authenticated, borrowController.getMyBorrowRequests);

/**
 * @route   GET /api/borrow-requests/:id
 * @desc    Lấy chi tiết phiếu mượn
 * @access  Admin, Librarian, Reader (self)
 */
router.get('/:id', authenticate, authenticated, idParamValidator, validate, borrowController.getBorrowRequestById);

/**
 * @route   POST /api/borrow-requests
 * @desc    Tạo phiếu mượn mới
 * @access  Admin, Librarian, Reader
 */
router.post('/', authenticate, authenticated, createBorrowRequestValidator, validate, borrowController.createBorrowRequest);

/**
 * @route   PUT /api/borrow-requests/:id/approve
 * @desc    Duyệt phiếu mượn (chuyển từ pending sang approved)
 * @access  Admin, Librarian
 */
router.put('/:id/approve', authenticate, staffOnly, approveBorrowRequestValidator, validate, borrowController.approveBorrowRequest);

/**
 * @route   PUT /api/borrow-requests/:id/issue
 * @desc    Xuất sách (chuyển từ approved sang borrowed)
 * @access  Admin, Librarian
 */
router.put('/:id/issue', authenticate, staffOnly, idParamValidator, validate, borrowController.issueBooks);

/**
 * @route   PUT /api/borrow-requests/:id/reject
 * @desc    Từ chối phiếu mượn
 * @access  Admin, Librarian
 */
router.put('/:id/reject', authenticate, staffOnly, rejectBorrowRequestValidator, validate, borrowController.rejectBorrowRequest);

/**
 * @route   PUT /api/borrow-requests/:id/extend
 * @desc    Gia hạn phiếu mượn
 * @access  Admin, Librarian
 */
router.put('/:id/extend', authenticate, staffOnly, extendBorrowRequestValidator, validate, borrowController.extendBorrowRequest);

/**
 * @route   PUT /api/borrow-requests/:id/return
 * @desc    Trả sách
 * @access  Admin, Librarian
 */
router.put('/:id/return', authenticate, staffOnly, returnBooksValidator, validate, borrowController.returnBooks);

/**
 * @route   DELETE /api/borrow-requests/:id
 * @desc    Hủy phiếu mượn
 * @access  Admin, Librarian, Reader (pending only)
 */
router.delete('/:id', authenticate, authenticated, idParamValidator, validate, borrowController.cancelBorrowRequest);

module.exports = router;
