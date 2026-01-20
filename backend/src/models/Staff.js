/**
 * ===================================================================
 * MODEL: NHÂN VIÊN (Staff)
 * ===================================================================
 * Bảng lưu trữ thông tin nhân viên thư viện
 * - Mỗi nhân viên có một tài khoản đăng nhập
 * - Nhân viên có thể là Admin hoặc Thủ thư
 * ===================================================================
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Staff = sequelize.define('Staff', {
        // Mã nhân viên - khóa chính, tự tăng
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: 'Mã nhân viên'
        },

        // Mã tài khoản - khóa ngoại, liên kết với bảng accounts
        account_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            comment: 'Mã tài khoản (FK -> accounts)'
        },

        // Họ và tên đầy đủ
        full_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            comment: 'Họ và tên nhân viên'
        },

        // Chức vụ trong thư viện
        position: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: 'Chức vụ (VD: Thủ thư, Quản lý, ...)'
        },

        // Số điện thoại liên hệ
        phone: {
            type: DataTypes.STRING(15),
            allowNull: true,
            comment: 'Số điện thoại'
        },

        // Địa chỉ
        address: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Địa chỉ liên hệ'
        }
    }, {
        tableName: 'staffs',
        timestamps: true,
        comment: 'Bảng thông tin nhân viên thư viện'
    });

    return Staff;
};
