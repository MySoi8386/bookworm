/**
 * ===================================================================
 * APP COMPONENT - Entry point của React App
 * ===================================================================
 * Cấu hình:
 * - React Router với các routes
 * - AuthProvider cho quản lý authentication
 * - Toast notifications
 * ===================================================================
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { MainLayout, ProtectedRoute } from './components';
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  VerifyEmailPage,
  DashboardPage,
  BorrowingPage,
  BorrowPage,
  ReturnPage,
  BooksPage,
  MembersPage,
  FinancePage,
  StatisticsPage,
  SettingsPage,
  MyBooksPage,
  SearchPage,
  MyFinancePage,
  UnauthorizedPage,
  NotFoundPage,
  AdminPage,
  ProfilePage,
  NotificationPage,
  CategoryPage
} from './pages';

/**
 * App Component
 * Root component của ứng dụng
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ===== PUBLIC ROUTES ===== */}
          {/* Trang đăng nhập */}
          <Route path="/login" element={<LoginPage />} />

          {/* Trang đăng ký */}
          <Route path="/register" element={<RegisterPage />} />

          {/* Trang quên mật khẩu */}
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Trang đặt lại mật khẩu */}
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* Trang xác nhận email */}
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

          {/* Redirect root về dashboard hoặc login */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* ===== PROTECTED ROUTES ===== */}
          {/* Các trang yêu cầu đăng nhập */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard - Trang chủ */}
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* Hồ sơ cá nhân */}
            <Route path="/profile" element={<ProfilePage />} />

            {/* ===== STAFF ROUTES (Admin/Librarian) ===== */}
            {/* Mượn sách */}
            <Route path="/borrow" element={
              <ProtectedRoute roles={['admin', 'librarian']}>
                <BorrowPage />
              </ProtectedRoute>
            } />
            
            {/* Trả sách */}
            <Route path="/return" element={
              <ProtectedRoute roles={['admin', 'librarian']}>
                <ReturnPage />
              </ProtectedRoute>
            } />

            {/* Quản lý sách */}
            <Route path="/books" element={
              <ProtectedRoute roles={['admin', 'librarian']}>
                <BooksPage />
              </ProtectedRoute>
            } />

            {/* Quản lý thành viên */}
            <Route path="/members" element={
              <ProtectedRoute roles={['admin', 'librarian']}>
                <MembersPage />
              </ProtectedRoute>
            } />

            {/* Quản lý tài chính */}
            <Route path="/finance" element={
              <ProtectedRoute roles={['admin', 'librarian']}>
                <FinancePage />
              </ProtectedRoute>
            } />

            {/* Quản lý danh mục */}
            <Route path="/categories" element={
              <ProtectedRoute roles={['admin', 'librarian']}>
                <CategoryPage />
              </ProtectedRoute>
            } />

            {/* ===== ADMIN + LIBRARIAN ROUTES ===== */}
            {/* Thống kê / Báo cáo */}
            <Route path="/statistics" element={
              <ProtectedRoute roles={['admin', 'librarian']}>
                <StatisticsPage />
              </ProtectedRoute>
            } />

            {/* ===== ADMIN ONLY ROUTES ===== */}
            {/* Trang điều hành (Admin) */}
            <Route path="/admin" element={
              <ProtectedRoute roles={['admin']}>
                <AdminPage />
              </ProtectedRoute>
            } />

            {/* Alias /operations -> /admin (or same page) */}
            <Route path="/operations" element={
              <ProtectedRoute roles={['admin']}>
                <AdminPage />
              </ProtectedRoute>
            } />

            {/* Cài đặt */}
            <Route path="/settings" element={
              <ProtectedRoute roles={['admin']}>
                <SettingsPage />
              </ProtectedRoute>
            } />

            {/* Quản lý thông báo - Admin & Librarian */}
            <Route path="/notifications" element={
              <ProtectedRoute roles={['admin', 'librarian']}>
                <NotificationPage />
              </ProtectedRoute>
            } />

            {/* ===== READER ROUTES ===== */}
            {/* Sách của tôi */}
            <Route path="/my-books" element={<MyBooksPage />} />

            {/* Tìm sách */}
            <Route path="/search" element={<SearchPage />} />

            {/* Tài chính cá nhân */}
            <Route path="/my-finance" element={<MyFinancePage />} />
          </Route>

          {/* ===== ERROR ROUTES ===== */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>

      {/* ===== TOAST NOTIFICATIONS ===== */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '8px',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;
