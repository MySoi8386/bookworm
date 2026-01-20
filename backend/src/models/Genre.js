/**
 * ===================================================================
 * MODEL: THỂ LOẠI (Genre)
 * ===================================================================
 * Bảng lưu trữ các thể loại sách
 * VD: Giáo trình, Tham khảo, Tiểu thuyết, Truyện ngắn, ...
 * - Mỗi cuốn sách thuộc đúng MỘT thể loại
 * ===================================================================
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Genre = sequelize.define('Genre', {
        // Mã thể loại - khóa chính, tự tăng
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: 'Mã thể loại'
        },

        // Mã thể loại dạng text (VD: GT, TK, TT, ...)
        code: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
            comment: 'Mã thể loại viết tắt'
        },

        // Tên thể loại
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            comment: 'Tên thể loại'
        },

        // Mô tả chi tiết
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Mô tả chi tiết về thể loại'
        }
    }, {
        tableName: 'genres',
        timestamps: true,
        comment: 'Bảng thể loại sách'
    });

    return Genre;
};
