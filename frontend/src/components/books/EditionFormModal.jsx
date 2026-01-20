/**
 * ===================================================================
 * EDITION FORM MODAL - Modal tạo phiên bản sách
 * ===================================================================
 */

import { useState, useEffect } from 'react';
import Modal from '../Modal';
import { bookService } from '../../services';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineOfficeBuilding } from 'react-icons/hi';

const EditionFormModal = ({ isOpen, onClose, onSuccess, bookId }) => {
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [publishers, setPublishers] = useState([]);
    const [showNewPublisher, setShowNewPublisher] = useState(false);

    const [formData, setFormData] = useState({
        publisher_id: '',
        publish_year: new Date().getFullYear(),
        isbn: ''
    });

    const [newPublisherData, setNewPublisherData] = useState({
        name: '',
        address: '',
        established_date: '',
        phone: '',
        email: ''
    });

    // Load publishers khi mở modal
    useEffect(() => {
        if (isOpen) {
            loadPublishers();
            setFormData({
                publisher_id: '',
                publish_year: new Date().getFullYear(),
                isbn: ''
            });
            setShowNewPublisher(false);
            setNewPublisherData({
                name: '',
                address: '',
                established_date: '',
                phone: '',
                email: ''
            });
        }
    }, [isOpen]);

    const loadPublishers = async () => {
        try {
            setLoading(true);
            const data = await bookService.getPublishers();
            const publishersData = Array.isArray(data) ? data : (data?.data || []);
            setPublishers(publishersData);
        } catch (error) {
            console.error('Load publishers error:', error);
            toast.error('Không thể tải danh sách nhà xuất bản');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNewPublisherChange = (e) => {
        const { name, value } = e.target;
        setNewPublisherData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreatePublisher = async () => {
        if (!newPublisherData.name.trim()) {
            toast.error('Vui lòng nhập tên nhà xuất bản');
            return;
        }

        try {
            setSubmitting(true);
            const response = await bookService.createPublisher(newPublisherData);
            const newPublisher = response?.data || response;
            
            toast.success('Đã thêm nhà xuất bản mới');
            await loadPublishers();
            
            // Tự động chọn publisher vừa tạo
            setFormData(prev => ({ ...prev, publisher_id: newPublisher.id }));
            setShowNewPublisher(false);
            setNewPublisherData({
                name: '',
                address: '',
                established_date: '',
                phone: '',
                email: ''
            });
        } catch (error) {
            console.error('Create publisher error:', error);
            toast.error(error.response?.data?.message || 'Không thể tạo nhà xuất bản');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.publisher_id) {
            toast.error('Vui lòng chọn nhà xuất bản');
            return;
        }

        if (!formData.publish_year) {
            toast.error('Vui lòng nhập năm xuất bản');
            return;
        }

        try {
            setSubmitting(true);
            await bookService.createEdition(bookId, formData);
            toast.success('Đã thêm phiên bản mới');
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Create edition error:', error);
            toast.error(error.response?.data?.message || 'Không thể tạo phiên bản');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Thêm phiên bản xuất bản"
            size="md"
        >
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Publisher Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nhà xuất bản <span className="text-red-500">*</span>
                        </label>
                        {!showNewPublisher ? (
                            <div className="space-y-2">
                                <select
                                    name="publisher_id"
                                    value={formData.publisher_id}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent bg-white"
                                    required
                                >
                                    <option value="">-- Chọn nhà xuất bản --</option>
                                    {publishers.map(publisher => (
                                        <option key={publisher.id} value={publisher.id}>
                                            {publisher.name}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setShowNewPublisher(true)}
                                    className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <HiOutlinePlus className="w-4 h-4" />
                                    Thêm nhà xuất bản mới
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                                <div className="flex items-center gap-2 text-blue-700 font-medium mb-2">
                                    <HiOutlineOfficeBuilding className="w-5 h-5" />
                                    Thông tin nhà xuất bản mới
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tên nhà xuất bản <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={newPublisherData.name}
                                        onChange={handleNewPublisherChange}
                                        placeholder="VD: Nhà xuất bản Giáo dục"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Địa chỉ
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={newPublisherData.address}
                                        onChange={handleNewPublisherChange}
                                        placeholder="Địa chỉ nhà xuất bản"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Ngày thành lập
                                        </label>
                                        <input
                                            type="date"
                                            name="established_date"
                                            value={newPublisherData.established_date}
                                            onChange={handleNewPublisherChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Số điện thoại
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={newPublisherData.phone}
                                            onChange={handleNewPublisherChange}
                                            placeholder="VD: 0123456789"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={newPublisherData.email}
                                        onChange={handleNewPublisherChange}
                                        placeholder="VD: contact@nxb.com"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                                    />
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={handleCreatePublisher}
                                        disabled={submitting || !newPublisherData.name.trim()}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                    >
                                        {submitting ? 'Đang tạo...' : 'Tạo nhà xuất bản'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowNewPublisher(false);
                                            setNewPublisherData({
                                                name: '',
                                                address: '',
                                                established_date: '',
                                                phone: '',
                                                email: ''
                                            });
                                        }}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Publish Year & ISBN */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Năm xuất bản <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="publish_year"
                                value={formData.publish_year}
                                onChange={handleChange}
                                min="1900"
                                max={new Date().getFullYear() + 1}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                ISBN
                            </label>
                            <input
                                type="text"
                                name="isbn"
                                value={formData.isbn}
                                onChange={handleChange}
                                placeholder="VD: 978-604-123-456-7"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                            />
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
                            disabled={submitting || showNewPublisher}
                            className="flex-1 px-4 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting && (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            )}
                            Thêm phiên bản
                        </button>
                    </div>
                </form>
            )}
        </Modal>
    );
};

export default EditionFormModal;
