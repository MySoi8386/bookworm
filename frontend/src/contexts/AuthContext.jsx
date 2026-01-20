/**
 * ===================================================================
 * AUTH CONTEXT - Quản lý trạng thái xác thực toàn ứng dụng
 * ===================================================================
 * Cung cấp:
 * - User state (thông tin người dùng đang đăng nhập)
 * - Login/Logout functions
 * - isAuthenticated flag
 * - Loading state
 * ===================================================================
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as loginApi, logout as logoutApi, getMe } from '../services/authService';

// Tạo context
const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * Bọc toàn bộ app để cung cấp auth state
 */
export const AuthProvider = ({ children }) => {
    // State
    const [user, setUser] = useState(null);           // Thông tin user
    const [loading, setLoading] = useState(true);     // Đang load user info
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Đã đăng nhập

    /**
     * Kiểm tra và load user info từ token khi app khởi động
     */
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');

            if (token) {
                try {
                    // Gọi API lấy thông tin user
                    const response = await getMe();
                    // Interceptor đã return response.data, nên response = { success: true, data: account }
                    // Hoặc nếu API trả về trực tiếp thì response = account
                    const account = response.data || response;

                    // Normalize user object để giống với login response
                    // Đảm bảo role luôn là lowercase để khớp với hasRole check
                    const rawRole = account.userGroup?.name || account.role || 'reader';
                    const normalizedRole = typeof rawRole === 'string' ? rawRole.toLowerCase() : 'reader';

                    const normalizedUser = {
                        id: account.id,
                        username: account.username,
                        email: account.email,
                        role: normalizedRole,
                        groupId: account.group_id,
                        staff: account.staff,
                        reader: account.reader
                    };

                    console.log('Loaded user from API:', normalizedUser); // Debug log
                    console.log('Raw role from API:', rawRole, 'Normalized:', normalizedRole); // Debug log
                    setUser(normalizedUser);
                    setIsAuthenticated(true);
                    // Cập nhật localStorage để đồng bộ
                    localStorage.setItem('user', JSON.stringify(normalizedUser));
                } catch (error) {
                    // Token không hợp lệ hoặc hết hạn
                    console.error('Auth init failed:', error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                    setIsAuthenticated(false);
                }
            }

            setLoading(false);
        };

        initAuth();
    }, []);

    /**
     * Đăng nhập
     * @param {string} username - Tên đăng nhập
     * @param {string} password - Mật khẩu
     */
    const login = useCallback(async (username, password) => {
        const response = await loginApi(username, password);

        // Normalize user object - đảm bảo role là lowercase
        const rawUser = response.data.user;
        const rawRole = rawUser.role || rawUser.userGroup?.name || 'reader';
        const normalizedRole = typeof rawRole === 'string' ? rawRole.toLowerCase() : 'reader';

        const normalizedUser = {
            ...rawUser,
            role: normalizedRole
        };

        console.log('Login response user:', rawUser); // Debug log
        console.log('Normalized user:', normalizedUser); // Debug log

        // Lưu token và user info vào localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(normalizedUser));

        // Cập nhật state
        setUser(normalizedUser);
        setIsAuthenticated(true);

        return response;
    }, []);

    /**
     * Đăng xuất
     */
    const logout = useCallback(() => {
        // Xóa token và user info
        logoutApi();

        // Reset state
        setUser(null);
        setIsAuthenticated(false);
    }, []);

    /**
     * Kiểm tra user có role cụ thể không
     * @param {string|string[]} roles - Role hoặc mảng roles cần kiểm tra
     */
    const hasRole = useCallback((roles) => {
        if (!user) return false;

        const userRole = user.role;

        if (Array.isArray(roles)) {
            return roles.includes(userRole);
        }

        return userRole === roles;
    }, [user]);

    /**
     * Kiểm tra có phải Admin không
     */
    const isAdmin = useCallback(() => hasRole('admin'), [hasRole]);

    /**
     * Kiểm tra có phải Staff (Admin hoặc Librarian) không
     */
    const isStaff = useCallback(() => hasRole(['admin', 'librarian']), [hasRole]);

    /**
     * Kiểm tra có phải Reader không
     */
    const isReader = useCallback(() => hasRole('reader'), [hasRole]);

    // Value object để truyền qua context
    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        hasRole,
        isAdmin,
        isStaff,
        isReader,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Custom hook để sử dụng Auth Context
 * @returns {Object} Auth context value
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth phải được sử dụng trong AuthProvider');
    }

    return context;
};

export default AuthContext;
