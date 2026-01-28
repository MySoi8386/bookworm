/**
 * ===================================================================
 * BORROW DETAIL MODAL - Xem chi tiết phiếu mượn
 * ===================================================================
 */

import { useEffect, useMemo, useState } from 'react';
import Modal from '../Modal';
import { HiOutlineUser, HiOutlineCalendar, HiOutlineBookOpen } from 'react-icons/hi';
import { api } from '../../services';

const BorrowDetailModal = ({ isOpen, onClose, borrowRequest, activeTab }) => {
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

    const isPendingTab = activeTab === 'pending';
    const isRejectedTab = activeTab === 'rejected';
    const showBookReturnStatus = !(isPendingTab || isRejectedTab);

    // Fine settings (for overdue display)
    const [fineRatePercent, setFineRatePercent] = useState(5);

    useEffect(() => {
        if (!isOpen) return;
        const loadSettings = async () => {
            try {
                const response = await api.get('/system/settings');
                const settingsData = response?.data?.data || response?.data || {};
                const fineRate = settingsData.fine_rate_percent;
                if (fineRate !== undefined && fineRate !== null) {
                    const parsed = parseFloat(fineRate);
                    if (Number.isFinite(parsed)) setFineRatePercent(parsed);
                }
            } catch (error) {
                console.error('Load settings error (BorrowDetailModal):', error);
            }
        };
        loadSettings();
    }, [isOpen]);

    const calculateDaysOverdue = (dueDate) => {
        if (!dueDate) return 0;
        const due = new Date(dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        due.setHours(0, 0, 0, 0);
        const diffTime = today - due;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    const daysOverdue = useMemo(
        () => calculateDaysOverdue(borrowRequest.due_date),
        [borrowRequest.due_date]
    );
    const displayStatus = isPendingTab ? { text: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800' } : getStatusBadge(borrowRequest.status);
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
                    <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${displayStatus.color}`}>
                        {displayStatus.text}
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
                    {activeTab === 'borrowed' ? (
                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                            <HiOutlineCalendar className="w-5 h-5 mx-auto mb-2 text-gray-400" />
                            <p className="text-xs text-gray-500 mb-1">Ngày mượn</p>
                            <p className="font-semibold text-gray-900">{formatDate(borrowRequest.borrow_date)}</p>
                        </div>
                    ) : (
                        <>
                        </>
                    )}
                    {/* <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <HiOutlineCalendar className="w-5 h-5 mx-auto mb-2 text-gray-400" />
                        <p className="text-xs text-gray-500 mb-1">Ngày mượn</p>
                        <p className="font-semibold text-gray-900">{formatDate(borrowRequest.borrow_date)}</p>
                    </div> */}
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
                                    {showBookReturnStatus && (
                                        detail.actual_return_date ? (
                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                Đã trả {formatDate(detail.actual_return_date)}
                                            </span>
                                        ) : (
                                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                                Chưa trả
                                            </span>
                                        )
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Notes / Reject reason */}
                {isRejectedTab ? (
                    (borrowRequest.reject_reason || borrowRequest.notes) && (
                        <div className="bg-red-50 rounded-xl p-4">
                            <p className="text-sm font-medium text-red-900 mb-1">Lý do huỷ</p>
                            <p className="text-sm text-red-700">{borrowRequest.reject_reason || borrowRequest.notes}</p>
                        </div>
                    )
                ) : (
                    borrowRequest.notes && (
                        <div className="bg-blue-50 rounded-xl p-4">
                            <p className="text-sm font-medium text-blue-900 mb-1">Ghi chú</p>
                            <p className="text-sm text-blue-700">{borrowRequest.notes}</p>
                        </div>
                    )
                )}

                {/* Fines */}
                {borrowRequest.fines?.length > 0 && (
                    <div className="bg-red-50 rounded-xl p-4">
                        <p className="text-sm font-medium text-red-900 mb-2">Tiền phạt</p>
                        {(() => {
                            let overdueTotal = 0;
                            const otherFines = [];

                            borrowRequest.fines.forEach((fine) => {
                                const rawReason = fine.reason || '';
                                const isOverdueFine =
                                    rawReason.includes('Quá hạn') || rawReason.includes('Trả quá hạn');

                                // Tìm giá sách từ chi tiết mượn (BookCopy.price)
                                const detailForFine = borrowRequest.details?.find(
                                    d => d.book_copy_id === fine.book_copy_id
                                );
                                const copyPrice = detailForFine
                                    ? parseFloat(detailForFine.bookCopy?.price) || 0
                                    : 0;

                                if (isOverdueFine && daysOverdue > 0 && copyPrice > 0) {
                                    const computed = (copyPrice * fineRatePercent / 100) * daysOverdue;
                                    overdueTotal += computed;
                                } else {
                                    otherFines.push(fine);
                                }
                            });

                            const rows = [];

                            if (overdueTotal > 0) {
                                const amountNumber = overdueTotal % 1 === 0
                                    ? Math.floor(overdueTotal)
                                    : overdueTotal;
                                rows.push(
                                    <div key="overdue" className="flex justify-between text-sm">
                                        <span className="text-red-700">
                                            Quá hạn {daysOverdue} ngày (Phí {fineRatePercent}%/ngày)
                                        </span>
                                        <span className="font-semibold text-red-900">
                                            {amountNumber.toLocaleString('vi-VN')} VNĐ
                                        </span>
                                    </div>
                                );
                            }

                            otherFines.forEach((fine, idx) => {
                                const rawReason = fine.reason || 'Phạt';
                                const num = parseFloat(fine.amount) || 0;
                                const amountNumber = num % 1 === 0 ? Math.floor(num) : num;
                                rows.push(
                                    <div key={`fine-${idx}`} className="flex justify-between text-sm">
                                        <span className="text-red-700">{rawReason}</span>
                                        <span className="font-semibold text-red-900">
                                            {amountNumber.toLocaleString('vi-VN')} VNĐ
                                        </span>
                                    </div>
                                );
                            });

                            return rows;
                        })()}
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default BorrowDetailModal;
