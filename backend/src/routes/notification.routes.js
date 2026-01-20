/**
 * ===================================================================
 * ROUTES: THÔNG BÁO (Notification Routes)
 * ===================================================================
 * Định nghĩa các routes cho Notification
 * ===================================================================
 */

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middlewares/auth');
const { staffOnly } = require('../middlewares/authorize');

/**
 * @route   GET /api/notifications/overdue-users
 * @desc    Lấy danh sách người dùng có sách quá hạn
 * @access  Admin, Librarian
 */
router.get('/overdue-users', authenticate, staffOnly, notificationController.getOverdueUsers);

/**
 * @route   POST /api/notifications/send
 * @desc    Gửi email thông báo sách quá hạn
 * @access  Admin, Librarian
 */
router.post('/send', authenticate, staffOnly, notificationController.sendOverdueNotifications);

module.exports = router;
