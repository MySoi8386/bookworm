/**
 * ===================================================================
 * RESET PASSWORD PAGE - Trang đặt lại mật khẩu
 * ===================================================================
 * Xử lý token từ email để đặt lại mật khẩu
 * ===================================================================
 */

import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineKey, HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi';
import { api } from '../../services';
import Logo from '../../components/Logo';

/**
 * ResetPasswordPage Component
 */
const ResetPasswordPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    /**
     * Xử lý đặt lại mật khẩu
     */
    const handleResetPassword = async () => {
        setError('');
        setLoading(true);

        try {
            await api.post('/auth/reset-password', { token });
            setSuccess(true);
            toast.success('Mật khẩu đã được đặt lại thành công!');
        } catch (err) {
            const errorMessage = err.message || 'Không thể đặt lại mật khẩu';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* ===== LEFT SIDE - White background with reset form (50% width) ===== */}
            <div className="flex-1 lg:w-[50%] flex items-center justify-center p-8 lg:p-12 bg-white">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="flex justify-center mb-8">
                        <Logo className="w-[89px] h-[74px] text-black" />
                    </div>

                    {/* Title */}
                    <h1 className="text-[42px] font-bold text-black text-center mb-4 leading-tight">
                        Đặt lại mật khẩu
                    </h1>

                    {/* Content based on state */}
                    {success ? (
                        <div className="space-y-6">
                            <div className="p-6 bg-green-50 border border-green-200 text-green-700 rounded-lg text-center">
                                <HiOutlineCheckCircle className="w-12 h-12 mx-auto mb-3 text-green-600" />
                                <h2 className="text-xl font-semibold mb-2">Thành công!</h2>
                                <p className="mb-2">Mật khẩu của bạn đã được đặt lại.</p>
                                <p className="text-sm bg-green-100 p-2 rounded font-mono">
                                    Mật khẩu mới: <strong>reader123</strong>
                                </p>
                                <p className="text-xs mt-3 text-green-600">
                                    Vui lòng đăng nhập và đổi mật khẩu ngay sau khi vào hệ thống.
                                </p>
                            </div>
                            <Link
                                to="/login"
                                className="block w-full bg-black text-white rounded-[15px] py-3 px-4 font-bold uppercase hover:bg-gray-800 transition-colors text-center"
                            >
                                Đăng nhập ngay
                            </Link>
                        </div>
                    ) : error ? (
                        <div className="space-y-6">
                            <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded-lg text-center">
                                <HiOutlineXCircle className="w-12 h-12 mx-auto mb-3 text-red-600" />
                                <h2 className="text-xl font-semibold mb-2">Lỗi!</h2>
                                <p>{error}</p>
                            </div>
                            <Link
                                to="/forgot-password"
                                className="block w-full bg-black text-white rounded-[15px] py-3 px-4 font-bold uppercase hover:bg-gray-800 transition-colors text-center"
                            >
                                Thử lại
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Subtitle */}
                            <p className="text-[17px] text-gray-600 text-center">
                                Nhấn nút bên dưới để đặt lại mật khẩu của bạn về mật khẩu mặc định.
                            </p>

                            <div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg text-sm">
                                <p className="font-medium mb-1">Lưu ý:</p>
                                <p>Sau khi đặt lại, mật khẩu của bạn sẽ là: <strong>reader123</strong></p>
                            </div>

                            {/* Reset Button */}
                            <button
                                onClick={handleResetPassword}
                                disabled={loading}
                                className="w-full bg-black text-white rounded-[15px] py-3 px-4 font-bold uppercase hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Đang xử lý...</span>
                                    </>
                                ) : (
                                    <>
                                        <HiOutlineKey className="w-5 h-5" />
                                        <span>Đặt lại mật khẩu</span>
                                    </>
                                )}
                            </button>
                        </div>
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
        </div>
    );
};

export default ResetPasswordPage;
