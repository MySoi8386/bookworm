/**
 * ===================================================================
 * STAFF FORM MODAL - Modal tạo/sửa nhân viên
 * ===================================================================
 */

import { useState, useEffect } from 'react';
import Modal from '../Modal';
import { api } from '../../services';
import toast from 'react-hot-toast';
import { HiOutlineUser, HiOutlineMail, HiOutlineKey, HiOutlineBriefcase, HiOutlineShieldCheck } from 'react-icons/hi';

const StaffFormModal = ({ isOpen, onClose, onSuccess, staff = null }) => {
    const isEdit = !!staff;
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        full_name: '',
        phone: '',
        address: '',
        title: '',
        role: 'librarian', // Default role
        position: '',
        status: 'active'
    });

    // Prefill form if editing
    useEffect(() => {
        if (staff && isOpen) {
            setFormData({
                username: staff.account?.username || '',
                password: '', // Don't show password
                email: staff.account?.email || '',
                full_name: staff.full_name || '',
                phone: staff.phone || '',
                address: staff.address || '',
                role: staff.account?.userGroup?.name || 'librarian',
                position: staff.position || '',
                status: staff.account?.status || 'active'
            });
        } else if (!isOpen) {
            setFormData({
                username: '',
                password: '',
                email: '',
                full_name: '',
                phone: '',
                address: '',
                role: 'librarian',
                position: '',
                status: 'active'
            });
        }
    }, [staff, isOpen]);

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
        }

        try {
            setSubmitting(true);

            if (isEdit) {
                // Update
                const updateData = {
                    full_name: formData.full_name,
                    phone: formData.phone,
                    address: formData.address,
                    position: formData.position,
                    role: formData.role,
                    status: formData.status
                };

                if (formData.password) {
                    updateData.password = formData.password;
                }

                await api.put(`/staff/${staff.id}`, updateData);
                toast.success('Cập nhật nhân viên thành công');
            } else {
                // Create
                await api.post('/staff', formData);
                toast.success('Tạo nhân viên thành công');
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
            title={isEdit ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Account Info */}
                <div className="bg-purple-50 rounded-xl p-4 space-y-4">
                    <div className="flex items-center gap-2 text-purple-700 font-medium">
                        <HiOutlineKey className="w-5 h-5" />
                        Thông tin tài khoản & Phân quyền
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
                                disabled={isEdit}
                                placeholder="VD: admin_hamy"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mật khẩu {isEdit ? '(Để trống nếu không đổi)' : <span className="text-red-500">*</span>}
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="******"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                required={!isEdit}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <HiOutlineShieldCheck className="inline w-4 h-4 mr-1" />
                                Phân quyền <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                            >
                                <option value="librarian">Thủ thư (Librarian)</option>
                                <option value="admin">Quản trị viên (Admin)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Trạng thái
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                            >
                                <option value="active">Hoạt động</option>
                                <option value="locked">Khóa</option>
                            </select>
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                </div>

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

                        <div>
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <HiOutlineBriefcase className="inline w-4 h-4 mr-1" />
                                Chức vụ
                            </label>
                            <input
                                type="text"
                                name="position"
                                value={formData.position}
                                onChange={handleChange}
                                placeholder="VD: Thủ thư chính"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Địa chỉ liên hệ"
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
                        className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                        {submitting && (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        )}
                        {isEdit ? 'Cập nhật' : 'Tạo nhân viên'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default StaffFormModal;
