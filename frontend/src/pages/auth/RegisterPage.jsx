/**
 * ===================================================================
 * REGISTER PAGE - Trang đăng ký
 * ===================================================================
 * Design mới theo Figma:
 * - Layout split: phần trái đen với logo và form, phần phải trắng
 * - Form đăng ký với các trường thông tin
 * - Link đăng nhập
 * ===================================================================
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { api } from '../../services';
import Logo from '../../components/Logo';

/**
 * RegisterPage Component
 */
const RegisterPage = () => {
    // Form state
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        full_name: '',
        id_card_number: '',
        phone: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Hooks
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Nếu đã đăng nhập, redirect về dashboard
    if (isAuthenticated) {
        navigate('/dashboard', { replace: true });
        return null;
    }

    /**
     * Xử lý thay đổi input
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    /**
     * Xử lý submit form
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate
        if (!formData.username.trim()) {
            setError('Vui lòng nhập tên đăng nhập');
            return;
        }
        if (!formData.password) {
            setError('Vui lòng nhập mật khẩu');
            return;
        }
        if (formData.password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }
        if (!formData.email.trim()) {
            setError('Vui lòng nhập email');
            return;
        }
        if (!formData.full_name.trim()) {
            setError('Vui lòng nhập họ tên');
            return;
        }
        if (!formData.id_card_number.trim()) {
            setError('Vui lòng nhập số CMND/CCCD');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                username: formData.username,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                email: formData.email,
                full_name: formData.full_name,
                id_card_number: formData.id_card_number,
                phone: formData.phone || null,
                title: null
            };

            await api.post('/auth/register', payload);
            toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.');
            navigate('/login', { replace: true });
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Đăng ký thất bại';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* ===== LEFT SIDE - White background with register form (50% width) ===== */}
            <div className="flex-1 lg:w-[50%] flex items-center justify-center p-8 lg:p-12 bg-white overflow-y-auto">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="flex justify-center mb-8">
                        <Logo className="w-[89px] h-[74px] text-black" />
                    </div>

                    {/* Title */}
                    <h1 className="text-[42px] font-bold text-black text-center mb-4 leading-tight">
                        Đăng ký tài khoản
                    </h1>

                    {/* Subtitle */}
                    <p className="text-[17px] text-black text-center mb-8">
                        Hãy điền thông tin của bạn để đăng ký
                    </p>

                    {/* Register Form */}
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
                            <div className="bg-white border border-gray-300 rounded-[12px] px-4 py-3">
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Tên đăng nhập"
                                    className="w-full bg-transparent text-gray-700 placeholder:text-[#727272] outline-none text-base"
                                    autoComplete="username"
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <div className="bg-white border border-gray-300 rounded-[12px] px-4 py-3">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Email"
                                    className="w-full bg-transparent text-gray-700 placeholder:text-[#727272] outline-none text-base"
                                    autoComplete="email"
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        {/* Full Name Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Họ và tên
                            </label>
                            <div className="bg-white border border-gray-300 rounded-[12px] px-4 py-3">
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    placeholder="Họ và tên"
                                    className="w-full bg-transparent text-gray-700 placeholder:text-[#727272] outline-none text-base"
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        {/* ID Card Number Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Số CMND/CCCD
                            </label>
                            <div className="bg-white border border-gray-300 rounded-[12px] px-4 py-3">
                                <input
                                    type="text"
                                    name="id_card_number"
                                    value={formData.id_card_number}
                                    onChange={handleChange}
                                    placeholder="Số CMND/CCCD"
                                    className="w-full bg-transparent text-gray-700 placeholder:text-[#727272] outline-none text-base"
                                    disabled={loading}
                                    required
                                />
                            </div>
                        </div>

                        {/* Phone Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Số điện thoại
                            </label>
                            <div className="bg-white border border-gray-300 rounded-[12px] px-4 py-3">
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Số điện thoại"
                                    className="w-full bg-transparent text-gray-700 placeholder:text-[#727272] outline-none text-base"
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
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Mật khẩu"
                                    className="flex-1 bg-transparent text-gray-700 placeholder:text-[#727272] outline-none text-base"
                                    autoComplete="new-password"
                                    disabled={loading}
                                    required
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

                        {/* Confirm Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Xác nhận mật khẩu
                            </label>
                            <div className="bg-white border border-gray-300 rounded-[12px] px-4 py-3 flex items-center">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Xác nhận mật khẩu"
                                    className="flex-1 bg-transparent text-gray-700 placeholder:text-[#727272] outline-none text-base"
                                    autoComplete="new-password"
                                    disabled={loading}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="ml-2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? (
                                        <HiOutlineEyeOff className="w-5 h-5" />
                                    ) : (
                                        <HiOutlineEye className="w-5 h-5" />
                                    )}
                                </button>
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
                                    <span>Đang đăng ký...</span>
                                </>
                            ) : (
                                'ĐĂNG KÝ'
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-black text-sm">
                            Đã có tài khoản?{' '}
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
                        <h1 className="text-2xl font-bold">Đăng ký tài khoản</h1>
                    </div>

                    {/* Mobile Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tên đăng nhập
                            </label>
                            <div className="bg-white border border-[#3D3D3D] rounded-xl px-4 py-3">
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Tên đăng nhập"
                                    className="w-full bg-transparent text-gray-700 placeholder:text-[#727272] outline-none"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <div className="bg-white border border-[#3D3D3D] rounded-xl px-4 py-3">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Email"
                                    className="w-full bg-transparent text-gray-700 placeholder:text-[#727272] outline-none"
                                    required
                                />
                            </div>
                        </div>

                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Họ và tên
                            </label>
                            <div className="bg-white border border-[#3D3D3D] rounded-xl px-4 py-3">
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    placeholder="Họ và tên"
                                    className="w-full bg-transparent text-gray-700 placeholder:text-[#727272] outline-none"
                                    required
                                />
                            </div>
                        </div>

                        {/* ID Card */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Số CMND/CCCD
                            </label>
                            <div className="bg-white border border-[#3D3D3D] rounded-xl px-4 py-3">
                                <input
                                    type="text"
                                    name="id_card_number"
                                    value={formData.id_card_number}
                                    onChange={handleChange}
                                    placeholder="Số CMND/CCCD"
                                    className="w-full bg-transparent text-gray-700 placeholder:text-[#727272] outline-none"
                                    required
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Số điện thoại
                            </label>
                            <div className="bg-white border border-[#3D3D3D] rounded-xl px-4 py-3">
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Số điện thoại"
                                    className="w-full bg-transparent text-gray-700 placeholder:text-[#727272] outline-none"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mật khẩu
                            </label>
                            <div className="bg-white border border-[#3D3D3D] rounded-xl px-4 py-3 flex items-center">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Mật khẩu"
                                    className="flex-1 bg-transparent text-gray-700 placeholder:text-[#727272] outline-none"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="ml-2 text-gray-400"
                                >
                                    {showPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Xác nhận mật khẩu
                            </label>
                            <div className="bg-white border border-[#3D3D3D] rounded-xl px-4 py-3 flex items-center">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Xác nhận mật khẩu"
                                    className="flex-1 bg-transparent text-gray-700 placeholder:text-[#727272] outline-none"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="ml-2 text-gray-400"
                                >
                                    {showConfirmPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                                </button>
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
                                    <span>Đang đăng ký...</span>
                                </>
                            ) : (
                                'ĐĂNG KÝ'
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600 text-sm">
                            Đã có tài khoản?{' '}
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

export default RegisterPage;
