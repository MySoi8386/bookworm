/**
 * ===================================================================
 * MODEL: NHÀ XUẤT BẢN (Publisher)
 * ===================================================================
 * Bảng lưu trữ thông tin các nhà xuất bản
 * - Mỗi NXB có thể xuất bản nhiều đầu sách khác nhau
 * - Một đầu sách có thể được xuất bản bởi nhiều NXB (các phiên bản khác nhau)
 * ===================================================================
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Publisher = sequelize.define('Publisher', {
        // Mã NXB - khóa chính, tự tăng
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: 'Mã nhà xuất bản'
        },

        // Tên nhà xuất bản
        name: {
            type: DataTypes.STRING(150),
            allowNull: false,
            comment: 'Tên nhà xuất bản'
        },

        // Địa chỉ
        address: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Địa chỉ nhà xuất bản'
        },

        // Ngày thành lập
        established_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            comment: 'Ngày thành lập'
        },

        // Số điện thoại
        phone: {
            type: DataTypes.STRING(15),
            allowNull: true,
            comment: 'Số điện thoại liên hệ'
        },

        // Email
        email: {
            type: DataTypes.STRING(100),
            allowNull: true,
            validate: {
                isEmail: true
            },
            comment: 'Email liên hệ'
        }
    }, {
        tableName: 'publishers',
        timestamps: true,
        comment: 'Bảng nhà xuất bản'
    });

    return Publisher;
};
