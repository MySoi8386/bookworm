/**
 * ===================================================================
 * ADMIN PAGE - Trang điều hành và phân quyền
 * ===================================================================
 * Features:
 * - Quản lý nhân viên (Staff)
 * - Phân quyền (Roles: admin, librarian, reader)
 * - Tạo nhắc nhở hàng tuần
 * - Các chức năng điều hành khác
 * ===================================================================
 */

import { useState, useEffect } from 'react';
import { api } from '../../services';
import { generateWeeklyReminders } from '../../services/statisticsService';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
    HiOutlineUsers,
    HiOutlineShieldCheck,
    HiOutlineRefresh,
    HiOutlineUserGroup,
    HiOutlineCog,
    HiOutlineClipboardList,
    HiOutlineMail,
    HiOutlineCheck,
    HiOutlineX,
    HiOutlinePlus,
    HiOutlinePencilAlt,
    HiOutlineTrash,
    HiOutlineBan
} from 'react-icons/hi';
import { ConfirmModal } from '../../components';
import { StaffFormModal } from '../../components/admin';

const AdminPage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('staff');

    // Staff state
    const [staffList, setStaffList] = useState([]);
    const [staffLoading, setStaffLoading] = useState(false);
    const [showStaffModal, setShowStaffModal] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [staffToDelete, setStaffToDelete] = useState(null);

    // Reminders
    const [reminderLoading, setReminderLoading] = useState(false);

    // Fetch staff list
    const fetchStaff = async () => {
        try {
            setStaffLoading(true);
            const res = await api.get('/staff');
            // Response có thể là { success, data } hoặc array trực tiếp
            const staffData = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
            setStaffList(staffData);
        } catch (error) {
            toast.error('Không thể tải danh sách nhân viên');
        } finally {
            setStaffLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'staff') {
            fetchStaff();
        }
    }, [activeTab]);

    // Handle staff actions
    const handleAddStaff = () => {
        setSelectedStaff(null);
        setShowStaffModal(true);
    };

    const handleEditStaff = (staff) => {
        setSelectedStaff(staff);
        setShowStaffModal(true);
    };

    const handleDeleteStaff = (staff) => {
        if (staff.account_id === user?.id) {
            toast.error('Không thể tự khóa tài khoản của mình');
            return;
        }
        setStaffToDelete(staff);
        setShowDeleteModal(true);
    };

    const confirmDeleteStaff = async () => {
        if (!staffToDelete) return;

        try {
            await api.delete(`/staff/${staffToDelete.id}`);
            toast.success('Đã khóa tài khoản nhân viên');
            fetchStaff();
        } catch (error) {
            toast.error(error.message || 'Lỗi khi khóa tài khoản');
        } finally {
            setShowDeleteModal(false);
            setStaffToDelete(null);
        }
    };

    // Roles info
    const roles = [
        {
            name: 'admin',
            label: 'Quản trị viên',
            description: 'Toàn quyền: Quản lý nhân viên, thống kê, cấu hình hệ thống',
            color: 'bg-purple-100 text-purple-800',
            icon: HiOutlineShieldCheck,
            permissions: ['Tất cả quyền', 'Quản lý nhân viên', 'Thống kê báo cáo', 'Cấu hình hệ thống']
        },
        {
            name: 'librarian',
            label: 'Thủ thư',
            description: 'Quản lý sách, mượn trả, độc giả, thu tiền phạt',
            color: 'bg-blue-100 text-blue-800',
            icon: HiOutlineUserGroup,
            permissions: ['Quản lý sách', 'Quản lý mượn trả', 'Quản lý độc giả', 'Thu tiền phạt']
        },
        {
            name: 'reader',
            label: 'Độc giả',
            description: 'Tìm sách, đăng ký mượn, xem lịch sử, tra cứu',
            color: 'bg-green-100 text-green-800',
            icon: HiOutlineUsers,
            permissions: ['Xem sách', 'Đăng ký mượn', 'Xem lịch sử', 'Xem tài chính cá nhân']
        }
    ];

    // Quick actions
    const quickActions = [
        {
            id: 'weekly_reminder',
            title: 'Tạo phiếu nhắc hàng tuần',
            description: 'Gửi nhắc trả sách cho độc giả quá hạn',
            icon: HiOutlineMail,
            color: 'bg-orange-100 text-orange-600',
            action: async () => {
                try {
                    setReminderLoading(true);
                    const result = await generateWeeklyReminders();
                    toast.success(result.message || 'Đã tạo phiếu nhắc thành công');
                } catch (error) {
                    toast.error(error.message || 'Lỗi khi tạo phiếu nhắc');
                } finally {
                    setReminderLoading(false);
                }
            }
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Trang điều hành</h1>
                    <p className="text-gray-500 text-sm mt-1">Quản lý nhân viên, phân quyền và điều hành hệ thống</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-4 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('staff')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'staff'
                            ? 'border-black text-black'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <HiOutlineUsers className="inline w-5 h-5 mr-2" />
                    Nhân viên ({activeTab === 'staff' ? staffList.length : '...'})
                </button>
                <button
                    onClick={() => setActiveTab('roles')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'roles'
                            ? 'border-black text-black'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <HiOutlineShieldCheck className="inline w-5 h-5 mr-2" />
                    Phân quyền
                </button>
                <button
                    onClick={() => setActiveTab('operations')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'operations'
                            ? 'border-black text-black'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <HiOutlineCog className="inline w-5 h-5 mr-2" />
                    Điều hành
                </button>
            </div>

            {/* Staff Tab */}
            {activeTab === 'staff' && (
                <div className="space-y-6">
                    {/* Actions Bar */}
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm nhân viên..."
                                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black"
                                // Implementation later
                                />
                                <HiOutlineUsers className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                        <button
                            onClick={handleAddStaff}
                            className="px-4 py-2 bg-black text-white rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors text-sm font-medium"
                        >
                            <HiOutlinePlus className="w-4 h-4" />
                            Thêm nhân viên
                        </button>
                    </div>

                    {/* Staff List */}
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                        {staffLoading ? (
                            <div className="p-8 flex justify-center">
                                <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Nhân viên</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Tài khoản</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Liên hệ</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {staffList.length > 0 ? (
                                            staffList.map((staff) => (
                                                <tr key={staff.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold">
                                                                {staff.full_name?.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-gray-900">{staff.full_name}</div>
                                                                <div className="text-xs text-gray-500">{staff.position}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-900 font-medium">{staff.account?.username}</div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${staff.account?.userGroup?.name === 'admin'
                                                                    ? 'bg-purple-100 text-purple-800'
                                                                    : 'bg-blue-100 text-blue-800'
                                                                }`}>
                                                                {staff.account?.userGroup?.name === 'admin' ? 'Admin' : 'Thủ thư'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-600">{staff.phone || '-'}</div>
                                                        <div className="text-xs text-gray-400">{staff.account?.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {staff.account?.status === 'active' ? (
                                                            <span className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full w-fit">
                                                                <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                                                                Hoạt động
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full w-fit">
                                                                <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                                                                Đã khóa
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => handleEditStaff(staff)}
                                                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                                title="Sửa thông tin"
                                                            >
                                                                <HiOutlinePencilAlt className="w-4 h-4" />
                                                            </button>
                                                            {staff.account?.status === 'active' ? (
                                                                <button
                                                                    onClick={() => handleDeleteStaff(staff)}
                                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title="Khóa tài khoản"
                                                                >
                                                                    <HiOutlineBan className="w-4 h-4" />
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleDeleteStaff(staff)} // Handle unlock logic if needed
                                                                    className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                                                                    title="Đã khóa"
                                                                    disabled
                                                                >
                                                                    <HiOutlineBan className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                                    Chưa có nhân viên nào
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Roles Tab */}
            {activeTab === 'roles' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {roles.map((role) => {
                            const Icon = role.icon;
                            return (
                                <div key={role.name} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
                                    <div className={`p-6 ${role.color.replace('text-', 'bg-').split(' ')[0]}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                                <Icon className="w-6 h-6 text-gray-700" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-lg">{role.label}</h3>
                                                <span className={`px-2 py-0.5 rounded text-xs font-mono ${role.color}`}>
                                                    {role.name}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <p className="text-gray-600 text-sm mb-4">{role.description}</p>
                                        <div className="space-y-2">
                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Quyền hạn:</p>
                                            {role.permissions.map((perm, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                                                    <HiOutlineCheck className="w-4 h-4 text-green-500" />
                                                    {perm}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Access Control Matrix */}
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900">Ma trận phân quyền</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Chức năng</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-purple-600 uppercase">Admin</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-blue-600 uppercase">Thủ thư</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-green-600 uppercase">Độc giả</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {[
                                        { name: 'Dashboard', admin: true, librarian: true, reader: true },
                                        { name: 'Quản lý sách', admin: true, librarian: true, reader: false },
                                        { name: 'Mượn trả', admin: true, librarian: true, reader: false },
                                        { name: 'Quản lý thành viên', admin: true, librarian: true, reader: false },
                                        { name: 'Quản lý tài chính', admin: true, librarian: true, reader: false },
                                        { name: 'Thống kê báo cáo', admin: true, librarian: false, reader: false },
                                        { name: 'Cài đặt hệ thống', admin: true, librarian: false, reader: false },
                                        { name: 'Tìm kiếm sách', admin: true, librarian: true, reader: true },
                                        { name: 'Sách của tôi', admin: true, librarian: true, reader: true },
                                        { name: 'Tài chính cá nhân', admin: true, librarian: true, reader: true },
                                    ].map((func, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{func.name}</td>
                                            <td className="px-6 py-4 text-center">
                                                {func.admin ? (
                                                    <HiOutlineCheck className="w-5 h-5 text-green-500 mx-auto" />
                                                ) : (
                                                    <HiOutlineX className="w-5 h-5 text-red-400 mx-auto" />
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {func.librarian ? (
                                                    <HiOutlineCheck className="w-5 h-5 text-green-500 mx-auto" />
                                                ) : (
                                                    <HiOutlineX className="w-5 h-5 text-red-400 mx-auto" />
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {func.reader ? (
                                                    <HiOutlineCheck className="w-5 h-5 text-green-500 mx-auto" />
                                                ) : (
                                                    <HiOutlineX className="w-5 h-5 text-red-400 mx-auto" />
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Operations Tab */}
            {activeTab === 'operations' && (
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {quickActions.map((action) => {
                                const Icon = action.icon;
                                return (
                                    <button
                                        key={action.id}
                                        onClick={action.action}
                                        disabled={reminderLoading}
                                        className="bg-white rounded-2xl border border-gray-100 p-6 text-left hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                                    >
                                        <div className={`w-12 h-12 ${action.color.split(' ')[0]} rounded-xl flex items-center justify-center mb-4`}>
                                            <Icon className={`w-6 h-6 ${action.color.split(' ')[1]}`} />
                                        </div>
                                        <h4 className="font-semibold text-gray-900">{action.title}</h4>
                                        <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                                        {reminderLoading && action.id === 'weekly_reminder' && (
                                            <div className="mt-3 flex items-center text-sm text-gray-500">
                                                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2" />
                                                Đang xử lý...
                                            </div>
                                        )}
                                    </button>
                                );
                            })}

                            {/* Navigate to Statistics */}
                            <a
                                href="/statistics"
                                className="bg-white rounded-2xl border border-gray-100 p-6 text-left hover:shadow-lg transition-all duration-300 block"
                            >
                                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                                    <HiOutlineClipboardList className="w-6 h-6 text-indigo-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900">Xem báo cáo 6 tháng</h4>
                                <p className="text-sm text-gray-500 mt-1">Phân tích sách và độc giả chi tiết</p>
                            </a>

                            {/* Navigate to Settings */}
                            <a
                                href="/settings"
                                className="bg-white rounded-2xl border border-gray-100 p-6 text-left hover:shadow-lg transition-all duration-300 block"
                            >
                                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                                    <HiOutlineCog className="w-6 h-6 text-gray-600" />
                                </div>
                                <h4 className="font-semibold text-gray-900">Cấu hình hệ thống</h4>
                                <p className="text-sm text-gray-500 mt-1">Thông số và cài đặt</p>
                            </a>
                        </div>
                    </div>

                    {/* System Status */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Trạng thái hệ thống</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Backend API</p>
                                    <p className="text-xs text-green-600">Hoạt động bình thường</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Database</p>
                                    <p className="text-xs text-green-600">Kết nối ổn định</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Frontend</p>
                                    <p className="text-xs text-green-600">Vite Dev Server</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
            <StaffFormModal
                isOpen={showStaffModal}
                onClose={() => setShowStaffModal(false)}
                onSuccess={() => {
                    fetchStaff();
                }}
                staff={selectedStaff}
            />

            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDeleteStaff}
                title="Khóa tài khoản nhân viên?"
                message={`Bạn có chắc chắn muốn khóa tài khoản "${staffToDelete?.full_name}"? Nhân viên sẽ không thể đăng nhập được nữa.`}
                confirmText="Khóa tài khoản"
                cancelText="Hủy"
                type="danger"
            />
        </div>
    );
};

export default AdminPage;
