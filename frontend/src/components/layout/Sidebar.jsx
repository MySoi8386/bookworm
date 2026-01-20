/**
 * ===================================================================
 * SIDEBAR COMPONENT - Thanh điều hướng bên trái (Theo Figma Design)
 * ===================================================================
 * Width: 222px (theo Figma)
 * Background: #000000 (đen)
 * Menu items: 48px height mỗi item
 * Active state: bg-white, text-black
 * ===================================================================
 */

import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    HiOutlineHome,           // Trang chủ
    HiOutlineBookOpen,       // Mượn trả
    HiOutlineCollection,     // Sách
    HiOutlineUserGroup,      // Thành viên
    HiOutlineOfficeBuilding, // Điều hành
    HiOutlineChartBar,       // Thống kê
    HiOutlineCog,            // Cài đặt
    HiOutlineCurrencyDollar, // Tài chính
    HiOutlineUser,           // Hồ sơ cá nhân
    HiOutlineBell,           // Thông báo
    HiOutlineTag             // Danh mục
} from 'react-icons/hi';

// Import logo SVG
import Logo from '../../assets/logo.svg';

/**
 * Sidebar Component
 * Thanh điều hướng bên trái với menu items theo role
 * Kích thước: 222px x 100vh (theo Figma)
 */
const Sidebar = () => {
    const { isAdmin, isStaff, isReader } = useAuth();

    /**
     * Menu items cho Admin/Librarian (Staff)
     * Thứ tự theo kế hoạch mới: Trang chủ → Mượn → Trả → Thành viên → Thông báo → Sách → Danh mục → Tài chính → Báo cáo → Hồ sơ
     */
    const staffMenuItems = [
        {
            path: '/dashboard',
            icon: HiOutlineHome,
            label: 'Trang chủ',
        },
        {
            path: '/borrow',
            icon: HiOutlineBookOpen,
            label: 'Mượn',
        },
        {
            path: '/return',
            icon: HiOutlineBookOpen,
            label: 'Trả',
        },
        {
            path: '/members',
            icon: HiOutlineUserGroup,
            label: 'Thành viên',
        },
        {
            path: '/notifications',
            icon: HiOutlineBell,
            label: 'Thông báo',
        },
        {
            path: '/books',
            icon: HiOutlineCollection,
            label: 'Sách',
        },
        {
            path: '/categories',
            icon: HiOutlineTag,
            label: 'Danh mục',
        },
        {
            path: '/finance',
            icon: HiOutlineCurrencyDollar,
            label: 'Tài chính',
        },
        {
            path: '/statistics',
            icon: HiOutlineChartBar,
            label: 'Báo cáo',
        },
        {
            path: '/profile',
            icon: HiOutlineUser,
            label: 'Hồ sơ',
        },
    ];

    /**
     * Menu items chỉ dành cho Admin (Điều hành + Cài đặt)
     */
    const adminOnlyItems = [
        {
            path: '/operations',
            icon: HiOutlineOfficeBuilding,
            label: 'Điều hành',
        },
        {
            path: '/settings',
            icon: HiOutlineCog,
            label: 'Cài đặt',
        },
    ];

    /**
     * Menu items cho Reader (Độc giả)
     * Thứ tự theo kế hoạch mới: Trang chủ → Tủ sách → Phiếu mượn → Công nợ → Hồ sơ
     */
    const readerMenuItems = [
        {
            path: '/dashboard',
            icon: HiOutlineHome,
            label: 'Trang chủ',
        },
        {
            path: '/search',
            icon: HiOutlineCollection,
            label: 'Tủ sách',
        },
        {
            path: '/my-books',
            icon: HiOutlineBookOpen,
            label: 'Phiếu mượn',
        },
        {
            path: '/my-finance',
            icon: HiOutlineCurrencyDollar,
            label: 'Công nợ',
        },
        {
            path: '/profile',
            icon: HiOutlineUser,
            label: 'Hồ sơ',
        },
    ];

    // Chọn menu items dựa trên role
    let menuItems = [];

    if (isStaff()) {
        menuItems = [...staffMenuItems];
        if (isAdmin()) {
            menuItems = [...menuItems, ...adminOnlyItems];
        }
    } else if (isReader()) {
        menuItems = readerMenuItems;
    }

    return (
        // Sidebar container: width tương đối theo rem, rộng rãi hơn
        <aside
            className="h-screen flex flex-col fixed left-0 top-0 z-50 bg-gradient-to-b from-gray-900 via-black to-black shadow-2xl w-[16rem] min-w-[16rem]"
        >
            {/* ===== LOGO SECTION ===== */}
            <div className="pt-6 pb-4 px-4 border-b border-gray-800/50">
                <div className="transform transition-transform duration-300 hover:scale-105 flex justify-center items-center">
                    <img
                        src={Logo}
                        alt="BookWorm Library"
                        className="w-auto h-12 drop-shadow-lg"
                    />
                </div>
            </div>

            {/* ===== NAVIGATION MENU ===== */}
            {/* Bắt đầu từ y=158 theo Figma */}
            <nav className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                <ul className="space-y-2">
                    {menuItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    `group flex items-center h-[3rem] px-5 gap-4 rounded-xl transition-all duration-200 relative ${isActive
                                        ? 'bg-white text-black shadow-lg shadow-white/20 font-medium'
                                        : 'text-gray-300 hover:text-white hover:bg-gray-800/50 hover:translate-x-1'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        {/* Active indicator bar */}
                                        {isActive && (
                                            <div className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-r-full" />
                                        )}

                                        {/* Icon: size tương đối, lớn hơn */}
                                        <item.icon
                                            className={`w-6 h-6 shrink-0 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'
                                                }`}
                                        />

                                        {/* Label */}
                                        <span className="text-sm font-medium tracking-wide">
                                            {item.label}
                                        </span>

                                        {/* Hover effect indicator */}
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                    </>
                                )}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
