/**
 * ===================================================================
 * PROTECTED ROUTE - Bảo vệ routes yêu cầu đăng nhập
 * ===================================================================
 * Kiểm tra authentication và redirect về login nếu chưa đăng nhập
 * Có thể kiểm tra role để giới hạn truy cập
 * ===================================================================
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * ProtectedRoute Component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Component con cần bảo vệ
 * @param {string|string[]} props.roles - Roles được phép truy cập (optional)
 */
const ProtectedRoute = ({ children, roles }) => {
    const { isAuthenticated, loading, hasRole, user } = useAuth();
    const location = useLocation();

    // Hiển thị loading khi đang kiểm tra auth
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center">
                    {/* Loading spinner */}
                    <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải...</p>
                </div>
            </div>
        );
    }

    // Chưa đăng nhập -> redirect về login
    if (!isAuthenticated) {
        // Lưu lại URL hiện tại để redirect lại sau khi login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Kiểm tra role nếu được chỉ định
    if (roles && !hasRole(roles)) {
        // Debug log để xem vấn đề
        console.log('ProtectedRoute: Role check failed', {
            requiredRoles: roles,
            userRole: user?.role,
            hasRole: hasRole(roles),
            user: user
        });
        // Không có quyền -> redirect về trang chủ hoặc 403
        return <Navigate to="/unauthorized" replace />;
    }

    // Đã đăng nhập và có quyền -> hiển thị component con
    return children;
};

export default ProtectedRoute;
