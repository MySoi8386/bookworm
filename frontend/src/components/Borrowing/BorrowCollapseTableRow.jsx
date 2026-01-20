/**
 * ===================================================================
 * BORROW COLLAPSE TABLE ROW - Component hiển thị row trong table với collapse
 * ===================================================================
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import { api } from '../../services';
import {
    HiOutlineCheck,
    HiOutlineExclamationCircle,
    HiOutlineChevronDown,
    HiOutlineChevronUp,
    HiOutlineUserGroup,
    HiOutlineEye
} from 'react-icons/hi';

const STATUS_CONFIG = {
    pending: { text: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800', dotColor: 'bg-yellow-500' },
    approved: { text: 'Đã duyệt', color: 'bg-blue-100 text-blue-800', dotColor: 'bg-blue-500' },
    borrowed: { text: 'Đang mượn', color: 'bg-green-100 text-green-800', dotColor: 'bg-green-500' },
    returned: { text: 'Đã trả', color: 'bg-gray-100 text-gray-800', dotColor: 'bg-gray-500' },
    rejected: { text: 'Từ chối', color: 'bg-red-100 text-red-800', dotColor: 'bg-red-500' },
    overdue: { text: 'Quá hạn', color: 'bg-red-100 text-red-800', dotColor: 'bg-red-500' }
};

const BorrowCollapseTableRow = ({
    borrowRequest,
    onReturn,
    onViewDetail,
    loading = false,
    showReturnButton = false
}) => {
    // Fine rate setting
    const [fineRatePercent, setFineRatePercent] = useState(5);
    const [isOpen, setIsOpen] = useState(false);

    // Load settings on mount
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const response = await api.get('/system/settings');
                const settings = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
                const rateSetting = settings.find(s => s.setting_key === 'fine_rate_percent');
                if (rateSetting) {
                    setFineRatePercent(parseInt(rateSetting.setting_value) || 5);
                }
            } catch (error) {
                console.error('Load settings error:', error);
            }
        };
        if (borrowRequest && showReturnButton) loadSettings();
    }, [borrowRequest, showReturnButton]);

    // Tính toán initial items từ borrowRequest
    const initialItems = useMemo(() => {
        if (!borrowRequest?.details) return [];
        return borrowRequest.details
            .filter(d => !d.actual_return_date)
            .map(d => ({
                book_copy_id: d.book_copy_id,
                bookTitle: d.bookCopy?.bookEdition?.book?.title || 'Sách không rõ',
                bookCode: d.bookCopy?.bookEdition?.book?.code || '',
                bookPrice: d.bookCopy?.price || 0,
                selected: true,
                return_condition: 'normal',
                notes: ''
            }));
    }, [borrowRequest]);

    const prevRequestIdRef = useRef(null);
    const [returnItems, setReturnItems] = useState(() => initialItems);

    // Reset state khi borrowRequest thay đổi
    useEffect(() => {
        const currentRequestId = borrowRequest?.id;
        if (currentRequestId !== prevRequestIdRef.current) {
            prevRequestIdRef.current = currentRequestId;
            setReturnItems(initialItems);
            setIsOpen(false);
        }
    }, [borrowRequest?.id, initialItems]);

    // Calculate overdue days
    const daysOverdue = useMemo(() => {
        if (!borrowRequest?.due_date) return 0;
        const dueDate = new Date(borrowRequest.due_date);
        const today = new Date();
        const diffTime = today - dueDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    }, [borrowRequest?.due_date]);

    // Calculate fine preview for each book
    const calculateFine = (item) => {
        let fine = 0;
        const price = parseFloat(item.bookPrice) || 0;

        // Overdue fine
        if (daysOverdue > 0 && item.selected) {
            fine += (price * fineRatePercent / 100) * daysOverdue;
        }

        // Condition fine
        if (item.selected) {
            if (item.return_condition === 'damaged') {
                fine += price * 0.5; // 50% cho hư hỏng
            } else if (item.return_condition === 'lost') {
                fine += price; // 100% cho mất sách
            }
        }

        return fine;
    };

    // Total fine preview
    const totalFinePreview = useMemo(() => {
        if (!showReturnButton) return 0;
        return returnItems.reduce((sum, item) => sum + calculateFine(item), 0);
    }, [returnItems, daysOverdue, fineRatePercent, showReturnButton]);

    const handleToggleItem = (bookCopyId) => {
        setReturnItems(prev => prev.map(item =>
            item.book_copy_id === bookCopyId
                ? { ...item, selected: !item.selected }
                : item
        ));
    };

    const handleConditionChange = (bookCopyId, condition) => {
        setReturnItems(prev => prev.map(item =>
            item.book_copy_id === bookCopyId
                ? { ...item, return_condition: condition }
                : item
        ));
    };

    const handleNotesChange = (bookCopyId, notes) => {
        setReturnItems(prev => prev.map(item =>
            item.book_copy_id === bookCopyId
                ? { ...item, notes }
                : item
        ));
    };

    const handleSubmit = () => {
        if (!onReturn) return;
        const selectedItems = returnItems
            .filter(item => item.selected)
            .map(({ book_copy_id, return_condition, notes }) => ({
                book_copy_id,
                return_condition,
                notes
            }));

        if (selectedItems.length === 0) return;
        onReturn(borrowRequest.id, selectedItems);
    };

    const conditionOptions = [
        { value: 'normal', label: 'Bình thường', color: 'bg-green-100 text-green-800' },
        { value: 'damaged', label: 'Hư hỏng', color: 'bg-yellow-100 text-yellow-800' },
        { value: 'lost', label: 'Mất sách', color: 'bg-red-100 text-red-800' }
    ];

    const selectedCount = returnItems.filter(i => i.selected).length;
    const formatCurrency = (amount) => (amount || 0).toLocaleString('vi-VN') + ' VNĐ';
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('vi-VN');
    };

    if (!borrowRequest) return null;

    const reader = borrowRequest.libraryCard?.reader;
    const hasReturnableBooks = returnItems.length > 0;

    // Get latest return date from details
    const getLatestReturnDate = () => {
        if (!borrowRequest.details || borrowRequest.details.length === 0) return '-';
        const returnDates = borrowRequest.details
            .map(d => d.actual_return_date)
            .filter(d => d)
            .sort((a, b) => new Date(b) - new Date(a));
        return returnDates.length > 0 ? formatDate(returnDates[0]) : '-';
    };

    return (
        <>
            {/* Table Row */}
            <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                    <span className="font-semibold text-gray-900">#{borrowRequest.id}</span>
                </td>
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                            <HiOutlineUserGroup className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 text-sm">{reader?.full_name || 'Không rõ'}</p>
                            <p className="text-xs text-gray-500">{borrowRequest.libraryCard?.card_number || '-'}</p>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                        {borrowRequest.details?.length || 0} cuốn
                    </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(borrowRequest.borrow_date)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                    {getLatestReturnDate()}
                </td>
                <td className="px-6 py-4">
                    <div className="flex items-center gap-2 flex-wrap">
                        {(() => {
                            const status = STATUS_CONFIG[borrowRequest.status] || STATUS_CONFIG.pending;
                            return (
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${status.color}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`}></span>
                                    {status.text}
                                </span>
                            );
                        })()}
                        {daysOverdue > 0 && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">
                                Quá hạn {daysOverdue} ngày
                            </span>
                        )}
                    </div>
                </td>
                <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title={isOpen ? "Thu gọn" : "Mở rộng"}
                        >
                            {isOpen ? (
                                <HiOutlineChevronUp className="w-5 h-5 text-gray-500" />
                            ) : (
                                <HiOutlineChevronDown className="w-5 h-5 text-gray-500" />
                            )}
                        </button>
                        {onViewDetail && (
                            <button
                                onClick={() => onViewDetail(borrowRequest)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Xem chi tiết"
                            >
                                <HiOutlineEye className="w-5 h-5 text-gray-500" />
                            </button>
                        )}
                    </div>
                </td>
            </tr>

            {/* Collapse Row */}
            {isOpen && (
                <tr>
                    <td colSpan="7" className="px-6 py-4 bg-gray-50">
                        <div className="space-y-4">
                            {/* Overdue Warning */}
                            {daysOverdue > 0 && showReturnButton && (
                                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                                    <HiOutlineExclamationCircle className="w-6 h-6 text-red-600 shrink-0" />
                                    <div>
                                        <p className="font-semibold text-red-800">Sách đã quá hạn {daysOverdue} ngày!</p>
                                        <p className="text-sm text-red-600">Phí phạt quá hạn: {fineRatePercent}%/ngày theo giá sách</p>
                                    </div>
                                </div>
                            )}

                            {/* Books List - Only show if has returnable books and showReturnButton */}
                            {showReturnButton && hasReturnableBooks && (
                                <div className="space-y-3">
                                    {returnItems.map((item) => {
                                        const itemFine = calculateFine(item);
                                        return (
                                            <div
                                                key={item.book_copy_id}
                                                className={`p-4 rounded-xl border-2 transition-all ${item.selected
                                                    ? 'border-black bg-gray-50'
                                                    : 'border-gray-200 bg-white'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleItem(item.book_copy_id)}
                                                        className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${item.selected
                                                            ? 'bg-black text-white'
                                                            : 'border-2 border-gray-300'
                                                            }`}
                                                    >
                                                        {item.selected && <HiOutlineCheck className="w-4 h-4" />}
                                                    </button>

                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900">{item.bookTitle}</p>
                                                        <div className="flex items-center gap-3 text-sm text-gray-500">
                                                            <span>Mã: {item.bookCode}</span>
                                                            {item.bookPrice > 0 && (
                                                                <span>Giá: {formatCurrency(item.bookPrice)}</span>
                                                            )}
                                                        </div>

                                                        {item.selected && (
                                                            <div className="mt-3 space-y-3">
                                                                <div className="flex gap-2 flex-wrap">
                                                                    {conditionOptions.map(opt => (
                                                                        <button
                                                                            key={opt.value}
                                                                            type="button"
                                                                            onClick={() => handleConditionChange(item.book_copy_id, opt.value)}
                                                                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${item.return_condition === opt.value
                                                                                ? opt.color + ' ring-2 ring-offset-1 ring-gray-400'
                                                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                                                }`}
                                                                        >
                                                                            {opt.label}
                                                                        </button>
                                                                    ))}
                                                                </div>

                                                                {item.return_condition !== 'normal' && (
                                                                    <input
                                                                        type="text"
                                                                        value={item.notes}
                                                                        onChange={(e) => handleNotesChange(item.book_copy_id, e.target.value)}
                                                                        placeholder="Ghi chú tình trạng..."
                                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                                                    />
                                                                )}

                                                                {/* Fine preview for this item */}
                                                                {itemFine > 0 && (
                                                                    <div className="text-sm text-red-600 font-medium">
                                                                        Tiền phạt dự kiến: {formatCurrency(itemFine)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Book Details - Show if not returnable or just viewing */}
                            {(!showReturnButton || !hasReturnableBooks) && (
                                <div className="space-y-2">
                                    {borrowRequest.details?.map((detail, index) => {
                                        const book = detail.bookCopy?.bookEdition?.book;
                                        return (
                                            <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
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
                            )}

                            {/* Total Fine Preview */}
                            {totalFinePreview > 0 && (
                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-yellow-800">Tổng tiền phạt cần thu:</span>
                                        <span className="text-lg font-bold text-red-600">{formatCurrency(totalFinePreview)}</span>
                                    </div>
                                    <p className="text-xs text-yellow-700 mt-1">
                                        * Tiền phạt sẽ được tạo sau khi trả sách. Vui lòng thu tiền trước hoặc ghi nhận vào tài chính.
                                    </p>
                                </div>
                            )}

                            {/* Submit Button - Only show if returnable */}
                            {showReturnButton && hasReturnableBooks && (
                                <div className="flex gap-3 pt-4 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={loading || selectedCount === 0}
                                        className="flex-1 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center justify-center gap-2 disabled:bg-gray-300"
                                    >
                                        {loading && (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        )}
                                        Trả {selectedCount} sách
                                    </button>
                                </div>
                            )}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

export default BorrowCollapseTableRow;
