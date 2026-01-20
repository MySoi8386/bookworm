/**
 * ===================================================================
 * MODEL: BẢN SÁCH (BookCopy)
 * ===================================================================
 * Bảng lưu trữ các bản sách vật lý trong thư viện
 * - Mỗi phiên bản xuất bản có thể có nhiều bản sách
 * - Mỗi bản sách được đánh số thứ tự và có giá riêng
 * - Trạng thái: có sẵn, đang mượn, hỏng, thanh lý
 * ===================================================================
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const BookCopy = sequelize.define('BookCopy', {
        // Mã bản sách - khóa chính, tự tăng
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: 'Mã bản sách'
        },

        // Mã phiên bản xuất bản - khóa ngoại
        book_edition_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Mã phiên bản xuất bản (FK -> book_editions)'
        },

        // Số thứ tự bản sách (1, 2, 3, ...)
        copy_number: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Số thứ tự bản sách trong cùng edition'
        },

        // Giá sách (dùng để tính tiền phạt)
        price: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0,
            comment: 'Giá sách (VND) - dùng tính tiền phạt'
        },

        // Trạng thái bản sách
        status: {
            type: DataTypes.ENUM('available', 'borrowed', 'damaged', 'disposed'),
            defaultValue: 'available',
            comment: 'Trạng thái: available-có sẵn, borrowed-đang mượn, damaged-hỏng, disposed-thanh lý'
        },

        // Ghi chú về tình trạng
        condition_notes: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Ghi chú về tình trạng sách'
        }
    }, {
        tableName: 'book_copies',
        timestamps: true,
        comment: 'Bảng bản sách vật lý'
    });

    return BookCopy;
};
