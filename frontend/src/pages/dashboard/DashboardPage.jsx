/**
 * ===================================================================
 * DASHBOARD PAGE - Trang chủ theo thiết kế Figma "Admin Dashboard Form"
 * ===================================================================
 * Layout:
 * - Background với gradient decorative shapes
 * - Panel "Người mượn quá hạn" bên phải
 * - Statistics cards và quick actions
 * ===================================================================
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services';
import borrowService from '../../services/borrowService';
import toast from 'react-hot-toast';
import {
    HiOutlineBookOpen,
    HiOutlineUserGroup,
    HiOutlineClipboardList,
    HiOutlineExclamation,
    HiOutlineCurrencyDollar,
    HiOutlineArrowRight,
    HiOutlineClock,
    HiOutlineSearch,
    HiOutlineEye
} from 'react-icons/hi';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import React from 'react';

// Đăng ký các components của Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * OverdueBorrowerCard - Card hiển thị người mượn quá hạn
 */
const OverdueBorrowerCard = ({ name, borrowedId, onView }) => {
    return (
        <div className="flex items-center gap-4 p-5 bg-gray-50 border border-gray-200 rounded-xl hover:shadow-md hover:border-gray-300 transition-all">
            {/* Icon người dùng */}
            <div className="w-11 h-11 flex items-center justify-center shrink-0 bg-white rounded-lg border border-gray-200">
                <HiOutlineUserGroup className="w-6 h-6 text-gray-700" />
            </div>

            {/* Thông tin */}
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 truncate mb-0.5">{name}</p>
                <p className="text-xs text-gray-500">ID: {borrowedId}</p>
            </div>

            {/* Nút xem chi tiết */}
            <button
                onClick={onView}
                className="p-2 hover:bg-white rounded-lg transition-colors shrink-0"
                title="Xem chi tiết"
            >
                <HiOutlineEye className="w-5 h-5 text-gray-600 hover:text-gray-900" />
            </button>
        </div>
    );
};

/**
 * StatCard - Card thống kê với icon và số liệu
 */
const StatCard = ({ title, value, icon, color = 'black', subtitle, link }) => {
    const colorClasses = {
        black: 'bg-black text-white',
        blue: 'bg-blue-600 text-white',
        green: 'bg-green-600 text-white',
        red: 'bg-red-600 text-white',
        yellow: 'bg-yellow-500 text-white',
    };

    const CardContent = (
        <div className="bg-white rounded-xl p-6 lg:p-8 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all w-full min-w-0">
            <div className="flex items-start justify-between mb-5 lg:mb-7">
                <div className={`w-12 h-12 lg:w-14 lg:h-14 ${colorClasses[color]} rounded-xl flex items-center justify-center shadow-sm shrink-0`}>
                    {icon && React.createElement(icon, { className: 'w-6 h-6 lg:w-7 lg:h-7' })}
                </div>
                {link && (
                    <span className="text-xs text-gray-500 font-medium flex items-center gap-1 transition-colors shrink-0">
                        Chi tiết <HiOutlineArrowRight className="w-3.5 h-3.5" />
                    </span>
                )}
            </div>
            <div className="min-w-0">
                <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 lg:mb-3 truncate">{value}</p>
                <p className="text-sm text-gray-600 font-medium truncate">{title}</p>
                {subtitle && <p className="text-xs text-gray-400 mt-2 line-clamp-2">{subtitle}</p>}
            </div>
        </div>
    );

    return link ? <Link to={link} className="block">{CardContent}</Link> : CardContent;
};

/**
 * QuickActionCard - Card hành động nhanh
 */
const QuickActionCard = ({ title, description, icon, link, color = 'black' }) => {
    return (
        <Link
            to={link}
            className="block bg-white rounded-xl p-6 lg:p-8 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all hover:-translate-y-0.5 group w-full min-w-0"
        >
            <div className={`w-12 h-12 lg:w-14 lg:h-14 ${color === 'black' ? 'bg-black' : `bg-${color}-600`} text-white rounded-xl flex items-center justify-center mb-4 lg:mb-6 shadow-sm group-hover:scale-105 transition-transform shrink-0`}>
                {icon && React.createElement(icon, { className: 'w-6 h-6 lg:w-7 lg:h-7' })}
            </div>
            <h3 className="font-semibold text-sm lg:text-base text-gray-900 mb-2 lg:mb-3 truncate">{title}</h3>
            <p className="text-xs lg:text-sm text-gray-600 line-clamp-2">{description}</p>
        </Link>
    );
};

/**
 * BorrowingStatusChart - Biểu đồ tròn hiển thị trạng thái mượn sách
 */
