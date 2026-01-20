/**
 * ===================================================================
 * PAGES INDEX - Export tất cả pages
 * ===================================================================
 */

// Auth pages
export { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage, VerifyEmailPage, ProfilePage } from './auth';

// Dashboard
export { DashboardPage } from './dashboard';

// Borrowing
export { BorrowingPage, BorrowPage, ReturnPage } from './borrowing';

// Books
export { BooksPage } from './books';

// Members
export { MembersPage } from './members';

// Finance
export { FinancePage } from './finance';

// Statistics
export { StatisticsPage } from './statistics';

// Settings
export { SettingsPage } from './settings';

// Admin
export { AdminPage } from './admin';

// Notifications
export { NotificationPage } from './notifications';

// Categories
export { CategoryPage } from './categories';

// Reader pages
export { MyBooksPage, SearchPage, MyFinancePage } from './reader';

// Error pages
export { default as UnauthorizedPage } from './UnauthorizedPage';
export { default as NotFoundPage } from './NotFoundPage';

