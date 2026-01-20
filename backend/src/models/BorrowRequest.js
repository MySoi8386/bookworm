/**
 * ===================================================================
 * MODEL: PHIẾU MƯỢN (BorrowRequest)
 * ===================================================================
 * Bảng lưu trữ các phiếu yêu cầu mượn sách
 * - Độc giả tạo phiếu mượn, thủ thư duyệt
 * - Một phiếu mượn có thể chứa nhiều bản sách (chi tiết mượn)
 * - Trạng thái: chờ duyệt, đã duyệt, từ chối, đã trả, quá hạn
 * ===================================================================
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const BorrowRequest = sequelize.define('BorrowRequest', {
        // Số phiếu mượn - khóa chính, tự tăng
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: 'Số phiếu mượn'
        },

        // Số thẻ thư viện - khóa ngoại
        library_card_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Số thẻ thư viện (FK -> library_cards)'
        },

        // Mã tài khoản (người tạo phiếu) - khóa ngoại
        account_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Mã tài khoản người tạo (FK -> accounts)'
        },

        // Mã nhân viên duyệt (nếu có) - khóa ngoại
        approved_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Mã nhân viên duyệt phiếu (FK -> staffs)'
        },

        // Ngày tạo phiếu
        request_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            comment: 'Ngày tạo phiếu mượn'
        },

        // Ngày mượn thực tế (sau khi duyệt)
        borrow_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
            comment: 'Ngày mượn thực tế'
        },

        // Ngày hẹn trả
        due_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            comment: 'Ngày hẹn trả sách'
        },

        // Trạng thái phiếu mượn
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected', 'borrowed', 'returned', 'overdue'),
            defaultValue: 'pending',
            comment: 'Trạng thái: pending-chờ duyệt, approved-đã duyệt, rejected-từ chối, borrowed-đang mượn, returned-đã trả, overdue-quá hạn'
        },

        // Ghi chú
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Ghi chú thêm'
        }
    }, {
        tableName: 'borrow_requests',
        timestamps: true,
        comment: 'Bảng phiếu mượn sách'
    });

    return BorrowRequest;
};
