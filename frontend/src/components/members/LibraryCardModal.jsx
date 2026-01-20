/**
 * ===================================================================
 * LIBRARY CARD MODAL - Modal cấp/sửa thẻ thư viện
 * ===================================================================
 */

import { useState, useEffect } from 'react';
import Modal from '../Modal';
import { api } from '../../services';
import { lockLibraryCard, unlockLibraryCard } from '../../services/memberService';
import toast from 'react-hot-toast';
import { HiOutlineCreditCard, HiOutlineCalendar, HiOutlineLockClosed, HiOutlineLockOpen } from 'react-icons/hi';

const LibraryCardModal = ({ isOpen, onClose, onSuccess, member, card = null }) => {
    const isEdit = !!card;
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [lockActionLoading, setLockActionLoading] = useState(false);

    const [formData, setFormData] = useState({
        expiry_date: '',
        max_books: 5,
        max_borrow_days: 14,
        deposit_amount: 200000
    });

    // Giá trị mặc định từ Settings
    const [defaults, setDefaults] = useState({
        min_deposit_amount: 200000,
        max_books_per_user: 5,
        max_borrow_days: 14
    });

    // Load system settings
    useEffect(() => {
        if (isOpen && !isEdit) {
            const loadSettings = async () => {
                try {
                    setLoading(true);
                    const response = await api.get('/system/settings');
                    const settings = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);

                    const getValue = (key, defaultVal) => {
                        const setting = settings.find(s => s.setting_key === key);
                        return setting ? parseInt(setting.setting_value) : defaultVal;
                    };

                    const newDefaults = {
                        min_deposit_amount: getValue('min_deposit_amount', 200000),
                        max_books_per_user: getValue('max_books_per_user', 5),
                        max_borrow_days: getValue('max_borrow_days', 14)
                    };
                    setDefaults(newDefaults);

                    // Set form data with defaults
                    const oneYearFromNow = new Date();
                    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
                    setFormData({
                        expiry_date: oneYearFromNow.toISOString().split('T')[0],
                        max_books: newDefaults.max_books_per_user,
                        max_borrow_days: newDefaults.max_borrow_days,
                        deposit_amount: newDefaults.min_deposit_amount
                    });
                } catch (error) {
                    console.error('Load settings error:', error);
                    // Sử dụng giá trị mặc định cứng nếu API lỗi
                    const oneYearFromNow = new Date();
                    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
                    setFormData({
                        expiry_date: oneYearFromNow.toISOString().split('T')[0],
                        max_books: 5,
                        max_borrow_days: 14,
                        deposit_amount: 200000
                    });
                } finally {
                    setLoading(false);
                }
            };
            loadSettings();
        } else if (isOpen && isEdit && card) {
            setFormData({
                expiry_date: card.expiry_date ? card.expiry_date.split('T')[0] : '',
                max_books: card.max_books || 5,
                max_borrow_days: card.max_borrow_days || 14,
                deposit_amount: card.deposit_amount || 200000
            });
        }
    }, [isOpen, card, isEdit]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) || 0 : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.expiry_date) {
            toast.error('Vui lòng chọn ngày hết hạn');
            return;
        }

        // Validate deposit amount
        if (!isEdit && formData.deposit_amount < defaults.min_deposit_amount) {
            toast.error(`Tiền cọc tối thiểu là ${defaults.min_deposit_amount.toLocaleString('vi-VN')} VNĐ`);
            return;
        }

        try {
            setSubmitting(true);

            if (isEdit) {
                // Khi edit, chỉ cho phép sửa expiry_date
                await api.put(`/library-cards/${card.id}`, {
                    expiry_date: formData.expiry_date,
                    status: 'active'
                });
                toast.success('Cập nhật thẻ thành công');
            } else {
                await api.post('/library-cards', {
                    reader_id: member.id,
                    ...formData
                });
                toast.success('Cấp thẻ thư viện thành công');
            }

            onSuccess?.();
            onClose();
        } catch (error) {
            toast.error(error.message || 'Lỗi thao tác thẻ');
        } finally {
            setSubmitting(false);
        }
    };

    const getMinDate = () => {
        const today = new Date();
        today.setDate(today.getDate() + 1);
        return today.toISOString().split('T')[0];
    };

    /**
     * Handle lock/unlock library card
     */
    const handleToggleCardLock = async () => {
        if (!card) return;

        const isLocked = card.status === 'locked';
        const action = isLocked ? unlockLibraryCard : lockLibraryCard;
        const actionText = isLocked ? 'Mở khóa' : 'Khóa';

        try {
            setLockActionLoading(true);
            await action(card.id);
            toast.success(`${actionText} thẻ thành công`);
            onSuccess?.(); // Refresh data
        } catch (error) {
            toast.error(error.response?.data?.message || `Lỗi ${actionText.toLowerCase()} thẻ`);
        } finally {
            setLockActionLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? 'Sửa thẻ thư viện' : 'Cấp thẻ thư viện'}
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Member Info */}
                {member && (
                    <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                        <div className="w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center">
                            <HiOutlineCreditCard className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">{member.full_name}</p>
                            <p className="text-sm text-gray-500">CMND: {member.id_card_number}</p>
                        </div>
                    </div>
                )}

                {/* Expiry Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <HiOutlineCalendar className="inline w-4 h-4 mr-1" />
                        Ngày hết hạn <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        name="expiry_date"
                        value={formData.expiry_date}
                        onChange={handleChange}
                        min={getMinDate()}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                        required
                    />
                </div>

                {/* Settings Grid - Chỉ hiển thị khi tạo mới, khi edit thì read-only */}
                {isEdit ? (
                    // Mode: Sửa thẻ - hiển thị read-only
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Số sách tối đa</p>
                            <p className="font-semibold text-gray-900">{formData.max_books}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Số ngày mượn tối đa</p>
                            <p className="font-semibold text-gray-900">{formData.max_borrow_days}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Ngày cấp thẻ</p>
                            <p className="font-semibold text-gray-900">
                                {card?.issue_date ? new Date(card.issue_date).toLocaleDateString('vi-VN') : '-'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-1">Tiền cọc</p>
                            <p className="font-semibold text-gray-900">{(card?.deposit_amount || 0).toLocaleString('vi-VN')} VNĐ</p>
                        </div>
                    </div>
                ) : (
                    // Mode: Cấp thẻ mới - hiển thị thông tin từ settings
                    <div className="bg-blue-50 rounded-xl p-4 space-y-2">
                        <p className="text-sm font-medium text-blue-900">Cấu hình thẻ (từ hệ thống)</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-blue-700">Số sách tối đa:</span>
                                <span className="font-semibold ml-1">{defaults.max_books_per_user}</span>
                            </div>
                            <div>
                                <span className="text-blue-700">Số ngày mượn:</span>
                                <span className="font-semibold ml-1">{defaults.max_borrow_days}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Note for edit mode */}
                {isEdit && (
                    <p className="text-xs text-gray-500 italic">
                        * Số sách tối đa và số ngày mượn được cấu hình trong Cài đặt hệ thống bởi Admin
                    </p>
                )}

                {/* Lock/Unlock Card (only for edit mode) */}
                {isEdit && card && (
                    <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Quản lý trạng thái thẻ</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {card.status === 'locked' 
                                        ? 'Thẻ đang bị khóa. Mở khóa để độc giả có thể sử dụng thẻ.'
                                        : 'Khóa thẻ để tạm thời ngăn độc giả mượn sách mới.'}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleToggleCardLock}
                                disabled={lockActionLoading || submitting}
                                className={`px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${
                                    card.status === 'locked'
                                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                        : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {lockActionLoading ? (
                                    <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                                ) : card.status === 'locked' ? (
                                    <HiOutlineLockOpen className="w-5 h-5" />
                                ) : (
                                    <HiOutlineLockClosed className="w-5 h-5" />
                                )}
                                {card.status === 'locked' ? 'Mở khóa thẻ' : 'Khóa thẻ'}
                            </button>
                        </div>
                        {card.status === 'locked' && (
                            <p className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
                                ⚠️ Lưu ý: Khi khóa thẻ, độc giả không thể mượn sách mới. Thẻ chỉ có thể khóa khi không có sách đang mượn (trừ sách quá hạn).
                            </p>
                        )}
                    </div>
                )}

                {/* Deposit (only for create) */}
                {!isEdit && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tiền đặt cọc <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="deposit_amount"
                            value={formData.deposit_amount}
                            onChange={handleChange}
                            min={defaults.min_deposit_amount}
                            step={10000}
                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-transparent ${formData.deposit_amount < defaults.min_deposit_amount
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-300'
                                }`}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Tối thiểu: {defaults.min_deposit_amount.toLocaleString('vi-VN')} VNĐ
                        </p>
                        {formData.deposit_amount < defaults.min_deposit_amount && (
                            <p className="text-xs text-red-500 mt-1">
                                ⚠️ Tiền cọc phải ≥ {defaults.min_deposit_amount.toLocaleString('vi-VN')} VNĐ
                            </p>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 px-4 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                        {submitting && (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        )}
                        {isEdit ? 'Cập nhật' : 'Cấp thẻ'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default LibraryCardModal;
