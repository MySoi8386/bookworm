/**
 * Migration: Remove page_count and size from books table
 * Created: 2026-01-19
 * Reason: Simplify book model by removing unused fields
 */

'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('books', 'page_count');
        await queryInterface.removeColumn('books', 'size');
  },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('books', 'page_count', {
            type: Sequelize.INTEGER,
            allowNull: true,
            comment: 'Số trang sách'
        });
        await queryInterface.addColumn('books', 'size', {
            type: Sequelize.STRING(20),
            allowNull: true,
            comment: 'Khổ sách (VD: 14x20cm)'
        });
  }
};
