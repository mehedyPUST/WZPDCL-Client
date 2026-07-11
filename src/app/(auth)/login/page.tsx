// app/(auth)/login/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Mail,
    Lock,
    ArrowRight,
    Eye,
    EyeOff,
    Loader2,
    CheckCircle,
    AlertCircle,
    Zap,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

const LoginPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [registered, setRegistered] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false,
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const error = searchParams.get('error');
        if (error) {
            setErrors((prev) => ({
                ...prev,
                email: `Authentication error: ${error.replace('_', ' ')}. Please try again.`,
            }));
        }
    }, [searchParams]);

    useEffect(() => {
        if (searchParams.get('registered') === 'true') {
            setRegistered(true);
            const timer = setTimeout(() => setRegistered(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [searchParams]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        setErrors({});

        try {
            console.log('🔍 Attempting login...');
            console.log('📧 Email:', formData.email);

            // ✅ Use authClient for Better Auth login
            const result = await authClient.signIn.email({
                email: formData.email,
                password: formData.password,
            });

            console.log('📦 Login result:', result);

            if (result.error) {
                console.error('❌ Login error:', result.error);
                throw new Error(result.error.message || 'Login failed');
            }

            console.log('✅ Login successful!');

            // ✅ Check if session exists
            const session = await authClient.getSession();
            console.log('📦 Session after login:', session);

            if (session.data) {
                console.log('✅ Session found, redirecting to dashboard');
                router.push('/');
            } else {
                console.log('⚠️ No session found after login');
                throw new Error('Session not established');
            }

        } catch (error: any) {
            console.error('❌ Login failed:', error);
            setErrors((prev) => ({
                ...prev,
                email: error.message || 'Invalid email or password. Please try again.',
            }));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = () => {
        setGoogleLoading(true);
        console.log('🔍 Starting Google Sign-In...');

        // ✅ Use Better Auth's social sign-in
        const redirectUrl = `${API_URL}/api/auth/sign-in/social?provider=google`;
        console.log('🔗 Redirecting to:', redirectUrl);
        window.location.href = redirectUrl;
    };

    const handleDemoLogin = () => {
        setFormData({
            email: 'demo@example.com',
            password: 'password123',
            rememberMe: false,
        });
    };

    return (
        <div className="min-h-screen bg-emerald-50 flex items-center justify-center px-4 py-8">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-emerald-100">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-3">
                        <div className="bg-emerald-100 p-3 rounded-full">
                            <Zap className="text-emerald-600" size={32} />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-emerald-800">Welcome Back</h1>
                    <p className="text-gray-500 text-sm mt-1">Sign in to your WZPDCL account</p>
                </div>

                {/* Success Message */}
                {registered && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
                        <CheckCircle size={18} className="text-green-600" />
                        <p className="text-sm text-green-700">
                            Registration successful! Please sign in.
                        </p>
                    </div>
                )}

                {/* Error Message */}
                {errors.email && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                        <AlertCircle size={18} className="text-red-600" />
                        <p className="text-sm text-red-700">{errors.email}</p>
                    </div>
                )}

                {/* Demo Login Hint */}
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700">
                        💡 Demo: Use <strong>demo@example.com</strong> / <strong>password123</strong>
                    </p>
                    <button
                        type="button"
                        onClick={handleDemoLogin}
                        className="text-xs text-blue-600 hover:text-blue-800 underline mt-1"
                    >
                        Click to fill demo credentials
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.email ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-12 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.password ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                placeholder="Min 8 characters"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                name="rememberMe"
                                checked={formData.rememberMe}
                                onChange={handleChange}
                                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                            />
                            <span className="text-sm text-gray-600">Remember me</span>
                        </label>
                        <Link href="/forgot-password" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                            Forgot password?
                        </Link>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-2.5 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                <span>Signing in...</span>
                            </>
                        ) : (
                            <>
                                <span>Sign In</span>
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-400">OR</span>
                    </div>
                </div>

                {/* Google Login Button */}
                <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading}
                    className={`w-full flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg transition-colors duration-200 ${googleLoading ? 'opacity-70 cursor-not-allowed bg-gray-100' : 'hover:bg-gray-50'
                        }`}
                >
                    {googleLoading ? (
                        <Loader2 size={20} className="animate-spin text-emerald-600" />
                    ) : (
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="#EA4335"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#34A853"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#4A90E2"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                    )}
                    <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
                </button>

                {/* Register Link */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    Don't have an account?{' '}
                    <Link href="/register" className="text-emerald-600 hover:text-emerald-700 font-medium">
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;