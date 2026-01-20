/**
 * ===================================================================
 * MODEL: LĨNH VỰC (Field)
 * ===================================================================
 * Bảng lưu trữ các lĩnh vực/ngành của sách
 * VD: Khoa học, Văn học, Kỹ thuật, Y học, ...
 * - Mỗi cuốn sách thuộc đúng MỘT lĩnh vực
 * ===================================================================
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Field = sequelize.define('Field', {
        // Mã lĩnh vực - khóa chính, tự tăng
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            comment: 'Mã lĩnh vực'
        },

        // Mã lĩnh vực dạng text (VD: KHTN, KHXH, ...)
        code: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
            comment: 'Mã lĩnh vực viết tắt'
        },

        // Tên lĩnh vực
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            comment: 'Tên lĩnh vực'
        },

        // Mô tả chi tiết
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Mô tả chi tiết về lĩnh vực'
        }
    }, {
        tableName: 'fields',
        timestamps: true,
        comment: 'Bảng lĩnh vực sách'
    });

    return Field;
};
