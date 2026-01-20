/**
 * ===================================================================
 * MEMBER DETAIL MODAL - Xem chi tiết thành viên
 * ===================================================================
 */

import { useState, useEffect } from 'react';
import Modal from '../Modal';
import { api } from '../../services';
import { HiOutlineUser, HiOutlinePhone, HiOutlineMail, HiOutlineCalendar, HiOutlineIdentification, HiOutlineCreditCard, HiOutlineBookOpen } from 'react-icons/hi';

const MemberDetailModal = ({ isOpen, onClose, member }) => {
    const [borrowedBooks, setBorrowedBooks] = useState([]);
    const [loadingBooks, setLoadingBooks] = useState(false);

    useEffect(() => {
        if (isOpen && member?.id) {
            const fetchBorrowedBooks = async () => {
                try {
                    setLoadingBooks(true);
                    const response = await api.get(`/readers/${member.id}/borrowed-books`);
                    setBorrowedBooks(response?.data || []);
                } catch (error) {
                    console.error('Error fetching borrowed books:', error);
                    setBorrowedBooks([]);
                } finally {
                    setLoadingBooks(false);
                }
            };
            fetchBorrowedBooks();
        }
    }, [isOpen, member?.id]);

    if (!member) return null;

    const getAccountStatusBadge = (status) => {
        const statusMap = {
            active: { text: 'Hoạt động', color: 'bg-green-100 text-green-800' },
            pending: { text: 'Chờ kích hoạt', color: 'bg-yellow-100 text-yellow-800' },
            locked: { text: 'Đã khóa', color: 'bg-red-100 text-red-800' }
        };
        return statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
    };

    const getCardStatusBadge = (card) => {
        if (!card) return null;
        
        // Kiểm tra nếu thẻ đã hết hạn dựa trên expiry_date
        const isExpired = card.expiry_date && new Date(card.expiry_date) < new Date();
        
        // Nếu thẻ đã hết hạn, hiển thị "Hết hạn" bất kể status
        if (isExpired) {
            return { text: 'Hết hạn', color: 'bg-orange-100 text-orange-800' };
        }

        const statusMap = {
            active: { text: 'Còn hạn', color: 'bg-green-100 text-green-800' },
            expired: { text: 'Hết hạn', color: 'bg-orange-100 text-orange-800' },
            locked: { text: 'Đã khóa', color: 'bg-red-100 text-red-800' }
        };
        return statusMap[card.status] || { text: card.status || 'Không xác định', color: 'bg-gray-100 text-gray-800' };
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('vi-VN');
    };

    const accountStatus = getAccountStatusBadge(member.account?.status);
    const card = member.libraryCard;
    const cardStatus = card ? getCardStatusBadge(card) : null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Chi tiết thành viên" size="lg">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-black text-white rounded-xl flex items-center justify-center shrink-0">
                        <HiOutlineUser className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">{member.full_name}</h3>
                        <p className="text-gray-500">{member.title || 'Độc giả'}</p>
                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${accountStatus.color}`}>
                            {accountStatus.text}
                        </span>
                    </div>
                </div>

                {/* Personal Info */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                            <HiOutlineIdentification className="w-4 h-4" />
                            <span className="text-xs">CMND/CCCD</span>
                        </div>
                        <p className="font-semibold text-gray-900">{member.id_card_number || '-'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                            <HiOutlinePhone className="w-4 h-4" />
                            <span className="text-xs">Số điện thoại</span>
                        </div>
                        <p className="font-semibold text-gray-900">{member.phone || '-'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                            <HiOutlineMail className="w-4 h-4" />
                            <span className="text-xs">Email</span>
                        </div>
                        <p className="font-semibold text-gray-900 truncate" title={member.account?.email}>
                            {member.account?.email || '-'}
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                            <HiOutlineCalendar className="w-4 h-4" />
                            <span className="text-xs">Ngày sinh</span>
                        </div>
                        <p className="font-semibold text-gray-900">{formatDate(member.birth_date)}</p>
                    </div>
                </div>

                {/* Address */}
                {member.address && (
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-1">Địa chỉ</p>
                        <p className="font-medium text-gray-900">{member.address}</p>
                    </div>
                )}

                {/* Library Card */}
                {card ? (
                    <div className="border border-gray-200 rounded-xl p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg flex items-center justify-center">
                                    <HiOutlineCreditCard className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-lg">{card.card_number}</p>
                                    <p className="text-xs text-gray-500">Thẻ thư viện</p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cardStatus.color}`}>
                                {cardStatus.text}
                            </span>
                        </div>

                        <div className="grid grid-cols-4 gap-3 text-center">
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-lg font-bold text-gray-900">{card.max_books}</p>
                                <p className="text-xs text-gray-500">Sách tối đa</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-lg font-bold text-gray-900">{card.max_borrow_days}</p>
                                <p className="text-xs text-gray-500">Ngày mượn</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-lg font-bold text-gray-900">{(card.deposit_amount || 0).toLocaleString('vi-VN')}</p>
                                <p className="text-xs text-gray-500">Tiền cọc (VNĐ)</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-lg font-bold text-gray-900">{formatDate(card.expiry_date)}</p>
                                <p className="text-xs text-gray-500">Hết hạn</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                        <HiOutlineCreditCard className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                        <p className="text-yellow-700 font-medium">Chưa có thẻ thư viện</p>
                        <p className="text-yellow-600 text-sm">Thành viên này chưa được cấp thẻ</p>
                    </div>
                )}

                {/* Account Info */}
                <div className="bg-blue-50 rounded-xl p-4">
                    <p className="text-xs text-blue-700 font-medium mb-2">Thông tin tài khoản</p>
                    <div className="flex justify-between text-sm">
                        <span className="text-blue-600">Tên đăng nhập</span>
                        <span className="font-semibold text-blue-900">{member.account?.username || '-'}</span>
                    </div>
                </div>

                {/* Borrowed Books */}
                <div className="border border-gray-200 rounded-xl p-5 space-y-4">
                    <div className="flex items-center gap-2">
                        <HiOutlineBookOpen className="w-5 h-5 text-gray-600" />
                        <h4 className="font-semibold text-gray-900">Sách đang mượn ({borrowedBooks.length})</h4>
                    </div>
                    {loadingBooks ? (
                        <div className="text-center py-4">
                            <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto"></div>
                        </div>
                    ) : borrowedBooks.length > 0 ? (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {borrowedBooks.map((book, index) => (
                                <div key={index} className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm">{book.book_title}</p>
                                        <p className="text-xs text-gray-500">Mã: {book.book_code}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">Hạn trả: {formatDate(book.due_date)}</p>
                                        {book.status === 'overdue' && (
                                            <span className="text-xs text-red-600 font-medium">Quá hạn</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm text-center py-4">Không có sách đang mượn</p>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default MemberDetailModal;
