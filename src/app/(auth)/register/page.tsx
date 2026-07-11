// app/(auth)/register/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    User,
    Mail,
    Phone,
    CreditCard,
    Upload,
    ArrowRight,
    X,
    Eye,
    EyeOff,
    Loader2,
} from 'lucide-react';

interface FormData {
    name: string;
    email: string;
    mobile: string;
    nidNo: string;
    password: string;
    confirmPassword: string;
    profileImage: string;
}

interface Errors {
    [key: string]: string;
}

const RegisterPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        mobile: '',
        nidNo: '',
        password: '',
        confirmPassword: '',
        profileImage: '',
    });

    const [errors, setErrors] = useState<Errors>({});

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                setErrors((prev) => ({ ...prev, profileImage: 'Only JPG, PNG, GIF, and WebP images are allowed' }));
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                setErrors((prev) => ({ ...prev, profileImage: 'Image must be less than 5MB' }));
                return;
            }

            setImageFile(file);
            setErrors((prev) => ({ ...prev, profileImage: '' }));

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadImageToImgBB = async (file: File): Promise<string> => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(
                `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            if (!response.ok) {
                throw new Error('Image upload failed');
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error?.message || 'Image upload failed');
            }

            return data.data.url;
        } catch (error) {
            console.error('Upload error:', error);
            throw new Error('Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Errors = {};

        if (!formData.name.trim()) newErrors.name = 'Full name is required';

        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';

        if (!formData.mobile.trim()) newErrors.mobile = 'Mobile number is required';
        else if (!/^01[3-9]\d{8}$/.test(formData.mobile)) newErrors.mobile = 'Invalid Bangladeshi mobile number';

        if (!formData.nidNo.trim()) newErrors.nidNo = 'NID number is required';
        else if (!/^\d{10,17}$/.test(formData.nidNo)) newErrors.nidNo = 'Invalid NID number (10-17 digits)';

        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        // ✅ Image is now OPTIONAL - no validation error

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            let imageUrl = '';
            if (imageFile) {
                imageUrl = await uploadImageToImgBB(imageFile);
            }

            // ✅ All users register as 'consumer' by default
            // ✅ No userType field needed
            const userData = {
                email: formData.email,
                password: formData.password,
                name: formData.name,
                mobile: formData.mobile,
                nidNo: formData.nidNo,
                profileImage: imageUrl,
                role: 'consumer', // ✅ Changed from 'consumer' to 'consumer'
                isActive: true,
            };

            console.log('📝 Sending registration data:', userData);

            const response = await fetch(`${API_URL}/api/auth/sign-up/email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();
            console.log('📦 Registration response:', data);

            if (!response.ok) {
                throw new Error(data.message || data.error?.message || 'Registration failed');
            }

            console.log('✅ Registration successful!');
            router.push('/login?registered=true');

        } catch (error: any) {
            console.error('❌ Registration failed:', error);
            setErrors((prev) => ({
                ...prev,
                email: error.message || 'Registration failed. Please try again.',
            }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-emerald-50 flex items-center justify-center px-4 py-8">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full border border-emerald-100">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-3">
                        <div className="bg-emerald-100 p-3 rounded-full">
                            <span className="text-3xl">⚡</span>
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-emerald-800">Create WZPDCL Account</h1>
                    <p className="text-gray-500 text-sm mt-1">Register for bill payment, complaints, and more</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Profile Image Upload - OPTIONAL now */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Profile Photo <span className="text-gray-400 text-xs">(Optional)</span>
                        </label>

                        {imagePreview ? (
                            <div className="relative flex items-center space-x-4 p-3 border border-emerald-200 rounded-lg bg-emerald-50">
                                <img
                                    src={imagePreview}
                                    alt="Profile preview"
                                    className="w-16 h-16 rounded-full object-cover"
                                />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600">{imageFile?.name}</p>
                                    <p className="text-xs text-gray-400">
                                        {(imageFile?.size && (imageFile.size / 1024).toFixed(1)) || '0'} KB
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImageFile(null);
                                        setImagePreview(null);
                                        setFormData((prev) => ({ ...prev, profileImage: '' }));
                                    }}
                                    className="text-red-500 hover:text-red-700 p-1"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors">
                                <Upload className="mx-auto text-gray-400" size={32} />
                                <p className="text-sm text-gray-600 mt-2">Click the button below to upload</p>
                                <p className="text-xs text-gray-400 mt-1">(Optional - You can skip this)</p>
                                <input
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                    onChange={handleFileChange}
                                    className="mt-3 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                                />
                                <p className="text-xs text-gray-400 mt-2">JPG, PNG, GIF, WebP (Max 5MB)</p>
                            </div>
                        )}
                        {errors.profileImage && <p className="text-red-500 text-xs mt-1">{errors.profileImage}</p>}
                        {uploading && <p className="text-emerald-600 text-xs mt-1">Uploading image...</p>}
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.name ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                placeholder="John Doe"
                            />
                        </div>
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email <span className="text-red-500">*</span>
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
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    {/* Mobile */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mobile Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="tel"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.mobile ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                placeholder="017XX-XXXXXX"
                            />
                        </div>
                        {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
                    </div>

                    {/* NID No */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            NID Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                name="nidNo"
                                value={formData.nidNo}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.nidNo ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                placeholder="12345678901234567"
                            />
                        </div>
                        {errors.nidNo && <p className="text-red-500 text-xs mt-1">{errors.nidNo}</p>}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full pl-4 pr-12 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.password ? 'border-red-500' : 'border-gray-200'
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
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`w-full pl-4 pr-12 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                placeholder="Re-enter password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className={`w-full py-2.5 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors ${loading || uploading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                <span>Creating Account...</span>
                            </>
                        ) : (
                            <>
                                <span>Create Account</span>
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                {/* Login Link */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    Already have an account?{' '}
                    <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
                        Sign in
                    </Link>
                </p>

                {/* Info Note */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700">
                        📌 By creating an account, you agree to our terms and conditions.
                        You will be registered as a <strong>consumer</strong>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;