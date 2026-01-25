/**
* ===================================================================
* DASHBOARD PAGE - Trang chủ theo thiết kế Figma "Admin Dashboard Form"
* ===================================================================
* Layout:
* - Background với gradient decorative shapes
* - Panel "Người mượn quá hạn" bên phải
* - Statistics cards và quick actions
* ===================================================================
*/


/**
* ===================================================================
* DASHBOARD PAGE - Trang chủ Admin/Thủ thư
* ===================================================================
* Layout:
* - Background với gradient decorative shapes
* - Panel "Người mượn quá hạn" bên phải (Dữ liệu thực tế)
* - Statistics cards và quick actions
* ===================================================================
*/


import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services';
// Import service lấy danh sách mượn
import borrowService, { getBorrowRequests } from '../../services/borrowService';
import toast from 'react-hot-toast';
import {
   HiOutlineBookOpen,
   HiOutlineUserGroup,
   HiOutlineExclamation,
   HiOutlineCurrencyDollar,
   HiOutlineArrowRight,
   HiOutlineSearch,
   HiOutlineEye
} from 'react-icons/hi';
import {
   Chart as ChartJS,
   ArcElement,
   Tooltip,
   Legend
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import React from 'react';


// Đăng ký các components của Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);


/**
* Helper: Tính số ngày quá hạn
*/
const calculateOverdueDays = (dueDate) => {
   if (!dueDate) return 0;
   const due = new Date(dueDate);
   const today = new Date();
   // Reset giờ về 0 để so sánh ngày
   due.setHours(0, 0, 0, 0);
   today.setHours(0, 0, 0, 0);


   if (today <= due) return 0;


   const diffTime = Math.abs(today - due);
   return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};


/**
* OverdueBorrowerCard - Card hiển thị người mượn quá hạn (Dữ liệu thật)
*/
const OverdueBorrowerCard = ({ data, onView }) => {
   const readerName = data.libraryCard?.reader?.full_name || 'Không rõ tên';
   const borrowedId = data.id;
   const daysOverdue = calculateOverdueDays(data.due_date);


   return (
       <div className="flex items-center gap-4 p-5 bg-red-50 border border-red-100 rounded-xl hover:shadow-md transition-all group">
           {/* Icon người dùng */}
           <div className="w-11 h-11 flex items-center justify-center shrink-0 bg-white rounded-lg border border-red-200 text-red-600 font-bold">
               {readerName.charAt(0)}
           </div>


           {/* Thông tin */}
           <div className="flex-1 min-w-0">
               <p className="font-semibold text-sm text-gray-900 truncate mb-0.5">{readerName}</p>
               <div className="flex items-center gap-2 text-xs">
                   <span className="text-gray-500">ID: #{borrowedId}</span>
                   <span className="text-red-600 font-bold">• Trễ {daysOverdue} ngày</span>
               </div>
           </div>


           {/* Nút xem chi tiết */}
           <button
               onClick={onView}
               className="p-2 bg-white hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors shrink-0 text-gray-600 shadow-sm"
               title="Xử lý trả sách"
           >
               <HiOutlineEye className="w-5 h-5" />
           </button>
       </div>
   );
};


// ... (Giữ nguyên component StatCard)
const StatCard = ({ title, value, icon, color = 'black', subtitle, link }) => {
   const colorClasses = {
       black: 'bg-black text-white',
       blue: 'bg-blue-600 text-white',
       green: 'bg-green-600 text-white',
       red: 'bg-red-600 text-white',
       yellow: 'bg-yellow-500 text-white',
   };


   const CardContent = (
       <div className="bg-white rounded-xl p-6 lg:p-8 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all w-full min-w-0">
           <div className="flex items-start justify-between mb-5 lg:mb-7">
               <div className={`w-12 h-12 lg:w-14 lg:h-14 ${colorClasses[color]} rounded-xl flex items-center justify-center shadow-sm shrink-0`}>
                   {icon && React.createElement(icon, { className: 'w-6 h-6 lg:w-7 lg:h-7' })}
               </div>
               {link && (
                   <span className="text-xs text-gray-500 font-medium flex items-center gap-1 transition-colors shrink-0">
                       Chi tiết <HiOutlineArrowRight className="w-3.5 h-3.5" />
                   </span>
               )}
           </div>
           <div className="min-w-0">
               <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 lg:mb-3 truncate">{value}</p>
               <p className="text-sm text-gray-600 font-medium truncate">{title}</p>
               {subtitle && <p className="text-xs text-gray-400 mt-2 line-clamp-2">{subtitle}</p>}
           </div>
       </div>
   );


   return link ? <Link to={link} className="block">{CardContent}</Link> : CardContent;
};


// ... (Giữ nguyên component BorrowingStatusChart)
const BorrowingStatusChart = ({ stats }) => {
   // Tính toán dữ liệu
   const activeBorrows = stats?.borrows?.activeBorrows || 0;
   const overdueBorrows = stats?.borrows?.overdueBorrows || 0;
   const totalCopies = stats?.books?.totalCopies || 0;
   const returnedBooks = stats?.borrows?.returnedBooks || 0;
   const onTimeBorrows = Math.max(0, activeBorrows - overdueBorrows);
   const availableBooks = Math.max(0, totalCopies - activeBorrows);


   const chartData = {
       labels: ['Đang mượn (đúng hạn)', 'Quá hạn', 'Có sẵn'],
       datasets: [{
           label: 'Số lượng sách',
           data: [onTimeBorrows, overdueBorrows, availableBooks],
           backgroundColor: ['rgba(234, 179, 8, 0.8)', 'rgba(239, 68, 68, 0.8)', 'rgba(59, 130, 246, 0.8)'],
           borderColor: ['rgba(234, 179, 8, 1)', 'rgba(239, 68, 68, 1)', 'rgba(59, 130, 246, 1)'],
           borderWidth: 2,
       }],
   };


   const options = {
       responsive: true,
       maintainAspectRatio: false,
       plugins: {
           legend: { position: 'bottom', labels: { padding: 15, usePointStyle: true, pointStyle: 'circle' } }
       }
   };


   return (
       <div className="bg-white rounded-xl p-6 lg:p-8 shadow-sm border border-gray-100 w-full min-w-0 overflow-hidden">
           <h3 className="text-lg font-semibold text-gray-900 mb-6 lg:mb-8">Thống kê mượn trả sách</h3>
           <div className="h-[280px] lg:h-[320px] mb-6 lg:mb-8 w-full min-w-0">
               <Pie data={chartData} options={options} />
           </div>
           <div className="mt-6 lg:mt-8 grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6 pt-4 lg:pt-6 border-t border-gray-200">
               <div className="text-center">
                   <div className="flex items-center justify-center gap-2 mb-1">
                       <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                       <span className="text-sm font-medium text-gray-700">Đúng hạn</span>
                   </div>
                   <p className="text-2xl font-bold text-gray-900">{onTimeBorrows}</p>
               </div>
               <div className="text-center">
                   <div className="flex items-center justify-center gap-2 mb-1">
                       <div className="w-3 h-3 rounded-full bg-red-500"></div>
                       <span className="text-sm font-medium text-gray-700">Quá hạn</span>
                   </div>
                   <p className="text-2xl font-bold text-red-600">{overdueBorrows}</p>
               </div>
               <div className="text-center">
                   <div className="flex items-center justify-center gap-2 mb-1">
                       <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                       <span className="text-sm font-medium text-gray-700">Có sẵn</span>
                   </div>
                   <p className="text-2xl font-bold text-gray-900">{availableBooks}</p>
               </div>
           </div>
           {returnedBooks > 0 && (
               <div className="mt-8 pt-8 border-t border-gray-200">
                   <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                       <div className="w-3 h-3 rounded-full bg-green-500"></div>
                       <span className="font-medium">Tổng số sách đã trả (lịch sử):</span>
                       <span className="text-lg font-bold text-gray-900">{returnedBooks.toLocaleString('vi-VN')}</span>
                   </div>
               </div>
           )}
       </div>
   );
};


// ... (Giữ nguyên component ReaderDashboard)
const ReaderDashboard = ({ user }) => {
   const [stats, setStats] = useState({ borrowed: 0, overdue: 0, fines: 0 });
   const [myBorrows, setMyBorrows] = useState([]);
   const [loading, setLoading] = useState(true);


   useEffect(() => {
       const fetchReaderData = async () => {
           try {
               setLoading(true);
               const res = await borrowService.getMyBorrowRequests();
               const requests = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
               let activeCount = 0;
               let overdueCount = 0;
               let finesAmount = 0;


               requests.forEach(req => {
                   if (['borrowed', 'overdue'].includes(req.status)) activeCount++;
                   if (req.status === 'overdue') overdueCount++;
                   if (req.fines?.length) req.fines.forEach(f => finesAmount += f.amount);
               });


               setStats({ borrowed: activeCount, overdue: overdueCount, fines: finesAmount });
               setMyBorrows(requests.slice(0, 5));
           } catch (error) { console.error(error); } finally { setLoading(false); }
       };
       fetchReaderData();
   }, []);


   if (loading) return <div className="p-8 text-center">Đang tải thông tin...</div>;


   return (
       <div className="space-y-8">
           <h1 className="text-2xl font-bold text-gray-900">Xin chào, {user?.reader?.full_name || user?.username}!</h1>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <StatCard title="Đang mượn" value={stats.borrowed} icon={HiOutlineBookOpen} color="blue" link="/my-books" />
               <StatCard title="Sách quá hạn" value={stats.overdue} icon={HiOutlineExclamation} color="red" link="/my-books?status=overdue" />
               <StatCard title="Nợ phí thư viện" value={`${stats.fines.toLocaleString('vi-VN')} VNĐ`} icon={HiOutlineCurrencyDollar} color="yellow" link="/my-finance" />
           </div>
           {/* Giữ nguyên phần Recent Borrows và Quick Suggestions */}
           <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
               <div className="flex items-center justify-between mb-6">
                   <h2 className="text-lg font-bold text-gray-900">Sách đang mượn gần đây</h2>
                   <Link to="/my-books" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                       Xem tất cả <HiOutlineArrowRight className="w-4 h-4" />
                   </Link>
               </div>
               <div className="space-y-4">
                   {myBorrows.length > 0 ? (
                       myBorrows.map(req => (
                           <div key={req.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                               <div>
                                   <p className="font-semibold text-gray-900">Phiếu #{req.id}</p>
                                   <p className="text-sm text-gray-500">Ngày mượn: {new Date(req.borrow_date).toLocaleDateString('vi-VN')}</p>
                                   <p className="text-sm text-gray-500">Hạn trả: {new Date(req.due_date).toLocaleDateString('vi-VN')}</p>
                               </div>
                               <span className={`px-3 py-1 rounded-full text-xs font-semibold ${req.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                   req.status === 'borrowed' ? 'bg-blue-100 text-blue-800' :
                                       'bg-gray-100 text-gray-800'
                                   }`}>
                                   {req.status === 'overdue' ? 'Quá hạn' : 'Đang mượn'}
                               </span>
                           </div>
                       ))
                   ) : (
                       <p className="text-gray-500 text-center py-4">Bạn chưa mượn cuốn sách nào.</p>
                   )}
               </div>
           </div>
       </div>
   );
};


/**
* DashboardPage Component Main
*/
const DashboardPage = () => {
   const { isStaff, user } = useAuth();
   const navigate = useNavigate(); // Hook để điều hướng


   const [loading, setLoading] = useState(true);
   const [stats, setStats] = useState(null);
   const [overdueItems, setOverdueItems] = useState([]);


   useEffect(() => {
       const fetchDashboardData = async () => {
           try {
               setLoading(true);


               if (isStaff()) {
                   let newStats = null;
                  
                   // 1. Fetch thống kê chung
                   try {
                       const statsResponse = await api.get('/statistics/dashboard');
                       newStats = statsResponse?.data || statsResponse;
                   } catch (err) {
                       console.error('Lỗi lấy thống kê dashboard', err);
                   }


                   // 2. Fetch danh sách QUÁ HẠN thực tế
                   // Thay vì gọi API statistics/overdue, ta gọi hàm getBorrowRequests
                   try {
                       const overdueRes = await getBorrowRequests({
                           page: 1,
                           limit: 5, // Lấy 5 người để hiển thị
                           status: 'overdue'
                       });


                       // Lấy danh sách thực tế
                       const overdueList = Array.isArray(overdueRes?.data)
                           ? overdueRes.data
                           : (Array.isArray(overdueRes) ? overdueRes : []);
                      
                       setOverdueItems(overdueList);


                       // CẬP NHẬT LẠI SỐ LIỆU THỐNG KÊ CHO CHÍNH XÁC
                       // Nếu lấy được danh sách quá hạn, ta cập nhật lại số lượng overdueBorrows
                       if (newStats && newStats.borrows) {
                           // Lấy tổng số lượng từ pagination nếu có, hoặc đếm mảng
                           const totalOverdue = overdueRes.pagination?.total || overdueList.length;
                           newStats.borrows.overdueBorrows = totalOverdue;
                       }


                   } catch (err) {
                       console.error('Lỗi lấy danh sách quá hạn', err);
                       setOverdueItems([]);
                   }


                   setStats(newStats);
               }
           } catch (error) {
               console.error('Dashboard error:', error);
           } finally {
               setLoading(false);
           }
       };


       if (isStaff()) {
           fetchDashboardData();
       } else {
           setLoading(false);
       }
   }, [isStaff]);


   // Handle view overdue item -> Chuyển sang trang Trả sách
   const handleViewOverdue = (item) => {
       navigate('/return');
   };


   if (!isStaff()) {
       return <ReaderDashboard user={user} />;
   }


   if (loading) {
       return (
           <div className="relative min-h-[calc(100vh-140px)]">
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
                   <div className="lg:col-span-2 space-y-6">
                       <div className="grid grid-cols-2 gap-4">
                           <div className="bg-white rounded-xl p-5 h-32 bg-gray-200"></div>
                           <div className="bg-white rounded-xl p-5 h-32 bg-gray-200"></div>
                       </div>
                   </div>
                   <div className="bg-white rounded-xl p-6 h-96 bg-gray-200"></div>
               </div>
           </div>
       );
   }


   return (
       <div className="relative min-h-[calc(100vh-140px)] w-full overflow-x-hidden">
           <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12">
               {/* ===== LEFT COLUMN (GIỮ NGUYÊN) ===== */}
               <div className="lg:col-span-2 space-y-8 lg:space-y-12 min-w-0">
                   {/* Additional Stats Row */}
                   <div className="mb-8 lg:mb-12">
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-7">
                           <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100 min-w-0">
                               <div className="flex items-center justify-between mb-4">
                                   <h3 className="text-sm font-semibold text-gray-700 truncate">Trạng thái phiếu mượn</h3>
                               </div>
                               <div className="space-y-2">
                                   {stats?.borrows?.borrowsByStatus && Object.entries(stats.borrows.borrowsByStatus).map(([status, count]) => (
                                       <div key={status} className="flex items-center justify-between text-sm">
                                           <span className="text-gray-600 capitalize">{status === 'pending' ? 'Chờ duyệt' : status === 'approved' ? 'Đã duyệt' : status === 'borrowed' ? 'Đang mượn' : status === 'returned' ? 'Đã trả' : status === 'overdue' ? 'Quá hạn' : status}</span>
                                           <span className="font-semibold text-gray-900">{count}</span>
                                       </div>
                                   ))}
                               </div>
                           </div>
                           <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100 min-w-0">
                               <div className="flex items-center justify-between mb-4">
                                   <h3 className="text-sm font-semibold text-gray-700 truncate">Trạng thái bản sách</h3>
                               </div>
                               <div className="space-y-2">
                                   {stats?.books?.copiesByStatus && Object.entries(stats.books.copiesByStatus).map(([status, count]) => (
                                       <div key={status} className="flex items-center justify-between text-sm">
                                           <span className="text-gray-600 capitalize">{status === 'available' ? 'Có sẵn' : status === 'borrowed' ? 'Đang mượn' : status === 'damaged' ? 'Hỏng' : status === 'disposed' ? 'Thanh lý' : status}</span>
                                           <span className="font-semibold text-gray-900">{count}</span>
                                       </div>
                                   ))}
                               </div>
                           </div>
                           <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100 min-w-0">
                               <div className="flex items-center justify-between mb-4">
                                   <h3 className="text-sm font-semibold text-gray-700 truncate">Hoạt động hôm nay</h3>
                               </div>
                               <div className="space-y-3">
                                   <div className="flex items-center justify-between">
                                       <span className="text-sm text-gray-600">Phiếu mượn mới</span>
                                       <span className="text-lg font-bold text-gray-900">{stats?.borrows?.borrowsToday || 0}</span>
                                   </div>
                                   <div className="flex items-center justify-between">
                                       <span className="text-sm text-gray-600">Sách đã trả</span>
                                       <span className="text-lg font-bold text-green-600">{stats?.borrows?.returnedBooks || 0}</span>
                                   </div>
                                   <div className="flex items-center justify-between">
                                       <span className="text-sm text-gray-600">Phiếu quá hạn</span>
                                       {/* SỐ LIỆU ĐÃ ĐƯỢC CẬP NHẬT TỪ API GETBORROWREQUESTS */}
                                       <span className="text-lg font-bold text-red-600">{stats?.borrows?.overdueBorrows || 0}</span>
                                   </div>
                               </div>
                           </div>
                       </div>
                   </div>


                   {/* Borrowing Status Chart */}
                   <div className="mb-8 lg:mb-12 w-full min-w-0">
                       <BorrowingStatusChart stats={stats} />
                   </div>


                   {/* Financial Stats */}
                   <div className="mb-8 lg:mb-12">
                       <h2 className="text-xl font-semibold text-gray-900 mb-6 lg:mb-8">Tài chính</h2>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-7">
                           <div className="bg-white rounded-xl p-6 lg:p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow min-w-0">
                               <div className="flex items-center justify-between mb-5 lg:mb-7">
                                   <h3 className="font-semibold text-base lg:text-lg text-gray-900 truncate">Tiền phạt chưa thu</h3>
                                   <Link to="/finance" className="text-xs lg:text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline shrink-0 ml-2">
                                       Xem tất cả
                                   </Link>
                               </div>
                               <p className="text-2xl lg:text-3xl font-bold text-red-600 mb-3 lg:mb-4 truncate">
                                   {(stats?.finances?.pendingFines || 0).toLocaleString('vi-VN')} VNĐ
                               </p>
                               <p className="text-sm text-gray-500 truncate">
                                   {/* SỐ LIỆU ĐÃ ĐƯỢC CẬP NHẬT */}
                                   {stats?.borrows?.overdueBorrows || 0} phiếu quá hạn
                               </p>
                           </div>


                           <div className="bg-white rounded-xl p-6 lg:p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow min-w-0">
                               <div className="flex items-center justify-between mb-5 lg:mb-7">
                                   <h3 className="font-semibold text-base lg:text-lg text-gray-900 truncate">Thu tháng này</h3>
                                   <span className="text-xs lg:text-sm text-green-600 font-medium flex items-center gap-1 shrink-0 ml-2">
                                       <HiOutlineArrowRight className="w-3 h-3 lg:w-4 lg:h-4 -rotate-45" />
                                       Tháng {new Date().getMonth() + 1}
                                   </span>
                               </div>
                               <p className="text-2xl lg:text-3xl font-bold text-green-600 mb-3 lg:mb-4 truncate">
                                   {(stats?.finances?.collectedFinesThisMonth || 0).toLocaleString('vi-VN')} VNĐ
                               </p>
                               <p className="text-sm text-gray-500 truncate">
                                   Đã thu trong tháng
                               </p>
                           </div>
                       </div>
                   </div>
               </div>


               {/* ===== RIGHT COLUMN - Overdue Borrowers Panel (ĐÃ CẬP NHẬT) ===== */}
               <div className="bg-white rounded-xl p-6 lg:p-8 shadow-sm border border-gray-100 h-fit lg:sticky lg:top-6 w-full min-w-0">
                   <div className="mb-6 pb-4 border-b border-gray-200 flex justify-between items-center">
                       <h2 className="text-lg font-bold text-gray-900">
                           Người mượn quá hạn
                       </h2>
                       {/* Hiển thị số lượng thực tế */}
                       <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full">
                           {overdueItems.length}
                       </span>
                   </div>


                   {/* DANH SÁCH NGƯỜI QUÁ HẠN THỰC TẾ */}
                   <div className="space-y-4">
                       {overdueItems.length > 0 ? (
                           overdueItems.map((item) => (
                               <OverdueBorrowerCard
                                   key={item.id}
                                   data={item} // Truyền toàn bộ object data
                                   onView={() => handleViewOverdue(item)}
                               />
                           ))
                       ) : (
                           <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                               <HiOutlineExclamation className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                               <p className="text-sm font-medium">Tuyệt vời!</p>
                               <p className="text-xs">Không có ai đang quá hạn sách.</p>
                           </div>
                       )}
                   </div>


                   {/* View All Link -> Dẫn sang trang Return tab overdue */}
                   {overdueItems.length >= 5 && (
                       <Link
                           to="/return"
                           className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-700 font-medium hover:text-red-600 hover:underline transition-colors pt-4 border-t border-gray-200"
                       >
                           Xem tất cả danh sách
                           <HiOutlineArrowRight className="w-4 h-4" />
                       </Link>
                   )}
               </div>
           </div>
       </div>
   );
};


export default DashboardPage;
