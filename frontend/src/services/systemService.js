/**
 * ===================================================================
 * SYSTEM SERVICE - API calls cho cấu hình hệ thống
 * ===================================================================
 */

import api from './api';

/**
 * Lấy danh sách cấu hình hệ thống
 */
export const getSettings = async () => {
    const response = await api.get('/system/settings');
    return response;
};

/**
 * Cập nhật cấu hình hệ thống (Admin only)
 * @param {Object} settings - Object chứa các key-value cần cập nhật
 * @example { fine_rate_percent: 0.1, max_borrow_days: 14 }
 */
export const updateSettings = async (settings) => {
    const response = await api.put('/system/settings', settings);
    return response;
};
