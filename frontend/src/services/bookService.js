/**
 * ===================================================================
 * BOOK SERVICE - API calls cho quản lý sách
 * ===================================================================
 */

import api from './api';

/**
 * Lấy danh sách sách
 * @param {Object} params - { keyword, field_id, genre_id, page, limit }
 */
export const getBooks = async (params = {}) => {
    const response = await api.get('/books', { params });
    return response.data;
};

/**
 * Lấy chi tiết sách
 * @param {number} id - ID sách
 */
export const getBookById = async (id) => {
    // API interceptor đã unwrap response.data
    // Backend trả về: { success: true, data: {...} }
    // Sau interceptor: response = { success: true, data: {...} }
    const response = await api.get(`/books/${id}`);
    console.log('getBookById raw response:', response);
    
    // Trả về data object trực tiếp
    if (response && typeof response === 'object') {
        // Nếu có wrapper { success, data }
        if (response.success !== undefined && response.data) {
            return response.data;
        }
        // Nếu đã là data object (có id hoặc code)
        if (response.id || response.code) {
            return response;
        }
    }
    return response;
};

/**
 * Tạo sách mới
 * @param {Object} data - { code, title, field_id, genre_id, page_count, size, description, author_ids }
 */
export const createBook = async (data) => {
    const response = await api.post('/books', data);
    return response.data;
};

/**
 * Cập nhật sách
 * @param {number} id - ID sách
 * @param {Object} data - { code, title, field_id, genre_id, page_count, size, description, author_ids }
 */
export const updateBook = async (id, data) => {
    const response = await api.put(`/books/${id}`, data);
    return response.data;
};

/**
 * Xóa sách
 * @param {number} id - ID sách
 */
export const deleteBook = async (id) => {
    const response = await api.delete(`/books/${id}`);
    return response.data;
};

/**
 * Lấy danh sách phiên bản của sách
 * @param {number} bookId - ID sách
 */
export const getEditions = async (bookId) => {
    const response = await api.get(`/books/${bookId}/editions`);
    return response.data;
};

/**
 * Tạo phiên bản mới
 * @param {number} bookId - ID sách
 * @param {Object} data - { publisher_id, publish_year, isbn }
 */
export const createEdition = async (bookId, data) => {
    const response = await api.post(`/books/${bookId}/editions`, data);
    return response.data;
};

/**
 * Lấy danh sách lĩnh vực
 */
export const getFields = async () => {
    const response = await api.get('/fields');
    // Response có thể là { success, data } hoặc array trực tiếp
    if (Array.isArray(response?.data)) {
        return response.data;
    }
    if (Array.isArray(response)) {
        return response;
    }
    return response?.data || [];
};

/**
 * Lấy danh sách thể loại
 */
export const getGenres = async () => {
    const response = await api.get('/genres');
    // Response có thể là { success, data } hoặc array trực tiếp
    if (Array.isArray(response?.data)) {
        return response.data;
    }
    if (Array.isArray(response)) {
        return response;
    }
    return response?.data || [];
};

/**
 * Lấy danh sách tác giả
 */
export const getAuthors = async (params = {}) => {
    const response = await api.get('/authors', { params });
    // Response có thể là { success, data } hoặc array trực tiếp
    if (Array.isArray(response?.data)) {
        return response.data;
    }
    if (Array.isArray(response)) {
        return response;
    }
    return response?.data || [];
};

/**
 * Lấy danh sách nhà xuất bản
 */
export const getPublishers = async () => {
    const response = await api.get('/publishers');
    // Response có thể là { success, data } hoặc array trực tiếp
    if (Array.isArray(response?.data)) {
        return response.data;
    }
    if (Array.isArray(response)) {
        return response;
    }
    return response?.data || [];
};

/**
 * Tạo nhà xuất bản mới
 * @param {Object} data - { name, address, established_date, phone, email }
 */
export const createPublisher = async (data) => {
    const response = await api.post('/publishers', data);
    return response.data;
};

/**
 * Thêm bản sách mới cho một edition
 * @param {number} editionId - ID phiên bản
 * @param {Object} data - { quantity, price, condition_notes }
 */
export const createCopies = async (editionId, data) => {
    const response = await api.post(`/editions/${editionId}/copies`, data);
    return response.data;
};

/**
 * Cập nhật bản sách (trạng thái, giá, ghi chú)
 * @param {number} copyId - ID bản sách
 * @param {Object} data - { status, price, condition_notes }
 */
export const updateCopy = async (copyId, data) => {
    const response = await api.put(`/copies/${copyId}`, data);
    return response.data;
};

/**
 * Xóa bản sách
 * @param {number} copyId - ID bản sách
 */
export const deleteCopy = async (copyId) => {
    const response = await api.delete(`/copies/${copyId}`);
    return response.data;
};

/**
 * Lấy danh sách bản sách của một edition
 * @param {number} editionId - ID phiên bản
 * @param {Object} params - { status }
 */
export const getCopies = async (editionId, params = {}) => {
    const response = await api.get(`/editions/${editionId}/copies`, { params });
    return response.data;
};

const bookService = {
    getBooks,
    getBookById,
    createBook,
    updateBook,
    deleteBook,
    getEditions,
    createEdition,
    getFields,
    getGenres,
    getAuthors,
    getPublishers,
    createPublisher,
    createCopies,
    updateCopy,
    deleteCopy,
    getCopies
};

export { bookService };
export default bookService;
