/**
 * ===================================================================
 * AUTH SERVICE - Các API liên quan đến xác thực
 * ===================================================================
 * - Đăng nhập
 * - Đăng ký
 * - Lấy thông tin user
 * - Đổi mật khẩu
 * ===================================================================
 */

import api from './api';

/**
 * Đăng nhập
 * @param {string} username - Tên đăng nhập
 * @param {string} password - Mật khẩu
 * @returns {Promise} Response chứa token và user info
 */
export const login = async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response;
};

/**
 * Đăng ký tài khoản độc giả
 * @param {Object} data - Thông tin đăng ký
 * @returns {Promise} Response
 */
export const register = async (data) => {
    const response = await api.post('/auth/register', data);
    return response;
};

/**
 * Lấy thông tin user hiện tại
 * @returns {Promise} User info
 */
export const getMe = async () => {
    const response = await api.get('/auth/me');
    return response;
};

/**
 * Đổi mật khẩu
 * @param {string} currentPassword - Mật khẩu hiện tại
 * @param {string} newPassword - Mật khẩu mới
 * @param {string} confirmPassword - Xác nhận mật khẩu mới
 * @returns {Promise} Response
 */
export const changePassword = async (currentPassword, newPassword, confirmPassword) => {
    const response = await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword
    });
    return response;
};

/**
 * Đăng xuất (xóa token ở client)
 */
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

export default {
    login,
    register,
    getMe,
    changePassword,
    logout
};
