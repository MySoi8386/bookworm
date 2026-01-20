/**
 * ===================================================================
 * MODEL: XUẤT BẢN (BookEdition)
 * ===================================================================
 * Bảng lưu trữ các phiên bản xuất bản của sách
 * - Một đầu sách có thể được xuất bản nhiều lần
 * - Mỗi lần xuất bản có thể bởi NXB khác nhau, năm khác nhau
 * ===================================================================
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const BookEdition = sequelize.define('BookEdition', {
        // ID - khóa chính, tự tăng
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: 'Mã phiên bản xuất bản'
        },

        // Mã sách - khóa ngoại
        book_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Mã sách (FK -> books)'
        },

        // Mã NXB - khóa ngoại
        publisher_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Mã nhà xuất bản (FK -> publishers)'
        },

        // Năm xuất bản
        publish_year: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Năm xuất bản'
        },

        // Mã ISBN (nếu có)
        isbn: {
            type: DataTypes.STRING(20),
            allowNull: true,
            comment: 'Mã ISBN quốc tế'
        }
    }, {
        tableName: 'book_editions',
        timestamps: true,
        comment: 'Bảng phiên bản xuất bản'
    });

    return BookEdition;
};
