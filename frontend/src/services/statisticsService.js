/**
 * ===================================================================
 * STATISTICS SERVICE - API calls cho thống kê báo cáo
 * ===================================================================
 */

import api from './api';

/**
 * Lấy thống kê tổng quan dashboard
 */
export const getDashboardStats = async () => {
    const response = await api.get('/statistics/dashboard');
    return response;
};

/**
 * Lấy danh sách sách quá hạn
 */
export const getOverdueBooks = async () => {
    const response = await api.get('/statistics/overdue');
    return response;
};

/**
 * Lấy danh sách sách mượn nhiều nhất
 * @param {Object} params - { limit, period }
 */
export const getPopularBooks = async (params = {}) => {
    const response = await api.get('/statistics/popular-books', { params });
    return response;
};

/**
 * Lấy xu hướng mượn sách
 * @param {string} period - 'week', 'month', '6months'
 */
export const getBorrowingTrend = async (period = 'month') => {
    const response = await api.get('/statistics/borrowing-trend', { params: { period } });
    return response;
};

/**
 * Tạo phiếu nhắc trả hàng tuần
 */
export const generateWeeklyReminders = async () => {
    const response = await api.post('/reports/weekly-reminders');
    return response;
};

/**
 * Lấy báo cáo 6 tháng
 */
export const getSemiAnnualReport = async () => {
    const response = await api.get('/reports/semi-annual');
    return response;
};

export default {
    getDashboardStats,
    getOverdueBooks,
    getPopularBooks,
    getBorrowingTrend,
    generateWeeklyReminders,
    getSemiAnnualReport
};
