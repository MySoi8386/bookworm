/**
 * ===================================================================
 * NOT FOUND PAGE - Trang 404
 * ===================================================================
 */

import { Link } from 'react-router-dom';
import { HiOutlineDocumentSearch } from 'react-icons/hi';

const NotFoundPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="text-center">
                <HiOutlineDocumentSearch className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
                <h2 className="text-xl font-medium text-gray-700 mb-4">Không tìm thấy trang</h2>
                <p className="text-gray-500 mb-8">
                    Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
                </p>
                <Link to="/dashboard" className="btn-primary">
                    Về trang chủ
                </Link>
            </div>
        </div>
    );
};

export default NotFoundPage;
