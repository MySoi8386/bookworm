/**
 * ===================================================================
 * MEMBER FORM MODAL - Modal tạo/sửa thành viên
 * ===================================================================
 */

import { useState, useEffect } from 'react';
import Modal from '../Modal';
import { api } from '../../services';
import toast from 'react-hot-toast';
import { HiOutlineUser, HiOutlineMail, HiOutlineKey } from 'react-icons/hi';

const MemberFormModal = ({ isOpen, onClose, onSuccess, member = null }) => {
    const isEdit = !!member;
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        // Account info (only for create)
        username: '',
        password: '',
        email: '',
        // Reader info
        full_name: '',
        id_card_number: '',
        phone: '',
        birth_date: '',
        address: '',
        title: ''
    });

    // Prefill form if editing
    useEffect(() => {
        if (member && isOpen) {
            setFormData({
                username: member.account?.username || '',
                password: '',
                email: member.account?.email || '',
                full_name: member.full_name || '',
                id_card_number: member.id_card_number || '',
                phone: member.phone || '',
                birth_date: member.birth_date ? member.birth_date.split('T')[0] : '',
                address: member.address || '',
                title: member.title || ''
            });
        } else if (!isOpen) {
            setFormData({
                username: '', password: '', email: '',
                full_name: '', id_card_number: '', phone: '',
                birth_date: '', address: '', title: ''
            });
        }
    }, [member, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.full_name.trim()) {
            toast.error('Vui lòng nhập họ tên');
            return;
        }

        if (!isEdit) {
            if (!formData.username.trim() || !formData.password.trim()) {
                toast.error('Vui lòng nhập tên đăng nhập và mật khẩu');
                return;
            }
            if (!formData.id_card_number.trim()) {
                toast.error('Vui lòng nhập số CMND/CCCD');
                return;
            }
        }

        try {
            setSubmitting(true);

            if (isEdit) {
                await api.put(`/readers/${member.id}`, {
                    full_name: formData.full_name,
                    phone: formData.phone,
                    birth_date: formData.birth_date || null,
                    address: formData.address,
                    title: formData.title
                });
                toast.success('Cập nhật thành viên thành công');
            } else {
                await api.post('/readers', formData);
                toast.success('Tạo thành viên thành công');
            }

            onSuccess?.();
            onClose();
        } catch (error) {
            toast.error(error.message || 'Lỗi lưu thông tin');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? 'Chỉnh sửa thành viên' : 'Thêm thành viên mới'}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Account Info - Only for create */}
                {!isEdit && (
                    <div className="bg-blue-50 rounded-xl p-4 space-y-4">
                        <div className="flex items-center gap-2 text-blue-700 font-medium">
                            <HiOutlineKey className="w-5 h-5" />
                            Thông tin tài khoản
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tên đăng nhập <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="VD: nguyenvana"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mật khẩu <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Mật khẩu"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <HiOutlineMail className="inline w-4 h-4 mr-1" />
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="email@example.com"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                            />
                        </div>
                    </div>
                )}

                {/* Personal Info */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                        <HiOutlineUser className="w-5 h-5" />
                        Thông tin cá nhân
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Họ và tên <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                placeholder="Nhập họ và tên"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                                required
                            />
                        </div>

                        {!isEdit && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    CMND/CCCD <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="id_card_number"
                                    value={formData.id_card_number}
                                    onChange={handleChange}
                                    placeholder="Số CMND/CCCD"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                                    required
                                />
                            </div>
                        )}

                        <div className={!isEdit ? '' : 'col-span-1'}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="0912345678"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh</label>
                            <input
                                type="date"
                                name="birth_date"
                                value={formData.birth_date}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Chức danh</label>
                            <select
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent bg-white"
                            >
                                <option value="">-- Chọn --</option>
                                <option value="Sinh viên">Sinh viên</option>
                                <option value="Giảng viên">Giảng viên</option>
                                <option value="Nghiên cứu sinh">Nghiên cứu sinh</option>
                                <option value="Cán bộ">Cán bộ</option>
                                <option value="Khác">Khác</option>
                            </select>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Địa chỉ thường trú"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

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
                        {isEdit ? 'Cập nhật' : 'Thêm thành viên'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default MemberFormModal;
