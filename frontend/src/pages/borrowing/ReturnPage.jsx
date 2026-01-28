import { useState, useEffect, useCallback } from 'react';
import {
   getBorrowRequests,
   returnBooks,
   getBorrowRequestById
} from '../../services/borrowService';
import toast from 'react-hot-toast';
import {
   HiOutlineSearch,
   HiOutlineEye,
   HiOutlineRefresh,
   HiOutlineUserGroup,
   HiOutlineBookOpen,
   HiOutlineExclamation // Icon cảnh báo quá hạn
} from 'react-icons/hi';
import { BorrowDetailModal, ReturnBookModal } from '../../components';


// Config màu sắc
const STATUS_CONFIG = {
   pending: { text: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800', dotColor: 'bg-yellow-500' },
   approved: { text: 'Đã duyệt', color: 'bg-blue-100 text-blue-800', dotColor: 'bg-blue-500' },
   borrowed: { text: 'Đang mượn', color: 'bg-green-100 text-green-800', dotColor: 'bg-green-500' },
   returned: { text: 'Đã trả', color: 'bg-gray-100 text-gray-800', dotColor: 'bg-gray-500' },
   rejected: { text: 'Từ chối', color: 'bg-red-100 text-red-800', dotColor: 'bg-red-500' },
   overdue: { text: 'Quá hạn', color: 'bg-red-100 text-red-800', dotColor: 'bg-red-500' }
};


const ReturnPage = () => {
   const [activeTab, setActiveTab] = useState('borrowed');
   const [borrowRequests, setBorrowRequests] = useState([]);
   const [loading, setLoading] = useState(true);
   const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
   const [searchQuery, setSearchQuery] = useState('');


   const [selectedRequest, setSelectedRequest] = useState(null);
   const [detailModalOpen, setDetailModalOpen] = useState(false);
   const [returnModalOpen, setReturnModalOpen] = useState(false);
   const [actionLoading, setActionLoading] = useState(false);


   const fetchData = useCallback(async () => {
       try {
           setLoading(true);
           const params = { page: pagination.page, limit: pagination.limit, status: activeTab };
           const response = await getBorrowRequests(params);
          
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
           toast.error('Lỗi tải dữ liệu');
       } finally {
           setLoading(false);
       }
   }, [activeTab, pagination.page, pagination.limit]);


   useEffect(() => { fetchData(); }, [fetchData]);
   useEffect(() => { setPagination(prev => ({ ...prev, page: 1 })); }, [activeTab]);


   const handleOpenReturnModal = (request) => {
       setSelectedRequest(request);
       setReturnModalOpen(true);
   };


   const handleReturnConfirm = async (returns) => {
       try {
           setActionLoading(true);
           const result = await returnBooks(selectedRequest.id, returns);
           toast.success('Trả sách thành công');
           setReturnModalOpen(false);
           fetchData();
       } catch (error) {
           toast.error(error.response?.data?.message || 'Lỗi trả sách');
       } finally {
           setActionLoading(false);
       }
   };


   const handleViewDetail = (request) => {
       setSelectedRequest(request);
       setDetailModalOpen(true);
   };


   const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '-';
   const formatMoney = (v) => {
       const num = parseFloat(v);
       if (Number.isNaN(num)) return '-';
       const display = num % 1 === 0 ? Math.floor(num) : num;
       return `${display.toLocaleString('vi-VN')}₫`;
   };
  
   // Hàm tính số ngày quá hạn (tính cả ngày hôm nay)
   const getOverdueDays = (dueDate) => {
       if (!dueDate) return 0;
       const today = new Date();
       today.setHours(0, 0, 0, 0);
       const due = new Date(dueDate);
       due.setHours(0, 0, 0, 0);
       const diffTime = today - due;
       const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
       return diffDays > 0 ? diffDays : 0;
   };


   const getStatusBadge = (req) => {
       // Xử lý riêng cho tab Quá hạn để hiển thị số ngày
       if (req.status === 'overdue' || (activeTab === 'overdue')) {
           const days = getOverdueDays(req.due_date);
           return {
               text: `Quá hạn ${days} ngày`,
               color: 'bg-red-100 text-red-800',
               dotColor: 'bg-red-500',
               icon: <HiOutlineExclamation className="w-4 h-4 mr-1" />
           };
       }
       return STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
   };


   const filteredRequests = borrowRequests.filter(req => {
       if (!searchQuery) return true;
       const q = searchQuery.toLowerCase();
       return req.libraryCard?.reader?.full_name?.toLowerCase().includes(q) ||
              req.libraryCard?.card_number?.toLowerCase().includes(q);
   });


   return (
       <div className="space-y-6">
           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
               <div>
                   <h1 className="text-2xl font-bold text-gray-900">Quản lý trả sách</h1>
                   <p className="text-gray-500 text-sm mt-1">Xử lý trả sách và phạt quá hạn</p>
               </div>
           </div>


           <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
               <div className="flex flex-wrap gap-2">
                   {['borrowed', 'overdue', 'returned'].map(key => (
                       <button key={key} onClick={() => setActiveTab(key)} className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${activeTab === key ? 'bg-black text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                           {key === 'borrowed' ? 'Đang mượn' : key === 'overdue' ? 'Quá hạn' : 'Đã trả'}
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
                               <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ngày mượn</th>
                               <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{activeTab === 'returned' ? 'Ngày trả' : 'Hạn trả'}</th>
                               <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
                               <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Thao tác</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100">
                           {filteredRequests.length > 0 ? filteredRequests.map(req => {
                               const statusInfo = getStatusBadge(req);
                              
                               let bookIconClass = "w-5 h-5 cursor-pointer ";
                               if (req.status === 'borrowed') bookIconClass += "text-green-600 hover:text-green-800";
                               else if (req.status === 'overdue') bookIconClass += "text-red-600 hover:text-red-800";
                               else bookIconClass += "text-gray-400";


                               return (
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
                                           <div className="text-xs text-gray-500 mt-1">
                                               Mã: {req.details?.[0]?.bookCopy?.bookEdition?.book?.code || '-'}
                                               <span className="mx-2">•</span>
                                               Giá: {formatMoney(req.details?.[0]?.bookCopy?.price)}
                                           </div>
                                           {req.details?.length > 1 && <span className="text-xs text-gray-500 mt-1 block">+{req.details.length - 1} cuốn khác</span>}
                                       </td>
                                       <td className="px-6 py-4 text-sm text-gray-600">{formatDate(req.borrow_date)}</td>
                                       <td className="px-6 py-4 text-sm text-gray-600">
                                           {activeTab === 'returned' ? formatDate(req.details?.[0]?.actual_return_date) : formatDate(req.due_date)}
                                       </td>
                                       <td className="px-6 py-4">
                                           {/* Hiển thị badge trạng thái (có số ngày nếu quá hạn) */}
                                           <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                                               {statusInfo.icon ? statusInfo.icon : <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotColor}`}></span>}
                                               {statusInfo.text}
                                           </span>
                                       </td>
                                       <td className="px-6 py-4">
                                           <div className="flex items-center justify-center gap-1">
                                               <button onClick={() => handleViewDetail(req)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500" title="Chi tiết"><HiOutlineEye className="w-5 h-5" /></button>
                                              
                                               {(req.status === 'borrowed' || req.status === 'overdue') && (
                                                   <button
                                                       onClick={() => handleOpenReturnModal(req)}
                                                       className={`p-2 rounded-lg transition-colors ${req.status === 'overdue' ? 'hover:bg-red-100' : 'hover:bg-green-100'}`}
                                                       title="Trả sách"
                                                   >
                                                       <HiOutlineBookOpen className={bookIconClass} />
                                                   </button>
                                               )}
                                           </div>
                                       </td>
                                   </tr>
                               );
                           }) : (
                               <tr><td colSpan="7" className="px-6 py-16 text-center text-gray-500">Không có dữ liệu</td></tr>
                           )}
                       </tbody>
                   </table>
               </div>
           </div>


           <BorrowDetailModal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} borrowRequest={selectedRequest} activeTab={activeTab} />
           <ReturnBookModal
               isOpen={returnModalOpen}
               onClose={() => setReturnModalOpen(false)}
               onConfirm={handleReturnConfirm}
               borrowRequest={selectedRequest}
               loading={actionLoading}
           />
       </div>
   );
};


export default ReturnPage;
