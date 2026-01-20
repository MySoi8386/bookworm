/**
 * ===================================================================
 * ROUTES INDEX - Tổng hợp tất cả routes
 * ===================================================================
 * File này đăng ký tất cả các routes cho ứng dụng
 * ===================================================================
 */

const express = require('express');
const router = express.Router();

// Import routes
const authRoutes = require('./auth.routes');
const categoryRoutes = require('./category.routes');
const bookRoutes = require('./book.routes');
const editionRoutes = require('./edition.routes');
const copyRoutes = require('./copy.routes');
const readerRoutes = require('./reader.routes');
const libraryCardRoutes = require('./libraryCard.routes');
const borrowRoutes = require('./borrow.routes');
const financeRoutes = require('./finance.routes');
const statisticsRoutes = require('./statistics.routes');
const staffRoutes = require('./staff.routes');
const systemRoutes = require('./system.routes');
const notificationRoutes = require('./notification.routes');

// ===================================================================
// ĐĂNG KÝ ROUTES
// ===================================================================

// Authentication
router.use('/auth', authRoutes);

// Staff (Admin operations)
router.use('/staff', staffRoutes);

// Danh mục (Field, Genre, Author, Publisher)
router.use('/', categoryRoutes);

// Sách
router.use('/books', bookRoutes);
router.use('/editions', editionRoutes);
router.use('/copies', copyRoutes);

// Độc giả & Thẻ thư viện
router.use('/readers', readerRoutes);
router.use('/library-cards', libraryCardRoutes);

// Mượn trả
router.use('/borrow-requests', borrowRoutes);

// Tài chính (Fines, Deposits)
router.use('/', financeRoutes);

// Thống kê & Báo cáo
router.use('/statistics', statisticsRoutes);
router.use('/reports', statisticsRoutes);

// Hệ thống (Cấu hình)
router.use('/system', systemRoutes);

// Thông báo
router.use('/notifications', notificationRoutes);

// ===================================================================
// API INFO
// ===================================================================

/**
 * @route   GET /api
 * @desc    API info
 * @access  Public
 */
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Library Management System API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            fields: '/api/fields',
            genres: '/api/genres',
            authors: '/api/authors',
            publishers: '/api/publishers',
            books: '/api/books',
            editions: '/api/editions',
            copies: '/api/copies',
            readers: '/api/readers',
            libraryCards: '/api/library-cards',
            borrowRequests: '/api/borrow-requests',
            fines: '/api/fines',
            deposits: '/api/deposits',
            statistics: '/api/statistics',
            reports: '/api/reports'
        }
    });
});

module.exports = router;
