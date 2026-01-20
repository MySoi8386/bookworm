/**
 * ===================================================================
 * VALIDATORS: MƯỢN TRẢ (Borrow Validators)
 * ===================================================================
 * Các rules validation cho BorrowRequest, BorrowDetail APIs
 * ===================================================================
 */

const { body, param, query } = require('express-validator');

// ===================================================================
// BORROW REQUEST (Phiếu mượn) VALIDATORS
// ===================================================================

/**
 * Tạo phiếu mượn mới
 * Note: library_card_id là optional - nếu là reader thì backend tự động lấy từ account_id
 */
const createBorrowRequestValidator = [
    body('library_card_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('ID thẻ thư viện không hợp lệ'),

    body('due_date')
        .notEmpty()
        .withMessage('Vui lòng nhập ngày hẹn trả')
        .isDate()
        .withMessage('Ngày hẹn trả không hợp lệ')
        .custom((value) => {
            if (new Date(value) <= new Date()) {
                throw new Error('Ngày hẹn trả phải sau ngày hiện tại');
            }
            return true;
        }),

    body('book_copy_ids')
        .notEmpty()
        .withMessage('Vui lòng chọn ít nhất một bản sách')
        .isArray({ min: 1 })
        .withMessage('Danh sách bản sách phải là mảng có ít nhất 1 phần tử'),

    body('book_copy_ids.*')
        .isInt({ min: 1 })
        .withMessage('ID bản sách không hợp lệ'),

    body('notes')
        .optional()
        .trim()
];

/**
 * Duyệt phiếu mượn
 */
const approveBorrowRequestValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('ID phiếu mượn không hợp lệ'),

    body('notes')
        .optional()
        .trim()
];

/**
 * Từ chối phiếu mượn
 */
const rejectBorrowRequestValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('ID phiếu mượn không hợp lệ'),

    body('reason')
        .trim()
        .notEmpty()
        .withMessage('Vui lòng nhập lý do từ chối')
];

/**
 * Gia hạn phiếu mượn
 */
const extendBorrowRequestValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('ID phiếu mượn không hợp lệ'),

    body('new_due_date')
        .notEmpty()
        .withMessage('Vui lòng nhập ngày hẹn trả mới')
        .isDate()
        .withMessage('Ngày hẹn trả không hợp lệ')
        .custom((value) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const newDueDate = new Date(value);
            newDueDate.setHours(0, 0, 0, 0);
            
            // Ngày hạn mới phải sau ngày hiện tại
            if (newDueDate <= today) {
                throw new Error('Ngày hẹn trả mới phải sau ngày hiện tại');
            }
            
            return true;
        }),

    body('notes')
        .optional()
        .trim()
];

/**
 * Trả sách
 */
const returnBooksValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('ID phiếu mượn không hợp lệ'),

    body('returns')
        .notEmpty()
        .withMessage('Vui lòng nhập thông tin trả sách')
        .isArray({ min: 1 })
        .withMessage('Danh sách trả sách phải là mảng'),

    body('returns.*.book_copy_id')
        .isInt({ min: 1 })
        .withMessage('ID bản sách không hợp lệ'),

    body('returns.*.return_condition')
        .isIn(['normal', 'damaged', 'lost'])
        .withMessage('Tình trạng trả không hợp lệ (normal, damaged, lost)'),

    body('returns.*.notes')
        .optional()
        .trim()
];

/**
 * Lọc/tìm kiếm phiếu mượn
 */
const searchBorrowRequestValidator = [
    query('status')
        .optional()
        .isIn(['pending', 'approved', 'rejected', 'borrowed', 'returned', 'overdue'])
        .withMessage('Trạng thái không hợp lệ'),

    query('library_card_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('ID thẻ thư viện không hợp lệ'),

    query('from_date')
        .optional()
        .isDate()
        .withMessage('Ngày bắt đầu không hợp lệ'),

    query('to_date')
        .optional()
        .isDate()
        .withMessage('Ngày kết thúc không hợp lệ'),

    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Số trang không hợp lệ'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Số lượng mỗi trang từ 1-100')
];

module.exports = {
    createBorrowRequestValidator,
    approveBorrowRequestValidator,
    rejectBorrowRequestValidator,
    extendBorrowRequestValidator,
    returnBooksValidator,
    searchBorrowRequestValidator
};
