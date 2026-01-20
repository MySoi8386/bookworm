/**
 * ===================================================================
 * MODEL: THẺ THƯ VIỆN (Library Card)
 * ===================================================================
 * Bảng lưu trữ thông tin thẻ thư viện của độc giả
 * - Mỗi độc giả được cấp MỘT thẻ thư viện khi đăng ký
 * - Thẻ có thời hạn sử dụng và quy định số sách tối đa được mượn
 * - Phải đặt cọc tiền khi làm thẻ
 * ===================================================================
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const LibraryCard = sequelize.define('LibraryCard', {
        // Số thẻ - khóa chính, tự tăng
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: 'Số thẻ thư viện'
        },

        // Mã định danh thẻ (VD: TV2024001)
        card_number: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
            comment: 'Mã định danh thẻ (VD: TV2024001)'
        },

        // Mã độc giả - khóa ngoại
        reader_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
            comment: 'Mã độc giả (FK -> readers)'
        },

        // Ngày cấp thẻ
        issue_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            comment: 'Ngày cấp thẻ'
        },

        // Ngày hết hạn
        expiry_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            comment: 'Ngày hết hạn thẻ'
        },

        // Số lượng sách được mượn tối đa
        max_books: {
            type: DataTypes.INTEGER,
            defaultValue: 5,
            comment: 'Số sách tối đa được mượn cùng lúc'
        },

        // Thời gian mượn cho phép (số ngày)
        max_borrow_days: {
            type: DataTypes.INTEGER,
            defaultValue: 14,
            comment: 'Số ngày tối đa cho một lần mượn'
        },

        // Tiền đặt cọc
        deposit_amount: {
            type: DataTypes.DECIMAL(12, 2),
            defaultValue: 200000,
            comment: 'Số tiền đặt cọc (VND)'
        },

        // Trạng thái thẻ
        status: {
            type: DataTypes.ENUM('active', 'expired', 'locked'),
            defaultValue: 'active',
            comment: 'Trạng thái thẻ: active-hoạt động, expired-hết hạn, locked-bị khóa'
        }
    }, {
        tableName: 'library_cards',
        timestamps: true,
        comment: 'Bảng thẻ thư viện'
    });

    return LibraryCard;
};
