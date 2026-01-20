/**
 * ===================================================================
 * FINANCE PAGE - Trang quản lý tài chính
 * ===================================================================
 * Features:
 * - Quản lý tiền phạt (Fines)
 * - Quản lý tiền đặt cọc (Deposits)
 * ===================================================================
 */

import { useState, useEffect, useCallback } from 'react';
import { getFines, payFine, getDeposits } from '../../services/financeService';
import toast from 'react-hot-toast';
import {
    HiOutlineSearch,
    HiOutlineRefresh,
    HiOutlineCash,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineExclamation,
    HiOutlineFilter,
    HiOutlineCheck,
    HiOutlineCreditCard,
    HiOutlineArrowUp,
    HiOutlineArrowDown
} from 'react-icons/hi';
import { ConfirmModal } from '../../components';
import { useAuth } from '../../contexts/AuthContext';

/**
 * FinancePage Component
 */
const FinancePage = () => {
    // Active tab: 'fines' or 'deposits'
    const [activeTab, setActiveTab] = useState('fines');

    // ===== FINES STATE =====
    const [fines, setFines] = useState([]);
    const [finesLoading, setFinesLoading] = useState(true);
    const [finesSummary, setFinesSummary] = useState({ totalPending: 0, totalPaid: 0 });
    const [finesPagination, setFinesPagination] = useState({
        page: 1, limit: 10, total: 0, totalPages: 0
    });
    const [finesStatusFilter, setFinesStatusFilter] = useState('');

    // ===== DEPOSITS STATE =====
    const [deposits, setDeposits] = useState([]);
    const [depositsLoading, setDepositsLoading] = useState(false);
    const [depositsPagination, setDepositsPagination] = useState({
        page: 1, limit: 10, total: 0, totalPages: 0
    });
    const [depositsTypeFilter, setDepositsTypeFilter] = useState('');

    // Common state
    const [showFilters, setShowFilters] = useState(false);
    const [confirmModal, setConfirmModal] = useState({
        open: false, title: '', message: '', type: 'success', onConfirm: null
    });
    const [actionLoading, setActionLoading] = useState(false);

    // Check user role for Admin-specific actions
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    /**
     * Fetch fines
     */
    const fetchFines = useCallback(async () => {
        try {
            setFinesLoading(true);
            const params = {
                page: finesPagination.page,
                limit: finesPagination.limit
            };
            if (finesStatusFilter) params.status = finesStatusFilter;

            const response = await getFines(params);
            // Response có thể là { success, data, pagination, summary } hoặc data trực tiếp
            const finesData = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
            const paginationData = response?.pagination || {};

            setFines(finesData);
            setFinesSummary(response?.summary || { totalPending: 0, totalPaid: 0 });
            setFinesPagination(prev => ({
                ...prev,
                total: paginationData.total || 0,
                totalPages: paginationData.totalPages || 0
            }));
        } catch (error) {
            console.error('Fetch fines error:', error);
            toast.error('Không thể tải danh sách tiền phạt');
        } finally {
            setFinesLoading(false);
        }
    }, [finesPagination.page, finesPagination.limit, finesStatusFilter]);

    /**
     * Fetch deposits
     */
    const fetchDeposits = useCallback(async () => {
        try {
            setDepositsLoading(true);
            const params = {
                page: depositsPagination.page,
                limit: depositsPagination.limit
            };
            if (depositsTypeFilter) params.type = depositsTypeFilter;

            const response = await getDeposits(params);
            // Response có thể là { success, data, pagination } hoặc data trực tiếp
            const depositsData = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
            const paginationData = response?.pagination || {};

            setDeposits(depositsData);
            setDepositsPagination(prev => ({
                ...prev,
                total: paginationData.total || 0,
                totalPages: paginationData.totalPages || 0
            }));
        } catch (error) {
            console.error('Fetch deposits error:', error);
            toast.error('Không thể tải danh sách giao dịch');
        } finally {
            setDepositsLoading(false);
        }
    }, [depositsPagination.page, depositsPagination.limit, depositsTypeFilter]);

    useEffect(() => {
        if (activeTab === 'fines') {
            fetchFines();
        } else {
            fetchDeposits();
        }
    }, [activeTab, fetchFines, fetchDeposits]);

    useEffect(() => {
        setFinesPagination(prev => ({ ...prev, page: 1 }));
    }, [finesStatusFilter]);

    useEffect(() => {
        setDepositsPagination(prev => ({ ...prev, page: 1 }));
    }, [depositsTypeFilter]);

    /**
     * Pay fine
     */
    const handlePayFine = (fine) => {
        setConfirmModal({
            open: true,
            title: 'Thanh toán tiền phạt',
            message: `Xác nhận thanh toán ${fine.amount?.toLocaleString('vi-VN')} VNĐ tiền phạt?`,
            type: 'success',
            onConfirm: async () => {
                try {
                    setActionLoading(true);
                    await payFine(fine.id);
                    toast.success('Thanh toán thành công');
                    setConfirmModal({ ...confirmModal, open: false });
                    fetchFines();
                } catch (error) {
                    toast.error(error.message || 'Lỗi thanh toán');
                } finally {
                    setActionLoading(false);
                }
            }
        });
    };

    /**
     * Delete fine (Admin only)
     */
    const handleDeleteFine = (fine) => {
        setConfirmModal({
            open: true,
            title: 'Xóa phiếu phạt',
            message: `Bạn có chắc chắn muốn xóa phiếu phạt này? Số tiền: ${fine.amount?.toLocaleString('vi-VN')} VNĐ`,
            type: 'danger',
            onConfirm: async () => {
                try {
                    setActionLoading(true);
                    const { api } = await import('../../services');
                    await api.delete(`/fines/${fine.id}`);
                    toast.success('Xóa phiếu phạt thành công');
                    setConfirmModal({ ...confirmModal, open: false });
                    fetchFines();
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Lỗi xóa phiếu phạt');
                } finally {
                    setActionLoading(false);
                }
            }
        });
    };

    /**
     * Format date
     */
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('vi-VN');
    };

    /**
     * Format currency
     */
    const formatCurrency = (amount) => {
        return (amount || 0).toLocaleString('vi-VN') + ' VNĐ';
    };

    return (
        <div className="space-y-6">
            {/* ===== HEADER ===== */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý tài chính</h1>
                    <p className="text-gray-500 text-sm mt-1">Tiền phạt và tiền đặt cọc</p>
                </div>
            </div>

            {/* ===== SUMMARY CARDS ===== */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Pending Fines Card */}
                <div className="relative bg-white rounded-2xl border border-gray-100 p-6 overflow-hidden group hover:shadow-lg transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform" />
                    <div className="relative">
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                            <HiOutlineCash className="w-6 h-6 text-red-600" />
                        </div>
                        <p className="text-sm text-gray-500 font-medium">Tiền phạt chờ thu</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(finesSummary.totalPending)}</p>
                        <div className="mt-3 flex items-center text-xs text-red-600">
                            <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
                            Cần xử lý
                        </div>
                    </div>
                </div>

                {/* Collected Fines Card */}
                <div className="relative bg-white rounded-2xl border border-gray-100 p-6 overflow-hidden group hover:shadow-lg transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform" />
                    <div className="relative">
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                            <HiOutlineCheck className="w-6 h-6 text-emerald-600" />
                        </div>
                        <p className="text-sm text-gray-500 font-medium">Tiền phạt đã thu</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(finesSummary.totalPaid)}</p>
                        <div className="mt-3 flex items-center text-xs text-emerald-600">
                            <HiOutlineCheck className="w-4 h-4 mr-1" />
                            Hoàn thành
                        </div>
                    </div>
                </div>

                {/* Total Deposits Card */}
                <div className="relative bg-white rounded-2xl border border-gray-100 p-6 overflow-hidden group hover:shadow-lg transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform" />
                    <div className="relative">
                        <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mb-4">
                            <HiOutlineCreditCard className="w-6 h-6 text-violet-600" />
                        </div>
                        <p className="text-sm text-gray-500 font-medium">Giao dịch tiền cọc</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{depositsPagination.total} <span className="text-base font-normal text-gray-400">giao dịch</span></p>
                        <div className="mt-3 flex items-center text-xs text-violet-600">
                            <HiOutlineArrowUp className="w-4 h-4 mr-1" />
                            Tổng số
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== TABS ===== */}
            <div className="flex items-center gap-4 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('fines')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'fines'
                        ? 'border-black text-black'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <HiOutlineCash className="inline w-5 h-5 mr-2" />
                    Tiền phạt
                </button>
                <button
                    onClick={() => setActiveTab('deposits')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'deposits'
                        ? 'border-black text-black'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <HiOutlineCreditCard className="inline w-5 h-5 mr-2" />
                    Tiền đặt cọc
                </button>

                <div className="flex-1" />

                {/* Filters & Refresh */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-5 py-2 rounded-xl font-medium text-sm flex items-center gap-2 transition-all ${showFilters || finesStatusFilter || depositsTypeFilter
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    <HiOutlineFilter className="w-5 h-5" />
                    Bộ lọc
                </button>
                <button
                    onClick={() => activeTab === 'fines' ? fetchFines() : fetchDeposits()}
                    className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                    title="Làm mới"
                >
                    <HiOutlineRefresh className={`w-5 h-5 text-gray-600 ${finesLoading || depositsLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* ===== FILTERS ===== */}
            {showFilters && (
                <div className="bg-gray-50 rounded-xl p-4 flex flex-wrap items-end gap-4">
                    {activeTab === 'fines' ? (
                        <div className="min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                            <select
                                value={finesStatusFilter}
                                onChange={(e) => setFinesStatusFilter(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                            >
                                <option value="">Tất cả</option>
                                <option value="pending">Chưa thanh toán</option>
                                <option value="paid">Đã thanh toán</option>
                            </select>
                        </div>
                    ) : (
                        <div className="min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Loại giao dịch</label>
                            <select
                                value={depositsTypeFilter}
                                onChange={(e) => setDepositsTypeFilter(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                            >
                                <option value="">Tất cả</option>
                                <option value="deposit">Nạp cọc</option>
                                <option value="refund">Hoàn cọc</option>
                            </select>
                        </div>
                    )}
                </div>
            )}

            {/* ===== FINES TABLE ===== */}
            {activeTab === 'fines' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Độc giả</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sách</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Lý do</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Số tiền</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {finesLoading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-16 text-center">
                                            <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto" />
                                        </td>
                                    </tr>
                                ) : fines.length > 0 ? (
                                    fines.map((fine) => (
                                        <tr key={fine.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-gray-900 text-sm">
                                                    {fine.borrowRequest?.libraryCard?.reader?.full_name || '-'}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {fine.borrowRequest?.libraryCard?.reader?.phone || '-'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {fine.bookCopy?.bookEdition?.book?.title || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {fine.reason || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="font-semibold text-gray-900">
                                                    {formatCurrency(fine.amount)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${fine.status === 'paid'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {fine.status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {fine.status === 'pending' && (
                                                    <>
                                                        {/* Librarian: Thu tiền phạt */}
                                                        {!isAdmin && (
                                                            <button
                                                                onClick={() => handlePayFine(fine)}
                                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                                            >
                                                                Thu tiền
                                                            </button>
                                                        )}
                                                        {/* Admin: Xóa phiếu phạt (không thu tiền) */}
                                                        {isAdmin && (
                                                            <button
                                                                onClick={() => handleDeleteFine(fine)}
                                                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                                            >
                                                                Xóa
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                                {fine.status === 'paid' && (
                                                    <span className="text-gray-400 text-sm">
                                                        {formatDate(fine.paid_date)}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-16 text-center">
                                            <HiOutlineExclamation className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                            <p className="text-gray-500 font-medium">Không có tiền phạt nào</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {finesPagination.totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                            <p className="text-sm text-gray-500">
                                Hiển thị {(finesPagination.page - 1) * finesPagination.limit + 1} - {Math.min(finesPagination.page * finesPagination.limit, finesPagination.total)} / {finesPagination.total}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setFinesPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                    disabled={finesPagination.page <= 1}
                                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <HiOutlineChevronLeft className="w-5 h-5" />
                                </button>
                                <span className="px-4 py-2 text-sm font-medium text-gray-700">
                                    {finesPagination.page} / {finesPagination.totalPages}
                                </span>
                                <button
                                    onClick={() => setFinesPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                    disabled={finesPagination.page >= finesPagination.totalPages}
                                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <HiOutlineChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ===== DEPOSITS TABLE ===== */}
            {activeTab === 'deposits' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Thành viên</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Số thẻ</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Loại GD</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Số tiền</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ngày GD</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nhân viên</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ghi chú</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {depositsLoading ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-16 text-center">
                                            <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto" />
                                        </td>
                                    </tr>
                                ) : deposits.length > 0 ? (
                                    deposits.map((deposit) => (
                                        <tr key={deposit.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-gray-900 text-sm">
                                                    {deposit.libraryCard?.reader?.full_name || '-'}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {deposit.libraryCard?.reader?.id_card_number || '-'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                                                {deposit.libraryCard?.card_number || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${deposit.type === 'deposit'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {deposit.type === 'deposit' ? (
                                                        <><HiOutlineArrowDown className="w-3 h-3" /> Nạp cọc</>
                                                    ) : (
                                                        <><HiOutlineArrowUp className="w-3 h-3" /> Hoàn cọc</>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`font-semibold ${deposit.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                    {deposit.type === 'deposit' ? '+' : '-'}{formatCurrency(deposit.amount)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {formatDate(deposit.transaction_date)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {deposit.staff?.full_name || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {deposit.notes || '-'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-16 text-center">
                                            <HiOutlineExclamation className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                            <p className="text-gray-500 font-medium">Không có giao dịch nào</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {depositsPagination.totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                            <p className="text-sm text-gray-500">
                                Hiển thị {(depositsPagination.page - 1) * depositsPagination.limit + 1} - {Math.min(depositsPagination.page * depositsPagination.limit, depositsPagination.total)} / {depositsPagination.total}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setDepositsPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                    disabled={depositsPagination.page <= 1}
                                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <HiOutlineChevronLeft className="w-5 h-5" />
                                </button>
                                <span className="px-4 py-2 text-sm font-medium text-gray-700">
                                    {depositsPagination.page} / {depositsPagination.totalPages}
                                </span>
                                <button
                                    onClick={() => setDepositsPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                    disabled={depositsPagination.page >= depositsPagination.totalPages}
                                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <HiOutlineChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ===== CONFIRM MODAL ===== */}
            <ConfirmModal
                isOpen={confirmModal.open}
                onClose={() => setConfirmModal({ ...confirmModal, open: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                loading={actionLoading}
            />
        </div>
    );
};

export default FinancePage;
