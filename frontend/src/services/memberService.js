/**
 * ===================================================================
 * MEMBER SERVICE - API calls cho quản lý thành viên
 * ===================================================================
 */

import api from './api';

/**
 * Lấy danh sách độc giả/thành viên
 * @param {Object} params - { keyword, status, account_status, page, limit }
 */
export const getReaders = async (params = {}) => {
    const response = await api.get('/readers', { params });
    return response;
};

/**
 * Lấy chi tiết độc giả
 * @param {number} id - ID độc giả
 */
export const getReaderById = async (id) => {
    const response = await api.get(`/readers/${id}`);
    // Trả về data object trực tiếp
    if (response && typeof response === 'object') {
        if (response.success !== undefined && response.data) {
            return response.data;
        }
        if (response.id || response.full_name) {
            return response;
        }
    }
    return response;
};

/**
 * Tạo độc giả mới
 * @param {Object} data - { username, password, email, full_name, id_card_number, phone, birth_date, address, title }
 */
export const createReader = async (data) => {
    const response = await api.post('/readers', data);
    return response;
};

/**
 * Cập nhật độc giả
 * @param {number} id - ID độc giả
 * @param {Object} data - { full_name, phone, birth_date, address, title }
 */
export const updateReader = async (id, data) => {
    const response = await api.put(`/readers/${id}`, data);
    return response;
};

/**
 * Khóa tài khoản độc giả
 * @param {number} id - ID độc giả
 */
export const lockReader = async (id) => {
    const response = await api.put(`/readers/${id}/lock`);
    return response;
};

/**
 * Mở khóa tài khoản độc giả
 * @param {number} id - ID độc giả
 */
export const unlockReader = async (id) => {
    const response = await api.put(`/readers/${id}/unlock`);
    return response;
};

/**
 * Xóa độc giả
 * @param {number} id - ID độc giả
 */
export const deleteReader = async (id) => {
    const response = await api.delete(`/readers/${id}`);
    return response;
};

// ===================================================================
// LIBRARY CARD
// ===================================================================

/**
 * Cấp thẻ thư viện cho độc giả
 * @param {Object} data - { reader_id, expiry_date, max_books, max_borrow_days, deposit_amount }
 */
export const createLibraryCard = async (data) => {
    const response = await api.post('/library-cards', data);
    return response;
};

/**
 * Cập nhật thẻ thư viện
 * @param {number} id - ID thẻ thư viện
 * @param {Object} data - { expiry_date, max_books, max_borrow_days, status }
 */
export const updateLibraryCard = async (id, data) => {
    const response = await api.put(`/library-cards/${id}`, data);
    return response;
};

/**
 * Gia hạn thẻ thư viện
 * @param {number} id - ID thẻ thư viện
 * @param {string} new_expiry_date - Ngày hết hạn mới
 */
export const renewLibraryCard = async (id, new_expiry_date) => {
    const response = await api.put(`/library-cards/${id}/renew`, { new_expiry_date });
    return response;
};

/**
 * Khóa thẻ thư viện
 * @param {number} id - ID thẻ thư viện
 */
export const lockLibraryCard = async (id) => {
    const response = await api.put(`/library-cards/${id}/lock`);
    return response;
};

/**
 * Mở khóa thẻ thư viện
 * @param {number} id - ID thẻ thư viện
 */
export const unlockLibraryCard = async (id) => {
    const response = await api.put(`/library-cards/${id}/unlock`);
    return response;
};

/**
 * Lấy danh sách sách đang mượn của độc giả
 * @param {number} id - ID độc giả
 */
export const getReaderBorrowedBooks = async (id) => {
    const response = await api.get(`/readers/${id}/borrowed-books`);
    return response;
};

export default {
    getReaders,
    getReaderById,
    createReader,
    updateReader,
    lockReader,
    unlockReader,
    deleteReader,
    getReaderBorrowedBooks,
    createLibraryCard,
    updateLibraryCard,
    renewLibraryCard,
    lockLibraryCard,
    unlockLibraryCard
};
