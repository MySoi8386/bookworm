/**
 * ===================================================================
 * MODEL: CẤU HÌNH HỆ THỐNG (SystemSetting)
 * ===================================================================
 * Bảng lưu trữ các tham số cấu hình hệ thống
 * - Tiền phạt trễ hạn (%)
 * - Số ngày mượn mặc định
 * - Số sách tối đa được mượn
 * - Tiền đặt cọc mặc định
 * ===================================================================
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const SystemSetting = sequelize.define('SystemSetting', {
        // ID - khóa chính, tự tăng
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: 'ID cấu hình'
        },

        // Khóa cấu hình - duy nhất
        setting_key: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            comment: 'Khóa cấu hình (VD: fine_rate_percent, max_borrow_days)'
        },

        // Giá trị cấu hình
        setting_value: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: 'Giá trị cấu hình'
        },

        // Mô tả
        description: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: 'Mô tả ý nghĩa của cấu hình'
        }
    }, {
        tableName: 'system_settings',
        timestamps: true,
        comment: 'Bảng cấu hình hệ thống'
    });

    return SystemSetting;
};
