/**
 * ===================================================================
 * CATEGORY PAGE - Trang quản lý danh mục
 * ===================================================================
 * Features:
 * - CRUD cho Lĩnh vực (Fields)
 * - CRUD cho Thể loại (Genres)
 * - CRUD cho Tác giả (Authors)
 * - CRUD cho Nhà xuất bản (Publishers)
 * ===================================================================
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '../../services';
import toast from 'react-hot-toast';
import {
    HiOutlineSearch,
    HiOutlinePlus,
    HiOutlinePencilAlt,
    HiOutlineTrash,
    HiOutlineRefresh,
    HiOutlineTag,
    HiOutlineBookOpen,
    HiOutlineUser,
    HiOutlineOfficeBuilding
} from 'react-icons/hi';
import { ConfirmModal } from '../../components';

const CategoryPage = () => {
    const [activeTab, setActiveTab] = useState('fields'); // fields, genres, authors, publishers
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal states
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    // Tab configs
    const tabConfigs = {
        fields: {
            label: 'Lĩnh vực',
            icon: HiOutlineTag,
            apiPath: '/fields',
            fields: [
                { name: 'code', label: 'Mã lĩnh vực', required: true },
                { name: 'name', label: 'Tên lĩnh vực', required: true },
                { name: 'description', label: 'Mô tả', type: 'textarea' }
            ]
        },
        genres: {
            label: 'Thể loại',
            icon: HiOutlineBookOpen,
            apiPath: '/genres',
            fields: [
                { name: 'code', label: 'Mã thể loại', required: true },
                { name: 'name', label: 'Tên thể loại', required: true },
                { name: 'description', label: 'Mô tả', type: 'textarea' }
            ]
        },
        authors: {
            label: 'Tác giả',
            icon: HiOutlineUser,
            apiPath: '/authors',
            fields: [
                { name: 'name', label: 'Họ tên', required: true },
                { name: 'title', label: 'Chức danh (GS, PGS, TS...)' },
                { name: 'workplace', label: 'Nơi làm việc' },
                { name: 'bio', label: 'Tiểu sử', type: 'textarea' }
            ]
        },
        publishers: {
            label: 'Nhà xuất bản',
            icon: HiOutlineOfficeBuilding,
            apiPath: '/publishers',
            fields: [
                { name: 'name', label: 'Tên NXB', required: true },
                { name: 'address', label: 'Địa chỉ' },
                { name: 'established_date', label: 'Ngày thành lập', type: 'date' },
                { name: 'phone', label: 'Số điện thoại' },
                { name: 'email', label: 'Email' }
            ]
        }
    };

    const currentConfig = tabConfigs[activeTab];

    // Fetch data
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(currentConfig.apiPath);
            const data = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
            setItems(data);
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    }, [currentConfig.apiPath]);

    useEffect(() => {
        fetchData();
        setSearchQuery('');
    }, [fetchData, activeTab]);

    // Filtered items
    const filteredItems = items.filter(item => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return item.name?.toLowerCase().includes(query) ||
            item.title?.toLowerCase().includes(query) ||
            item.workplace?.toLowerCase().includes(query);
    });

    // Open form modal
    const handleAdd = () => {
        const initialData = {};
        currentConfig.fields.forEach(f => initialData[f.name] = '');
        setFormData(initialData);
        setEditingItem(null);
        setShowFormModal(true);
    };

    const handleEdit = (item) => {
        const data = {};
        currentConfig.fields.forEach(f => data[f.name] = item[f.name] || '');
        setFormData(data);
        setEditingItem(item);
        setShowFormModal(true);
    };

    const handleDelete = (item) => {
        setItemToDelete(item);
        setShowDeleteModal(true);
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        const required = currentConfig.fields.filter(f => f.required);
        for (const field of required) {
            if (!formData[field.name]?.trim()) {
                toast.error(`Vui lòng nhập ${field.label}`);
                return;
            }
        }

        try {
            setSubmitting(true);
            if (editingItem) {
                await api.put(`${currentConfig.apiPath}/${editingItem.id}`, formData);
                toast.success('Cập nhật thành công');
            } else {
                await api.post(currentConfig.apiPath, formData);
                toast.success('Thêm mới thành công');
            }
            setShowFormModal(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Lỗi thao tác');
        } finally {
            setSubmitting(false);
        }
    };

    // Confirm delete
    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await api.delete(`${currentConfig.apiPath}/${itemToDelete.id}`);
            toast.success('Xóa thành công');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi xóa');
        } finally {
            setShowDeleteModal(false);
            setItemToDelete(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý danh mục</h1>
                    <p className="text-gray-500 text-sm mt-1">Lĩnh vực, thể loại, tác giả, nhà xuất bản</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-gray-200">
                {Object.entries(tabConfigs).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`px-5 py-3 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === key
                                ? 'border-black text-black'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {config.label}
                        </button>
                    );
                })}
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder={`Tìm kiếm ${currentConfig.label.toLowerCase()}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                        title="Làm mới"
                    >
                        <HiOutlineRefresh className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={handleAdd}
                        className="px-5 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-medium flex items-center gap-2"
                    >
                        <HiOutlinePlus className="w-5 h-5" />
                        Thêm mới
                    </button>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Tên</th>
                                {activeTab === 'authors' && (
                                    <>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Chức danh</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Nơi làm việc</th>
                                    </>
                                )}
                                {activeTab === 'publishers' && (
                                    <>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Địa chỉ</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Ngày thành lập</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Liên hệ</th>
                                    </>
                                )}
                                {['fields', 'genres'].includes(activeTab) && (
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Mô tả</th>
                                )}
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-16 text-center">
                                        <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : filteredItems.length > 0 ? (
                                filteredItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-500">#{item.id}</td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">{item.name}</p>
                                        </td>
                                        {activeTab === 'authors' && (
                                            <>
                                                <td className="px-6 py-4 text-sm text-gray-600">{item.title || '-'}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{item.workplace || '-'}</td>
                                            </>
                                        )}
                                        {activeTab === 'publishers' && (
                                            <>
                                                <td className="px-6 py-4 text-sm text-gray-600">{item.address || '-'}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {item.established_date ? new Date(item.established_date).toLocaleDateString('vi-VN') : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {item.phone && <div>{item.phone}</div>}
                                                    {item.email && <div className="text-xs text-gray-400">{item.email}</div>}
                                                    {!item.phone && !item.email && '-'}
                                                </td>
                                            </>
                                        )}
                                        {['fields', 'genres'].includes(activeTab) && (
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{item.description || '-'}</td>
                                        )}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="Sửa"
                                                >
                                                    <HiOutlinePencilAlt className="w-5 h-5 text-gray-500" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item)}
                                                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Xóa"
                                                >
                                                    <HiOutlineTrash className="w-5 h-5 text-red-500" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-16 text-center text-gray-500">
                                        Không có dữ liệu
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Form Modal */}
            {showFormModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900">
                                {editingItem ? `Sửa ${currentConfig.label}` : `Thêm ${currentConfig.label}`}
                            </h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {currentConfig.fields.map((field) => (
                                <div key={field.name}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {field.label}
                                        {field.required && <span className="text-red-500 ml-1">*</span>}
                                    </label>
                                    {field.type === 'textarea' ? (
                                        <textarea
                                            value={formData[field.name] || ''}
                                            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                                            placeholder={`Nhập ${field.label.toLowerCase()}`}
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            value={formData[field.name] || ''}
                                            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                                            placeholder={`Nhập ${field.label.toLowerCase()}`}
                                        />
                                    )}
                                </div>
                            ))}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowFormModal(false)}
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
                                    {submitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                    {editingItem ? 'Cập nhật' : 'Thêm mới'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title={`Xóa ${currentConfig.label}?`}
                message={`Bạn có chắc chắn muốn xóa "${itemToDelete?.name}"? Thao tác này không thể hoàn tác.`}
                confirmText="Xóa"
                cancelText="Hủy"
                type="danger"
            />
        </div>
    );
};

export default CategoryPage;
