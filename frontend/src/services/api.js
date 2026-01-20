/**
 * ===================================================================
 * API CONFIG - Cấu hình Axios instance
 * ===================================================================
 * Tạo axios instance với base URL, interceptors cho auth và error handling
 * ===================================================================
 */

import axios from 'axios';

// Base URL cho API - sẽ được proxy qua Vite config
const API_URL = '/api';

/**
 * Tạo Axios instance với cấu hình mặc định
 */
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 giây timeout
});

/**
 * Request Interceptor
 * - Tự động thêm JWT token vào header cho mỗi request
 */
api.interceptors.request.use(
    (config) => {
        // Lấy token từ localStorage
        const token = localStorage.getItem('token');

        // Nếu có token, thêm vào Authorization header
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Response Interceptor
 * - Xử lý lỗi 401 (Unauthorized) - redirect về login
 * - Xử lý các lỗi khác
 */
api.interceptors.response.use(
    (response) => {
        // Trả về data trực tiếp (bỏ qua wrapper object)
        return response.data;
    },
    (error) => {
        // Xử lý lỗi từ response
        const { response } = error;

        if (response) {
            // Nếu 401 (Unauthorized) - Token hết hạn hoặc không hợp lệ
            if (response.status === 401) {
                // Xóa token và redirect về login
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                // Chỉ redirect nếu không phải đang ở trang login
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
            }

            // Giữ nguyên error object để có thể truy cập response.data.errors
            // Tạo error mới nhưng giữ nguyên response
            const enhancedError = new Error(response.data?.message || 'Đã có lỗi xảy ra');
            enhancedError.response = response; // Giữ nguyên response để truy cập errors
            return Promise.reject(enhancedError);
        }

        // Lỗi network hoặc timeout
        if (error.code === 'ECONNABORTED') {
            return Promise.reject(new Error('Kết nối quá thời gian. Vui lòng thử lại.'));
        }

        return Promise.reject(new Error('Không thể kết nối đến server'));
    }
);

export default api;
