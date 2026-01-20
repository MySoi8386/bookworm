/**
 * ===================================================================
 * MIGRATION: Thêm email verification columns vào bảng accounts
 * ===================================================================
 * Thêm các cột:
 * - email_verification_token: Token xác nhận email
 * - email_verification_expires: Thời gian hết hạn token
 * ===================================================================
 */

'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('accounts', 'email_verification_token', {
            type: Sequelize.STRING(255),
            allowNull: true,
            comment: 'Token xác nhận email'
        });

        await queryInterface.addColumn('accounts', 'email_verification_expires', {
            type: Sequelize.DATE,
            allowNull: true,
            comment: 'Thời gian hết hạn token xác nhận email'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('accounts', 'email_verification_token');
        await queryInterface.removeColumn('accounts', 'email_verification_expires');
    }
};
