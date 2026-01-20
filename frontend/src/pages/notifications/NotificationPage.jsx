/**
 * ===================================================================
 * NOTIFICATION PAGE - Trang quản lý thông báo
 * ===================================================================
 * Gửi thông báo nhắc nhở trả sách quá hạn
 * Chỉ Admin và Thủ thư được truy cập
 * ===================================================================
 */

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
    HiOutlineBell,
    HiOutlineMail,
    HiOutlineExclamation,
    HiOutlineCheck,
    HiOutlineX,
    HiOutlineRefresh,
    HiOutlineUsers,
    HiOutlineDocumentText,
    HiOutlineClock,
    HiOutlinePaperAirplane
} from 'react-icons/hi';
import { api } from '../../services';

/**
 * NotificationPage Component
 */
const NotificationPage = () => {
    const [overdueUsers, setOverdueUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [message, setMessage] = useState(
        `Kính gửi Quý độc giả,

Thư viện BookWorm xin thông báo rằng bạn đang có sách mượn đã quá hạn trả.

Vui lòng đến thư viện để trả sách trong thời gian sớm nhất để tránh phát sinh thêm tiền phạt.

Trân trọng,
Thư viện BookWorm`
    );
    const [sendResults, setSendResults] = useState(null);

    /**
     * Lấy danh sách người dùng có sách quá hạn
     */
    const fetchOverdueUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/notifications/overdue-users');
            setOverdueUsers(response.data || []);
        } catch (error) {
            toast.error(error.message || 'Không thể tải danh sách');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOverdueUsers();
    }, []);

    /**
     * Toggle chọn user
     */
    const toggleSelectUser = (userId) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    /**
     * Chọn/Bỏ chọn tất cả
     */
    const toggleSelectAll = () => {
        if (selectedUsers.length === overdueUsers.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(overdueUsers.map(u => u.id));
        }
    };

    /**
     * Gửi thông báo
     */
    const handleSendNotifications = async () => {
        if (selectedUsers.length === 0) {
            toast.error('Vui lòng chọn ít nhất một người dùng');
            return;
        }

        if (!message.trim()) {
            toast.error('Vui lòng nhập nội dung thông báo');
            return;
        }

        setSending(true);
        setSendResults(null);

        try {
            const response = await api.post('/notifications/send', {
                userIds: selectedUsers,
                message: message.trim()
            });

            setSendResults(response.data);
            toast.success(response.message || 'Gửi thông báo thành công');

            // Nếu gửi thành công, bỏ chọn các user đã gửi
            if (response.data?.success) {
                const successIds = response.data.success.map(s => s.readerId);
                setSelectedUsers(prev => prev.filter(id => !successIds.includes(id)));
            }
        } catch (error) {
            toast.error(error.message || 'Gửi thông báo thất bại');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                            <HiOutlineBell className="w-6 h-6 text-white" />
                        </div>
                        Quản lý thông báo
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Gửi email nhắc nhở đến độc giả có sách quá hạn
                    </p>
                </div>

                <button
                    onClick={fetchOverdueUsers}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                    <HiOutlineRefresh className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    Làm mới
                </button>
            </div>

            {/* Stats Cards */}
            {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="relative bg-white rounded-xl border-l-4 border-red-500 shadow-sm p-5 overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -mr-12 -mt-12"></div>
                    <div className="relative">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <HiOutlineExclamation className="w-4 h-4 text-red-500" />
                                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Người dùng quá hạn</p>
                                </div>
                                <p className="text-3xl font-bold text-gray-900 mb-1">{overdueUsers.length}</p>
                                <p className="text-xs text-gray-500">Độc giả cần nhắc nhở</p>
                            </div>
                            <div className="p-2.5 bg-red-50 rounded-lg">
                                <HiOutlineUsers className="w-5 h-5 text-red-600" />
                            </div>
                        </div>
                        {overdueUsers.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <span className="text-xs text-red-600 font-medium">⚠️ Cần xử lý ngay</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="relative bg-white rounded-xl border-l-4 border-blue-500 shadow-sm p-5 overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-12 -mt-12"></div>
                    <div className="relative">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <HiOutlineCheck className="w-4 h-4 text-blue-500" />
                                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Đã chọn</p>
                                </div>
                                <p className="text-3xl font-bold text-gray-900 mb-1">{selectedUsers.length}</p>
                                <p className="text-xs text-gray-500">Người sẽ nhận thông báo</p>
                            </div>
                            <div className="p-2.5 bg-blue-50 rounded-lg">
                                <HiOutlineCheck className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>
                        {selectedUsers.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <span className="text-xs text-blue-600 font-medium">✓ Sẵn sàng gửi</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="relative bg-white rounded-xl border-l-4 border-purple-500 shadow-sm p-5 overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-12 -mt-12"></div>
                    <div className="relative">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <HiOutlineClock className="w-4 h-4 text-purple-500" />
                                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Tổng sách quá hạn</p>
                                </div>
                                <p className="text-3xl font-bold text-gray-900 mb-1">
                                    {overdueUsers.reduce((sum, u) => sum + u.overdueBooks.length, 0)}
                                </p>
                                <p className="text-xs text-gray-500">Sách cần được trả</p>
                            </div>
                            <div className="p-2.5 bg-purple-50 rounded-lg">
                                <HiOutlineDocumentText className="w-5 h-5 text-purple-600" />
                            </div>
                        </div>
                        {overdueUsers.reduce((sum, u) => sum + u.overdueBooks.length, 0) > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <span className="text-xs text-purple-600 font-medium">📚 Cần thu hồi</span>
                            </div>
                        )}
                    </div>
                </div>
            </div> */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User List */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                        <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                            <HiOutlineExclamation className="w-5 h-5 text-orange-500" />
                            Danh sách quá hạn
                        </h2>
                        {overdueUsers.length > 0 && (
                            <button
                                onClick={toggleSelectAll}
                                className="text-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                            >
                                {selectedUsers.length === overdueUsers.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                            </button>
                        )}
                    </div>

                    <div className="max-h-[500px] overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : overdueUsers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <HiOutlineCheck className="w-16 h-16 mb-3 text-green-400" />
                                <p className="text-lg font-medium text-gray-600">Không có sách quá hạn!</p>
                                <p className="text-sm">Tất cả độc giả đã trả sách đúng hạn</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {overdueUsers.map(user => (
                                    <div
                                        key={user.id}
                                        onClick={() => toggleSelectUser(user.id)}
                                        className={`p-4 cursor-pointer transition-all hover:bg-gray-50 ${selectedUsers.includes(user.id)
                                            ? 'bg-purple-50 border-l-4 border-purple-500'
                                            : 'border-l-4 border-transparent'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Checkbox */}
                                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-1 transition-colors ${selectedUsers.includes(user.id)
                                                ? 'bg-purple-500 border-purple-500'
                                                : 'border-gray-300'
                                                }`}>
                                                {selectedUsers.includes(user.id) && (
                                                    <HiOutlineCheck className="w-3 h-3 text-white" />
                                                )}
                                            </div>

                                            {/* User Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-semibold text-gray-800 truncate">
                                                        {user.fullName}
                                                    </h3>
                                                    <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-medium">
                                                        {user.totalDaysOverdue} ngày
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 truncate flex items-center gap-1">
                                                    <HiOutlineMail className="w-4 h-4" />
                                                    {user.email}
                                                </p>

                                                {/* Books */}
                                                <div className="mt-2 space-y-1">
                                                    {user.overdueBooks.slice(0, 3).map((book, idx) => (
                                                        <div key={idx} className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                                                            <HiOutlineClock className="w-3 h-3 text-orange-500" />
                                                            <span className="truncate">{book.title}</span>
                                                            <span className="text-red-500 ml-auto shrink-0">
                                                                ({book.daysOverdue} ngày)
                                                            </span>
                                                        </div>
                                                    ))}
                                                    {user.overdueBooks.length > 3 && (
                                                        <p className="text-xs text-gray-400">
                                                            +{user.overdueBooks.length - 3} sách khác
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Message Composer */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                        <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                            <HiOutlineMail className="w-5 h-5 text-blue-500" />
                            Soạn thông báo
                        </h2>
                    </div>

                    <div className="p-4 flex-1 flex flex-col">
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Nhập nội dung thông báo..."
                            className="flex-1 w-full p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[300px]"
                        />

                        {/* Send Results */}
                        {sendResults && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                                <h3 className="font-medium text-gray-700 mb-2">Kết quả gửi:</h3>
                                {sendResults.success.length > 0 && (
                                    <div className="mb-2">
                                        <p className="text-sm text-green-600 flex items-center gap-1">
                                            <HiOutlineCheck className="w-4 h-4" />
                                            Thành công: {sendResults.success.length} người
                                        </p>
                                    </div>
                                )}
                                {sendResults.failed.length > 0 && (
                                    <div>
                                        <p className="text-sm text-red-600 flex items-center gap-1">
                                            <HiOutlineX className="w-4 h-4" />
                                            Thất bại: {sendResults.failed.length} người
                                        </p>
                                        <ul className="mt-1 text-xs text-gray-500 list-disc list-inside">
                                            {sendResults.failed.map((f, idx) => (
                                                <li key={idx}>{f.name}: {f.reason}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Send Button */}
                        <button
                            onClick={handleSendNotifications}
                            disabled={sending || selectedUsers.length === 0}
                            className="mt-4 w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                        >
                            {sending ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Đang gửi...</span>
                                </>
                            ) : (
                                <>
                                    <HiOutlinePaperAirplane className="w-5 h-5" />
                                    <span>
                                        Gửi thông báo ({selectedUsers.length} người)
                                    </span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationPage;
