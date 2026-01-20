/**
 * ===================================================================
 * SEARCH PAGE - Trang tìm kiếm sách
 * ===================================================================
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '../../services';
import toast from 'react-hot-toast';
import {
    HiOutlineSearch,
    HiOutlineBookOpen,
    HiOutlineFilter,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineExclamation,
    HiOutlineTag,
    HiOutlineUser,
    HiOutlineEye,
    HiOutlinePlus
} from 'react-icons/hi';
import { ReaderBorrowModal } from '../../components/reader';
import { BookDetailModal } from '../../components';

const SearchPage = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [fields, setFields] = useState([]);
    const [genres, setGenres] = useState([]);
    const [publishers, setPublishers] = useState([]);
    const [selectedField, setSelectedField] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('');
    const [selectedPublisher, setSelectedPublisher] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1, limit: 12, total: 0, totalPages: 0
    });

    // Modals
    const [selectedBook, setSelectedBook] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [borrowModalOpen, setBorrowModalOpen] = useState(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchQuery(debouncedSearch);
            setPagination(prev => ({ ...prev, page: 1 }));
        }, 300);
        return () => clearTimeout(timer);
    }, [debouncedSearch]);

    // Load filter options
    useEffect(() => {
        const loadFilters = async () => {
            try {
                const [fieldsRes, genresRes, publishersRes] = await Promise.all([
                    api.get('/fields'),
                    api.get('/genres'),
                    api.get('/publishers')
                ]);
                setFields(fieldsRes.data || []);
                setGenres(genresRes.data || []);
                setPublishers(publishersRes.data || []);
            } catch (error) {
                console.error('Load filters error:', error);
            }
        };
        loadFilters();
    }, []);

    // Fetch books
    const fetchBooks = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.page,
                limit: pagination.limit
            };
            if (searchQuery) params.keyword = searchQuery;
            if (selectedField) params.field_id = selectedField;
            if (selectedGenre) params.genre_id = selectedGenre;
            if (selectedPublisher) params.publisher_id = selectedPublisher;
            if (selectedYear) params.publish_year = selectedYear;

            const response = await api.get('/books', { params });
            // Response có thể là { success, data, pagination } hoặc data trực tiếp
            const booksData = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
            const paginationData = response?.pagination || {};

            setBooks(booksData);
            setPagination(prev => ({
                ...prev,
                total: paginationData.total || 0,
                totalPages: paginationData.totalPages || 0
            }));
        } catch (error) {
            console.error('Fetch books error:', error);
            toast.error('Không thể tải danh sách sách');
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, searchQuery, selectedField, selectedGenre, selectedPublisher, selectedYear]);

    useEffect(() => {
        fetchBooks();
    }, [fetchBooks]);

    // Reset page when filters change
    useEffect(() => {
        setPagination(prev => ({ ...prev, page: 1 }));
    }, [selectedField, selectedGenre, selectedPublisher, selectedYear]);

    const clearFilters = () => {
        setSelectedField('');
        setSelectedGenre('');
        setSelectedPublisher('');
        setSelectedYear('');
        setDebouncedSearch('');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Tìm kiếm sách</h1>
                <p className="text-gray-500 text-sm mt-1">Khám phá kho sách thư viện</p>
            </div>

            {/* Search & Filters */}
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm theo tên sách, mã sách, tác giả..."
                            value={debouncedSearch}
                            onChange={(e) => setDebouncedSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-5 py-3 rounded-xl font-medium text-sm flex items-center gap-2 transition-all ${showFilters || selectedField || selectedGenre
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        <HiOutlineFilter className="w-5 h-5" />
                        Bộ lọc
                    </button>
                </div>

                {showFilters && (
                    <div className="bg-gray-50 rounded-xl p-4 flex flex-wrap items-end gap-4">
                        <div className="min-w-[180px]">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Lĩnh vực</label>
                            <select
                                value={selectedField}
                                onChange={(e) => setSelectedField(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm"
                            >
                                <option value="">Tất cả</option>
                                {fields.map((f) => (
                                    <option key={f.id} value={f.id}>{f.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="min-w-[180px]">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Thể loại</label>
                            <select
                                value={selectedGenre}
                                onChange={(e) => setSelectedGenre(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm"
                            >
                                <option value="">Tất cả</option>
                                {genres.map((g) => (
                                    <option key={g.id} value={g.id}>{g.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="min-w-[180px]">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nhà xuất bản</label>
                            <select
                                value={selectedPublisher}
                                onChange={(e) => setSelectedPublisher(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm"
                            >
                                <option value="">Tất cả</option>
                                {publishers.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="min-w-[120px]">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Năm XB</label>
                            <input
                                type="number"
                                placeholder="VD: 2023"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                min="1900"
                                max={new Date().getFullYear()}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm"
                            />
                        </div>
                        {(selectedField || selectedGenre || selectedPublisher || selectedYear || debouncedSearch) && (
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                            >
                                Xóa bộ lọc
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Results count */}
            {!loading && (
                <p className="text-sm text-gray-500">
                    Tìm thấy <span className="font-semibold text-gray-900">{pagination.total}</span> kết quả
                </p>
            )}

            {/* Books Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="w-10 h-10 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
                </div>
            ) : books.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {books.map((book) => (
                        <div key={book.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                            {/* Book Cover Placeholder */}
                            <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                <HiOutlineBookOpen className="w-16 h-16 text-gray-300" />
                            </div>

                            {/* Book Info */}
                            <div className="p-4">
                                <p className="text-xs text-gray-500 font-mono mb-1">{book.code}</p>
                                <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2" title={book.title}>
                                    {book.title}
                                </h3>

                                {/* Authors */}
                                {book.authors?.length > 0 && (
                                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                                        <HiOutlineUser className="w-4 h-4 text-gray-400" />
                                        <span className="truncate">
                                            {book.authors.map(a => a.name).join(', ')}
                                        </span>
                                    </div>
                                )}

                                {/* Tags */}
                                <div className="flex flex-wrap gap-1.5 mt-3">
                                    {book.field && (
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                                            {book.field.name}
                                        </span>
                                    )}
                                    {book.genre && (
                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                                            {book.genre.name}
                                        </span>
                                    )}
                                </div>

                                {/* Availability */}
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                    <div className="flex items-center justify-between text-sm mb-3">
                                        <span className="text-gray-500">Còn lại:</span>
                                        <span className={`font-semibold ${(book.available_copies || 0) > 0 ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {book.available_copies || 0} / {book.total_copies || 0} bản
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedBook(book);
                                                setDetailModalOpen(true);
                                            }}
                                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                                        >
                                            <HiOutlineEye className="w-4 h-4" />
                                            Chi tiết
                                        </button>
                                        {(book.available_copies || 0) > 0 && (
                                            <button
                                                onClick={() => {
                                                    setSelectedBook(book);
                                                    setBorrowModalOpen(true);
                                                }}
                                                className="flex-1 px-3 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-1"
                                            >
                                                <HiOutlinePlus className="w-4 h-4" />
                                                Mượn
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
                    <HiOutlineExclamation className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium">Không tìm thấy sách nào</p>
                    <p className="text-gray-400 text-sm mt-1">Thử thay đổi từ khóa hoặc bộ lọc</p>
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={pagination.page <= 1}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <HiOutlineChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="px-4 py-2 text-sm font-medium text-gray-700">
                        Trang {pagination.page} / {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.page >= pagination.totalPages}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <HiOutlineChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Modals */}
            <BookDetailModal
                isOpen={detailModalOpen}
                onClose={() => {
                    setDetailModalOpen(false);
                    setSelectedBook(null);
                }}
                book={selectedBook}
                onBorrow={(book) => {
                    setDetailModalOpen(false); // Đóng modal chi tiết trước
                    setSelectedBook(book);
                    setBorrowModalOpen(true); // Mở modal mượn sách
                }}
                onUpdate={() => {
                    fetchBooks();
                }}
            />

            <ReaderBorrowModal
                isOpen={borrowModalOpen}
                onClose={() => {
                    setBorrowModalOpen(false);
                    setSelectedBook(null);
                }}
                onSuccess={() => {
                    fetchBooks();
                }}
                book={selectedBook}
            />
        </div>
    );
};

export default SearchPage;
