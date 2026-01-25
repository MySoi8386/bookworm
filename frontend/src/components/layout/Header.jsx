/**
 * ===================================================================
 * HEADER COMPONENT - Thanh tiêu đề phía trên (Theo Figma Design)
 * ===================================================================
 * Height: 71px (theo Figma)
 * Background: #FFFFFF (trắng)
 * Layout:
 * - Trái: User icon + Tên + Role
 * - Phải: Giờ + Ngày | Icon Settings
 * ===================================================================
 */

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { HiOutlineUser, HiOutlineLogout, HiOutlineLogin, HiOutlineUserAdd } from 'react-icons/hi';

/**
 * Header Component
 * Thanh tiêu đề với thông tin user và thời gian
 */
const Header = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    /**
     * Xử lý đăng xuất
     */
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    /**
     * Lấy tên hiển thị của user
     */
    const getUserDisplayName = () => {
        if (user?.staff?.full_name) return user.staff.full_name;
        if (user?.reader?.full_name) return user.reader.full_name;
        return user?.username || 'User';
    };

    /**
     * Lấy role hiển thị
     */
    const getRoleDisplay = () => {
        if (user?.role === 'admin') return 'Admin';
        if (user?.role === 'librarian') return 'Thủ thư';
        return 'Độc giả';
    };

    return (
        // Header container: height 71px theo Figma, sticky khi scroll
        <header
            className="bg-white flex items-center justify-between px-5 sticky top-0 z-50 shadow-sm"
            style={{ height: '71px' }}
        >
            {/* ===== LEFT SECTION: User Info ===== */}
            {/* Position: x=20 theo Figma */}
            {isAuthenticated ? (
                <Link to="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    {/* User Icon: 34x34 */}
                    <div className="w-9 h-9 flex items-center justify-center">
                        <HiOutlineUser className="w-8 h-8 text-black" />
                    </div>

                    {/* User Name & Role */}
                    <div>
                        {/* Name: x=61, y=16 */}
                        <p className="text-lg font-semibold text-black leading-tight">
                            {getUserDisplayName()}
                        </p>
                        {/* Role: x=61, y=38 */}
                        <p className="text-sm text-black leading-tight">
                            {getRoleDisplay()}
                        </p>
                    </div>
                </Link>
            ) : (
                <div className="flex items-center gap-3">
                    {/* Guest Icon */}
                    <div className="w-9 h-9 flex items-center justify-center">
                        <HiOutlineUser className="w-8 h-8 text-black" />
                    </div>

                    {/* Guest Info */}
                    <div>
                        <p className="text-lg font-semibold text-black leading-tight">
                            Khách hàng
                        </p>
                        <p className="text-sm text-black leading-tight">
                            Guest
                        </p>
                    </div>
                </div>
            )}

            {/* ===== RIGHT SECTION: Auth Buttons ===== */}
            <div className="flex items-center gap-4">
                {isAuthenticated ? (
                    /* Logout Button - chỉ hiển thị khi đã đăng nhập */
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                        <HiOutlineLogout className="w-5 h-5" />
                        <span className="text-sm font-medium">Đăng xuất</span>
                    </button>
                ) : (
                    /* Login & Register Buttons - chỉ hiển thị khi chưa đăng nhập */
                    <>
                        <Link
                            to="/login"
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-black hover:bg-gray-50 rounded-lg transition-colors duration-200"
                        >
                            <HiOutlineLogin className="w-5 h-5" />
                            <span className="text-sm font-medium">Đăng nhập</span>
                        </Link>
                        <Link
                            to="/register"
                            className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-gray-800 rounded-lg transition-colors duration-200"
                        >
                            <HiOutlineUserAdd className="w-5 h-5" />
                            <span className="text-sm font-medium">Đăng ký</span>
                        </Link>
                    </>
                )}
            </div>
        </header>
    );
};

export default Header;
