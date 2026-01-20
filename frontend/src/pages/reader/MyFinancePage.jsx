/**
 * ===================================================================
 * MY FINANCE PAGE - Tài chính cá nhân của độc giả
 * ===================================================================
 */

import { useState, useEffect, useCallback } from 'react';
import { getMyFines, getMyDeposits } from '../../services/financeService';
import toast from 'react-hot-toast';
import {
    HiOutlineCash,
    HiOutlineRefresh,
    HiOutlineExclamation,
    HiOutlineCheck,
    HiOutlineCreditCard,
    HiOutlineArrowUp,
    HiOutlineArrowDown
} from 'react-icons/hi';

const MyFinancePage = () => {
    const [fines, setFines] = useState([]);
    const [finesSummary, setFinesSummary] = useState({ total: 0, pending: 0, paid: 0 });
    const [deposits, setDeposits] = useState([]);
    const [depositBalance, setDepositBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('fines');

    /**
     * Fetch finance data
     */
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [finesRes, depositsRes] = await Promise.all([
                getMyFines(),
                getMyDeposits()
            ]);

            // Response có thể là { success, data, summary } hoặc data trực tiếp
            const finesData = Array.isArray(finesRes?.data) ? finesRes.data : (Array.isArray(finesRes) ? finesRes : []);
            const depositsData = Array.isArray(depositsRes?.data) ? depositsRes.data : (Array.isArray(depositsRes) ? depositsRes : []);
            
            setFines(finesData);
            setFinesSummary(finesRes?.summary || { total: 0, pending: 0, paid: 0 });
            setDeposits(depositsData);
            setDepositBalance(depositsRes?.balance || 0);
        } catch (error) {
            console.error('Fetch finance error:', error);
            toast.error('Không thể tải thông tin tài chính');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const formatCurrency = (amount) => {
        return (amount || 0).toLocaleString('vi-VN') + ' VNĐ';
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('vi-VN');
    };

    if (loading) {
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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tài chính của tôi</h1>
                    <p className="text-gray-500 text-sm mt-1">Tiền phạt và tiền đặt cọc</p>
                </div>
                <button
                    onClick={fetchData}
                    className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                    <HiOutlineRefresh className="w-5 h-5 text-gray-600" />
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Card 1 - Tiền phạt chưa nộp */}
                <div className="relative bg-white rounded-xl border-l-4 border-red-500 shadow-sm p-5 overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full -mr-16 -mt-16"></div>
                    <div className="relative">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <HiOutlineExclamation className="w-4 h-4 text-red-500" />
                                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Chưa nộp</p>
                                </div>
                                <p className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(finesSummary.pending)}</p>
                                <p className="text-xs text-gray-500">Tiền phạt đang chờ</p>
                            </div>
                            <div className="p-2.5 bg-red-50 rounded-lg">
                                <HiOutlineCash className="w-5 h-5 text-red-600" />
                            </div>
                        </div>
                        {finesSummary.pending > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <span className="text-xs text-red-600 font-medium">⚠️ Cần thanh toán sớm</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Card 2 - Tiền phạt đã nộp */}
                <div className="relative bg-white rounded-xl border-l-4 border-green-500 shadow-sm p-5 overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute bottom-0 left-0 w-28 h-28 bg-green-50 rounded-tr-full -ml-14 -mb-14"></div>
                    <div className="relative">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <HiOutlineCheck className="w-4 h-4 text-green-500" />
                                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Đã nộp</p>
                                </div>
                                <p className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(finesSummary.paid)}</p>
                                <p className="text-xs text-gray-500">Tổng đã thanh toán</p>
                            </div>
                            <div className="p-2.5 bg-green-50 rounded-lg">
                                <HiOutlineCheck className="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                        {finesSummary.paid > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <span className="text-xs text-green-600 font-medium">✓ Đã hoàn tất</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Card 3 - Số dư tiền cọc */}
                <div className="relative bg-white rounded-xl border-l-4 border-blue-500 shadow-sm p-5 overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-2 right-2 w-20 h-20 bg-blue-50 rounded-full opacity-50"></div>
                    <div className="relative">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <HiOutlineCreditCard className="w-4 h-4 text-blue-500" />
                                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Số dư</p>
                                </div>
                                <p className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(depositBalance)}</p>
                                <p className="text-xs text-gray-500">Tiền đặt cọc hiện có</p>
                            </div>
                            <div className="p-2.5 bg-blue-50 rounded-lg">
                                <HiOutlineCreditCard className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <span className="text-xs text-blue-600 font-medium">💳 Có thể sử dụng</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-4 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('fines')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'fines'
                            ? 'border-black text-black'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <HiOutlineCash className="inline w-5 h-5 mr-2" />
                    Tiền phạt ({fines.length})
                </button>
                <button
                    onClick={() => setActiveTab('deposits')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'deposits'
                            ? 'border-black text-black'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <HiOutlineCreditCard className="inline w-5 h-5 mr-2" />
                    Tiền đặt cọc ({deposits.length})
                </button>
            </div>

            {/* Fines Tab */}
            {activeTab === 'fines' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Sách</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Lý do</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Số tiền</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Ngày</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {fines.length > 0 ? (
                                    fines.map((fine) => (
                                        <tr key={fine.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {fine.bookCopy?.bookEdition?.book?.title || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {fine.reason || 'Trả sách trễ hạn'}
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
                                                    {fine.status === 'paid' ? 'Đã nộp' : 'Chưa nộp'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {formatDate(fine.paid_date || fine.created_at)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-16 text-center text-gray-500">
                                            ✅ Bạn không có tiền phạt nào
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Deposits Tab */}
            {activeTab === 'deposits' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Ngày</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Loại GD</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Số tiền</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Nhân viên</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Ghi chú</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {deposits.length > 0 ? (
                                    deposits.map((deposit) => (
                                        <tr key={deposit.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {formatDate(deposit.transaction_date)}
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
                                                {deposit.staff?.full_name || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {deposit.notes || '-'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-16 text-center text-gray-500">
                                            Chưa có giao dịch nào
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyFinancePage;
