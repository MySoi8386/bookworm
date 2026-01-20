/**
 * ===================================================================
 * ROUTES: XÁC THỰC (Auth Routes)
 * ===================================================================
 * Định nghĩa các routes cho authentication
 * ===================================================================
 */

const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const { authenticate } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { loginValidator, registerValidator, changePasswordValidator } = require('../validators');

/**
 * @route   POST /api/auth/login
 * @desc    Đăng nhập
 * @access  Public
 */
router.post('/login', loginValidator, validate, authController.login);

/**
 * @route   POST /api/auth/register
 * @desc    Đăng ký tài khoản độc giả
 * @access  Public
 */
router.post('/register', registerValidator, validate, authController.register);

/**
 * @route   GET /api/auth/me
 * @desc    Lấy thông tin người dùng hiện tại
 * @access  Private
 */
router.get('/me', authenticate, authController.getMe);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Đổi mật khẩu
 * @access  Private
 */
router.put('/change-password', authenticate, changePasswordValidator, validate, authController.changePassword);

/**
 * @route   PUT /api/auth/profile
 * @desc    Cập nhật thông tin cá nhân
 * @access  Private
 */
router.put('/profile', authenticate, authController.updateProfile);

/**
 * @route   POST /api/auth/logout
 * @desc    Đăng xuất
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Gửi email đặt lại mật khẩu
 * @access  Public
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @route   GET /api/auth/verify-email/:token
 * @desc    Xác nhận email và kích hoạt tài khoản
 * @access  Public
 */
router.get('/verify-email/:token', authController.verifyEmail);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Đặt lại mật khẩu
 * @access  Public
 */
router.post('/reset-password', authController.resetPassword);

module.exports = router;
