/**
 * ===================================================================
 * RETURN PAGE - Trang quản lý trả sách
 * ===================================================================
 * Features:
 * - Tab "Đang mượn": Hiển thị phiếu mượn đang mượn (có thể trả)
 * - Tab "Quá hạn": Hiển thị phiếu mượn quá hạn
 * - Tab "Đã trả": Hiển thị phiếu mượn đã trả
 * - UI Collapse thay vì modal
 * ===================================================================
 */

import { useState, useEffect, useCallback } from 'react';
import {
    getBorrowRequests,
    returnBooks,
    getBorrowRequestById
} from '../../services/borrowService';
import toast from 'react-hot-toast';
import {
    HiOutlineSearch,
    HiOutlineEye,
    HiOutlineExclamation,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineRefresh,
    HiOutlineUserGroup
} from 'react-icons/hi';
import { BorrowDetailModal, BorrowCollapseTableRow } from '../../components';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Status configuration
 */
const STATUS_CONFIG = {
    pending: { text: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800', dotColor: 'bg-yellow-500' },
    approved: { text: 'Đã duyệt', color: 'bg-blue-100 text-blue-800', dotColor: 'bg-blue-500' },
    borrowed: { text: 'Đang mượn', color: 'bg-green-100 text-green-800', dotColor: 'bg-green-500' },
    returned: { text: 'Đã trả', color: 'bg-gray-100 text-gray-800', dotColor: 'bg-gray-500' },
    rejected: { text: 'Từ chối', color: 'bg-red-100 text-red-800', dotColor: 'bg-red-500' },
    overdue: { text: 'Quá hạn', color: 'bg-red-100 text-red-800', dotColor: 'bg-red-500' }
};

/**
 * ReturnPage Component
 */
const ReturnPage = () => {
    // Tab state - borrowed, overdue, returned
    const [activeTab, setActiveTab] = useState('borrowed'); // 'borrowed', 'overdue', 'returned'

    // Data state
    const [borrowRequests, setBorrowRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    // Search
    const [searchQuery, setSearchQuery] = useState('');

    // Modal states
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    // Lấy thông tin user để check quyền
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    /**
     * Fetch borrow requests
     */
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                status: activeTab // Luôn filter theo tab
            };

            const response = await getBorrowRequests(params);
            const requestsData = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
            const paginationData = response?.pagination || {};

            // Chỉ load full details cho tab "Đang mượn" và "Quá hạn" (cần để hiển thị collapse)
            // Tab "Đã trả" không cần details đầy đủ
            let requestsWithDetails = requestsData;
            if (activeTab === 'borrowed' || activeTab === 'overdue') {
                requestsWithDetails = await Promise.all(
                    requestsData.map(async (req) => {
                        try {
                            const detail = await getBorrowRequestById(req.id);
                            return detail || req;
                        } catch (error) {
                            console.error(`Error loading detail for request ${req.id}:`, error);
                            return req;
                        }
                    })
                );
            }

            setBorrowRequests(requestsWithDetails);
            setPagination(prev => ({
                ...prev,
                total: paginationData.total || 0,
                totalPages: paginationData.totalPages || 0
            }));
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error('Không thể tải danh sách phiếu mượn');
            setBorrowRequests([]);
        } finally {
            setLoading(false);
        }
    }, [activeTab, pagination.page, pagination.limit]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Reset page when tab changes
    useEffect(() => {
        setPagination(prev => ({ ...prev, page: 1 }));
    }, [activeTab]);

    /**
     * View detail
     */
    const handleViewDetail = async (request) => {
        try {
            const requestData = await getBorrowRequestById(request.id);
            if (requestData) {
                setSelectedRequest(requestData);
                setDetailModalOpen(true);
            } else {
                toast.error('Không tìm thấy thông tin phiếu mượn');
            }
        } catch (error) {
            console.error('View detail error:', error);
            toast.error(error.response?.data?.message || 'Không thể tải chi tiết phiếu mượn');
        }
    };

    /**
     * Return books
     */
    const handleReturn = async (requestId, returns) => {
        try {
            setActionLoading(true);
            const result = await returnBooks(requestId, returns);
            toast.success(result?.allReturned ? 'Đã trả hết sách' : 'Trả sách thành công');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi trả sách');
        } finally {
            setActionLoading(false);
        }
    };

    /**
     * Format date
     */
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('vi-VN');
    };

    /**
     * Get status badge
     */
    const getStatusBadge = (status) => {
        return STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    };

    /**
     * Filter by search
     */
    const filteredRequests = borrowRequests.filter(req => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        const readerName = req.libraryCard?.reader?.full_name?.toLowerCase() || '';
        const cardNumber = req.libraryCard?.card_number?.toLowerCase() || '';
        return readerName.includes(query) || cardNumber.includes(query) || String(req.id).includes(query);
    });

    // Loading state
    if (loading && borrowRequests.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* ===== HEADER ===== */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý trả sách</h1>
                    <p className="text-gray-500 text-sm mt-1">Xử lý trả sách cho độc giả</p>
                </div>
            </div>

            {/* ===== TABS & SEARCH ===== */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                {/* Tabs */}
                <div className="flex flex-wrap gap-2">
                    {[
                        { key: 'borrowed', label: 'Đang mượn' },
                        { key: 'overdue', label: 'Quá hạn' },
                        { key: 'returned', label: 'Đã trả' }
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${activeTab === tab.key
                                ? 'bg-black text-white shadow-sm'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search & Refresh */}
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-72">
                        <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm theo tên, số thẻ, ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                        />
                    </div>
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                        title="Làm mới"
                    >
                        <HiOutlineRefresh className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* ===== TABLE ===== */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Độc giả</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Số sách</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ngày mượn</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ngày trả</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredRequests.length > 0 ? (
                                (activeTab === 'borrowed' || activeTab === 'overdue') ? (
                                    // Tab "Đang mượn" và "Quá hạn" - sử dụng collapse rows với chức năng trả sách
                                    filteredRequests.map((request) => (
                                        <BorrowCollapseTableRow
                                            key={request.id}
                                            borrowRequest={request}
                                            onReturn={handleReturn}
                                            onViewDetail={handleViewDetail}
                                            loading={actionLoading}
                                            showReturnButton={true}
                                        />
                                    ))
                                ) : (
                                    // Tab "Đã trả" - hiển thị bình thường
                                    filteredRequests.map((request) => {
                                        const status = getStatusBadge(request.status);
                                        const reader = request.libraryCard?.reader;

                                        // Get latest return date
                                        const getLatestReturnDate = () => {
                                            if (!request.details || request.details.length === 0) return '-';
                                            const returnDates = request.details
                                                .map(d => d.actual_return_date)
                                                .filter(d => d)
                                                .sort((a, b) => new Date(b) - new Date(a));
                                            return returnDates.length > 0 ? formatDate(returnDates[0]) : '-';
                                        };

                                        return (
                                            <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="font-semibold text-gray-900">#{request.id}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                                                            <HiOutlineUserGroup className="w-4 h-4 text-gray-500" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900 text-sm">{reader?.full_name || 'Không rõ'}</p>
                                                            <p className="text-xs text-gray-500">{request.libraryCard?.card_number || '-'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-600">
                                                        {request.details?.length || 0} cuốn
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {formatDate(request.borrow_date)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {getLatestReturnDate()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${status.color}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`}></span>
                                                        {status.text}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center">
                                                        <button
                                                            onClick={() => handleViewDetail(request)}
                                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                            title="Xem chi tiết"
                                                        >
                                                            <HiOutlineEye className="w-5 h-5 text-gray-500" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-16 text-center">
                                        <HiOutlineExclamation className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                        <p className="text-gray-500 font-medium">Không có phiếu mượn nào</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                            Hiển thị {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} / {pagination.total}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                disabled={pagination.page <= 1}
                                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <HiOutlineChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="px-4 py-2 text-sm font-medium text-gray-700">
                                {pagination.page} / {pagination.totalPages}
                            </span>
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                disabled={pagination.page >= pagination.totalPages}
                                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <HiOutlineChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ===== MODALS ===== */}

            {/* Detail Modal */}
            <BorrowDetailModal
                isOpen={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                borrowRequest={selectedRequest}
            />
        </div>
    );
};

export default ReturnPage;
