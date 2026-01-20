/**
 * ===================================================================
 * FORGOT PASSWORD PAGE - Trang quên mật khẩu
 * ===================================================================
 * Design mới theo Figma:
 * - Layout split: phần trái đen với logo và form, phần phải trắng
 * - Form nhập email để reset mật khẩu
 * - Link đăng nhập
 * ===================================================================
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineMail } from 'react-icons/hi';
import { api } from '../../services';
import Logo from '../../components/Logo';

/**
 * ForgotPasswordPage Component
 */
const ForgotPasswordPage = () => {
    // Form state
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    /**
     * Xử lý submit form
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        // Validate
        if (!email.trim()) {
            setError('Vui lòng nhập email');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Email không hợp lệ');
            return;
        }

        setLoading(true);

        try {
            // Gọi API reset password
            await api.post('/auth/forgot-password', { email });

            setSuccess(true);
            toast.success('Yêu cầu đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra email.');
        } catch (err) {
            const errorMessage = err.message || 'Không thể gửi yêu cầu đặt lại mật khẩu';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* ===== LEFT SIDE - White background with forgot password form (50% width) ===== */}
            <div className="flex-1 lg:w-[50%] flex items-center justify-center p-8 lg:p-12 bg-white">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="flex justify-center mb-8">
                        <Logo className="w-[89px] h-[74px] text-black" />
                    </div>

                    {/* Title */}
                    <h1 className="text-[42px] font-bold text-black text-center mb-4 leading-tight">
                        Quên mật khẩu?
                    </h1>

                    {/* Subtitle */}
                    <p className="text-[17px] text-black text-center mb-8">
                        Nhập email của bạn để nhận link đặt lại mật khẩu
                    </p>

                    {/* Forgot Password Form */}
                    {success ? (
                        <div className="space-y-4">
                            <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm text-center">
                                <HiOutlineMail className="w-8 h-8 mx-auto mb-2 text-green-600" />
                                <p>Yêu cầu đặt lại mật khẩu đã được gửi đến email của bạn!</p>
                                <p className="mt-2 text-xs">Vui lòng kiểm tra hộp thư và làm theo hướng dẫn.</p>
                            </div>
                            <Link
                                to="/login"
                                className="block w-full bg-black text-white rounded-[15px] py-3 px-4 font-bold uppercase hover:bg-gray-800 transition-colors text-center"
                            >
                                Quay lại đăng nhập
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Error Message */}
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Email Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <div className="bg-white border border-gray-300 rounded-[12px] px-4 py-3 flex items-center">
                                    <HiOutlineMail className="w-5 h-5 text-gray-400 mr-2" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Email của bạn"
                                        className="flex-1 bg-transparent text-gray-700 placeholder:text-[#727272] outline-none text-base"
                                        autoComplete="email"
                                        disabled={loading}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-black text-white rounded-[15px] py-3 px-4 font-bold uppercase hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Đang gửi...</span>
                                    </>
                                ) : (
                                    'GỬI YÊU CẦU'
                                )}
                            </button>
                        </form>
                    )}

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-black text-sm">
                            Nhớ mật khẩu?{' '}
                            <Link to="/login" className="underline hover:no-underline font-medium">
                                Đăng nhập ngay
                            </Link>
                        </p>
                    </div>
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

            {/* ===== MOBILE VERSION ===== */}
            <div className="flex-1 lg:hidden flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mx-auto mb-4">
                            <Logo className="w-[89px] h-[74px] text-black" />
                        </div>
                        <h1 className="text-2xl font-bold">Quên mật khẩu?</h1>
                    </div>

                    {/* Mobile Form */}
                    {success ? (
                        <div className="space-y-4">
                            <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm text-center">
                                <HiOutlineMail className="w-8 h-8 mx-auto mb-2 text-green-600" />
                                <p>Yêu cầu đặt lại mật khẩu đã được gửi đến email của bạn!</p>
                                <p className="mt-2 text-xs">Vui lòng kiểm tra hộp thư và làm theo hướng dẫn.</p>
                            </div>
                            <Link
                                to="/login"
                                className="block w-full bg-black text-white rounded-[15px] py-3 px-4 font-medium hover:bg-gray-800 transition-colors text-center"
                            >
                                Quay lại đăng nhập
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Error Message */}
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Email Field */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <div className="bg-white border border-[#3D3D3D] rounded-xl px-4 py-3 flex items-center">
                                    <HiOutlineMail className="w-5 h-5 text-gray-400 mr-2" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Email của bạn"
                                        className="flex-1 bg-transparent text-gray-700 placeholder:text-[#727272] outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-black text-white rounded-[15px] py-3 px-4 font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Đang gửi...</span>
                                    </>
                                ) : (
                                    'GỬI YÊU CẦU'
                                )}
                            </button>
                        </form>
                    )}

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600 text-sm">
                            Nhớ mật khẩu?{' '}
                            <Link to="/login" className="text-black font-medium underline">
                                Đăng nhập ngay
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