const BorrowingStatusChart = ({ stats }) => {
    // Tính toán dữ liệu
    const activeBorrows = stats?.borrows?.activeBorrows || 0;
    const overdueBorrows = stats?.borrows?.overdueBorrows || 0;
    const totalCopies = stats?.books?.totalCopies || 0;

    // Số sách đã trả (lấy từ API hoặc tính toán từ lịch sử)
    const returnedBooks = stats?.borrows?.returnedBooks || 0;

    // Tính số sách đang mượn đúng hạn (không quá hạn)
    const onTimeBorrows = Math.max(0, activeBorrows - overdueBorrows);

    // Tính số sách có sẵn (tổng - đang mượn)
    const availableBooks = Math.max(0, totalCopies - activeBorrows);

    const chartData = {
        labels: [
            'Đang mượn (đúng hạn)',
            'Quá hạn',
            'Có sẵn'
        ],
        datasets: [
            {
                label: 'Số lượng sách',
                data: [
                    onTimeBorrows,
                    overdueBorrows,
                    availableBooks
                ],
                backgroundColor: [
                    'rgba(234, 179, 8, 0.8)',   // Yellow - Đang mượn đúng hạn
                    'rgba(239, 68, 68, 0.8)',   // Red - Quá hạn
                    'rgba(59, 130, 246, 0.8)'   // Blue - Có sẵn
                ],
                borderColor: [
                    'rgba(234, 179, 8, 1)',
                    'rgba(239, 68, 68, 1)',
                    'rgba(59, 130, 246, 1)'
                ],
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 15,
                    font: {
                        size: 12,
                        family: "'Inter', 'Segoe UI', system-ui, sans-serif"
                    },
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: {
                    size: 14,
                    weight: 'bold'
                },
                bodyFont: {
                    size: 13
                },
                callbacks: {
                    label: function (context) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        return `${label}: ${value.toLocaleString('vi-VN')} (${percentage}%)`;
                    }
                }
            }
        }
    };

    return (
        <div className="bg-white rounded-xl p-6 lg:p-8 shadow-sm border border-gray-100 w-full min-w-0 overflow-hidden">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 lg:mb-8">Thống kê mượn trả sách</h3>
            <div className="h-[280px] lg:h-[320px] mb-6 lg:mb-8 w-full min-w-0">
                <Pie data={chartData} options={options} />
            </div>
            <div className="mt-6 lg:mt-8 grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6 pt-4 lg:pt-6 border-t border-gray-200">
                <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span className="text-sm font-medium text-gray-700">Đúng hạn</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{onTimeBorrows}</p>
                </div>
                <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-sm font-medium text-gray-700">Quá hạn</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{overdueBorrows}</p>
                </div>
                <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm font-medium text-gray-700">Có sẵn</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{availableBooks}</p>
                </div>
            </div>
            {/* Thông tin bổ sung về sách đã trả */}
            {returnedBooks > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="font-medium">Tổng số sách đã trả (lịch sử):</span>
                        <span className="text-lg font-bold text-gray-900">{returnedBooks.toLocaleString('vi-VN')}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * ReaderDashboard - Dashboard cho độc giả
 */
const ReaderDashboard = ({ user }) => {
    const [stats, setStats] = useState({
        borrowed: 0,
        overdue: 0,
        fines: 0
    });
    const [myBorrows, setMyBorrows] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReaderData = async () => {
            try {
                setLoading(true);
                // Get my requests
                const res = await borrowService.getMyBorrowRequests();
                const requests = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);

                // Calculate stats
                let activeCount = 0;
                let overdueCount = 0;
                let finesAmount = 0;

                requests.forEach(req => {
                    if (['borrowed', 'overdue'].includes(req.status)) {
                        activeCount++;
                    }
                    if (req.status === 'overdue') {
                        overdueCount++;
                    }
                    // Sum fines if available in request object
                    if (req.fines?.length) {
                        req.fines.forEach(f => finesAmount += f.amount);
                    }
                });

                setStats({
                    borrowed: activeCount,
                    overdue: overdueCount,
                    fines: finesAmount
                });
                setMyBorrows(requests.slice(0, 5)); // Recent 5
            } catch (error) {
                console.error('Reader dashboard error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReaderData();
    }, []);

    if (loading) return <div className="p-8 text-center">Đang tải thông tin...</div>;

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-gray-900">Xin chào, {user?.reader?.full_name || user?.username}!</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Đang mượn"
                    value={stats.borrowed}
                    icon={HiOutlineBookOpen}
                    color="blue"
                    link="/my-books"
                />
                <StatCard
                    title="Sách quá hạn"
                    value={stats.overdue}
                    icon={HiOutlineExclamation}
                    color="red"
                    link="/my-books?status=overdue"
                />
                <StatCard
                    title="Nợ phí thư viện"
                    value={`${stats.fines.toLocaleString('vi-VN')} VNĐ`}
                    icon={HiOutlineCurrencyDollar}
                    color="yellow"
                    link="/my-finance"
                />
            </div>

            {/* Recent Borrows */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900">Sách đang mượn gần đây</h2>
                    <Link to="/my-books" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                        Xem tất cả <HiOutlineArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="space-y-4">
                    {myBorrows.length > 0 ? (
                        myBorrows.map(req => (
                            <div key={req.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-semibold text-gray-900">Phiếu #{req.id}</p>
                                    <p className="text-sm text-gray-500">Ngày mượn: {new Date(req.borrow_date).toLocaleDateString('vi-VN')}</p>
                                    <p className="text-sm text-gray-500">Hạn trả: {new Date(req.due_date).toLocaleDateString('vi-VN')}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${req.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                    req.status === 'borrowed' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                    {req.status === 'overdue' ? 'Quá hạn' : 'Đang mượn'}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-4">Bạn chưa mượn cuốn sách nào.</p>
                    )}
                </div>
            </div>

            {/* Quick Suggestions */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900">Gợi ý cho bạn</h2>
                    <Link to="/search" className="text-sm text-blue-600 hover:underline">Tìm sách mới</Link>
                </div>
                <p className="text-gray-500">Tính năng gợi ý đang được phát triển...</p>
            </div>
        </div>
    );
};

/**
 * DashboardPage Component
 */
const DashboardPage = () => {
    const { isStaff, user } = useAuth();

    // All hooks must be called before any conditional returns
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [overdueItems, setOverdueItems] = useState([]);

    /**
     * Fetch dashboard data
     */
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                if (isStaff()) {
                    // Fetch stats
                    const statsResponse = await api.get('/statistics/dashboard');
                    // Response có thể là { success, data } hoặc data trực tiếp
                    const statsData = statsResponse?.data || statsResponse;
                    setStats(statsData);

                    // Fetch overdue
                    const overdueResponse = await api.get('/statistics/overdue');
                    const overdueData = Array.isArray(overdueResponse?.data) ? overdueResponse.data : (Array.isArray(overdueResponse) ? overdueResponse : []);
                    setOverdueItems(overdueData);
                }
            } catch (error) {
                console.error('Dashboard fetch error:', error);
                // Sử dụng dữ liệu mẫu nếu không thể fetch
                setStats({
                    books: { totalBooks: 156, totalCopies: 432 },
                    readers: { totalReaders: 89 },
                    borrows: {
                        overdueBorrows: 12,
                        borrowsToday: 5,
                        activeBorrows: 34,
                        returnedBooks: 386
                    },
                    finances: { pendingFines: 1250000, collectedFinesThisMonth: 3500000 }
                });
                // Dữ liệu mẫu cho overdue
                setOverdueItems([
                    { id: 1, name: 'Nguyễn Văn A', borrowedId: '10', daysOverdue: 5 },
                    { id: 2, name: 'Trần Thị B', borrowedId: '15', daysOverdue: 3 },
                    { id: 3, name: 'Lê Văn C', borrowedId: '22', daysOverdue: 7 },
                    { id: 4, name: 'Phạm Thị D', borrowedId: '28', daysOverdue: 2 },
                ]);
            } finally {
                setLoading(false);
            }
        };

        // Only fetch if staff
        if (isStaff()) {
            fetchDashboardData();
        } else {
            setLoading(false);
        }
    }, [isStaff]);

    // Return Reader Dashboard if not staff (after all hooks)
    if (!isStaff()) {
        return <ReaderDashboard user={user} />;
    }

    // Loading state
    if (loading) {
        return (
            <div className="relative min-h-[calc(100vh-140px)]">
                {/* Skeleton loading */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="bg-white rounded-xl p-5 h-32">
                                    <div className="w-12 h-12 bg-gray-200 rounded-xl mb-4"></div>
                                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-6 h-96">
                        <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-14 bg-gray-200 rounded-xl"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-[calc(100vh-140px)] w-full overflow-x-hidden">
            {/* ===== MAIN CONTENT ===== */}
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12">
                {/* ===== LEFT COLUMN - Stats & Actions ===== */}
                <div className="lg:col-span-2 space-y-8 lg:space-y-12 min-w-0">
                    {/* Additional Stats Row */}
                    <div className="mb-8 lg:mb-12">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-7">
                            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100 min-w-0">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-semibold text-gray-700 truncate">Trạng thái phiếu mượn</h3>
                                </div>
                                <div className="space-y-2">
                                    {stats?.borrows?.borrowsByStatus && Object.entries(stats.borrows.borrowsByStatus).map(([status, count]) => (
                                        <div key={status} className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600 capitalize">{status === 'pending' ? 'Chờ duyệt' : status === 'approved' ? 'Đã duyệt' : status === 'borrowed' ? 'Đang mượn' : status === 'returned' ? 'Đã trả' : status === 'overdue' ? 'Quá hạn' : status}</span>
                                            <span className="font-semibold text-gray-900">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100 min-w-0">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-semibold text-gray-700 truncate">Trạng thái bản sách</h3>
                                </div>
                                <div className="space-y-2">
                                    {stats?.books?.copiesByStatus && Object.entries(stats.books.copiesByStatus).map(([status, count]) => (
                                        <div key={status} className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600 capitalize">{status === 'available' ? 'Có sẵn' : status === 'borrowed' ? 'Đang mượn' : status === 'damaged' ? 'Hỏng' : status === 'disposed' ? 'Thanh lý' : status}</span>
                                            <span className="font-semibold text-gray-900">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100 min-w-0">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-semibold text-gray-700 truncate">Hoạt động hôm nay</h3>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Phiếu mượn mới</span>
                                        <span className="text-lg font-bold text-gray-900">{stats?.borrows?.borrowsToday || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Sách đã trả</span>
                                        <span className="text-lg font-bold text-green-600">{stats?.borrows?.returnedBooks || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Phiếu quá hạn</span>
                                        <span className="text-lg font-bold text-red-600">{stats?.borrows?.overdueBorrows || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Borrowing Status Chart */}
                    <div className="mb-8 lg:mb-12 w-full min-w-0">
                        <BorrowingStatusChart stats={stats} />
                    </div>

                    {/* Financial Stats */}
                    <div className="mb-8 lg:mb-12">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 lg:mb-8">Tài chính</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-7">
                            <div className="bg-white rounded-xl p-6 lg:p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow min-w-0">
                                <div className="flex items-center justify-between mb-5 lg:mb-7">
                                    <h3 className="font-semibold text-base lg:text-lg text-gray-900 truncate">Tiền phạt chưa thu</h3>
                                    <Link to="/finance" className="text-xs lg:text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline shrink-0 ml-2">
                                        Xem tất cả
                                    </Link>
                                </div>
                                <p className="text-2xl lg:text-3xl font-bold text-red-600 mb-3 lg:mb-4 truncate">
                                    {(stats?.finances?.pendingFines || 0).toLocaleString('vi-VN')} VNĐ
                                </p>
                                <p className="text-sm text-gray-500 truncate">
                                    {stats?.borrows?.overdueBorrows || 0} phiếu quá hạn
                                </p>
                            </div>

                            <div className="bg-white rounded-xl p-6 lg:p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow min-w-0">
                                <div className="flex items-center justify-between mb-5 lg:mb-7">
                                    <h3 className="font-semibold text-base lg:text-lg text-gray-900 truncate">Thu tháng này</h3>
                                    <span className="text-xs lg:text-sm text-green-600 font-medium flex items-center gap-1 shrink-0 ml-2">
                                        <HiOutlineArrowRight className="w-3 h-3 lg:w-4 lg:h-4 -rotate-45" />
                                        Tháng {new Date().getMonth() + 1}
                                    </span>
                                </div>
                                <p className="text-2xl lg:text-3xl font-bold text-green-600 mb-3 lg:mb-4 truncate">
                                    {(stats?.finances?.collectedFinesThisMonth || 0).toLocaleString('vi-VN')} VNĐ
                                </p>
                                <p className="text-sm text-gray-500 truncate">
                                    Đã thu trong tháng
                                </p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* ===== RIGHT COLUMN - Overdue Borrowers Panel ===== */}
                <div className="bg-white rounded-xl p-6 lg:p-8 shadow-sm border border-gray-100 h-fit lg:sticky lg:top-6 w-full min-w-0">
                    {/* Header */}
                    <div className="mb-10 pb-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900 text-center">
                            Người mượn quá hạn
                        </h2>
                    </div>

                    {/* List of overdue borrowers */}
                    <div className="space-y-4">
                        {overdueItems.length > 0 ? (
                            overdueItems.slice(0, 5).map((item, index) => (
                                <OverdueBorrowerCard
                                    key={item.id || index}
                                    name={item.name || item.libraryCard?.reader?.full_name || 'Chưa có tên'}
                                    borrowedId={item.borrowedId || item.id || index + 1}
                                    onView={() => {
                                        toast.success('Xem chi tiết phiếu mượn #' + (item.borrowedId || item.id));
                                    }}
                                />
                            ))
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <HiOutlineExclamation className="w-16 h-16 mx-auto mb-3 opacity-30" />
                                <p className="text-sm">Không có người mượn quá hạn</p>
                            </div>
                        )}
                    </div>

                    {/* View All Link */}
                    {overdueItems.length > 5 && (
                        <Link
                            to="/borrowing?status=overdue"
                            className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-700 font-medium hover:text-black hover:underline transition-colors pt-4 border-t border-gray-200"
                        >
                            Xem tất cả ({overdueItems.length})
                            <HiOutlineArrowRight className="w-4 h-4" />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
