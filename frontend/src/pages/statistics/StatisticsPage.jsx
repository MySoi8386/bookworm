/**
 * ===================================================================
 * STATISTICS PAGE - Trang thống kê báo cáo
 * ===================================================================
 */

import { useState, useEffect } from 'react';
import {
    getDashboardStats,
    getOverdueBooks,
    getPopularBooks,
    getSemiAnnualReport
} from '../../services/statisticsService';
import toast from 'react-hot-toast';
import {
    HiOutlineChartBar,
    HiOutlineBookOpen,
    HiOutlineUsers,
    HiOutlineCash,
    HiOutlineRefresh,
    HiOutlineExclamationCircle,
    HiOutlineTrendingUp,
    HiOutlineDocumentReport,
    HiOutlineFire
} from 'react-icons/hi';

const StatisticsPage = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [overdueBooks, setOverdueBooks] = useState([]);
    const [popularBooks, setPopularBooks] = useState([]);
    const [report, setReport] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    /**
     * Fetch all statistics
     */
    const fetchStats = async () => {
        try {
            setLoading(true);
            const [dashboardRes, overdueRes, popularRes] = await Promise.all([
                getDashboardStats(),
                getOverdueBooks(),
                getPopularBooks({ limit: 10, period: 'month' })
            ]);

            // Response có thể là { success, data } hoặc data trực tiếp
            const statsData = dashboardRes?.data || dashboardRes || null;
            const overdueData = Array.isArray(overdueRes?.data) ? overdueRes.data : (Array.isArray(overdueRes) ? overdueRes : []);
            const popularData = Array.isArray(popularRes?.data) ? popularRes.data : (Array.isArray(popularRes) ? popularRes : []);
            
            setStats(statsData);
            setOverdueBooks(overdueData);
            setPopularBooks(popularData);
        } catch (error) {
            console.error('Fetch stats error:', error);
            toast.error('Không thể tải dữ liệu thống kê');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Fetch semi-annual report
     */
    const fetchReport = async () => {
        try {
            const res = await getSemiAnnualReport();
            // Response có thể là { success, data } hoặc data trực tiếp
            const reportData = res?.data || res || null;
            setReport(reportData);
        } catch (error) {
            console.error('Fetch report error:', error);
            toast.error('Không thể tải báo cáo');
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        if (activeTab === 'report' && !report) {
            fetchReport();
        }
    }, [activeTab]);

    const formatCurrency = (amount) => {
        return (amount || 0).toLocaleString('vi-VN') + ' VNĐ';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải thống kê...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Thống kê & Báo cáo</h1>
                    <p className="text-gray-500 text-sm mt-1">Tổng quan hoạt động thư viện</p>
                </div>
                <button
                    onClick={fetchStats}
                    className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                    <HiOutlineRefresh className="w-5 h-5 text-gray-600" />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-4 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'overview'
                        ? 'border-black text-black'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <HiOutlineChartBar className="inline w-5 h-5 mr-2" />
                    Tổng quan
                </button>
                <button
                    onClick={() => setActiveTab('overdue')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'overdue'
                        ? 'border-black text-black'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <HiOutlineExclamationCircle className="inline w-5 h-5 mr-2" />
                    Quá hạn ({overdueBooks.length})
                </button>
                <button
                    onClick={() => setActiveTab('popular')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'popular'
                        ? 'border-black text-black'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <HiOutlineFire className="inline w-5 h-5 mr-2" />
                    Sách phổ biến
                </button>
                <button
                    onClick={() => setActiveTab('report')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'report'
                        ? 'border-black text-black'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <HiOutlineDocumentReport className="inline w-5 h-5 mr-2" />
                    Báo cáo 6 tháng
                </button>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && stats && (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {/* Total Books Card */}
                        <div className="relative bg-white rounded-2xl border border-gray-100 p-5 overflow-hidden group hover:shadow-lg transition-all duration-300">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform" />
                            <div className="relative">
                                <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center mb-3">
                                    <HiOutlineBookOpen className="w-5 h-5 text-sky-600" />
                                </div>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Tổng đầu sách</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.books?.totalBooks || 0}</p>
                                <p className="text-xs text-gray-400 mt-1">{stats.books?.totalCopies || 0} bản sách</p>
                            </div>
                        </div>

                        {/* Readers Card */}
                        <div className="relative bg-white rounded-2xl border border-gray-100 p-5 overflow-hidden group hover:shadow-lg transition-all duration-300">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform" />
                            <div className="relative">
                                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mb-3">
                                    <HiOutlineUsers className="w-5 h-5 text-teal-600" />
                                </div>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Độc giả</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.readers?.totalReaders || 0}</p>
                                <p className="text-xs text-gray-400 mt-1">{stats.readers?.activeCards || 0} thẻ hoạt động</p>
                            </div>
                        </div>

                        {/* Borrowing Card */}
                        <div className="relative bg-white rounded-2xl border border-gray-100 p-5 overflow-hidden group hover:shadow-lg transition-all duration-300">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform" />
                            <div className="relative">
                                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-3">
                                    <HiOutlineTrendingUp className="w-5 h-5 text-amber-600" />
                                </div>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Đang mượn</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.borrows?.borrowsByStatus?.borrowed || 0}</p>
                                <div className="flex items-center text-xs mt-1">
                                    {(stats.borrows?.overdueBorrows || 0) > 0 ? (
                                        <span className="text-red-500 font-medium">{stats.borrows?.overdueBorrows} quá hạn</span>
                                    ) : (
                                        <span className="text-gray-400">Không có quá hạn</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Fines Card */}
                        <div className="relative bg-white rounded-2xl border border-gray-100 p-5 overflow-hidden group hover:shadow-lg transition-all duration-300">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform" />
                            <div className="relative">
                                <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center mb-3">
                                    <HiOutlineCash className="w-5 h-5 text-rose-600" />
                                </div>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Tiền phạt chờ</p>
                                <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(stats.finances?.pendingFines)}</p>
                                <p className="text-xs text-gray-400 mt-1">Thu: {formatCurrency(stats.finances?.collectedFinesThisMonth)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Book Status Distribution */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Trạng thái bản sách</h3>
                            <div className="space-y-3">
                                {Object.entries(stats.books?.copiesByStatus || {}).map(([status, count]) => {
                                    const statusLabels = {
                                        available: { label: 'Có sẵn', color: 'bg-green-500' },
                                        borrowed: { label: 'Đang mượn', color: 'bg-blue-500' },
                                        damaged: { label: 'Hư hỏng', color: 'bg-yellow-500' },
                                        lost: { label: 'Mất', color: 'bg-red-500' }
                                    };
                                    const info = statusLabels[status] || { label: status, color: 'bg-gray-500' };
                                    const percentage = ((count / (stats.books?.totalCopies || 1)) * 100).toFixed(1);
                                    return (
                                        <div key={status} className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${info.color}`}></div>
                                            <span className="text-sm text-gray-600 flex-1">{info.label}</span>
                                            <span className="text-sm font-semibold text-gray-900">{count}</span>
                                            <span className="text-xs text-gray-500 w-12 text-right">{percentage}%</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Trạng thái phiếu mượn</h3>
                            <div className="space-y-3">
                                {Object.entries(stats.borrows?.borrowsByStatus || {}).map(([status, count]) => {
                                    const statusLabels = {
                                        pending: { label: 'Chờ duyệt', color: 'bg-yellow-500' },
                                        approved: { label: 'Đã duyệt', color: 'bg-blue-500' },
                                        borrowed: { label: 'Đang mượn', color: 'bg-green-500' },
                                        returned: { label: 'Đã trả', color: 'bg-gray-500' },
                                        rejected: { label: 'Từ chối', color: 'bg-red-500' },
                                        overdue: { label: 'Quá hạn', color: 'bg-red-600' }
                                    };
                                    const info = statusLabels[status] || { label: status, color: 'bg-gray-500' };
                                    return (
                                        <div key={status} className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${info.color}`}></div>
                                            <span className="text-sm text-gray-600 flex-1">{info.label}</span>
                                            <span className="text-sm font-semibold text-gray-900">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                </div>
            )}

            {/* Overdue Tab */}
            {activeTab === 'overdue' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Độc giả</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Hạn trả</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Số ngày quá</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Sách</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Phạt dự kiến</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {overdueBooks.length > 0 ? (
                                    overdueBooks.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-gray-900 text-sm">{item.libraryCard?.reader?.full_name}</p>
                                                <p className="text-xs text-gray-500">{item.libraryCard?.reader?.phone}</p>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {new Date(item.due_date).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                                                    {item.daysOverdue} ngày
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {item.details?.map((d, i) => (
                                                    <div key={i}>{d.bookCopy?.bookEdition?.book?.title}</div>
                                                ))}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="font-semibold text-red-600">
                                                    {formatCurrency(item.estimatedFine)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-16 text-center text-gray-500">
                                            ✅ Không có sách quá hạn
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Popular Books Tab */}
            {activeTab === 'popular' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase w-20">#</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Mã sách</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Tên sách</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Lượt mượn</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {popularBooks.length > 0 ? (
                                    popularBooks.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-center">
                                                {index < 3 ? (
                                                    <span className={`w-8 h-8 inline-flex items-center justify-center rounded-full font-bold text-white ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'
                                                        }`}>
                                                        {index + 1}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-500">{index + 1}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-mono text-gray-600">
                                                {item.bookCopy?.bookEdition?.book?.code || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {item.bookCopy?.bookEdition?.book?.title || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                                                    {item.borrow_count}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-16 text-center text-gray-500">
                                            Không có dữ liệu
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Semi-Annual Report Tab */}
            {activeTab === 'report' && (
                <div className="space-y-6">
                    {report ? (
                        <>
                            {/* Report Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
                                    <HiOutlineBookOpen className="w-10 h-10 mx-auto text-blue-500 mb-2" />
                                    <p className="text-3xl font-bold text-gray-900">{report.summary?.totalBooks}</p>
                                    <p className="text-sm text-gray-500">Tổng đầu sách</p>
                                </div>
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
                                    <HiOutlineUsers className="w-10 h-10 mx-auto text-green-500 mb-2" />
                                    <p className="text-3xl font-bold text-gray-900">{report.summary?.activeReadersCount}</p>
                                    <p className="text-sm text-gray-500">Độc giả đã sử dụng</p>
                                </div>
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
                                    <HiOutlineCash className="w-10 h-10 mx-auto text-red-500 mb-2" />
                                    <p className="text-3xl font-bold text-gray-900">{formatCurrency(report.summary?.fineRevenue)}</p>
                                    <p className="text-sm text-gray-500">Thu tiền phạt</p>
                                </div>
                            </div>

                            {/* High Demand Books */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">📈 Sách có nhu cầu cao (Top 10)</h3>
                                <div className="space-y-2">
                                    {report.bookStats?.highDemandBooks?.slice(0, 10).map((book, i) => (
                                        <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                            <span className="text-sm text-gray-900">{book.title}</span>
                                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                                                {book.borrow_count} lượt
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Low Demand Books */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">📉 Sách ít sử dụng ({report.bookStats?.lowDemandBooksCount} cuốn)</h3>
                                <p className="text-sm text-gray-500 mb-4">Các sách không được mượn trong 6 tháng qua</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {report.bookStats?.lowDemandBooks?.slice(0, 10).map((book, i) => (
                                        <div key={i} className="text-sm text-gray-600">
                                            • {book.title}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Field Stats */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="font-semibold text-gray-900 mb-4">📊 Thống kê theo lĩnh vực</h3>
                                <div className="space-y-3">
                                    {report.fieldStats?.map((field, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <span className="text-sm text-gray-900">{field.name}</span>
                                            <div className="flex items-center gap-4">
                                                <span className="text-xs text-gray-500">{field.book_count} đầu sách</span>
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                                    {field.borrow_count} lượt mượn
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center py-16">
                            <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StatisticsPage;
