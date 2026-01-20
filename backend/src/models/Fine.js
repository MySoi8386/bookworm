/**
 * ===================================================================
 * MODEL: PHIẾU PHẠT (Fine)
 * ===================================================================
 * Bảng lưu trữ thông tin tiền phạt
 * - Phạt khi trả sách quá hạn: 10% giá sách x số ngày quá hạn
 * - Phạt khi làm hỏng hoặc mất sách
 * ===================================================================
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Fine = sequelize.define('Fine', {
        // Mã phiếu phạt - khóa chính, tự tăng
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: 'Mã phiếu phạt'
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
            comment: 'Mã bản sách bị phạt (FK -> book_copies)'
        },

        // Lý do phạt
        reason: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: 'Lý do phạt (quá hạn, hư hỏng, mất)'
        },

        // Số tiền phạt
        amount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            comment: 'Số tiền phạt (VND)'
        },

        // Trạng thái thanh toán
        status: {
            type: DataTypes.ENUM('pending', 'paid'),
            defaultValue: 'pending',
            comment: 'Trạng thái: pending-chưa thanh toán, paid-đã thanh toán'
        },

        // Ngày thanh toán
        paid_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            comment: 'Ngày thanh toán tiền phạt'
        },

        // Nhân viên thu tiền
        collected_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Mã nhân viên thu tiền (FK -> staffs)'
        }
    }, {
        tableName: 'fines',
        timestamps: true,
        comment: 'Bảng phiếu phạt'
    });

    return Fine;
};
