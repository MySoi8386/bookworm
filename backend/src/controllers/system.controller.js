/**
 * ===================================================================
 * CONTROLLER: CẤU HÌNH HỆ THỐNG (System Controller)
 * ===================================================================
 * Xử lý các nghiệp vụ liên quan đến cấu hình:
 * - Lấy danh sách cấu hình public/private
 * - Cập nhật cấu hình (Admin only)
 * ===================================================================
 */

const { SystemSetting } = require('../models');
const { asyncHandler, AppError } = require('../middlewares/errorHandler');
const {
    defaultDepositAmount,
    defaultMaxBooks,
    defaultBorrowDays,
    fineRatePercent
} = require('../config/auth');

/**
 * @desc    Lấy danh sách cấu hình
 * @route   GET /api/system/settings
 * @access  Authenticated
 */
const getSettings = asyncHandler(async (req, res) => {
    const settings = await SystemSetting.findAll();

    // Chuyển về dạng KV object cho frontend dễ dùng
    const settingsMap = {};
    settings.forEach(s => {
        settingsMap[s.setting_key] = s.setting_value;
    });

    // Merge với default nếu DB chưa có
    const finalSettings = {
        fine_rate_percent: settingsMap.fine_rate_percent || fineRatePercent,
        max_borrow_days: settingsMap.max_borrow_days || defaultBorrowDays,
        max_books_per_user: settingsMap.max_books_per_user || defaultMaxBooks,
        min_deposit_amount: settingsMap.min_deposit_amount || defaultDepositAmount,
        ...settingsMap
    };

    res.json({
        success: true,
        data: finalSettings
    });
});

/**
 * @desc    Cập nhật cấu hình (Batch update)
 * @route   PUT /api/system/settings
 * @access  Admin only
 */
const updateSettings = asyncHandler(async (req, res) => {
    const updates = req.body; // { key: value, key2: value2 }

    const transaction = await SystemSetting.sequelize.transaction();

    try {
        const keys = Object.keys(updates);

        for (const key of keys) {
            const value = updates[key];

            // Upsert (Tìm update hoặc tạo mới)
            const [setting, created] = await SystemSetting.findOrCreate({
                where: { setting_key: key },
                defaults: { setting_value: String(value) },
                transaction
            });

            if (!created && setting.setting_value !== String(value)) {
                await setting.update({ setting_value: String(value) }, { transaction });
            }
        }

        await transaction.commit();

        res.json({
            success: true,
            message: 'Cập nhật cấu hình thành công'
        });

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
});

module.exports = {
    getSettings,
    updateSettings
};
