const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller');
const { authenticate } = require('../middlewares/auth');
const { adminOnly } = require('../middlewares/authorize');

// Tất cả routes đều yêu cầu login và quyền Admin
router.use(authenticate);
router.use(adminOnly);

router.get('/', staffController.getAllStaff);
router.post('/', staffController.createStaff);
router.put('/:id', staffController.updateStaff);
router.delete('/:id', staffController.deleteStaff);

module.exports = router;
