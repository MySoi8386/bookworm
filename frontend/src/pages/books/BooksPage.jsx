/**
 * ===================================================================
 * BOOKS PAGE - Trang quản lý sách
 * ===================================================================
 * Features:
 * - Hiển thị danh sách sách với filter và pagination
 * - CRUD operations với modals
 * - Filter theo lĩnh vực, thể loại
 * ===================================================================
 */

import { useState, useEffect, useCallback } from 'react';
import { getBooks, getBookById, deleteBook, getFields, getGenres } from '../../services/bookService';
import toast from 'react-hot-toast';
import {
    HiOutlineSearch,
    HiOutlinePlus,
    HiOutlineEye,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineRefresh,
    HiOutlineBookOpen,
    HiOutlineFilter,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineExclamation
} from 'react-icons/hi';
import { ConfirmModal, BookDetailModal, BookFormModal } from '../../components';

/**
 * BooksPage Component
 */
const BooksPage = () => {
    // Data state
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [fieldFilter, setFieldFilter] = useState('');
    const [genreFilter, setGenreFilter] = useState('');
    const [fields, setFields] = useState([]);
    const [genres, setGenres] = useState([]);
    const [showFilters, setShowFilters] = useState(false);

    // Modal states
    const [selectedBook, setSelectedBook] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [confirmModal, setConfirmModal] = useState({
        open: false,
        title: '',
        message: '',
        onConfirm: null
    });
    const [actionLoading, setActionLoading] = useState(false);

    /**
     * Fetch filters data
     */
    useEffect(() => {
        const loadFilters = async () => {
            try {
                const [fieldsRes, genresRes] = await Promise.all([
                    getFields(),
                    getGenres()
                ]);
                // Response có thể là { success, data } hoặc array trực tiếp
                const fieldsData = Array.isArray(fieldsRes?.data) ? fieldsRes.data : (Array.isArray(fieldsRes) ? fieldsRes : []);
                const genresData = Array.isArray(genresRes?.data) ? genresRes.data : (Array.isArray(genresRes) ? genresRes : []);
                setFields(fieldsData);
                setGenres(genresData);
            } catch (error) {
                console.error('Load filters error:', error);
            }
        };
        loadFilters();
    }, []);

    /**
     * Fetch books
     */
    const fetchBooks = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.page,
                limit: pagination.limit
            };

            if (searchQuery.trim()) {
                params.keyword = searchQuery.trim();
            }
            if (fieldFilter) {
                params.field_id = fieldFilter;
            }
            if (genreFilter) {
                params.genre_id = genreFilter;
            }

            const response = await getBooks(params);

            // API trả về { success: true, data: [...], pagination: {...} }
            // Interceptor đã unwrap response.data, nên response = { success, data, pagination }
            let booksData = [];
            let paginationData = {};

            if (response) {
                // Nếu response có property 'data' và là array
                if (Array.isArray(response.data)) {
                    booksData = response.data;
                    paginationData = response.pagination || {};
                }
                // Nếu response là array trực tiếp (fallback)
                else if (Array.isArray(response)) {
                    booksData = response;
                }
                // Nếu response có structure khác
                else if (response.success !== undefined && response.data) {
                    booksData = response.data;
                    paginationData = response.pagination || {};
                } else if (response.id || response.code) {
                    booksData = [response];
                }
            }

            setBooks(booksData);
            setPagination(prev => ({
                ...prev,
                total: paginationData.total || 0,
                totalPages: paginationData.totalPages || 0
            }));
        } catch (error) {
            console.error('Fetch books error:', error);
            toast.error('Không thể tải danh sách sách');
            setBooks([]);
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, searchQuery, fieldFilter, genreFilter]);

    useEffect(() => {
        fetchBooks();
    }, [fetchBooks]);

    // Reset page when filters change
    useEffect(() => {
        setPagination(prev => ({ ...prev, page: 1 }));
    }, [searchQuery, fieldFilter, genreFilter]);

    /**
     * Handle search with debounce
     */
    const [debouncedSearch, setDebouncedSearch] = useState('');
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchQuery(debouncedSearch);
        }, 300);
        return () => clearTimeout(timer);
    }, [debouncedSearch]);

    /**
     * View detail
     */
    const handleViewDetail = async (book) => {
        try {
            console.log('Fetching book detail for ID:', book.id);
            const bookData = await getBookById(book.id);
            console.log('Book detail response:', bookData);
            if (bookData && (bookData.id || bookData.code)) {
                setSelectedBook(bookData);
                setDetailModalOpen(true);
            } else {
                console.error('Invalid book data:', bookData);
                toast.error('Không tìm thấy thông tin sách');
            }
        } catch (error) {
            console.error('View detail error:', error);
            toast.error(error.response?.data?.message || error.message || 'Không thể tải chi tiết sách');
        }
    };

    /**
     * Edit book
     */
    const handleEdit = async (book) => {
        try {
            console.log('Fetching book for edit, ID:', book.id);
            const bookData = await getBookById(book.id);
            console.log('Book edit response:', bookData);
            if (bookData && (bookData.id || bookData.code)) {
                setEditingBook(bookData);
                setFormModalOpen(true);
            } else {
                console.error('Invalid book data for edit:', bookData);
                toast.error('Không tìm thấy thông tin sách');
            }
        } catch (error) {
            console.error('Edit book error:', error);
            toast.error(error.response?.data?.message || error.message || 'Không thể tải thông tin sách');
        }
    };

    /**
     * Delete book
     */
    const handleDelete = (book) => {
        setConfirmModal({
            open: true,
            title: 'Xóa sách',
            message: `Xác nhận xóa sách "${book.title}"? Hành động này không thể hoàn tác.`,
            onConfirm: async () => {
                try {
                    setActionLoading(true);
                    await deleteBook(book.id);
                    toast.success('Xóa sách thành công');
                    setConfirmModal({ ...confirmModal, open: false });
                    fetchBooks();
                } catch (error) {
                    toast.error(error.response?.data?.message || 'Lỗi xóa sách');
                } finally {
                    setActionLoading(false);
                }
            }
        });
    };

    /**
     * Create new book
     */
    const handleCreate = () => {
        setEditingBook(null);
        setFormModalOpen(true);
    };


    /**
     * Clear filters
     */
    const clearFilters = () => {
        setDebouncedSearch('');
        setSearchQuery('');
        setFieldFilter('');
        setGenreFilter('');
    };

    // Loading state
    if (loading && books.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* ===== HEADER ===== */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý sách</h1>
                    <p className="text-gray-500 text-sm mt-1">Quản lý danh mục sách trong thư viện</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-medium flex items-center gap-2 shadow-sm"
                >
                    <HiOutlinePlus className="w-5 h-5" />
                    Thêm sách
                </button>
            </div>

            {/* ===== SEARCH & FILTERS ===== */}
            <div className="space-y-4">
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                    {/* Search */}
                    <div className="relative flex-1 w-full lg:max-w-md">
                        <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm theo tên sách, mã sách..."
                            value={debouncedSearch}
                            onChange={(e) => setDebouncedSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                        />
                    </div>

                    {/* Filter toggle & Refresh */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-5 py-3 rounded-xl font-medium text-sm flex items-center gap-2 transition-all ${showFilters || fieldFilter || genreFilter
                                ? 'bg-black text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <HiOutlineFilter className="w-5 h-5" />
                            Bộ lọc
                            {(fieldFilter || genreFilter) && (
                                <span className="bg-white text-black text-xs px-2 py-0.5 rounded-full">
                                    {[fieldFilter, genreFilter].filter(Boolean).length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={fetchBooks}
                            disabled={loading}
                            className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                            title="Làm mới"
                        >
                            <HiOutlineRefresh className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="bg-gray-50 rounded-xl p-4 flex flex-wrap items-end gap-4">
                        <div className="min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Lĩnh vực</label>
                            <select
                                value={fieldFilter}
                                onChange={(e) => setFieldFilter(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                            >
                                <option value="">Tất cả lĩnh vực</option>
                                {fields.map(field => (
                                    <option key={field.id} value={field.id}>{field.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Thể loại</label>
                            <select
                                value={genreFilter}
                                onChange={(e) => setGenreFilter(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                            >
                                <option value="">Tất cả thể loại</option>
                                {genres.map(genre => (
                                    <option key={genre.id} value={genre.id}>{genre.name}</option>
                                ))}
                            </select>
                        </div>
                        {(fieldFilter || genreFilter) && (
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                Xóa bộ lọc
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* ===== TABLE ===== */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mã</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tên sách</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tác giả</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Lĩnh vực</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Thể loại</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Số bản</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {books.length > 0 ? (
                                books.map((book) => {
                                    return (
                                        <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="font-semibold text-gray-900">{book.code}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                                        <HiOutlineBookOpen className="w-4 h-4 text-gray-500" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-gray-900 text-sm truncate max-w-[250px]" title={book.title}>
                                                            {book.title}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {book.authors?.length > 0
                                                    ? book.authors.map(a => a.name).join(', ')
                                                    : '-'
                                                }
                                            </td>
                                            <td className="px-6 py-4">
                                                {book.field?.name ? (
                                                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                                        {book.field.name}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                {book.genre?.name ? (
                                                    <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                                                        {book.genre.name}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-sm">
                                                    <span className={`font-semibold ${(book.available_copies || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {book.available_copies || 0}
                                                    </span>
                                                    <span className="text-gray-400"> / {book.total_copies || 0}</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() => handleViewDetail(book)}
                                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                        title="Xem chi tiết"
                                                    >
                                                        <HiOutlineEye className="w-5 h-5 text-gray-500" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(book)}
                                                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <HiOutlinePencil className="w-5 h-5 text-blue-600" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(book)}
                                                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                                        title="Xóa"
                                                    >
                                                        <HiOutlineTrash className="w-5 h-5 text-red-600" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-16 text-center">
                                        <HiOutlineExclamation className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                        <p className="text-gray-500 font-medium">Không có sách nào</p>
                                        <p className="text-gray-400 text-sm mt-1">Thêm sách mới để bắt đầu</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                            Hiển thị {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} / {pagination.total}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                disabled={pagination.page <= 1}
                                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <HiOutlineChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="px-4 py-2 text-sm font-medium text-gray-700">
                                {pagination.page} / {pagination.totalPages}
                            </span>
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                disabled={pagination.page >= pagination.totalPages}
                                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <HiOutlineChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ===== MODALS ===== */}

            {/* Detail Modal */}
            <BookDetailModal
                isOpen={detailModalOpen}
                onClose={() => {
                    setDetailModalOpen(false);
                    setSelectedBook(null);
                }}
                book={selectedBook}
                onUpdate={() => {
                    fetchBooks();
                    // Reload selected book if needed
                    if (selectedBook) {
                        handleViewDetail(selectedBook);
                    }
                }}
            />

            {/* Form Modal (Create/Edit) */}
            <BookFormModal
                isOpen={formModalOpen}
                onClose={() => {
                    setFormModalOpen(false);
                    setEditingBook(null);
                }}
                onSuccess={fetchBooks}
                book={editingBook}
            />

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={confirmModal.open}
                onClose={() => setConfirmModal({ ...confirmModal, open: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type="danger"
                loading={actionLoading}
            />
        </div>
    );
};

export default BooksPage;
