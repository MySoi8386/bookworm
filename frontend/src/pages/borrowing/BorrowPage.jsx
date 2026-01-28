import { useState, useEffect, useCallback } from 'react';
import {
   getBorrowRequests,
   getRejectedBorrowRequests,
   issueBooks,
   rejectBorrowRequest,
   getBorrowRequestById
} from '../../services/borrowService';
import toast from 'react-hot-toast';
import {
   HiOutlineSearch,
   HiOutlinePlus,
   HiOutlineEye,
   HiOutlineX,
   HiOutlineBookOpen,
   HiOutlineUserGroup,
   HiOutlineRefresh
} from 'react-icons/hi';
import { ConfirmModal, BorrowDetailModal, CreateBorrowModal } from '../../components';
import { useAuth } from '../../contexts/AuthContext';


const BorrowPage = () => {
   const [activeTab, setActiveTab] = useState('pending');
   const [borrowRequests, setBorrowRequests] = useState([]);
   const [loading, setLoading] = useState(true);
   const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
   const [searchQuery, setSearchQuery] = useState('');


   const [selectedRequest, setSelectedRequest] = useState(null);
   const [detailModalOpen, setDetailModalOpen] = useState(false);
   const [createModalOpen, setCreateModalOpen] = useState(false);
   const [confirmModal, setConfirmModal] = useState({ open: false, type: 'warning', title: '', message: '', onConfirm: null });
   const [actionLoading, setActionLoading] = useState(false);


   const { user } = useAuth();
   const isAdmin = user?.role === 'admin';


   const fetchData = useCallback(async () => {
       try {
           setLoading(true);
           const params = { page: pagination.page, limit: pagination.limit };
           const response = activeTab === 'rejected'
               ? await getRejectedBorrowRequests(params)
               : await getBorrowRequests({ ...params, status: activeTab === 'pending' ? 'pending,approved' : activeTab });
          
           const requestsData = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
          
           let requestsWithDetails = requestsData;
           if (requestsData.length > 0) {
                requestsWithDetails = await Promise.all(
                   requestsData.map(async (req) => {
                       try {
                           const detail = await getBorrowRequestById(req.id);
                           return detail || req;
                       } catch (error) { return req; }
                   })
               );
           }


           setBorrowRequests(requestsWithDetails);
           setPagination(prev => ({ ...prev, total: response?.pagination?.total || 0, totalPages: response?.pagination?.totalPages || 0 }));
       } catch (error) {
           console.error(error);
           toast.error('Lỗi tải danh sách');
       } finally {
           setLoading(false);
       }
   }, [activeTab, pagination.page, pagination.limit]);


   useEffect(() => { fetchData(); }, [fetchData]);
   useEffect(() => { setPagination(prev => ({ ...prev, page: 1 })); }, [activeTab]);


   const handleViewDetail = (request) => {
       setSelectedRequest(request);
       setDetailModalOpen(true);
   };


   const handleIssue = (request) => {
       setSelectedRequest(request);
       setConfirmModal({
           open: true, type: 'success', title: 'Xuất sách', message: `Xuất sách cho phiếu #${request.id}?`,
           onConfirm: async () => {
               try {
                   setActionLoading(true);
                   await issueBooks(request.id);
                   toast.success('Đã xuất sách');
                   setConfirmModal(prev => ({ ...prev, open: false }));
                   fetchData();
               } catch (error) { toast.error(error.response?.data?.message || 'Lỗi'); } finally { setActionLoading(false); }
           }
       });
   };


   const handleReject = (request) => {
       setSelectedRequest(request);
       setConfirmModal({
           open: true, type: 'danger', title: 'Từ chối', message: `Từ chối phiếu #${request.id}?`,
           onConfirm: async () => {
               try {
                   setActionLoading(true);
                   await rejectBorrowRequest(request.id, 'Nhân viên từ chối');
                   toast.success('Đã từ chối');
                   setConfirmModal(prev => ({ ...prev, open: false }));
                   fetchData();
               } catch (error) { toast.error(error.response?.data?.message || 'Lỗi'); } finally { setActionLoading(false); }
           }
       });
   };


   const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '-';

   const filteredRequests = borrowRequests.filter(req => {
       if (!searchQuery) return true;
       const q = searchQuery.toLowerCase();
       return req.libraryCard?.reader?.full_name?.toLowerCase().includes(q) || req.libraryCard?.card_number?.toLowerCase().includes(q);
   });


   return (
       <div className="space-y-6">
           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
               <div>
                   <h1 className="text-2xl font-bold text-gray-900">Quản lý mượn sách</h1>
                   <p className="text-gray-500 text-sm mt-1">Quản lý các phiếu mượn sách</p>
               </div>
               {!isAdmin && (
                   <button onClick={() => setCreateModalOpen(true)} className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-medium flex items-center gap-2 shadow-sm">
                       <HiOutlinePlus className="w-5 h-5" /> Tạo phiếu mượn
                   </button>
               )}
           </div>


           <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
               <div className="flex flex-wrap gap-2">
                   {[
                       { key: 'pending', label: 'Chờ duyệt' },
                       { key: 'borrowed', label: 'Đang mượn' },
                       { key: 'rejected', label: 'Huỷ' }
                   ].map(({ key, label }) => (
                       <button key={key} onClick={() => setActiveTab(key)} className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${activeTab === key ? 'bg-black text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                           {label}
                       </button>
                   ))}
               </div>
               <div className="flex items-center gap-3 w-full lg:w-auto">
                   <div className="relative flex-1 lg:w-72">
                       <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                       <input type="text" placeholder="Tìm kiếm..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent text-sm" />
                   </div>
                   <button onClick={fetchData} className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"><HiOutlineRefresh className="w-5 h-5 text-gray-600" /></button>
               </div>
           </div>


           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
               <div className="overflow-x-auto">
                   <table className="w-full">
                       <thead className="bg-gray-50 border-b border-gray-200">
                           <tr>
                               <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                               <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Độc giả</th>
                               <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-1/3">Tên sách</th>
                               <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{activeTab === 'borrowed' ? 'Ngày mượn' : 'Ngày tạo'}</th>
                               <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Hạn trả</th>
                               <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Thao tác</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100">
                           {filteredRequests.length > 0 ? filteredRequests.map(req => (
                                   <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                       <td className="px-6 py-4"><span className="font-semibold text-gray-900">#{req.id}</span></td>
                                       <td className="px-6 py-4">
                                           <div className="flex items-center gap-3">
                                               <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0"><HiOutlineUserGroup className="w-4 h-4 text-gray-500" /></div>
                                               <div>
                                                   <p className="font-medium text-gray-900 text-sm">{req.libraryCard?.reader?.full_name}</p>
                                                   <p className="text-xs text-gray-500">{req.libraryCard?.card_number}</p>
                                               </div>
                                           </div>
                                       </td>
                                       <td className="px-6 py-4">
                                           <div className="text-sm text-gray-900 font-medium line-clamp-2" title={req.details?.[0]?.bookCopy?.bookEdition?.book?.title}>
                                               {req.details?.[0]?.bookCopy?.bookEdition?.book?.title || 'Không rõ tên sách'}
                                           </div>
                                           {req.details?.length > 1 && <span className="text-xs text-gray-500 mt-1 block">+{req.details.length - 1} cuốn khác</span>}
                                       </td>
                                       <td className="px-6 py-4 text-sm text-gray-600">{formatDate(activeTab === 'borrowed' ? req.borrow_date : req.request_date)}</td>
                                       <td className="px-6 py-4 text-sm text-gray-600">{formatDate(req.due_date)}</td>
                                       <td className="px-6 py-4">
                                           <div className="flex items-center justify-center gap-1">
                                               <button onClick={() => handleViewDetail(req)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500" title="Chi tiết"><HiOutlineEye className="w-5 h-5" /></button>
                                               {/* Chỉ hiển thị nút Huỷ và Xuất sách ở tab Chờ duyệt */}
                                               {activeTab === 'pending' && !isAdmin && (
                                                   <>
                                                       <button onClick={() => handleReject(req)} className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600" title="Huỷ"><HiOutlineX className="w-5 h-5" /></button>
                                                       <button onClick={() => handleIssue(req)} className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600" title="Xuất sách"><HiOutlineBookOpen className="w-5 h-5" /></button>
                                                   </>
                                               )}
                                               {/* Tab Huỷ và Đang mượn chỉ có nút Detail */}
                                           </div>
                                       </td>
                                   </tr>
                               )) : (
                               <tr><td colSpan="6" className="px-6 py-16 text-center text-gray-500">Không có dữ liệu</td></tr>
                           )}
                       </tbody>
                   </table>
               </div>
           </div>


           <CreateBorrowModal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} onSuccess={fetchData} />
           <BorrowDetailModal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} borrowRequest={selectedRequest} activeTab={activeTab} />
           <ConfirmModal isOpen={confirmModal.open} onClose={() => setConfirmModal({ ...confirmModal, open: false })} onConfirm={confirmModal.onConfirm} title={confirmModal.title} message={confirmModal.message} type={confirmModal.type} loading={actionLoading} />
       </div>
   );
};


export default BorrowPage;
