/**
 * ===================================================================
 * READER BORROW MODAL - Modal mượn sách cho độc giả
 * ===================================================================
 */

import { useState, useEffect, useCallback } from 'react';
import Modal from '../Modal';
import { api } from '../../services';
import toast from 'react-hot-toast';
import { HiOutlineBookOpen, HiOutlineCalendar, HiOutlineX, HiOutlineCheckCircle } from 'react-icons/hi';

const ReaderBorrowModal = ({ isOpen, onClose, onSuccess, book }) => {
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editions, setEditions] = useState([]);
    const [selectedCopies, setSelectedCopies] = useState([]);
    const [dueDate, setDueDate] = useState('');
    const [maxBorrowDays, setMaxBorrowDays] = useState(14); // Default, will be fetched from settings

    // Load editions function
    const loadEditions = useCallback(async () => {
        if (!book?.id) return;
        try {
            setLoading(true);
            const response = await api.get(`/books/${book.id}/editions`);
            // Response có thể là { success, data } hoặc array trực tiếp
            const editionsData = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
            setEditions(editionsData);
        } catch (error) {
            console.error('Load editions error:', error);
            toast.error('Không thể tải thông tin sách');
        } finally {
            setLoading(false);
        }
    }, [book?.id]);

    // Fetch settings and load editions when modal opens
    useEffect(() => {
        if (isOpen && book?.id) {
            loadEditions();

            // Fetch system settings for max_borrow_days
            const loadSettings = async () => {
                try {
                    const response = await api.get('/system/settings');
                    const settings = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
                    const maxDays = settings.find(s => s.setting_key === 'max_borrow_days');
                    const days = maxDays ? parseInt(maxDays.setting_value) : 14;
                    setMaxBorrowDays(days);

                    // Set default due date based on max_borrow_days
                    const defaultDue = new Date();
                    defaultDue.setDate(defaultDue.getDate() + days);
                    setDueDate(defaultDue.toISOString().split('T')[0]);
                } catch (error) {
                    console.error('Load settings error:', error);
                    // Fallback to 14 days
                    const defaultDue = new Date();
                    defaultDue.setDate(defaultDue.getDate() + 14);
                    setDueDate(defaultDue.toISOString().split('T')[0]);
                }
            };
            loadSettings();
        }
    }, [isOpen, book?.id, loadEditions]);

    const handleSelectCopy = async (edition) => {
        try {
            // Get available copies for this edition
            const response = await api.get(`/copies`, {
                params: { edition_id: edition.id, status: 'available', limit: 1 }
            });
            const copies = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);

            if (copies.length === 0) {
                toast.error('Không còn bản sách có sẵn cho phiên bản này');
                return;
            }

            const copy = copies[0];

            // Check if already selected
            if (selectedCopies.find(c => c.copyId === copy.id)) {
                toast.error('Bản sách này đã được chọn');
                return;
            }

            setSelectedCopies(prev => [...prev, {
                copyId: copy.id,
                editionId: edition.id,
                editionInfo: `${edition.publisher?.name || 'NXB'} - ${edition.publish_year || ''}`,
                copyNumber: copy.copy_number
            }]);
            toast.success('Đã thêm sách vào danh sách mượn');
        } catch (error) {
            console.error('Select copy error:', error);
            toast.error('Không thể lấy thông tin bản sách');
        }
    };

    const handleRemoveCopy = (copyId) => {
        setSelectedCopies(prev => prev.filter(c => c.copyId !== copyId));
    };

    const handleSubmit = async () => {
        if (selectedCopies.length === 0) {
            toast.error('Vui lòng chọn ít nhất 1 cuốn sách');
            return;
        }
        if (!dueDate) {
            toast.error('Vui lòng chọn ngày hạn trả');
            return;
        }

        try {
            setSubmitting(true);
            // Backend sẽ tự động lấy library_card_id từ account_id của reader
            // Nên không cần truyền library_card_id
            const response = await api.post('/borrow-requests', {
                book_copy_ids: selectedCopies.map(c => c.copyId),
                due_date: dueDate,
                notes: ''
            });

            const message = response?.message || response?.data?.message || 'Tạo phiếu mượn thành công. Vui lòng chờ duyệt.';
            toast.success(message);
            onSuccess?.();
            handleClose();
        } catch (error) {
            console.error('Create borrow error:', error);

            // Xử lý lỗi chi tiết
            const errorData = error.response?.data;

            // Nếu có mảng errors (validation errors)
            if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
                // Hiển thị từng lỗi validation
                errorData.errors.forEach((err, index) => {
                    const fieldName = err.field || 'Dữ liệu';
                    const message = err.message || 'Không hợp lệ';
                    toast.error(`${fieldName}: ${message}`, {
                        duration: 4000,
                        id: `borrow-error-${index}` // Tránh duplicate toast
                    });
                });
            } else {
                // Hiển thị message chính
                const errorMessage = errorData?.message || error.message || 'Lỗi tạo phiếu mượn. Vui lòng thử lại.';
                toast.error(errorMessage, { duration: 5000 });
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setSelectedCopies([]);
        setDueDate('');
        setEditions([]);
        onClose();
    };

    const getMinDate = () => {
        const today = new Date();
        today.setDate(today.getDate() + 1);
        return today.toISOString().split('T')[0];
    };

    const getMaxDate = () => {
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + maxBorrowDays);
        return maxDate.toISOString().split('T')[0];
    };

    if (!book) return null;

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Mượn sách" size="lg">
            <div className="space-y-6">
                {/* Book Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-bold text-gray-900 mb-1">{book.title}</h3>
                    <p className="text-sm text-gray-600">Mã: {book.code}</p>
                </div>

                {/* Select Copies */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Chọn phiên bản sách</h4>
                    {loading ? (
                        <div className="text-center py-4">
                            <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto"></div>
                        </div>
                    ) : editions.length > 0 ? (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {editions.map((edition) => (
                                <button
                                    key={edition.id}
                                    onClick={() => handleSelectCopy(edition)}
                                    disabled={selectedCopies.find(c => c.editionId === edition.id)}
                                    className="w-full p-3 bg-white border border-gray-200 rounded-lg hover:border-black hover:bg-gray-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {edition.publisher?.name || 'NXB'} - {edition.publish_year || ''}
                                            </p>
                                            <p className="text-xs text-gray-500">ISBN: {edition.isbn || '-'}</p>
                                        </div>
                                        {selectedCopies.find(c => c.editionId === edition.id) && (
                                            <HiOutlineCheckCircle className="w-5 h-5 text-green-600" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-4">Sách này chưa có phiên bản nào</p>
                    )}
                </div>

                {/* Selected Copies */}
                {selectedCopies.length > 0 && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Sách đã chọn ({selectedCopies.length})</h4>
                        <div className="space-y-2">
                            {selectedCopies.map((copy) => (
                                <div key={copy.copyId} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{copy.editionInfo}</p>
                                        <p className="text-xs text-gray-500">Bản số: {copy.copyNumber}</p>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveCopy(copy.copyId)}
                                        className="p-1 hover:bg-red-100 rounded transition-colors"
                                    >
                                        <HiOutlineX className="w-4 h-4 text-red-600" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Due Date */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <HiOutlineCalendar className="inline w-4 h-4 mr-1" />
                        Ngày hạn trả
                    </label>
                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        min={getMinDate()}
                        max={getMaxDate()}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Tối đa: {maxBorrowDays} ngày kể từ hôm nay</p>
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                        onClick={handleClose}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || selectedCopies.length === 0}
                        className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {submitting ? 'Đang tạo...' : 'Tạo phiếu mượn'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ReaderBorrowModal;
