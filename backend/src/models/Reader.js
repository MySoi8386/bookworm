/**
 * ===================================================================
 * MODEL: ĐỘC GIẢ (Reader)
 * ===================================================================
 * Bảng lưu trữ hồ sơ độc giả của thư viện
 * - Mỗi độc giả có một tài khoản đăng nhập
 * - Độc giả được định danh bằng số CMND/CCCD
 * - Phải đăng ký và được cấp thẻ thư viện mới có thể mượn sách
 * ===================================================================
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Reader = sequelize.define('Reader', {
        // Mã độc giả - khóa chính, tự tăng
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: 'Mã độc giả'
        },

        // Số CMND/CCCD - duy nhất, dùng để định danh
        id_card_number: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
            comment: 'Số CMND/CCCD - định danh độc giả'
        },

        // Mã tài khoản - khóa ngoại
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
            comment: 'Họ và tên độc giả'
        },

        // Ngày sinh
        birth_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            comment: 'Ngày sinh'
        },

        // Địa chỉ thường trú
        address: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Địa chỉ thường trú'
        },

        // Số điện thoại
        phone: {
            type: DataTypes.STRING(15),
            allowNull: true,
            comment: 'Số điện thoại liên hệ'
        },

        // Chức danh (sinh viên, giảng viên, nghiên cứu sinh, ...)
        title: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: 'Chức danh (sinh viên, giảng viên, ...)'
        }
    }, {
        tableName: 'readers',
        timestamps: true,
        comment: 'Bảng hồ sơ độc giả'
    });

    return Reader;
};
