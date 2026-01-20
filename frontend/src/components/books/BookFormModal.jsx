/**
 * ===================================================================
 * CREATE/EDIT BOOK MODAL - Modal tạo/sửa sách
 * ===================================================================
 */

import { useState, useEffect } from 'react';
import Modal from '../Modal';
import { api } from '../../services';
import toast from 'react-hot-toast';
import { HiOutlineX, HiOutlinePlus } from 'react-icons/hi';

const BookFormModal = ({ isOpen, onClose, onSuccess, book = null }) => {
    const isEdit = !!book;
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        code: '',
        title: '',
        field_id: '',
        genre_id: '',
        description: '',
        author_ids: [],
        // Initial edition data (for new books)
        publisher_id: '',
        publish_year: new Date().getFullYear(),
        isbn: '',
        initial_copies: 1
    });

    // Dropdown data
    const [fields, setFields] = useState([]);
    const [genres, setGenres] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [publishers, setPublishers] = useState([]);
    const [authorSearch, setAuthorSearch] = useState('');
    const [filteredAuthors, setFilteredAuthors] = useState([]);

    // Load dropdown data
    useEffect(() => {
        if (isOpen) {
            loadDropdownData();
        }
    }, [isOpen]);

    // Prefill form if editing
    useEffect(() => {
        if (book && isOpen) {
            setFormData({
                code: book.code || '',
                title: book.title || '',
                field_id: book.field_id || '',
                genre_id: book.genre_id || '',
                description: book.description || '',
                author_ids: book.authors?.map(a => a.id) || []
            });
        } else if (!isOpen) {
            setFormData({
                code: '', title: '', field_id: '', genre_id: '',
                description: '', author_ids: []
            });
        }
    }, [book, isOpen]);

    // Filter authors by search
    useEffect(() => {
        if (authorSearch.trim()) {
            const filtered = authors.filter(a =>
                a.name.toLowerCase().includes(authorSearch.toLowerCase()) &&
                !formData.author_ids.includes(a.id)
            );
            setFilteredAuthors(filtered.slice(0, 5));
        } else {
            setFilteredAuthors([]);
        }
    }, [authorSearch, authors, formData.author_ids]);

    const loadDropdownData = async () => {
        try {
            setLoading(true);
            const [fieldsRes, genresRes, authorsRes, publishersRes] = await Promise.all([
                api.get('/fields'),
                api.get('/genres'),
                api.get('/authors'),
                api.get('/publishers')
            ]);
            // Response có thể là { success, data } hoặc array trực tiếp
            const fieldsData = Array.isArray(fieldsRes?.data) ? fieldsRes.data : (Array.isArray(fieldsRes) ? fieldsRes : []);
            const genresData = Array.isArray(genresRes?.data) ? genresRes.data : (Array.isArray(genresRes) ? genresRes : []);
            const authorsData = Array.isArray(authorsRes?.data) ? authorsRes.data : (Array.isArray(authorsRes) ? authorsRes : []);
            const publishersData = Array.isArray(publishersRes?.data) ? publishersRes.data : (Array.isArray(publishersRes) ? publishersRes : []);
            setFields(fieldsData);
            setGenres(genresData);
            setAuthors(authorsData);
            setPublishers(publishersData);
        } catch (error) {
            console.error('Load dropdown error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddAuthor = (author) => {
        setFormData(prev => ({
            ...prev,
            author_ids: [...prev.author_ids, author.id]
        }));
        setAuthorSearch('');
        setFilteredAuthors([]);
    };

    const handleRemoveAuthor = (authorId) => {
        setFormData(prev => ({
            ...prev,
            author_ids: prev.author_ids.filter(id => id !== authorId)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.code.trim() || !formData.title.trim()) {
            toast.error('Vui lòng nhập mã và tên sách');
            return;
        }

        try {
            setSubmitting(true);

            const payload = {
                ...formData,
                field_id: formData.field_id || null,
                genre_id: formData.genre_id || null
            };

            if (isEdit) {
                await api.put(`/books/${book.id}`, payload);
                toast.success('Cập nhật sách thành công');
            } else {
                await api.post('/books', payload);
                toast.success('Tạo sách thành công');
            }

            onSuccess?.();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Lỗi lưu sách');
        } finally {
            setSubmitting(false);
        }
    };

    const getAuthorById = (id) => authors.find(a => a.id === id);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? 'Chỉnh sửa sách' : 'Thêm sách mới'}
            size="lg"
        >
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Code & Title */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mã sách <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                placeholder="VD: SACH001"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                                required
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tên sách <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Nhập tên sách"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                                required
                            />
                        </div>
                    </div>

                    {/* Field & Genre */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Lĩnh vực</label>
                            <select
                                name="field_id"
                                value={formData.field_id}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent bg-white"
                            >
                                <option value="">-- Chọn lĩnh vực --</option>
                                {fields.map(field => (
                                    <option key={field.id} value={field.id}>{field.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Thể loại</label>
                            <select
                                name="genre_id"
                                value={formData.genre_id}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent bg-white"
                            >
                                <option value="">-- Chọn thể loại --</option>
                                {genres.map(genre => (
                                    <option key={genre.id} value={genre.id}>{genre.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Page count & Size */}
                    {/* Authors */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tác giả</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={authorSearch}
                                onChange={(e) => setAuthorSearch(e.target.value)}
                                placeholder="Tìm và chọn tác giả..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                            />
                            {filteredAuthors.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                                    {filteredAuthors.map(author => (
                                        <button
                                            key={author.id}
                                            type="button"
                                            onClick={() => handleAddAuthor(author)}
                                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                                        >
                                            <HiOutlinePlus className="w-4 h-4 text-gray-400" />
                                            {author.title ? `${author.title} ` : ''}{author.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        {formData.author_ids.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {formData.author_ids.map(authorId => {
                                    const author = getAuthorById(authorId);
                                    return author ? (
                                        <span
                                            key={authorId}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm"
                                        >
                                            {author.name}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveAuthor(authorId)}
                                                className="hover:text-blue-900"
                                            >
                                                <HiOutlineX className="w-4 h-4" />
                                            </button>
                                        </span>
                                    ) : null;
                                })}
                            </div>
                        )}
                    </div>

                    {/* Initial Edition - Only for new books */}
                    {!isEdit && (
                        <div className="p-4 bg-blue-50 rounded-xl">
                            <h4 className="text-sm font-semibold text-blue-900 mb-3">Phiên bản xuất bản đầu tiên</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nhà xuất bản</label>
                                    <select
                                        name="publisher_id"
                                        value={formData.publisher_id}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent bg-white"
                                    >
                                        <option value="">-- Chọn NXB --</option>
                                        {publishers.map(pub => (
                                            <option key={pub.id} value={pub.id}>{pub.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Năm xuất bản</label>
                                    <input
                                        type="number"
                                        name="publish_year"
                                        value={formData.publish_year}
                                        onChange={handleChange}
                                        min="1900"
                                        max={new Date().getFullYear()}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">ISBN</label>
                                    <input
                                        type="text"
                                        name="isbn"
                                        value={formData.isbn}
                                        onChange={handleChange}
                                        placeholder="VD: 978-3-16-148410-0"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Số bản sách ban đầu</label>
                                    <input
                                        type="number"
                                        name="initial_copies"
                                        value={formData.initial_copies}
                                        onChange={handleChange}
                                        min="0"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Mô tả về sách..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                        />
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
                            {isEdit ? 'Cập nhật' : 'Thêm sách'}
                        </button>
                    </div>
                </form>
            )}
        </Modal>
    );
};

export default BookFormModal;
