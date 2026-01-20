/**
 * ===================================================================
 * MODEL: SÁCH (Book)
 * ===================================================================
 * Bảng lưu trữ thông tin đầu sách
 * - Mỗi đầu sách thuộc một lĩnh vực và một thể loại
 * - Mỗi đầu sách có thể có nhiều phiên bản xuất bản (editions)
 * - Mỗi phiên bản có thể có nhiều bản sách (copies)
 * ===================================================================
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Book = sequelize.define('Book', {
        // Mã sách - khóa chính, tự tăng
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: 'Mã sách'
        },

        // Mã sách dạng text (VD: S001, IT001, ...)
        code: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
            comment: 'Mã sách định danh'
        },

        // Tên sách
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: 'Tên sách'
        },

        // Mã lĩnh vực - khóa ngoại
        field_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Mã lĩnh vực (FK -> fields)'
        },

        // Mã thể loại - khóa ngoại
        genre_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Mã thể loại (FK -> genres)'
        },

        // Mô tả/Tóm tắt nội dung
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Mô tả/Tóm tắt nội dung sách'
        }
    }, {
        tableName: 'books',
        timestamps: true,
        comment: 'Bảng đầu sách'
    });

    return Book;
};
