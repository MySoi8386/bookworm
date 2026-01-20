/**
 * ===================================================================
 * MODEL: TÁC GIẢ (Author)
 * ===================================================================
 * Bảng lưu trữ thông tin các tác giả
 * - Mỗi tác giả có thể viết nhiều sách
 * - Mỗi cuốn sách có thể có nhiều tác giả (đồng tác giả)
 * ===================================================================
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Author = sequelize.define('Author', {
        // Mã tác giả - khóa chính, tự tăng
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: 'Mã tác giả'
        },

        // Họ và tên tác giả
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            comment: 'Họ và tên tác giả'
        },

        // Chức danh (GS, PGS, TS, ThS, ...)
        title: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: 'Chức danh học hàm, học vị'
        },

        // Nơi làm việc
        workplace: {
            type: DataTypes.STRING(200),
            allowNull: true,
            comment: 'Nơi làm việc/công tác'
        },

        // Tiểu sử ngắn
        bio: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Tiểu sử ngắn về tác giả'
        }
    }, {
        tableName: 'authors',
        timestamps: true,
        comment: 'Bảng thông tin tác giả'
    });

    return Author;
};
