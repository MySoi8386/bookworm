/**
 * ===================================================================
 * MODEL: PHIẾU NHẮC TRẢ (Reminder)
 * ===================================================================
 * Bảng lưu trữ các phiếu nhắc trả sách
 * - Gửi vào thứ 6 hàng tuần cho độc giả có sách quá hạn
 * - Ghi nhận nội dung và số tiền phạt dự kiến
 * ===================================================================
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Reminder = sequelize.define('Reminder', {
        // Mã phiếu nhắc - khóa chính, tự tăng
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: 'Mã phiếu nhắc trả'
        },

        // Số phiếu mượn - khóa ngoại
        borrow_request_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Số phiếu mượn (FK -> borrow_requests)'
        },

        // Ngày gửi phiếu nhắc
        sent_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            comment: 'Ngày gửi phiếu nhắc'
        },

        // Nội dung phiếu nhắc
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
            comment: 'Nội dung chi tiết phiếu nhắc (tên sách, tiền phạt)'
        },

        // Tổng tiền phạt dự kiến
        estimated_fine: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
            comment: 'Tổng tiền phạt dự kiến tại thời điểm gửi'
        }
    }, {
        tableName: 'reminders',
        timestamps: true,
        comment: 'Bảng phiếu nhắc trả sách'
    });

    return Reminder;
};
