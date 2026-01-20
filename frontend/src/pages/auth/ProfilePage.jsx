/**
 * ===================================================================
 * PROFILE PAGE - Trang thông tin cá nhân
 * ===================================================================
 * Features:
 * - Xem thông tin cá nhân
 * - Cập nhật thông tin (Tên, SĐT, Địa chỉ)
 * - Đổi mật khẩu
 * ===================================================================
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services';
import toast from 'react-hot-toast';
import {
    HiOutlineUser,
    HiOutlineMail,
    HiOutlinePhone,
    HiOutlineLocationMarker,
    HiOutlineIdentification,
    HiOutlineBriefcase,
    HiOutlineLockClosed,
    HiOutlineCamera
} from 'react-icons/hi';

const ProfilePage = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    // Forms state
    const [infoForm, setInfoForm] = useState({
        full_name: '',
        email: '', // Read only
        phone: '',
        address: '',
        birth_date: '',
        title: ''
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Initialize form with user data
    useEffect(() => {
        if (user) {
            const profile = user.staff || user.reader || {};
            setInfoForm({
                full_name: profile.full_name || '',
                email: user.email || '',
                phone: profile.phone || '',
                address: profile.address || '',
                birth_date: profile.birth_date ? profile.birth_date.split('T')[0] : '',
                title: profile.title || ''
            });
        }
    }, [user]);

    // Update Profile Handler
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            // Exclude email from update data
            const { email: _, ...dataToUpdate } = infoForm;
            await api.put('/auth/profile', dataToUpdate);

            // Reload user data
            const res = await api.get('/auth/me');
            // Response có thể là { success, data } hoặc data trực tiếp
            const userData = res?.data || res;
            if (userData) {
                // Update user context if needed
                // AuthContext should handle this automatically on next request
            }

            toast.success('Cập nhật thông tin thành công');
        } catch (error) {
            toast.error(error.message || 'Lỗi cập nhật thông tin');
        } finally {
            setLoading(false);
        }
    };

    // Change Password Handler
    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('Mật khẩu mới không khớp');
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            toast.error('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        try {
            setLoading(true);
            await api.put('/auth/change-password', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            toast.success('Đổi mật khẩu thành công');
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            toast.error(error.message || 'Lỗi đổi mật khẩu');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    const isReader = user.role === 'reader';

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Avatar & Basic Info */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center space-y-4 shadow-sm">
                        <div className="relative w-24 h-24 mx-auto">
                            <div className="w-24 h-24 bg-black text-white rounded-full flex items-center justify-center text-3xl font-bold">
                                {infoForm.full_name?.charAt(0) || user.username?.charAt(0)}
                            </div>
                            <button className="absolute bottom-0 right-0 p-2 bg-gray-100 rounded-full border border-white text-gray-600 hover:bg-gray-200 transition-colors">
                                <HiOutlineCamera className="w-4 h-4" />
                            </button>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{infoForm.full_name || user.username}</h2>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                user.role === 'librarian' ? 'bg-blue-100 text-blue-800' :
                                    'bg-green-100 text-green-800'
                                }`}>
                                {user.role === 'admin' ? 'Quản trị viên' :
                                    user.role === 'librarian' ? 'Thủ thư' : 'Độc giả'}
                            </span>
                        </div>

                        <div className="border-t border-gray-100 pt-4 space-y-2 text-left">
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <HiOutlineUser className="w-5 h-5 text-gray-400" />
                                <span>@{user.username}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <HiOutlineMail className="w-5 h-5 text-gray-400" />
                                <span>{infoForm.email}</span>
                            </div>
                            {!isReader && (
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <HiOutlineBriefcase className="w-5 h-5 text-gray-400" />
                                    <span>{user.staff?.position || 'Nhân viên'}</span>
                                </div>
                            )}
                            {isReader && (
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <HiOutlineIdentification className="w-5 h-5 text-gray-400" />
                                    <span>CMND: {user.reader?.id_card_number}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Forms */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Public Info Form */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <HiOutlineUser className="w-6 h-6 text-gray-400" />
                            <h2 className="text-lg font-bold text-gray-900">Thông tin chung</h2>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                                    <input
                                        type="text"
                                        value={infoForm.full_name}
                                        onChange={(e) => setInfoForm({ ...infoForm, full_name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                    <div className="relative">
                                        <HiOutlinePhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={infoForm.phone}
                                            onChange={(e) => setInfoForm({ ...infoForm, phone: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                {isReader && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                                        <input
                                            type="date"
                                            value={infoForm.birth_date}
                                            onChange={(e) => setInfoForm({ ...infoForm, birth_date: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                        />
                                    </div>
                                )}
                                {isReader && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Danh xưng / Nghề nghiệp</label>
                                        <input
                                            type="text"
                                            value={infoForm.title}
                                            onChange={(e) => setInfoForm({ ...infoForm, title: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                            placeholder="VD: Sinh viên, Giáo viên..."
                                        />
                                    </div>
                                )}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                                    <div className="relative">
                                        <HiOutlineLocationMarker className="absolute left-3 top-3 text-gray-400" />
                                        <textarea
                                            rows={2}
                                            value={infoForm.address}
                                            onChange={(e) => setInfoForm({ ...infoForm, address: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors text-sm font-medium"
                                >
                                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Change Password Form */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <HiOutlineLockClosed className="w-6 h-6 text-gray-400" />
                            <h2 className="text-lg font-bold text-gray-900">Đổi mật khẩu</h2>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
                                <input
                                    type="password"
                                    required
                                    value={passwordForm.currentPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors text-sm font-medium"
                                >
                                    {loading ? 'Đang đổi...' : 'Đổi mật khẩu'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
