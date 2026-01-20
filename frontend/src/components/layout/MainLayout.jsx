/**
 * ===================================================================
 * MAIN LAYOUT - Layout chính cho các trang sau khi đăng nhập
 * ===================================================================
 * Cấu trúc:
 * - Sidebar cố định bên trái
 * - Content area bên phải (header + main content)
 * ===================================================================
 */

import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

/**
 * MainLayout Component
 * Layout wrapper cho tất cả các trang sau khi đăng nhập
 */
const MainLayout = () => {
    return (
        <div className="min-h-screen bg-gray-100">
            {/* ===== SIDEBAR ===== */}
            <Sidebar />

            {/* ===== MAIN CONTENT AREA ===== */}
            {/* margin-left: 16rem (256px) để khớp với sidebar width */}
            <div style={{ marginLeft: '16rem' }} className="h-screen w-[calc(100%-16rem)] overflow-y-auto overflow-x-hidden">
                {/* Header */}
                <Header />

                {/* Page Content */}
                <main className="p-4 lg:p-6 w-full max-w-full overflow-x-hidden">
                    {/* Outlet sẽ render component của route hiện tại */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
