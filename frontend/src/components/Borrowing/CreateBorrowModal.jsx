/**
 * ===================================================================
 * CREATE BORROW MODAL - Modal tạo phiếu mượn mới
 * ===================================================================
 */

import { useState, useEffect } from 'react';
import Modal from '../Modal';
import { api } from '../../services';
import toast from 'react-hot-toast';
import { HiOutlineSearch, HiOutlineUser, HiOutlineBookOpen, HiOutlineX, HiOutlinePlus } from 'react-icons/hi';

const CreateBorrowModal = ({ isOpen, onClose, onSuccess }) => {
    const [step, setStep] = useState(1); // 1: Select reader, 2: Select books, 3: Confirm
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Reader selection
    const [readerSearch, setReaderSearch] = useState('');
    const [readers, setReaders] = useState([]);
    const [selectedReader, setSelectedReader] = useState(null);

    // Book selection
    const [bookSearch, setBookSearch] = useState('');
    const [books, setBooks] = useState([]);
    const [selectedBooks, setSelectedBooks] = useState([]);

    // Edition selection modal
    const [showEditionModal, setShowEditionModal] = useState(false);
    const [pendingBook, setPendingBook] = useState(null);
    const [editions, setEditions] = useState([]);
    const [editionsLoading, setEditionsLoading] = useState(false);

    // Borrow details
    const [dueDate, setDueDate] = useState('');
    const [notes, setNotes] = useState('');
    const [maxBorrowDays, setMaxBorrowDays] = useState(14); // Default, will be fetched from settings

    // Search readers
    useEffect(() => {
        if (!readerSearch.trim() || step !== 1) return;

        const timer = setTimeout(async () => {
            try {
                setLoading(true);
                const response = await api.get('/readers', {
                    params: { keyword: readerSearch, limit: 10 }
                });
                // Response có thể là { success, data, pagination } hoặc data trực tiếp
                const readersData = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
                setReaders(readersData);
            } catch (error) {
                console.error('Search readers error:', error);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [readerSearch, step]);

    // Search books
    useEffect(() => {
        if (!bookSearch.trim() || step !== 2) return;

        const timer = setTimeout(async () => {
            try {
                setLoading(true);
                const response = await api.get('/books', {
                    params: { keyword: bookSearch, limit: 20 }
                });
                // Response có thể là { success, data, pagination } hoặc data trực tiếp
                const booksData = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
                setBooks(booksData);
            } catch (error) {
                console.error('Search books error:', error);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [bookSearch, step]);

    // Fetch settings and set default due date based on max_borrow_days
    useEffect(() => {
        if (isOpen) {
            const loadSettings = async () => {
                try {
                    const response = await api.get('/system/settings');
                    const settings = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
                    const maxDays = settings.find(s => s.setting_key === 'max_borrow_days');
                    const days = maxDays ? parseInt(maxDays.setting_value) : 14;
                    setMaxBorrowDays(days);

                    // Set default due date
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
    }, [isOpen]);

    const handleSelectReader = (reader) => {
        setSelectedReader(reader);
        setStep(2);
    };

    const handleSelectBook = async (book) => {
        // Fetch editions with available copies for this book
        try {
            setEditionsLoading(true);
            setPendingBook(book);
            setBookSearch('');
            setBooks([]);

            const editionsResponse = await api.get(`/books/${book.id}/editions`);
            const editionsData = Array.isArray(editionsResponse?.data) ? editionsResponse.data : (Array.isArray(editionsResponse) ? editionsResponse : []);

            if (editionsData.length === 0) {
                toast.error('Sách này chưa có phiên bản nào');
                setPendingBook(null);
                return;
            }

            // Fetch available copies count for each edition
            const editionsWithCopies = await Promise.all(
                editionsData.map(async (edition) => {
                    const copiesResponse = await api.get(`/copies`, {
                        params: { edition_id: edition.id, status: 'available' }
                    });
                    const copies = Array.isArray(copiesResponse?.data) ? copiesResponse.data : (Array.isArray(copiesResponse) ? copiesResponse : []);
                    return {
                        ...edition,
                        availableCopies: copies
                    };
                })
            );

            // Filter editions that have available copies
            const availableEditions = editionsWithCopies.filter(e => e.availableCopies.length > 0);

            if (availableEditions.length === 0) {
                toast.error('Sách này đã hết bản có sẵn');
                setPendingBook(null);
                return;
            }

            setEditions(availableEditions);
            setShowEditionModal(true);
        } catch (error) {
            console.error('Get editions error:', error);
            toast.error('Không thể lấy thông tin phiên bản');
            setPendingBook(null);
        } finally {
            setEditionsLoading(false);
        }
    };

    const handleSelectEdition = (edition, copy) => {
        // 1 phiếu = 1 sách: Thay thế sách cũ nếu có
        setSelectedBooks([{
            copyId: copy.id,
            bookId: pendingBook.id,
            title: pendingBook.title,
            code: pendingBook.code,
            editionId: edition.id,
            publisher: edition.publisher?.name || 'Không rõ NXB',
            publishYear: edition.publish_year,
            copyNumber: copy.copy_number
        }]);

        toast.success(`Đã chọn: ${pendingBook.title} - ${edition.publisher?.name || 'NXB'} (Bản #${copy.copy_number})`);
        setShowEditionModal(false);
        setPendingBook(null);
        setEditions([]);
    };

    const handleCloseEditionModal = () => {
        setShowEditionModal(false);
        setPendingBook(null);
        setEditions([]);
    };

    const handleRemoveBook = (copyId) => {
        setSelectedBooks(prev => prev.filter(b => b.copyId !== copyId));
    };

    const handleSubmit = async () => {
        if (!selectedReader?.libraryCard?.id) {
            toast.error('Độc giả chưa có thẻ thư viện');
            return;
        }
        if (selectedBooks.length === 0) {
            toast.error('Vui lòng chọn 1 cuốn sách');
            return;
        }
        if (!dueDate) {
            toast.error('Vui lòng chọn ngày hạn trả');
            return;
        }

        try {
            setSubmitting(true);
            const response = await api.post('/borrow-requests', {
                library_card_id: selectedReader.libraryCard.id,
                book_copy_ids: selectedBooks.map(b => b.copyId),
                due_date: dueDate,
                notes
            });

            // Response có thể là { success, message, data } hoặc message trực tiếp
            const message = response?.message || response?.data?.message || 'Tạo phiếu mượn thành công';
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
        setStep(1);
        setReaderSearch('');
        setReaders([]);
        setSelectedReader(null);
        setBookSearch('');
        setBooks([]);
        setSelectedBooks([]);
        setNotes('');
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

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Tạo phiếu mượn mới" size="lg">
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-4 mb-6">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${step >= s ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'
                            }`}>
                            {s}
                        </div>
                        <span className={`text-sm ${step >= s ? 'text-gray-900' : 'text-gray-400'}`}>
                            {s === 1 ? 'Chọn độc giả' : s === 2 ? 'Chọn sách' : 'Xác nhận'}
                        </span>
                        {s < 3 && <div className="w-8 h-0.5 bg-gray-200" />}
                    </div>
                ))}
            </div>

            {/* Step 1: Select Reader */}
            {step === 1 && (
                <div className="space-y-4">
                    <div className="relative">
                        <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={readerSearch}
                            onChange={(e) => setReaderSearch(e.target.value)}
                            placeholder="Tìm kiếm độc giả theo tên, CMND, số thẻ..."
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                            autoFocus
                        />
                    </div>

                    <div className="max-h-[300px] overflow-y-auto space-y-2">
                        {loading ? (
                            <div className="text-center py-8 text-gray-500">Đang tìm...</div>
                        ) : readers.length > 0 ? (
                            readers.map((reader) => (
                                <button
                                    key={reader.id}
                                    onClick={() => handleSelectReader(reader)}
                                    className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
                                >
                                    <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center">
                                        <HiOutlineUser className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900">{reader.full_name}</p>
                                        <p className="text-sm text-gray-500">
                                            {reader.libraryCard?.card_number
                                                ? `Thẻ: ${reader.libraryCard.card_number}`
                                                : 'Chưa có thẻ thư viện'}
                                        </p>
                                    </div>
                                    {reader.libraryCard && (() => {
                                        // Kiểm tra nếu thẻ đã hết hạn dựa trên expiry_date
                                        const isExpired = reader.libraryCard.expiry_date && new Date(reader.libraryCard.expiry_date) < new Date();
                                        const isActive = reader.libraryCard.status === 'active' && !isExpired;

                                        return (
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${isActive
                                                ? 'bg-green-100 text-green-800'
                                                : isExpired
                                                    ? 'bg-orange-100 text-orange-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                {isExpired ? 'Hết hạn' : (isActive ? 'Còn hạn' : 'Không hoạt động')}
                                            </span>
                                        );
                                    })()}
                                </button>
                            ))
                        ) : readerSearch.trim() ? (
                            <div className="text-center py-8 text-gray-500">
                                Không tìm thấy độc giả
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                Nhập tên hoặc số thẻ để tìm kiếm
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Step 2: Select Books */}
            {step === 2 && (
                <div className="space-y-4">
                    {/* Selected Reader Info */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center">
                                <HiOutlineUser className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">{selectedReader?.full_name}</p>
                                <p className="text-sm text-gray-500">Thẻ: {selectedReader?.libraryCard?.card_number}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setStep(1)}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            Đổi
                        </button>
                    </div>

                    {/* Book Search */}
                    <div className="relative">
                        <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={bookSearch}
                            onChange={(e) => setBookSearch(e.target.value)}
                            placeholder="Tìm kiếm sách theo tên, mã sách..."
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                    </div>

                    {/* Book Results */}
                    {books.length > 0 && (
                        <div className="max-h-[150px] overflow-y-auto space-y-2 border border-gray-200 rounded-xl p-2">
                            {books.map((book) => (
                                <button
                                    key={book.id}
                                    onClick={() => handleSelectBook(book)}
                                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                                >
                                    <HiOutlineBookOpen className="w-5 h-5 text-gray-400" />
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 text-sm">{book.title}</p>
                                        <p className="text-xs text-gray-500">Mã: {book.code}</p>
                                    </div>
                                    <HiOutlinePlus className="w-5 h-5 text-gray-400" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Selected Books */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-700">
                                Sách đã chọn ({selectedBooks.length}/1)
                            </p>
                            <p className="text-xs text-gray-500 italic">1 phiếu = 1 sách</p>
                        </div>
                        {selectedBooks.length > 0 ? (
                            <div className="space-y-2">
                                {selectedBooks.map((book) => (
                                    <div key={book.copyId} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                        <HiOutlineBookOpen className="w-5 h-5 text-green-600" />
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 text-sm">{book.title}</p>
                                            <p className="text-xs text-gray-500">Mã: {book.code}</p>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveBook(book.copyId)}
                                            className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                                        >
                                            <HiOutlineX className="w-4 h-4 text-red-500" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 bg-gray-50 rounded-xl text-gray-400 text-sm">
                                Tìm và chọn sách để mượn
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={() => setStep(1)}
                            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                        >
                            Quay lại
                        </button>
                        <button
                            onClick={() => setStep(3)}
                            disabled={selectedBooks.length === 0}
                            className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 font-medium disabled:bg-gray-300"
                        >
                            Tiếp tục
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
                <div className="space-y-4">
                    {/* Summary */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center">
                                <HiOutlineUser className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">{selectedReader?.full_name}</p>
                                <p className="text-sm text-gray-500">Thẻ: {selectedReader?.libraryCard?.card_number}</p>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Sách mượn ({selectedBooks.length})</p>
                            {selectedBooks.map((book) => (
                                <div key={book.copyId} className="flex items-center justify-between text-sm py-2 px-3 bg-gray-50 rounded-lg mb-1">
                                    <div className="flex items-center gap-2">
                                        <HiOutlineBookOpen className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <span className="text-gray-900">{book.title}</span>
                                            <span className="text-gray-500 text-xs ml-2">
                                                {book.publisher} ({book.publishYear}) - Bản #{book.copyNumber}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Due Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ngày hạn trả</label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            min={getMinDate()}
                            max={getMaxDate()}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">Tối đa: {maxBorrowDays} ngày kể từ hôm nay</p>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú (tùy chọn)</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={2}
                            placeholder="Ghi chú thêm..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={() => setStep(2)}
                            disabled={submitting}
                            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                        >
                            Quay lại
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 font-medium flex items-center justify-center gap-2"
                        >
                            {submitting && (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            )}
                            Tạo phiếu mượn
                        </button>
                    </div>
                </div>
            )}

            {/* Edition Selection Modal */}
            {showEditionModal && pendingBook && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[80vh] overflow-hidden">
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Chọn phiên bản sách</h3>
                                <p className="text-sm text-gray-500">{pendingBook.title}</p>
                            </div>
                            <button
                                onClick={handleCloseEditionModal}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <HiOutlineX className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
                            {editionsLoading ? (
                                <div className="flex justify-center py-8">
                                    <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
                                </div>
                            ) : editions.length > 0 ? (
                                editions.map((edition) => (
                                    <div key={edition.id} className="border border-gray-200 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {edition.publisher?.name || 'Không rõ NXB'}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Năm {edition.publish_year} | ISBN: {edition.isbn || '-'}
                                                </p>
                                            </div>
                                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                                {edition.availableCopies.length} bản có sẵn
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2">
                                            {edition.availableCopies.slice(0, 6).map((copy) => {
                                                const isAlreadySelected = selectedBooks.find(b => b.copyId === copy.id);
                                                return (
                                                    <button
                                                        key={copy.id}
                                                        onClick={() => !isAlreadySelected && handleSelectEdition(edition, copy)}
                                                        disabled={isAlreadySelected}
                                                        className={`p-2 rounded-lg text-sm font-medium transition-colors ${isAlreadySelected
                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                                            }`}
                                                    >
                                                        Bản #{copy.copy_number}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {edition.availableCopies.length > 6 && (
                                            <p className="text-xs text-gray-400 mt-2 text-center">
                                                Và {edition.availableCopies.length - 6} bản khác...
                                            </p>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    Không có phiên bản nào có sẵn
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default CreateBorrowModal;
