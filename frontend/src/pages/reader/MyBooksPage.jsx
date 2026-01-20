/**
 * ===================================================================
 * MY BOOKS PAGE - Sách đang mượn của độc giả
 * ===================================================================
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
    HiOutlineBookOpen,
    HiOutlineCalendar,
    HiOutlineRefresh,
    HiOutlineExclamationCircle,
    HiOutlineCheckCircle,
    HiOutlineClock,
    HiOutlineTrash
} from 'react-icons/hi';
import { ConfirmModal } from '../../components';

const MyBooksPage = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('borrowed');
    const [cancellingId, setCancellingId] = useState(null);
    const [confirmModal, setConfirmModal] = useState({
        open: false,
        requestId: null,
        title: '',
        message: ''
    });

    /**
     * Fetch my borrow requests
     */
    const fetchMyRequests = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/borrow-requests/my');
            // Response structure: { success: true, data: [...], pagination: {...} }
            let requestsData = [];
            if (response?.success && Array.isArray(response.data)) {
                requestsData = response.data;
            } else if (Array.isArray(response?.data)) {
                requestsData = response.data;
            } else if (Array.isArray(response)) {
                requestsData = response;
            }
            setRequests(requestsData);
        } catch (error) {
            console.error('Fetch my books error:', error);
            toast.error('Không thể tải danh sách sách của bạn');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMyRequests();
    }, [fetchMyRequests]);

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('vi-VN');
    };

    /**
     * Handle cancel pending request
     */
    const handleCancelRequest = (request) => {
        setConfirmModal({
            open: true,
            requestId: request.id,
            title: 'Hủy yêu cầu mượn sách',
            message: `Bạn có chắc chắn muốn hủy yêu cầu mượn #${request.id}?`
        });
    };

    const confirmCancelRequest = async () => {
        const requestId = confirmModal.requestId;
        if (!requestId) return;

        try {
            setCancellingId(requestId);
            await api.delete(`/borrow-requests/${requestId}`);
            toast.success('Hủy yêu cầu thành công');
            setConfirmModal({ open: false, requestId: null, title: '', message: '' });
            fetchMyRequests();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi hủy yêu cầu');
        } finally {
            setCancellingId(null);
        }
    };

    const getStatusInfo = (status, dueDate) => {
        const isOverdue = dueDate && new Date(dueDate) < new Date() && status === 'borrowed';

        const statusMap = {
            pending: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800', icon: HiOutlineClock },
            approved: { label: 'Đã duyệt', color: 'bg-blue-100 text-blue-800', icon: HiOutlineCheckCircle },
            borrowed: isOverdue
                ? { label: 'Quá hạn', color: 'bg-red-100 text-red-800', icon: HiOutlineExclamationCircle }
                : { label: 'Đang mượn', color: 'bg-green-100 text-green-800', icon: HiOutlineBookOpen },
            returned: { label: 'Đã trả', color: 'bg-gray-100 text-gray-800', icon: HiOutlineCheckCircle },
            rejected: { label: 'Từ chối', color: 'bg-red-100 text-red-800', icon: HiOutlineExclamationCircle },
            overdue: { label: 'Quá hạn', color: 'bg-red-100 text-red-800', icon: HiOutlineExclamationCircle }
        };
        return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: HiOutlineClock };
    };

    // Filter requests by tab
    const filteredRequests = requests.filter(req => {
        if (activeTab === 'borrowed') return ['borrowed', 'overdue'].includes(req.status);
        if (activeTab === 'pending') return ['pending', 'approved'].includes(req.status);
        if (activeTab === 'history') return ['returned', 'rejected', 'cancelled'].includes(req.status);
        return true;
    });

    const borrowedCount = requests.filter(r => ['borrowed', 'overdue'].includes(r.status)).length;
    const pendingCount = requests.filter(r => ['pending', 'approved'].includes(r.status)).length;

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
                    <h1 className="text-2xl font-bold text-gray-900">Sách của tôi</h1>
                    <p className="text-gray-500 text-sm mt-1">Quản lý sách đang mượn và lịch sử mượn trả</p>
                </div>
                <button
                    onClick={fetchMyRequests}
                    className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                    <HiOutlineRefresh className="w-5 h-5 text-gray-600" />
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Card 1 - Đang mượn */}
                <div className="relative bg-white rounded-xl border-2 border-green-200 p-5 overflow-hidden group hover:shadow-lg transition-all">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-green-50 rounded-bl-full opacity-50"></div>
                    <div className="relative">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Đang mượn</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-4xl font-bold text-gray-900">{borrowedCount}</p>
                                    <span className="text-sm text-gray-400">cuốn</span>
                                </div>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg">
                                <HiOutlineBookOpen className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min((borrowedCount / Math.max(requests.length, 1)) * 100, 100)}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* Card 2 - Chờ xử lý */}
                <div className="relative bg-white rounded-xl border-2 border-amber-200 p-5 overflow-hidden group hover:shadow-lg transition-all">
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-amber-50 rounded-tr-full opacity-40"></div>
                    <div className="relative">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Chờ xử lý</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-4xl font-bold text-gray-900">{pendingCount}</p>
                                    <span className="text-sm text-gray-400">yêu cầu</span>
                                </div>
                            </div>
                            <div className="p-3 bg-amber-50 rounded-lg">
                                <HiOutlineClock className="w-6 h-6 text-amber-600" />
                            </div>
                        </div>
                        {pendingCount > 0 && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                                <HiOutlineExclamationCircle className="w-3 h-3" />
                                <span>Cần theo dõi</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Card 3 - Tổng lượt mượn */}
                <div className="relative bg-white rounded-xl border-2 border-blue-200 p-5 overflow-hidden group hover:shadow-lg transition-all md:col-span-1">
                    <div className="absolute top-2 right-2 w-24 h-24 bg-blue-50 rounded-full opacity-30"></div>
                    <div className="relative">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Tổng lượt mượn</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-4xl font-bold text-gray-900">{requests.length}</p>
                                    <span className="text-sm text-gray-400">phiếu</span>
                                </div>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <HiOutlineCalendar className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                            Tất cả các phiếu mượn của bạn
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-4 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('borrowed')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'borrowed'
                        ? 'border-black text-black'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Đang mượn ({borrowedCount})
                </button>
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'pending'
                        ? 'border-black text-black'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Chờ xử lý ({pendingCount})
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'history'
                        ? 'border-black text-black'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Lịch sử
                </button>
            </div>

            {/* Books List */}
            <div className="space-y-4">
                {filteredRequests.length > 0 ? (
                    filteredRequests.map((request) => {
                        const statusInfo = getStatusInfo(request.status, request.due_date);
                        const StatusIcon = statusInfo.icon;

                        return (
                            <div key={request.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <p className="text-xs text-gray-500">Mã phiếu</p>
                                        <p className="font-mono font-semibold text-gray-900">#{request.id}</p>
                                    </div>
                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                        <StatusIcon className="w-3 h-3" />
                                        {statusInfo.label}
                                    </span>
                                </div>

                                {/* Books in this request */}
                                <div className="space-y-2 mb-4">
                                    {request.details?.length > 0 ? (
                                        request.details.map((detail, idx) => {
                                            const bookTitle = detail.bookCopy?.bookEdition?.book?.title || 'Không rõ tên sách';
                                            const bookCode = detail.bookCopy?.bookEdition?.book?.code || '';
                                            const copyNumber = detail.bookCopy?.copy_number || '';
                                            const isReturned = detail.actual_return_date !== null;

                                            return (
                                                <div key={detail.id || idx} className={`flex items-center gap-3 rounded-xl p-3 ${isReturned ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                                                    <HiOutlineBookOpen className={`w-5 h-5 ${isReturned ? 'text-green-600' : 'text-gray-400'}`} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">{bookTitle}</p>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            {bookCode && (
                                                                <span className="text-xs text-gray-500 font-mono">{bookCode}</span>
                                                            )}
                                                            {copyNumber && (
                                                                <span className="text-xs text-gray-500">Bản số: {copyNumber}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {isReturned && (
                                                        <span className="text-xs text-green-600 font-medium whitespace-nowrap">
                                                            Đã trả
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-sm text-gray-500 italic">Không có chi tiết sách</div>
                                    )}
                                </div>

                                {/* Dates */}
                                <div className="flex flex-wrap items-center gap-4 text-sm">
                                    {request.request_date && (
                                        <div>
                                            <span className="text-gray-500">Ngày yêu cầu: </span>
                                            <span className="font-medium text-gray-900">{formatDate(request.request_date)}</span>
                                        </div>
                                    )}
                                    {request.borrow_date && (
                                        <div>
                                            <span className="text-gray-500">Ngày mượn: </span>
                                            <span className="font-medium text-gray-900">{formatDate(request.borrow_date)}</span>
                                        </div>
                                    )}
                                    {request.due_date && (
                                        <div>
                                            <span className="text-gray-500">Hạn trả: </span>
                                            <span className={`font-medium ${new Date(request.due_date) < new Date() && ['borrowed', 'overdue'].includes(request.status)
                                                ? 'text-red-600'
                                                : 'text-gray-900'
                                                }`}>
                                                {formatDate(request.due_date)}
                                            </span>
                                        </div>
                                    )}
                                    {/* Hiển thị ngày trả từ detail đầu tiên nếu có */}
                                    {request.details?.some(d => d.actual_return_date) && (
                                        <div>
                                            <span className="text-gray-500">Đã trả: </span>
                                            <span className="font-medium text-green-600">
                                                {formatDate(request.details.find(d => d.actual_return_date)?.actual_return_date)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Fines info */}
                                {request.fines && request.fines.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <p className="text-xs text-gray-500 mb-2">Tiền phạt:</p>
                                        <div className="space-y-1">
                                            {request.fines.map((fine, idx) => (
                                                <div key={fine.id || idx} className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-700">{fine.reason || 'Phạt'}</span>
                                                    <span className={`font-medium ${fine.status === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
                                                        {parseFloat(fine.amount || 0).toLocaleString('vi-VN')} VND
                                                        {fine.status === 'paid' && ' (Đã thanh toán)'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Cancel button for pending requests */}
                                {request.status === 'pending' && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <button
                                            onClick={() => handleCancelRequest(request)}
                                            disabled={cancellingId === request.id}
                                            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {cancellingId === request.id ? (
                                                <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                                            ) : (
                                                <HiOutlineTrash className="w-4 h-4" />
                                            )}
                                            Hủy yêu cầu
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
                        <HiOutlineBookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium">Không có dữ liệu</p>
                        <p className="text-gray-400 text-sm mt-1">
                            {activeTab === 'borrowed' && 'Bạn chưa mượn sách nào'}
                            {activeTab === 'pending' && 'Không có yêu cầu đang chờ xử lý'}
                            {activeTab === 'history' && 'Chưa có lịch sử mượn trả'}
                        </p>
                    </div>
                )}
            </div>

            {/* Confirm Cancel Modal */}
            <ConfirmModal
                isOpen={confirmModal.open}
                onClose={() => setConfirmModal({ open: false, requestId: null, title: '', message: '' })}
                onConfirm={confirmCancelRequest}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText="Hủy yêu cầu"
                cancelText="Quay lại"
                type="danger"
            />
        </div>
    );
};

export default MyBooksPage;

