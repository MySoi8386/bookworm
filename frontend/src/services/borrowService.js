/**
 * ===================================================================
 * BORROW SERVICE - API calls cho mượn trả sách
 * ===================================================================
 */

import api from './api';

/**
 * Lấy danh sách phiếu mượn (cho staff)
 * @param {Object} params - { status, library_card_id, from_date, to_date, page, limit }
 */
export const getBorrowRequests = async (params = {}) => {
    // API interceptor đã unwrap response.data
    // Backend trả về: { success: true, data: [...], pagination: {...} }
    // Sau interceptor: response = { success: true, data: [...], pagination: {...} }
    const response = await api.get('/borrow-requests', { params });
    return response;
};

/**
 * Lấy phiếu mượn của tôi (cho reader)
 * @param {Object} params - { status, page, limit }
 */
export const getMyBorrowRequests = async (params = {}) => {
    const response = await api.get('/borrow-requests/my', { params });
    // Response có thể là { success, data } hoặc array trực tiếp
    if (response && typeof response === 'object') {
        if (Array.isArray(response.data)) {
            return { data: response.data, pagination: response.pagination };
        }
        if (Array.isArray(response)) {
            return { data: response, pagination: {} };
        }
    }
    return response;
};

/**
 * Lấy chi tiết phiếu mượn
 * @param {number} id - ID phiếu mượn
 */
export const getBorrowRequestById = async (id) => {
    const response = await api.get(`/borrow-requests/${id}`);
    // Trả về data object trực tiếp
    if (response && typeof response === 'object') {
        if (response.success !== undefined && response.data) {
            return response.data;
        }
        if (response.id || response.library_card_id) {
            return response;
        }
    }
    return response;
};

/**
 * Tạo phiếu mượn mới
 * @param {Object} data - { library_card_id, due_date, book_copy_ids, notes }
 */
export const createBorrowRequest = async (data) => {
    const response = await api.post('/borrow-requests', data);
    return response.data;
};

/**
 * Duyệt phiếu mượn (chuyển từ pending sang approved)
 * @param {number} id - ID phiếu mượn
 * @param {string} notes - Ghi chú
 */
export const approveBorrowRequest = async (id, notes = '') => {
    const response = await api.put(`/borrow-requests/${id}/approve`, { notes });
    return response.data;
};

/**
 * Xuất sách (chuyển từ approved sang borrowed)
 * @param {number} id - ID phiếu mượn
 * @param {string} notes - Ghi chú
 */
export const issueBooks = async (id, notes = '') => {
    const response = await api.put(`/borrow-requests/${id}/issue`, { notes });
    return response.data;
};

/**
 * Từ chối phiếu mượn
 * @param {number} id - ID phiếu mượn
 * @param {string} reason - Lý do từ chối
 */
export const rejectBorrowRequest = async (id, reason) => {
    const response = await api.put(`/borrow-requests/${id}/reject`, { reason });
    return response.data;
};

/**
 * Gia hạn phiếu mượn
 * @param {number} id - ID phiếu mượn
 * @param {string} new_due_date - Ngày hạn mới
 * @param {string} notes - Ghi chú
 */
export const extendBorrowRequest = async (id, new_due_date, notes = '') => {
    const response = await api.put(`/borrow-requests/${id}/extend`, { new_due_date, notes });
    return response.data;
};

/**
 * Trả sách
 * @param {number} id - ID phiếu mượn
 * @param {Array} returns - [{ book_copy_id, return_condition, notes }]
 */
export const returnBooks = async (id, returns) => {
    const response = await api.put(`/borrow-requests/${id}/return`, { returns });
    return response.data;
};

/**
 * Hủy phiếu mượn
 * @param {number} id - ID phiếu mượn
 */
export const cancelBorrowRequest = async (id) => {
    const response = await api.delete(`/borrow-requests/${id}`);
    return response.data;
};

/**
 * Lấy danh sách thẻ thư viện (cho tạo phiếu mượn)
 */
export const getLibraryCards = async (params = {}) => {
    const response = await api.get('/readers', { params });
    // Response có thể là { success, data, pagination } hoặc data trực tiếp
    if (Array.isArray(response?.data)) {
        return response.data;
    }
    if (Array.isArray(response)) {
        return response;
    }
    return response?.data || [];
};

/**
 * Lấy danh sách sách có sẵn (cho tạo phiếu mượn)
 */
export const getAvailableBooks = async (params = {}) => {
    const response = await api.get('/books', { params });
    // Response có thể là { success, data, pagination } hoặc data trực tiếp
    if (Array.isArray(response?.data)) {
        return response.data;
    }
    if (Array.isArray(response)) {
        return response;
    }
    return response?.data || [];
};

/**
 * Lấy danh sách bản sách có sẵn theo edition
 */
export const getAvailableCopies = async (editionId) => {
    const response = await api.get(`/editions/${editionId}/copies`, { params: { status: 'available' } });
    // Response có thể là { success, data } hoặc array trực tiếp
    if (Array.isArray(response?.data)) {
        return response.data;
    }
    if (Array.isArray(response)) {
        return response;
    }
    return response?.data || [];
};

export default {
    getBorrowRequests,
    getMyBorrowRequests,
    getBorrowRequestById,
    createBorrowRequest,
    approveBorrowRequest,
    rejectBorrowRequest,
    extendBorrowRequest,
    returnBooks,
    cancelBorrowRequest,
    getLibraryCards,
    getAvailableBooks,
    getAvailableCopies
};
