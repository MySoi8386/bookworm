/**
 * ===================================================================
 * MODEL: GIAO DỊCH CỌC (DepositTransaction)
 * ===================================================================
 * Bảng lưu trữ các giao dịch tiền đặt cọc
 * - Nạp tiền cọc khi đăng ký thẻ thư viện
 * - Hoàn trả tiền cọc khi chấm dứt tư cách độc giả
 * ===================================================================
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const DepositTransaction = sequelize.define('DepositTransaction', {
        // Mã giao dịch - khóa chính, tự tăng
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: 'Mã giao dịch cọc'
        },

        // Số thẻ thư viện - khóa ngoại
        library_card_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Số thẻ thư viện (FK -> library_cards)'
        },

        // Mã nhân viên thực hiện - khóa ngoại
        staff_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Mã nhân viên thực hiện (FK -> staffs)'
        },

        // Số tiền giao dịch
        amount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            comment: 'Số tiền giao dịch (VND)'
        },

        // Loại giao dịch
        type: {
            type: DataTypes.ENUM('deposit', 'refund'),
            allowNull: false,
            comment: 'Loại GD: deposit-nạp cọc, refund-hoàn trả'
        },

        // Ngày giao dịch
        transaction_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            comment: 'Ngày thực hiện giao dịch'
        },

        // Ghi chú
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Ghi chú về giao dịch'
        }
    }, {
        tableName: 'deposit_transactions',
        timestamps: true,
        comment: 'Bảng giao dịch tiền đặt cọc'
    });

    return DepositTransaction;
};
