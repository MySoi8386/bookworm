/**
 * ===================================================================
 * BOOK DETAIL MODAL - Xem chi tiết sách
 * ===================================================================
 */

import { useState, useEffect, useCallback } from 'react';
import Modal from '../Modal';
import { useAuth } from '../../contexts/AuthContext';
import { bookService } from '../../services';
import toast from 'react-hot-toast';
import { HiOutlineBookOpen, HiOutlineUser, HiOutlineOfficeBuilding, HiOutlineCalendar, HiOutlinePlus, HiOutlineMinus, HiOutlinePencil } from 'react-icons/hi';
import EditionFormModal from './EditionFormModal';

const BookDetailModal = ({ isOpen, onClose, book, onBorrow, onUpdate }) => {
    const { user } = useAuth();
    const [editions, setEditions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [manageQuantity, setManageQuantity] = useState(null); // { editionId, quantity, price }
    const [showEditionModal, setShowEditionModal] = useState(false);
    const [editingCopy, setEditingCopy] = useState(null); // { copyId, status, notes }

    const loadEditions = useCallback(async () => {
        if (!book?.id) return;
        try {
            const data = await bookService.getEditions(book.id);
            const editionsData = Array.isArray(data) ? data : (data?.data || []);
            setEditions(editionsData);
        } catch (error) {
            console.error('Load editions error:', error);
        }
    }, [book?.id]);

    // Load editions khi mở modal - cho tất cả users
    useEffect(() => {
        if (isOpen && book?.id) {
            loadEditions();
        }
    }, [isOpen, book?.id, loadEditions]);

    if (!book) return null;

    const handleAddCopies = async (editionId, quantity, price) => {
        if (!quantity || quantity <= 0) {
            toast.error('Số lượng phải lớn hơn 0');
            return;
        }

        if (!price || price <= 0) {
            toast.error('Giá sách phải lớn hơn 0');
            return;
        }

        try {
            setLoading(true);
            await bookService.createCopies(editionId, { quantity, price });
            toast.success(`Đã thêm ${quantity} bản sách`);
            setManageQuantity(null);
            await loadEditions();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Add copies error:', error);
            toast.error(error.response?.data?.message || 'Không thể thêm bản sách');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveCopy = async (copyId) => {
        if (!window.confirm('Bạn có chắc muốn xóa bản sách này?')) {
            return;
        }

        try {
            setLoading(true);
            await bookService.deleteCopy(copyId);
            toast.success('Đã xóa bản sách');
            await loadEditions();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Delete copy error:', error);
            toast.error(error.response?.data?.message || 'Không thể xóa bản sách');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateCopyStatus = async (copyId, status, notes = '') => {
        try {
            setLoading(true);
            await bookService.updateCopy(copyId, { status, condition_notes: notes });
            toast.success('Cập nhật trạng thái thành công');
            setEditingCopy(null);
            await loadEditions();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Update copy error:', error);
            toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái');
        } finally {
            setLoading(false);
        }
    };


    // Tính số lượng từ editions state
    const getCopiesCount = () => {
        // Ưu tiên tính từ editions state (đã load chi tiết copies)
        if (editions.length > 0) {
            let available = 0, borrowed = 0, damaged = 0, disposed = 0;
            editions.forEach(edition => {
                (edition.copies || []).forEach(copy => {
                    if (copy.status === 'available') available++;
                    else if (copy.status === 'borrowed') borrowed++;
                    else if (copy.status === 'damaged') damaged++;
                    else if (copy.status === 'disposed') disposed++;
                });
            });
            return { available, borrowed, damaged, disposed, total: available + borrowed + damaged + disposed };
        }

        // Fallback: tính từ book.editions nếu có
        if (book.editions?.length > 0) {
            let available = 0, borrowed = 0, damaged = 0, disposed = 0;
            book.editions.forEach(edition => {
                (edition.copies || []).forEach(copy => {
                    if (copy.status === 'available') available++;
                    else if (copy.status === 'borrowed') borrowed++;
                    else if (copy.status === 'damaged') damaged++;
                    else if (copy.status === 'disposed') disposed++;
                });
            });
            return { available, borrowed, damaged, disposed, total: available + borrowed + damaged + disposed };
        }

        // Fallback cuối: dùng giá trị từ API nếu không có chi tiết
        return {
            available: book.available_copies || 0,
            total: book.total_copies || 0,
            borrowed: 0,
            damaged: 0,
            disposed: 0
        };
    };

    const copiesCount = getCopiesCount();

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết sách" size="lg">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-black text-white rounded-xl flex items-center justify-center shrink-0">
                        <HiOutlineBookOpen className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">{book.title}</h3>
                        <p className="text-gray-500">Mã: {book.code}</p>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-1">Lĩnh vực</p>
                        <p className="font-semibold text-gray-900">{book.field?.name || '-'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-1">Thể loại</p>
                        <p className="font-semibold text-gray-900">{book.genre?.name || '-'}</p>
                    </div>
                </div>

                {/* Authors */}
                {book.authors?.length > 0 && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <HiOutlineUser className="w-4 h-4" />
                            Tác giả ({book.authors.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {book.authors.map((author) => (
                                <span key={author.id} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                                    {author.title ? `${author.title} ` : ''}{author.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Copies Stats */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Thống kê bản sách</h4>
                    <div className="grid grid-cols-5 gap-3">
                        <div className="text-center p-3 bg-gray-50 rounded-xl">
                            <p className="text-2xl font-bold text-gray-900">{copiesCount.total}</p>
                            <p className="text-xs text-gray-500">Tổng</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-xl">
                            <p className="text-2xl font-bold text-green-600">{copiesCount.available}</p>
                            <p className="text-xs text-green-600">Có sẵn</p>
                        </div>
                        <div className="text-center p-3 bg-yellow-50 rounded-xl">
                            <p className="text-2xl font-bold text-yellow-600">{copiesCount.borrowed}</p>
                            <p className="text-xs text-yellow-600">Đang mượn</p>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-xl">
                            <p className="text-2xl font-bold text-red-600">{copiesCount.damaged}</p>
                            <p className="text-xs text-red-600">Hư hỏng</p>
                        </div>
                        <div className="text-center p-3 bg-gray-100 rounded-xl">
                            <p className="text-2xl font-bold text-gray-600">{copiesCount.disposed}</p>
                            <p className="text-xs text-gray-500">Thanh lý</p>
                        </div>
                    </div>
                </div>

                {/* Editions */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <HiOutlineOfficeBuilding className="w-4 h-4" />
                            Phiên bản ({(book.editions || editions).length})
                        </h4>
                        {(user?.role === 'admin' || user?.role === 'librarian') && (
                            <button
                                onClick={() => setShowEditionModal(true)}
                                className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1"
                            >
                                <HiOutlinePlus className="w-3 h-3" />
                                Thêm phiên bản
                            </button>
                        )}
                    </div>
                    {(book.editions?.length > 0 || editions.length > 0) && (
                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                            {(editions.length > 0 ? editions : book.editions || []).map((edition) => {
                                const copies = edition.copies || [];
                                const availableCopies = copies.filter(c => c.status === 'available');
                                const isManaging = manageQuantity?.editionId === edition.id;

                                return (
                                    <div key={edition.id} className="p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{edition.publisher?.name || 'Không rõ NXB'}</p>
                                                <p className="text-sm text-gray-500">
                                                    <HiOutlineCalendar className="inline w-3 h-3 mr-1" />
                                                    Năm {edition.publish_year} | ISBN: {edition.isbn || '-'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full">
                                                    {copies.length} bản ({availableCopies.length} có sẵn)
                                                </span>
                                            </div>
                                        </div>

                                        {/* Danh sách bản sách với thông tin người mượn */}
                                        {(user?.role === 'admin' || user?.role === 'librarian') && copies.length > 0 && (
                                            <div className="mt-2 pt-2 border-t border-gray-200">
                                                <p className="text-xs font-medium text-gray-500 mb-2">Chi tiết bản sách:</p>
                                                <div className="space-y-1 max-h-[150px] overflow-y-auto">
                                                    {copies.map((copy) => (
                                                        <div key={copy.id} className="p-2 bg-white rounded-lg text-xs border border-gray-200">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-mono text-gray-600">#{copy.copy_number}</span>
                                                                    <span className={`px-2 py-0.5 rounded-full ${copy.status === 'available' ? 'bg-green-100 text-green-700' :
                                                                        copy.status === 'borrowed' ? 'bg-yellow-100 text-yellow-700' :
                                                                            copy.status === 'damaged' ? 'bg-red-100 text-red-700' :
                                                                                'bg-gray-100 text-gray-700'
                                                                        }`}>
                                                                        {copy.status === 'available' ? 'Có sẵn' :
                                                                            copy.status === 'borrowed' ? 'Đang mượn' :
                                                                                copy.status === 'damaged' ? 'Hư hỏng' : 'Thanh lý'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    {/* Hiển thị thông tin người mượn */}
                                                                    {copy.borrower && (
                                                                        <div className="text-right text-gray-600 mr-2">
                                                                            <span className="font-medium text-gray-900">{copy.borrower.name}</span>
                                                                            {copy.borrower.phone && <span className="ml-1">{copy.borrower.phone}</span>}
                                                                            <span className="ml-1 text-yellow-600">
                                                                                Hạn: {new Date(copy.borrower.due_date).toLocaleDateString('vi-VN')}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                    {/* Nút sửa trạng thái */}
                                                                    {copy.status !== 'borrowed' && (
                                                                        <button
                                                                            onClick={() => setEditingCopy({ copyId: copy.id, status: copy.status, notes: copy.condition_notes || '' })}
                                                                            className="p-1 hover:bg-gray-100 rounded"
                                                                            title="Sửa trạng thái"
                                                                        >
                                                                            <HiOutlinePencil className="w-3 h-3 text-gray-500" />
                                                                        </button>
                                                                    )}
                                                                    {/* Nút xóa */}
                                                                    {copy.status === 'available' && (
                                                                        <button
                                                                            onClick={() => handleRemoveCopy(copy.id)}
                                                                            className="p-1 hover:bg-red-100 rounded"
                                                                            title="Xóa bản này"
                                                                        >
                                                                            <HiOutlineMinus className="w-3 h-3 text-red-600" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {/* Form sửa trạng thái */}
                                                            {editingCopy?.copyId === copy.id && (
                                                                <div className="mt-2 pt-2 border-t border-gray-200 space-y-2">
                                                                    <select
                                                                        value={editingCopy.status}
                                                                        onChange={(e) => setEditingCopy(prev => ({ ...prev, status: e.target.value }))}
                                                                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                                                                        disabled={loading}
                                                                    >
                                                                        <option value="available">Có sẵn</option>
                                                                        <option value="damaged">Hư hỏng</option>
                                                                        <option value="disposed">Thanh lý</option>
                                                                    </select>
                                                                    <input
                                                                        type="text"
                                                                        value={editingCopy.notes}
                                                                        onChange={(e) => setEditingCopy(prev => ({ ...prev, notes: e.target.value }))}
                                                                        placeholder="Ghi chú (tùy chọn)"
                                                                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                                                                        disabled={loading}
                                                                    />
                                                                    <div className="flex gap-1">
                                                                        <button
                                                                            onClick={() => handleUpdateCopyStatus(copy.id, editingCopy.status, editingCopy.notes)}
                                                                            disabled={loading}
                                                                            className="flex-1 px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                                                        >
                                                                            Lưu
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setEditingCopy(null)}
                                                                            disabled={loading}
                                                                            className="flex-1 px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                                                        >
                                                                            Hủy
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Quản lý số lượng cho admin/thủ thư */}
                                        {(user?.role === 'admin' || user?.role === 'librarian') && (
                                            <div className="mt-2 pt-2 border-t border-gray-200">
                                                {!isManaging ? (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => {
                                                                // Lấy giá từ copy đầu tiên nếu có, nếu không thì dùng giá mặc định
                                                                const defaultPrice = copies.length > 0 && copies[0].price ? copies[0].price : 50000;
                                                                setManageQuantity({ editionId: edition.id, quantity: 1, price: defaultPrice });
                                                            }}
                                                            className="flex-1 px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center gap-1"
                                                        >
                                                            <HiOutlinePlus className="w-3 h-3" />
                                                            Thêm bản
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={manageQuantity.quantity}
                                                                onChange={(e) => setManageQuantity(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                                                                className="w-20 px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                                                                placeholder="SL"
                                                            />
                                                            <input
                                                                type="number"
                                                                min="1000"
                                                                step="1000"
                                                                value={manageQuantity.price}
                                                                onChange={(e) => setManageQuantity(prev => ({ ...prev, price: parseInt(e.target.value) || 50000 }))}
                                                                className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
                                                                placeholder="Giá (VNĐ)"
                                                            />
                                                            <button
                                                                onClick={() => handleAddCopies(edition.id, manageQuantity.quantity, manageQuantity.price)}
                                                                disabled={loading}
                                                                className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                                            >
                                                                Thêm
                                                            </button>
                                                            <button
                                                                onClick={() => setManageQuantity(null)}
                                                                className="px-3 py-1.5 text-xs bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                                            >
                                                                Hủy
                                                            </button>
                                                        </div>
                                                        <p className="text-xs text-gray-500">
                                                            Giá hiện tại: {copies[0]?.price ? `${copies[0].price.toLocaleString('vi-VN')} VNĐ` : 'Chưa có'}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Description */}
                {book.description && (
                    <div className="bg-blue-50 rounded-xl p-4">
                        <p className="text-sm font-medium text-blue-900 mb-1">Mô tả</p>
                        <p className="text-sm text-blue-700">{book.description}</p>
                    </div>
                )}

                {/* Borrow Button for Readers */}
                {user?.role === 'reader' && (book.available_copies || copiesCount.available) > 0 && onBorrow && (
                    <div className="pt-4 border-t border-gray-200">
                        <button
                            onClick={() => {
                                // Chỉ gọi onBorrow - callback này sẽ đóng modal chi tiết và mở modal mượn
                                onBorrow(book);
                            }}
                            className="w-full px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center justify-center gap-2"
                        >
                            <HiOutlinePlus className="w-5 h-5" />
                            Mượn sách này
                        </button>
                    </div>
                )}
            </div>

            {/* Edition Form Modal */}
            <EditionFormModal
                isOpen={showEditionModal}
                onClose={() => setShowEditionModal(false)}
                onSuccess={async () => {
                    await loadEditions();
                    if (onUpdate) onUpdate();
                }}
                bookId={book.id}
            />
        </Modal>
    );
};

export default BookDetailModal;
