/**
 * ===================================================================
 * MODEL: CHI TIẾT MƯỢN (BorrowDetail)
 * ===================================================================
 * Bảng lưu trữ chi tiết từng cuốn sách trong phiếu mượn
 * - Mỗi phiếu mượn có nhiều chi tiết (nhiều bản sách)
 * - Ghi nhận ngày trả thực tế và tình trạng sách khi trả
 * ===================================================================
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const BorrowDetail = sequelize.define('BorrowDetail', {
        // ID - khóa chính, tự tăng
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: 'ID chi tiết mượn'
        },

        // Số phiếu mượn - khóa ngoại
        borrow_request_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Số phiếu mượn (FK -> borrow_requests)'
        },

        // Mã bản sách - khóa ngoại
        book_copy_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Mã bản sách (FK -> book_copies)'
        },

        // Ngày trả thực tế
        actual_return_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            comment: 'Ngày trả sách thực tế'
        },

        // Tình trạng sách khi trả
        return_condition: {
            type: DataTypes.ENUM('normal', 'damaged', 'lost'),
            allowNull: true,
            comment: 'Tình trạng trả: normal-bình thường, damaged-hư hỏng, lost-mất'
        },

        // Ghi chú
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Ghi chú về tình trạng sách'
        }
    }, {
        tableName: 'borrow_details',
        timestamps: true,
        comment: 'Bảng chi tiết mượn sách'
    });

    return BorrowDetail;
};
