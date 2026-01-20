/**
 * ===================================================================
 * MODEL: VIẾT SÁCH (BookAuthor) - Bảng trung gian
 * ===================================================================
 * Bảng quan hệ nhiều-nhiều giữa Sách và Tác giả
 * - Một cuốn sách có thể có nhiều tác giả
 * - Một tác giả có thể viết nhiều sách
 * ===================================================================
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const BookAuthor = sequelize.define('BookAuthor', {
        // ID - khóa chính, tự tăng
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: 'ID bản ghi'
        },

        // Mã sách - khóa ngoại
        book_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Mã sách (FK -> books)'
        },

        // Mã tác giả - khóa ngoại
        author_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Mã tác giả (FK -> authors)'
        }
    }, {
        tableName: 'book_authors',
        timestamps: true,
        updatedAt: false, // Không cần updated_at cho bảng trung gian
        comment: 'Bảng quan hệ Sách - Tác giả',
        indexes: [
            {
                unique: true,
                fields: ['book_id', 'author_id'],
                name: 'unique_book_author'
            }
        ]
    });

    return BookAuthor;
};
