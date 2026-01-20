/**
 * ===================================================================
 * UNAUTHORIZED PAGE - Trang không có quyền truy cập
 * ===================================================================
 */

import { Link } from 'react-router-dom';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

const UnauthorizedPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center">
                <HiOutlineExclamationCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
                <h1 className="text-4xl font-bold text-gray-900 mb-2">403</h1>
                <h2 className="text-xl font-medium text-gray-700 mb-4">Không có quyền truy cập</h2>
                <p className="text-gray-500 mb-8">
                    Bạn không có quyền truy cập trang này.<br />
                    Vui lòng liên hệ quản trị viên nếu cần hỗ trợ.
                </p>
                <Link to="/dashboard" className="btn-primary">
                    Về trang chủ
                </Link>
            </div>
        </div>
    );
};

export default UnauthorizedPage;
