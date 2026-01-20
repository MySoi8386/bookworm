/**
 * ===================================================================
 * ROUTES: TÀI CHÍNH (Finance Routes)
 * ===================================================================
 * Định nghĩa các routes cho Fine và Deposit
 * ===================================================================
 */

const express = require('express');
const router = express.Router();
const { financeController } = require('../controllers');
const { authenticate } = require('../middlewares/auth');
const { staffOnly, authenticated } = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const { idParamValidator } = require('../validators');
const { body } = require('express-validator');

// ===================================================================
// FINE (Tiền phạt) ROUTES
// ===================================================================

/**
 * @route   GET /api/fines
 * @desc    Lấy danh sách tiền phạt
 * @access  Admin, Librarian
 */
router.get('/fines', authenticate, staffOnly, financeController.getFines);

/**
 * @route   GET /api/fines/my
 * @desc    Lấy tiền phạt của tôi (độc giả)
 * @access  Reader
 */
router.get('/fines/my', authenticate, authenticated, financeController.getMyFines);

/**
 * @route   PUT /api/fines/:id/pay
 * @desc    Thanh toán tiền phạt
 * @access  Admin, Librarian
 */
router.put('/fines/:id/pay', authenticate, staffOnly, idParamValidator, validate, financeController.payFine);

/**
 * @route   PUT /api/fines/pay-all/:borrowRequestId
 * @desc    Thanh toán tất cả tiền phạt của một phiếu mượn
 * @access  Admin, Librarian
 */
router.put('/fines/pay-all/:borrowRequestId', authenticate, staffOnly, financeController.payAllFines);

/**
 * @route   DELETE /api/fines/:id
 * @desc    Xóa phiếu phạt (Admin only)
 * @access  Admin
 */
router.delete('/fines/:id', authenticate, staffOnly, idParamValidator, validate, financeController.deleteFine);

// ===================================================================
// DEPOSIT (Tiền đặt cọc) ROUTES
// ===================================================================

/**
 * @route   GET /api/deposits
 * @desc    Lấy danh sách giao dịch cọc
 * @access  Admin, Librarian
 */
router.get('/deposits', authenticate, staffOnly, financeController.getDeposits);

/**
 * @route   GET /api/deposits/my
 * @desc    Lấy giao dịch cọc của tôi (độc giả)
 * @access  Reader
 */
router.get('/deposits/my', authenticate, authenticated, financeController.getMyDeposits);

/**
 * @route   POST /api/deposits
 * @desc    Nạp tiền cọc
 * @access  Admin, Librarian
 */
router.post('/deposits',
    authenticate,
    staffOnly,
    [
        body('library_card_id').isInt({ min: 1 }).withMessage('ID thẻ không hợp lệ'),
        body('amount').isFloat({ min: 1000 }).withMessage('Số tiền phải lớn hơn 1,000 VND'),
        body('notes').optional().trim()
    ],
    validate,
    financeController.createDeposit
);

/**
 * @route   POST /api/deposits/refund
 * @desc    Hoàn tiền cọc
 * @access  Admin, Librarian
 */
router.post('/deposits/refund',
    authenticate,
    staffOnly,
    [
        body('library_card_id').isInt({ min: 1 }).withMessage('ID thẻ không hợp lệ'),
        body('amount').isFloat({ min: 1000 }).withMessage('Số tiền phải lớn hơn 1,000 VND'),
        body('notes').optional().trim()
    ],
    validate,
    financeController.refundDeposit
);

module.exports = router;
