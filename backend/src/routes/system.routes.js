/**
 * ===================================================================
 * ROUTES: HỆ THỐNG (System Routes)
 * ===================================================================
 */

const express = require('express');
const router = express.Router();
const { systemController } = require('../controllers');
const { authenticate } = require('../middlewares/auth');
const { adminOnly } = require('../middlewares/authorize');

/**
 * @route   GET /api/system/settings
 * @desc    Lấy danh sách cấu hình
 * @access  Authenticated (Staff/Admin)
 *          (Frontend có thể cần cho public logic, nhưng tạm thời để auth)
 */
router.get('/settings', authenticate, systemController.getSettings);

/**
 * @route   PUT /api/system/settings
 * @desc    Cập nhật cấu hình
 * @access  Admin only
 */
router.put('/settings', authenticate, adminOnly, systemController.updateSettings);

module.exports = router;
