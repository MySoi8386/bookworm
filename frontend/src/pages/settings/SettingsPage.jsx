/**
 * ===================================================================
 * SETTINGS PAGE - Trang cài đặt hệ thống
 * ===================================================================
 * Features:
 * - Cấu hình tham số hệ thống (Tiền phạt, ngày mượn, số sách tối đa, tiền đặt cọc)
 * - Quản lý tài khoản nhân viên (link đến AdminPage)
 * - Admin only
 * ===================================================================
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getSettings, updateSettings } from '../../services/systemService';
import toast from 'react-hot-toast';
import {
    HiOutlineCog,
    HiOutlineBookOpen,
    HiOutlineCash,
    HiOutlineCalendar,
    HiOutlineInformationCircle,
    HiOutlineUsers,
    HiOutlineShieldCheck,
    HiOutlineSave,
    HiOutlineX,
    HiOutlinePencil
} from 'react-icons/hi';

const SettingsPage = () => {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('settings'); // 'settings' hoặc 'staff'

    // Settings state
    const [settings, setSettings] = useState({
        fine_rate_percent: 0.1,
        max_borrow_days: 14,
        max_books_per_user: 5,
        min_deposit_amount: 100000
    });
    const [originalSettings, setOriginalSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingKey, setEditingKey] = useState(null);
    const [editValue, setEditValue] = useState('');

    /**
     * Load settings from API
     */
    useEffect(() => {
        const loadSettings = async () => {
            try {
                setLoading(true);
                const response = await getSettings();
                // Response có thể là { success, data } hoặc object trực tiếp
                const data = response?.data || response || {};

                // Map API keys to component keys
                const mappedSettings = {
                    fine_rate_percent: parseFloat(data.fine_rate_percent) || 0.1,
                    max_borrow_days: parseInt(data.max_borrow_days) || 14,
                    max_books_per_user: parseInt(data.max_books_per_user) || 5,
                    min_deposit_amount: parseInt(data.min_deposit_amount) || 100000
                };

                setSettings(mappedSettings);
                setOriginalSettings(mappedSettings);
            } catch (error) {
                console.error('Load settings error:', error);
                toast.error('Không thể tải cấu hình hệ thống');
            } finally {
                setLoading(false);
            }
        };

        if (isAdmin()) {
            loadSettings();
        }
    }, [isAdmin]);

    /**
     * Handle edit setting
     */
    const handleEdit = (key) => {
        setEditingKey(key);
        setEditValue(String(settings[key]));
    };

    /**
     * Cancel edit
     */
    const handleCancelEdit = () => {
        setEditingKey(null);
        setEditValue('');
    };

    /**
     * Save single setting
     */
    const handleSaveSingle = async (key) => {
        if (!editingKey) return;

        const numValue = key === 'min_deposit_amount'
            ? parseInt(editValue)
            : key === 'fine_rate_percent'
                ? parseFloat(editValue)
                : parseInt(editValue);

        if (isNaN(numValue) || numValue < 0) {
            toast.error('Giá trị không hợp lệ');
            return;
        }

        try {
            setSaving(true);
            await updateSettings({ [key]: numValue });

            const updatedSettings = { ...settings, [key]: numValue };
            setSettings(updatedSettings);
            setOriginalSettings(updatedSettings);
            setEditingKey(null);
            setEditValue('');

            toast.success('Cập nhật thành công');
        } catch (error) {
            console.error('Update setting error:', error);
            toast.error(error.message || 'Không thể cập nhật cấu hình');
        } finally {
            setSaving(false);
        }
    };

    /**
     * Save all settings
     */
    const handleSaveAll = async () => {
        try {
            setSaving(true);
            await updateSettings(settings);
            setOriginalSettings({ ...settings });
            toast.success('Cập nhật tất cả cấu hình thành công');
        } catch (error) {
            console.error('Update settings error:', error);
            toast.error(error.message || 'Không thể cập nhật cấu hình');
        } finally {
            setSaving(false);
        }
    };

    /**
     * Check if settings changed
     */
    const hasChanges = () => {
        return Object.keys(settings).some(key => settings[key] !== originalSettings[key]);
    };

    const settingsItems = [
        {
            key: 'fine_rate_percent',
            label: 'Phí phạt trễ hạn',
            description: 'Phần trăm phạt mỗi ngày trễ (tính trên giá sách). Ví dụ: 0.1 = 10%',
            icon: HiOutlineCash,
            unit: '%/ngày',
            color: 'red',
            type: 'number',
            step: 0.01,
            min: 0,
            max: 1
        },
        {
            key: 'max_borrow_days',
            label: 'Số ngày mượn tối đa',
            description: 'Thời gian mượn mặc định cho độc giả (ngày)',
            icon: HiOutlineCalendar,
            unit: 'ngày',
            color: 'blue',
            type: 'number',
            step: 1,
            min: 1,
            max: 365
        },
        {
            key: 'max_books_per_user',
            label: 'Số sách tối đa',
            description: 'Số lượng sách tối đa được mượn cùng lúc',
            icon: HiOutlineBookOpen,
            unit: 'cuốn',
            color: 'green',
            type: 'number',
            step: 1,
            min: 1,
            max: 20
        },
        {
            key: 'min_deposit_amount',
            label: 'Tiền đặt cọc mặc định',
            description: 'Số tiền đặt cọc khi làm thẻ thư viện',
            icon: HiOutlineCash,
            unit: 'VND',
            color: 'yellow',
            type: 'number',
            step: 10000,
            min: 0
        }
    ];

    const colorMap = {
        red: 'bg-red-100 text-red-600',
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        yellow: 'bg-yellow-100 text-yellow-600'
    };

    // Redirect if not admin
    if (!isAdmin()) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <HiOutlineShieldCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Không có quyền truy cập</h2>
                    <p className="text-gray-500">Chỉ quản trị viên mới có thể truy cập trang này.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải cấu hình...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Cài đặt hệ thống</h1>
                    <p className="text-gray-500 text-sm mt-1">Quản lý các thông số cấu hình thư viện</p>
                </div>
                {hasChanges() && (
                    <button
                        onClick={handleSaveAll}
                        disabled={saving}
                        className="px-4 py-2 bg-black text-white rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                        <HiOutlineSave className="w-4 h-4" />
                        {saving ? 'Đang lưu...' : 'Lưu tất cả'}
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-4 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'settings'
                            ? 'border-black text-black'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <HiOutlineCog className="inline w-5 h-5 mr-2" />
                    Cấu hình tham số
                </button>
                <button
                    onClick={() => setActiveTab('staff')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'staff'
                            ? 'border-black text-black'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <HiOutlineUsers className="inline w-5 h-5 mr-2" />
                    Quản lý nhân viên
                </button>
            </div>

            {/* Settings Tab */}
            {activeTab === 'settings' && (
                <div className="space-y-6">
                    {/* Info Banner */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                        <HiOutlineInformationCircle className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-blue-800 font-medium">Lưu ý</p>
                            <p className="text-blue-600 text-sm mt-1">
                                Các thay đổi sẽ ảnh hưởng đến toàn bộ hệ thống. Vui lòng kiểm tra kỹ trước khi lưu.
                            </p>
                        </div>
                    </div>

                    {/* Settings Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {settingsItems.map((item) => {
                            const Icon = item.icon;
                            const isEditing = editingKey === item.key;
                            const value = settings[item.key];
                            const displayValue = item.key === 'min_deposit_amount'
                                ? value.toLocaleString('vi-VN')
                                : item.key === 'fine_rate_percent'
                                    ? (value * 100).toFixed(1)
                                    : value;

                            return (
                                <div key={item.key} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorMap[item.color]}`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">{item.label}</h3>
                                            <p className="text-sm text-gray-500 mt-1">{item.description}</p>

                                            {isEditing ? (
                                                <div className="mt-4 space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type={item.type}
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                            step={item.step}
                                                            min={item.min}
                                                            max={item.max}
                                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                                                            autoFocus
                                                        />
                                                        <span className="text-gray-500 text-sm">{item.unit}</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleSaveSingle(item.key)}
                                                            disabled={saving}
                                                            className="px-3 py-1.5 bg-black text-white rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                                                        >
                                                            Lưu
                                                        </button>
                                                        <button
                                                            onClick={handleCancelEdit}
                                                            disabled={saving}
                                                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                                                        >
                                                            Hủy
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="mt-4 flex items-center justify-between">
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-3xl font-bold text-gray-900">
                                                            {displayValue}
                                                        </span>
                                                        <span className="text-gray-500">{item.unit}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleEdit(item.key)}
                                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <HiOutlinePencil className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Staff Management Tab */}
            {activeTab === 'staff' && (
                <div className="space-y-6">
                    {/* Info Banner */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                        <HiOutlineInformationCircle className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-blue-800 font-medium">Quản lý nhân viên</p>
                            <p className="text-blue-600 text-sm mt-1">
                                Quản lý tài khoản nhân viên, phân quyền và cấp quyền truy cập cho các nhóm người dùng.
                            </p>
                        </div>
                    </div>

                    {/* Quick Link to Admin Page */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        <div className="text-center">
                            <HiOutlineUsers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quản lý nhân viên</h3>
                            <p className="text-gray-500 text-sm mb-6">
                                Để quản lý chi tiết nhân viên, phân quyền và các thao tác điều hành khác,
                                vui lòng truy cập trang điều hành.
                            </p>
                            <button
                                onClick={() => navigate('/admin')}
                                className="px-6 py-3 bg-black text-white rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors text-sm font-medium mx-auto"
                            >
                                <HiOutlineShieldCheck className="w-5 h-5" />
                                Đi đến trang điều hành
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* System Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <HiOutlineCog className="w-5 h-5" />
                    Thông tin hệ thống
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500">Phiên bản</p>
                        <p className="font-medium text-gray-900">1.0.0</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500">Môi trường</p>
                        <p className="font-medium text-gray-900">Development</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500">Database</p>
                        <p className="font-medium text-gray-900">MySQL</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-500">Backend</p>
                        <p className="font-medium text-gray-900">Node.js + Express</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
