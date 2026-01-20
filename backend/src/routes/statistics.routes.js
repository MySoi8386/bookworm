/**
 * ===================================================================
 * ROUTES: THỐNG KÊ BÁO CÁO (Statistics Routes)
 * ===================================================================
 * Định nghĩa các routes cho Statistics và Reports
 * ===================================================================
 */

const express = require('express');
const router = express.Router();
const { statisticsController } = require('../controllers');
const { authenticate } = require('../middlewares/auth');
const { staffOnly, adminOnly } = require('../middlewares/authorize');

// ===================================================================
// STATISTICS ROUTES
// ===================================================================

/**
 * @route   GET /api/statistics/dashboard
 * @desc    Lấy thống kê tổng quan cho dashboard
 * @access  Admin, Librarian
 */
router.get('/dashboard', authenticate, staffOnly, statisticsController.getDashboardStats);

/**
 * @route   GET /api/statistics/overdue
 * @desc    Lấy danh sách sách quá hạn
 * @access  Admin, Librarian
 */
router.get('/overdue', authenticate, staffOnly, statisticsController.getOverdueBooks);

/**
 * @route   GET /api/statistics/popular-books
 * @desc    Lấy danh sách sách mượn nhiều nhất
 * @access  Admin, Librarian
 */
router.get('/popular-books', authenticate, staffOnly, statisticsController.getPopularBooks);

/**
 * @route   GET /api/statistics/borrowing-trend
 * @desc    Lấy xu hướng mượn sách
 * @access  Admin, Librarian
 */
router.get('/borrowing-trend', authenticate, staffOnly, statisticsController.getBorrowingTrend);

// ===================================================================
// REPORTS ROUTES
// ===================================================================

/**
 * @route   POST /api/reports/weekly-reminders
 * @desc    Tạo phiếu nhắc trả (thứ 6 hàng tuần)
 * @access  Admin, Librarian
 */
router.post('/weekly-reminders', authenticate, staffOnly, statisticsController.generateWeeklyReminders);

/**
 * @route   GET /api/reports/semi-annual
 * @desc    Báo cáo tổng hợp 6 tháng
 * @access  Admin only
 */
router.get('/semi-annual', authenticate, adminOnly, statisticsController.getSemiAnnualReport);

module.exports = router;
