/**
 * ===================================================================
 * CONTROLLERS INDEX
 * ===================================================================
 * Export tất cả controllers
 * ===================================================================
 */

const authController = require('./auth.controller');
const categoryController = require('./category.controller');
const bookController = require('./book.controller');
const readerController = require('./reader.controller');
const borrowController = require('./borrow.controller');
const financeController = require('./finance.controller');
const statisticsController = require('./statistics.controller');
const systemController = require('./system.controller');

module.exports = {
    authController,
    categoryController,
    bookController,
    readerController,
    borrowController,
    financeController,
    statisticsController,
    systemController
};
