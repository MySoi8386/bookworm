/**
 * ===================================================================
 * LOGIN PAGE - Trang đăng nhập
 * ===================================================================
 * Design mới theo Figma:
 * - Layout split: phần trái TRẮNG với form đăng nhập, phần phải ĐEN với khuyến khích đăng ký
 * - Form đăng nhập với username/password
 * - Link đăng ký và quên mật khẩu
 * ===================================================================
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import Logo from '../../components/Logo';

/**
 * LoginPage Component
 */
const LoginPage = () => {
    // Form state
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Hooks
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Redirect URL sau khi login (nếu có)
    const from = location.state?.from?.pathname || '/dashboard';

    // Nếu đã đăng nhập, redirect về dashboard
    useEffect(() => {
        if (isAuthenticated) {
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, from]);

    /**
     * Xử lý submit form
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate
        if (!username.trim()) {
            setError('Vui lòng nhập tên đăng nhập');
            return;
        }
        if (!password) {
            setError('Vui lòng nhập mật khẩu');
            return;
        }

        setLoading(true);

        try {
            await login(username, password);
            toast.success('Đăng nhập thành công!');
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.message || 'Đăng nhập thất bại');
            toast.error(err.message || 'Đăng nhập thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* ===== LEFT SIDE - White background with login form (70-75% width) ===== */}
            <div className="flex-1 lg:w-[50%] flex items-center justify-center p-8 lg:p-12 bg-white">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="flex justify-center mb-8">
                        <Logo className="w-[89px] h-[74px] text-black" />
                    </div>

                    {/* Title */}
                    <h1 className="text-[42px] font-bold text-black text-center mb-4 leading-tight">
                        Chào mừng bạn!
                    </h1>

                    {/* Subtitle */}
                    <p className="text-[17px] text-black text-center mb-8">
                        Hãy điền thông tin của bạn để đăng nhập
                    </p>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Username Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tên đăng nhập
                            </label>
                            <div className="bg-white border border-gray-300 rounded-[12px] px-4 py-3 flex items-center">
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Tên đăng nhập"
                                    className="flex-1 bg-transparent text-gray-700 placeholder:text-[#727272] outline-none text-base"
                                    autoComplete="username"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mật khẩu
                            </label>
                            <div className="bg-white border border-gray-300 rounded-[12px] px-4 py-3 flex items-center">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Mật khẩu"
                                    className="flex-1 bg-transparent text-gray-700 placeholder:text-[#727272] outline-none text-base"
                                    autoComplete="current-password"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="ml-2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? (
                                        <HiOutlineEyeOff className="w-5 h-5" />
                                    ) : (
                                        <HiOutlineEye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Forgot Password Link */}
                        <div className="flex justify-start">
                            <Link
                                to="/forgot-password"
                                className="text-black text-sm hover:underline"
                            >
                                Quên mật khẩu ?
                            </Link>
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
                                    <span>Đang đăng nhập...</span>
                                </>
                            ) : (
                                'Đăng nhập'
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* ===== RIGHT SIDE - Black background with registration prompt (25-30% width) ===== */}
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

                    {/* Call to Action */}
                    <p className="text-white text-sm mb-6">
                        Bạn là người mới ? Hãy đăng ký ngay!
                    </p>

                    {/* Register Button */}
                    <Link
                        to="/register"
                        className="inline-block w-full max-w-[185px] bg-transparent border border-white text-white rounded-[15px] py-3 px-4 font-bold uppercase hover:bg-white/10 transition-colors text-center"
                    >
                        ĐĂNG KÝ
                    </Link>
                </div>
            </div>

        </div>
    );
};

export default LoginPage;
