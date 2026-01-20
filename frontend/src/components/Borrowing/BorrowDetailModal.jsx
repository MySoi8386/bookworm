/**
 * ===================================================================
 * BORROW DETAIL MODAL - Xem chi tiết phiếu mượn
 * ===================================================================
 */

import Modal from '../Modal';
import { HiOutlineUser, HiOutlineCalendar, HiOutlineBookOpen } from 'react-icons/hi';

const BorrowDetailModal = ({ isOpen, onClose, borrowRequest }) => {
    if (!borrowRequest) return null;

    const getStatusBadge = (status) => {
        const statusMap = {
            pending: { text: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800' },
            approved: { text: 'Đã duyệt', color: 'bg-blue-100 text-blue-800' },
            borrowed: { text: 'Đang mượn', color: 'bg-green-100 text-green-800' },
            returned: { text: 'Đã trả', color: 'bg-gray-100 text-gray-800' },
            rejected: { text: 'Từ chối', color: 'bg-red-100 text-red-800' },
            overdue: { text: 'Quá hạn', color: 'bg-red-100 text-red-800' }
        };
        return statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('vi-VN');
    };

    const status = getStatusBadge(borrowRequest.status);
    const reader = borrowRequest.libraryCard?.reader;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết phiếu mượn" size="lg">
            <div className="space-y-6">
                {/* Header Info */}
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-gray-500">Mã phiếu</p>
                        <p className="text-xl font-bold text-gray-900">#{borrowRequest.id}</p>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${status.color}`}>
                        {status.text}
                    </span>
                </div>

                {/* Reader Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center">
                            <HiOutlineUser className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">{reader?.full_name || 'Không rõ'}</p>
                            <p className="text-sm text-gray-500">Thẻ: {borrowRequest.libraryCard?.card_number || '-'}</p>
                        </div>
                    </div>
                    {reader?.phone && (
                        <p className="text-sm text-gray-600">SĐT: {reader.phone}</p>
                    )}
                </div>

                {/* Dates */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <HiOutlineCalendar className="w-5 h-5 mx-auto mb-2 text-gray-400" />
                        <p className="text-xs text-gray-500 mb-1">Ngày mượn</p>
                        <p className="font-semibold text-gray-900">{formatDate(borrowRequest.borrow_date)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <HiOutlineCalendar className="w-5 h-5 mx-auto mb-2 text-gray-400" />
                        <p className="text-xs text-gray-500 mb-1">Hạn trả</p>
                        <p className="font-semibold text-gray-900">{formatDate(borrowRequest.due_date)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <HiOutlineCalendar className="w-5 h-5 mx-auto mb-2 text-gray-400" />
                        <p className="text-xs text-gray-500 mb-1">Ngày yêu cầu</p>
                        <p className="font-semibold text-gray-900">{formatDate(borrowRequest.request_date)}</p>
                    </div>
                </div>

                {/* Books */}
                <div>
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <HiOutlineBookOpen className="w-5 h-5" />
                        Danh sách sách ({borrowRequest.details?.length || 0})
                    </h4>
                    <div className="space-y-2">
                        {borrowRequest.details?.map((detail, index) => {
                            const book = detail.bookCopy?.bookEdition?.book;
                            return (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">{book?.title || 'Không rõ'}</p>
                                        <p className="text-sm text-gray-500">Mã: {book?.code || '-'}</p>
                                    </div>
                                    {detail.actual_return_date ? (
                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                            Đã trả {formatDate(detail.actual_return_date)}
                                        </span>
                                    ) : (
                                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                            Chưa trả
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Notes */}
                {borrowRequest.notes && (
                    <div className="bg-blue-50 rounded-xl p-4">
                        <p className="text-sm font-medium text-blue-900 mb-1">Ghi chú</p>
                        <p className="text-sm text-blue-700">{borrowRequest.notes}</p>
                    </div>
                )}

                {/* Fines */}
                {borrowRequest.fines?.length > 0 && (
                    <div className="bg-red-50 rounded-xl p-4">
                        <p className="text-sm font-medium text-red-900 mb-2">Tiền phạt</p>
                        {borrowRequest.fines.map((fine, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                                <span className="text-red-700">{fine.reason}</span>
                                <span className="font-semibold text-red-900">
                                    {fine.amount?.toLocaleString('vi-VN')} VNĐ
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default BorrowDetailModal;
