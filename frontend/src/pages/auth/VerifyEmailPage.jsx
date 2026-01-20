/**
 * ===================================================================
 * VERIFY EMAIL PAGE - Trang xác nhận email
 * ===================================================================
 * Xử lý xác nhận email khi người dùng click vào link trong email
 * ===================================================================
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services';
import toast from 'react-hot-toast';
import Logo from '../../components/Logo';
import { HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi';

/**
 * VerifyEmailPage Component
 */
const VerifyEmailPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const hasVerified = useRef(false); // Tránh gọi API nhiều lần

    useEffect(() => {
        if (token && !hasVerified.current) {
            hasVerified.current = true; // Đánh dấu đã gọi API
            verifyEmail();
        } else if (!token) {
            setError('Token không hợp lệ');
            setLoading(false);
        }
    }, [token]);

    const verifyEmail = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/auth/verify-email/${token}`);
            
            if (response.success) {
                setSuccess(true);
                toast.success('Email đã được xác nhận thành công!');
                
                // Redirect về login sau 3 giây
                setTimeout(() => {
                    navigate('/login', { replace: true });
                }, 3000);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Không thể xác nhận email';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* ===== LEFT SIDE - White background (50% width) ===== */}
            <div className="flex-1 lg:w-[50%] flex items-center justify-center p-8 lg:p-12 bg-white">
                <div className="w-full max-w-md text-center">
                    {loading ? (
                        <>
                            <div className="flex justify-center mb-8">
                                <Logo className="w-[89px] h-[74px] text-black" />
                            </div>
                            <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600">Đang xác nhận email...</p>
                        </>
                    ) : success ? (
                        <>
                            <div className="flex justify-center mb-8">
                                <Logo className="w-[89px] h-[74px] text-black" />
                            </div>
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <HiOutlineCheckCircle className="w-12 h-12 text-green-600" />
                            </div>
                            <h1 className="text-3xl font-bold text-black mb-4">
                                Xác nhận thành công!
                            </h1>
                            <p className="text-gray-600 mb-8">
                                Email của bạn đã được xác nhận. Tài khoản đã được kích hoạt.
                            </p>
                            <p className="text-sm text-gray-500 mb-6">
                                Bạn sẽ được chuyển đến trang đăng nhập trong giây lát...
                            </p>
                            <Link
                                to="/login"
                                className="inline-block w-full max-w-[200px] bg-black text-white rounded-[15px] py-3 px-4 font-bold uppercase hover:bg-gray-800 transition-colors"
                            >
                                Đăng nhập ngay
                            </Link>
                        </>
                    ) : (
                        <>
                            <div className="flex justify-center mb-8">
                                <Logo className="w-[89px] h-[74px] text-black" />
                            </div>
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <HiOutlineXCircle className="w-12 h-12 text-red-600" />
                            </div>
                            <h1 className="text-3xl font-bold text-black mb-4">
                                Xác nhận thất bại
                            </h1>
                            <p className="text-gray-600 mb-8">
                                {error || 'Link xác nhận không hợp lệ hoặc đã hết hạn.'}
                            </p>
                            <div className="space-y-3">
                                <Link
                                    to="/login"
                                    className="inline-block w-full max-w-[200px] bg-black text-white rounded-[15px] py-3 px-4 font-bold uppercase hover:bg-gray-800 transition-colors"
                                >
                                    Đăng nhập
                                </Link>
                                <Link
                                    to="/register"
                                    className="inline-block w-full max-w-[200px] text-black border border-gray-300 rounded-[15px] py-3 px-4 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Đăng ký lại
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ===== RIGHT SIDE - Black background with brand (50% width) ===== */}
            <div className="hidden lg:flex lg:w-[50%] bg-black items-center justify-center relative overflow-hidden">
                <div className="w-full max-w-[264px] px-4 text-center">
                    {/* Logo */}
                    <div className="flex justify-center mb-8">
                        <Logo className="w-[89px] h-[74px] text-white" />
                    </div>

                    {/* Brand Name */}
                    <h2 className="text-4xl font-bold text-white mb-2">
                        BookWorm
                    </h2>
                    <p className="text-xl text-white mb-12">
                        LIBRARY
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailPage;
