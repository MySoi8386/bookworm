/**
 * ===================================================================
 * MODEL: NHÓM NGƯỜI DÙNG (User Group / Role)
 * ===================================================================
 * Bảng lưu trữ các nhóm quyền trong hệ thống:
 * - Admin: Quản trị viên - toàn quyền
 * - Librarian: Thủ thư - quản lý sách và mượn trả
 * - Reader: Độc giả - tra cứu và mượn sách
 * ===================================================================
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const UserGroup = sequelize.define('UserGroup', {
        // Mã nhóm - khóa chính, tự tăng
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: 'Mã nhóm người dùng'
        },

        // Tên nhóm (admin, librarian, reader)
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            comment: 'Tên nhóm (admin, librarian, reader)'
        },

        // Mô tả chi tiết về nhóm
        description: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: 'Mô tả chi tiết về quyền hạn của nhóm'
        }
    }, {
        tableName: 'user_groups',
        timestamps: true,
        comment: 'Bảng nhóm người dùng - phân quyền hệ thống'
    });

    return UserGroup;
};
