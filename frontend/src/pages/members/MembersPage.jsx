/**
 * ===================================================================
 * MEMBERS PAGE - Trang quản lý thành viên
 * ===================================================================
 * Features:
 * - Hiển thị danh sách thành viên với filter và pagination
 * - CRUD operations với modals
 * - Quản lý thẻ thư viện
 * - Khóa/mở khóa tài khoản
 * ===================================================================
 */

import { useState, useEffect, useCallback } from 'react';
import { getReaders, getReaderById, lockReader, unlockReader } from '../../services/memberService';
import toast from 'react-hot-toast';
import {
    HiOutlineSearch,
    HiOutlinePlus,
    HiOutlinePencil,
    HiOutlineRefresh,
    HiOutlineUser,
    HiOutlineFilter,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineExclamation,
    HiOutlineLockClosed,
    HiOutlineLockOpen,
    HiOutlineCreditCard
} from 'react-icons/hi';
import { ConfirmModal, MemberDetailModal, MemberFormModal, LibraryCardModal } from '../../components';

/**
 * MembersPage Component
 */
const MembersPage = () => {
    // Data state
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [accountStatusFilter, setAccountStatusFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Modal states
    const [selectedMember, setSelectedMember] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [cardModalOpen, setCardModalOpen] = useState(false);
    const [cardModalMember, setCardModalMember] = useState(null);
    const [confirmModal, setConfirmModal] = useState({
        open: false,
        title: '',
        message: '',
        type: 'warning',
        onConfirm: null
    });
    const [actionLoading, setActionLoading] = useState(false);

    /**
     * Fetch members
     */
    const fetchMembers = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.page,
                limit: pagination.limit
            };

            if (searchQuery.trim()) {
                params.keyword = searchQuery.trim();
            }
            if (statusFilter) {
                params.status = statusFilter;
            }
            if (accountStatusFilter) {
                params.account_status = accountStatusFilter;
            }

            const response = await getReaders(params);
            // Response có thể là { success, data, pagination } hoặc data trực tiếp
            const membersData = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
            const paginationData = response?.pagination || {};
            
            setMembers(membersData);
            setPagination(prev => ({
                ...prev,
                total: paginationData.total || 0,
                totalPages: paginationData.totalPages || 0
            }));
        } catch (error) {
            console.error('Fetch members error:', error);
            toast.error('Không thể tải danh sách thành viên');
            setMembers([]);
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, searchQuery, statusFilter, accountStatusFilter]);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    // Reset page when filters change
    useEffect(() => {
        setPagination(prev => ({ ...prev, page: 1 }));
    }, [searchQuery, statusFilter, accountStatusFilter]);

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
    const handleViewDetail = async (member) => {
        try {
            const memberData = await getReaderById(member.id);
            if (memberData) {
                setSelectedMember(memberData);
                setDetailModalOpen(true);
            } else {
                toast.error('Không tìm thấy thông tin thành viên');
            }
        } catch (error) {
            console.error('View detail error:', error);
            toast.error(error.response?.data?.message || 'Không thể tải chi tiết thành viên');
        }
    };

    /**
     * Edit member
     */
    const handleEdit = async (member) => {
        try {
            const memberData = await getReaderById(member.id);
            if (memberData) {
                setEditingMember(memberData);
                setFormModalOpen(true);
            } else {
                toast.error('Không tìm thấy thông tin thành viên');
            }
        } catch (error) {
            console.error('Edit member error:', error);
            toast.error('Không thể tải thông tin thành viên');
        }
    };


    /**
     * Lock/unlock member
     */
    const handleToggleLock = (member) => {
        const isLocked = member.account?.status === 'locked';
        setConfirmModal({
            open: true,
            title: isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản',
            message: isLocked
                ? `Xác nhận mở khóa tài khoản của "${member.full_name}"?`
                : `Xác nhận khóa tài khoản của "${member.full_name}"?`,
            type: isLocked ? 'success' : 'warning',
            onConfirm: async () => {
                try {
                    setActionLoading(true);
                    if (isLocked) {
                        await unlockReader(member.id);
                        toast.success('Mở khóa tài khoản thành công');
                    } else {
                        await lockReader(member.id);
                        toast.success('Khóa tài khoản thành công');
                    }
                    setConfirmModal({ ...confirmModal, open: false });
                    fetchMembers();
                } catch (error) {
                    toast.error(error.message || 'Lỗi thao tác');
                } finally {
                    setActionLoading(false);
                }
            }
        });
    };

    /**
     * Issue library card
     */
    const handleIssueCard = (member) => {
        setCardModalMember(member);
        setCardModalOpen(true);
    };

    /**
     * Create new member
     */
    const handleCreate = () => {
        setEditingMember(null);
        setFormModalOpen(true);
    };

    /**
     * Get status badge
     */
    const getAccountStatusBadge = (status) => {
        const statusMap = {
            active: { text: 'Hoạt động', color: 'bg-green-100 text-green-800' },
            pending: { text: 'Chờ kích hoạt', color: 'bg-yellow-100 text-yellow-800' },
            locked: { text: 'Đã khóa', color: 'bg-red-100 text-red-800' }
        };
        return statusMap[status] || { text: status || '-', color: 'bg-gray-100 text-gray-800' };
    };

    const getCardStatusBadge = (card) => {
        if (!card) return { text: 'Chưa có', color: 'bg-gray-100 text-gray-500' };

        // Kiểm tra nếu thẻ đã hết hạn dựa trên expiry_date
        const isExpired = card.expiry_date && new Date(card.expiry_date) < new Date();
        
        // Nếu thẻ đã hết hạn, hiển thị "Hết hạn" bất kể status
        if (isExpired) {
            return { text: 'Hết hạn', color: 'bg-orange-100 text-orange-800' };
        }

        const statusMap = {
            active: { text: 'Còn hạn', color: 'bg-green-100 text-green-800' },
            expired: { text: 'Hết hạn', color: 'bg-orange-100 text-orange-800' },
            locked: { text: 'Đã khóa', color: 'bg-red-100 text-red-800' }
        };
        return statusMap[card.status] || { text: card.card_number, color: 'bg-blue-100 text-blue-800' };
    };

    /**
     * Clear filters
     */
    const clearFilters = () => {
        setDebouncedSearch('');
        setSearchQuery('');
        setStatusFilter('');
        setAccountStatusFilter('');
    };

    // Loading state
    if (loading && members.length === 0) {
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
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý thành viên</h1>
                    <p className="text-gray-500 text-sm mt-1">Quản lý độc giả và thẻ thư viện</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-medium flex items-center gap-2 shadow-sm"
                >
                    <HiOutlinePlus className="w-5 h-5" />
                    Thêm thành viên
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
                            placeholder="Tìm theo tên, CMND, SĐT..."
                            value={debouncedSearch}
                            onChange={(e) => setDebouncedSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                        />
                    </div>

                    {/* Filter toggle & Refresh */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-5 py-3 rounded-xl font-medium text-sm flex items-center gap-2 transition-all ${showFilters || statusFilter || accountStatusFilter
                                    ? 'bg-black text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <HiOutlineFilter className="w-5 h-5" />
                            Bộ lọc
                            {(statusFilter || accountStatusFilter) && (
                                <span className="bg-white text-black text-xs px-2 py-0.5 rounded-full">
                                    {(statusFilter ? 1 : 0) + (accountStatusFilter ? 1 : 0)}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={fetchMembers}
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái thẻ</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                            >
                                <option value="">Tất cả</option>
                                <option value="active">Còn hạn</option>
                                <option value="expired">Hết hạn</option>
                                <option value="locked">Đã khóa</option>
                            </select>
                        </div>
                        <div className="min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái tài khoản</label>
                            <select
                                value={accountStatusFilter}
                                onChange={(e) => setAccountStatusFilter(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-black focus:border-transparent text-sm"
                            >
                                <option value="">Tất cả</option>
                                <option value="active">Hoạt động</option>
                                <option value="locked">Bị khóa</option>
                                <option value="inactive">Chưa kích hoạt</option>
                            </select>
                        </div>
                        {(statusFilter || accountStatusFilter) && (
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
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Thành viên</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">CMND/CCCD</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Liên hệ</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Tài khoản</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Thẻ TV</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {members.length > 0 ? (
                                members.map((member) => {
                                    const accountStatus = getAccountStatusBadge(member.account?.status);
                                    const cardStatus = getCardStatusBadge(member.libraryCard);
                                    return (
                                        <tr 
                                            key={member.id} 
                                            onClick={() => handleViewDetail(member)}
                                            className="hover:bg-gray-50 transition-colors cursor-pointer"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                                                        <HiOutlineUser className="w-5 h-5 text-gray-500" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-gray-900 text-sm">{member.full_name}</p>
                                                        <p className="text-xs text-gray-500">{member.title || 'Độc giả'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                                                {member.id_card_number || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-900">{member.phone || '-'}</p>
                                                <p className="text-xs text-gray-500 truncate max-w-[150px]" title={member.account?.email}>
                                                    {member.account?.email || '-'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${accountStatus.color}`}>
                                                    {accountStatus.text}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {member.libraryCard ? (
                                                    <div>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${cardStatus.color}`}>
                                                            {member.libraryCard.card_number}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleIssueCard(member);
                                                        }}
                                                        className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors"
                                                    >
                                                        + Cấp thẻ
                                                    </button>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => handleEdit(member)}
                                                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <HiOutlinePencil className="w-5 h-5 text-blue-600" />
                                                    </button>
                                                    {member.libraryCard && (
                                                        <button
                                                            onClick={() => {
                                                                setCardModalMember(member);
                                                                setCardModalOpen(true);
                                                            }}
                                                            className="p-2 hover:bg-indigo-100 rounded-lg transition-colors"
                                                            title="Sửa thẻ"
                                                        >
                                                            <HiOutlineCreditCard className="w-5 h-5 text-indigo-600" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleToggleLock(member)}
                                                        className={`p-2 rounded-lg transition-colors ${member.account?.status === 'locked'
                                                                ? 'hover:bg-green-100'
                                                                : 'hover:bg-yellow-100'
                                                            }`}
                                                        title={member.account?.status === 'locked' ? 'Mở khóa' : 'Khóa'}
                                                    >
                                                        {member.account?.status === 'locked' ? (
                                                            <HiOutlineLockOpen className="w-5 h-5 text-green-600" />
                                                        ) : (
                                                            <HiOutlineLockClosed className="w-5 h-5 text-yellow-600" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-16 text-center">
                                        <HiOutlineExclamation className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                        <p className="text-gray-500 font-medium">Không có thành viên nào</p>
                                        <p className="text-gray-400 text-sm mt-1">Thêm thành viên mới để bắt đầu</p>
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
            <MemberDetailModal
                isOpen={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                member={selectedMember}
            />

            {/* Form Modal (Create/Edit) */}
            <MemberFormModal
                isOpen={formModalOpen}
                onClose={() => {
                    setFormModalOpen(false);
                    setEditingMember(null);
                }}
                onSuccess={fetchMembers}
                member={editingMember}
            />

            {/* Library Card Modal */}
            <LibraryCardModal
                isOpen={cardModalOpen}
                onClose={() => {
                    setCardModalOpen(false);
                    setCardModalMember(null);
                }}
                onSuccess={fetchMembers}
                member={cardModalMember}
                card={cardModalMember?.libraryCard}
            />

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={confirmModal.open}
                onClose={() => setConfirmModal({ ...confirmModal, open: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                loading={actionLoading}
            />
        </div>
    );
};

export default MembersPage;
