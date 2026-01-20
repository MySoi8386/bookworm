/**
 * ===================================================================
 * FINANCE SERVICE - API calls cho quản lý tài chính
 * ===================================================================
 */

import api from './api';

// ===================================================================
// FINES (Tiền phạt)
// ===================================================================

/**
 * Lấy danh sách tiền phạt
 * @param {Object} params - { status, page, limit }
 */
export const getFines = async (params = {}) => {
    const response = await api.get('/fines', { params });
    return response;
};

/**
 * Lấy tiền phạt của tôi (độc giả)
 */
export const getMyFines = async () => {
    const response = await api.get('/fines/my');
    return response;
};

/**
 * Thanh toán tiền phạt
 * @param {number} id - ID phiếu phạt
 */
export const payFine = async (id) => {
    const response = await api.put(`/fines/${id}/pay`);
    return response;
};

/**
 * Thanh toán tất cả tiền phạt của một phiếu mượn
 * @param {number} borrowRequestId - ID phiếu mượn
 */
export const payAllFines = async (borrowRequestId) => {
    const response = await api.put(`/fines/pay-all/${borrowRequestId}`);
    return response;
};

// ===================================================================
// DEPOSITS (Tiền đặt cọc)
// ===================================================================

/**
 * Lấy danh sách giao dịch cọc
 * @param {Object} params - { type, library_card_id, page, limit }
 */
export const getDeposits = async (params = {}) => {
    const response = await api.get('/deposits', { params });
    return response;
};

/**
 * Lấy giao dịch cọc của tôi (độc giả)
 */
export const getMyDeposits = async () => {
    const response = await api.get('/deposits/my');
    return response;
};

/**
 * Nạp tiền cọc
 * @param {Object} data - { library_card_id, amount, notes }
 */
export const createDeposit = async (data) => {
    const response = await api.post('/deposits', data);
    return response;
};

/**
 * Hoàn tiền cọc
 * @param {Object} data - { library_card_id, amount, notes }
 */
export const refundDeposit = async (data) => {
    const response = await api.post('/deposits/refund', data);
    return response;
};

export default {
    getFines,
    getMyFines,
    payFine,
    payAllFines,
    getDeposits,
    getMyDeposits,
    createDeposit,
    refundDeposit
};
