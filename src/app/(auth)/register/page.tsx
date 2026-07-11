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
    Search,
    CheckCircle,
    Package,
    MapPin,
    Zap,
    Calendar,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

interface FormData {
    name: string;
    email: string;
    mobile: string;
    nidNo: string;
    password: string;
    confirmPassword: string;
    profileImage: string;
}

interface MeterData {
    meterNo: string;
    consumerName: string;
    feederName: string;
    connectionDate: string;
    consumerType: string;
    address: string;
    mobile: string;
    email: string;
    initialReading: number;
}

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    // Meter search states
    const [searchMeterNo, setSearchMeterNo] = useState('');
    const [meterSearching, setMeterSearching] = useState(false);
    const [meterSearchResult, setMeterSearchResult] = useState<MeterData | null>(null);
    const [meterClaimed, setMeterClaimed] = useState(false);
    const [meterError, setMeterError] = useState<string | null>(null);
    const [claimedMeterNo, setClaimedMeterNo] = useState('');

    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        mobile: '',
        nidNo: '',
        password: '',
        confirmPassword: '',
        profileImage: '',
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                setErrors(prev => ({ ...prev, profileImage: 'Only JPG, PNG, GIF, and WebP images are allowed' }));
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, profileImage: 'Image must be less than 5MB' }));
                return;
            }
            setImageFile(file);
            setErrors(prev => ({ ...prev, profileImage: '' }));
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
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
                { method: 'POST', body: formData }
            );
            if (!response.ok) throw new Error('Image upload failed');
            const data = await response.json();
            if (!data.success) throw new Error(data.error?.message || 'Image upload failed');
            return data.data.url;
        } catch (error) {
            console.error('Upload error:', error);
            throw new Error('Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    // ✅ Search for meter
    const searchMeter = async () => {
        if (!searchMeterNo.trim()) {
            setMeterError('Please enter a meter number');
            return;
        }

        setMeterSearching(true);
        setMeterError(null);
        setMeterSearchResult(null);

        try {
            const response = await fetch(`${API_URL}/api/meters/search/${searchMeterNo.trim()}`);

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Meter not found');
            }

            const data = await response.json();
            setMeterSearchResult(data.data);
            setMeterError(null);
        } catch (error: any) {
            console.error('Search error:', error);
            setMeterError(error.message || 'Meter not found or already claimed');
            setMeterSearchResult(null);
        } finally {
            setMeterSearching(false);
        }
    };

    // ✅ Claim meter
    const claimMeter = async () => {
        if (!meterSearchResult) return;

        try {
            // Store claimed meter in localStorage to associate after registration
            setClaimedMeterNo(meterSearchResult.meterNo);
            localStorage.setItem('claimedMeter', meterSearchResult.meterNo);
            localStorage.setItem('claimedMeterData', JSON.stringify(meterSearchResult));

            setMeterClaimed(true);
            setMeterError(null);
            setSearchMeterNo('');
            setMeterSearchResult(null);

        } catch (error: any) {
            console.error('Claim error:', error);
            setMeterError(error.message || 'Failed to claim meter');
        }
    };

    // ✅ Remove claimed meter
    const removeClaimedMeter = () => {
        setMeterClaimed(false);
        setClaimedMeterNo('');
        localStorage.removeItem('claimedMeter');
        localStorage.removeItem('claimedMeterData');
    };

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};
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

            // Get claimed meter from localStorage
            const claimedMeter = localStorage.getItem('claimedMeter');
            const claimedMeterData = localStorage.getItem('claimedMeterData');
            let meterData = null;
            if (claimedMeterData) {
                try {
                    meterData = JSON.parse(claimedMeterData);
                } catch (e) {
                    console.error('Error parsing meter data:', e);
                }
            }

            const userData = {
                email: formData.email,
                password: formData.password,
                name: formData.name,
                mobile: formData.mobile,
                nidNo: formData.nidNo,
                profileImage: imageUrl,
                role: 'consumer',
                isActive: true,
                // If meter is claimed, include meter details
                meterNo: claimedMeter || '',
                feederName: meterData?.feederName || '',
                consumerType: meterData?.consumerType || 'residential',
                address: meterData?.address || '',
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

            // If meter was claimed, update the meter with the new user ID
            if (claimedMeter && data.data?.user?.id) {
                try {
                    await fetch(`${API_URL}/api/meters/claim`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            meterNo: claimedMeter,
                            consumerId: data.data.user.id,
                            consumerName: formData.name,
                            email: formData.email,
                            mobile: formData.mobile,
                        }),
                    });
                } catch (claimError) {
                    console.error('Meter claim error:', claimError);
                    // Continue even if claim fails - user is registered
                }
            }

            console.log('✅ Registration successful!');
            router.push('/login?registered=true');

        } catch (error: any) {
            console.error('❌ Registration failed:', error);
            setErrors(prev => ({
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

                {/* Claimed Meter Alert */}
                {meterClaimed && claimedMeterNo && (
                    <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <CheckCircle size={18} className="text-emerald-600" />
                            <p className="text-sm text-emerald-700">
                                ✅ Meter <strong>{claimedMeterNo}</strong> claimed! Complete registration to finalize.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={removeClaimedMeter}
                            className="text-red-500 hover:text-red-700 text-sm"
                        >
                            Remove
                        </button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Profile Image Upload - Optional */}
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
                                        setFormData(prev => ({ ...prev, profileImage: '' }));
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

                    {/* ✅ Meter Claim Section */}
                    <div className="border-t border-gray-200 pt-4">
                        <p className="text-sm font-medium text-gray-700 mb-3 flex items-center space-x-2">
                            <Search size={16} className="text-emerald-600" />
                            <span>Already have a meter? Search and claim it!</span>
                        </p>

                        {!meterClaimed ? (
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative flex-1">
                                    <Package size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Enter your meter number to search..."
                                        value={searchMeterNo}
                                        onChange={(e) => setSearchMeterNo(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={searchMeter}
                                    disabled={meterSearching}
                                    className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2 disabled:opacity-70"
                                >
                                    {meterSearching ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            <span>Searching...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Search size={18} />
                                            <span>Search</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <CheckCircle size={18} className="text-emerald-600" />
                                    <p className="text-sm text-emerald-700">
                                        Meter <strong>{claimedMeterNo}</strong> claimed successfully!
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={removeClaimedMeter}
                                    className="text-red-500 hover:text-red-700 text-sm"
                                >
                                    Change
                                </button>
                            </div>
                        )}

                        {/* Search Result */}
                        {meterSearchResult && (
                            <div className="mt-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-gray-800">{meterSearchResult.consumerName}</p>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                            <span className="text-gray-500">Meter:</span>
                                            <span className="font-medium text-emerald-700">{meterSearchResult.meterNo}</span>
                                            <span className="text-gray-500">Feeder:</span>
                                            <span>{meterSearchResult.feederName}</span>
                                            <span className="text-gray-500">Type:</span>
                                            <span className="capitalize">{meterSearchResult.consumerType}</span>
                                            <span className="text-gray-500">Connection:</span>
                                            <span>{new Date(meterSearchResult.connectionDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={claimMeter}
                                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2 whitespace-nowrap"
                                    >
                                        <CheckCircle size={18} />
                                        <span>Claim This Meter</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Meter Error */}
                        {meterError && (
                            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                                <X size={18} className="text-red-500" />
                                <p className="text-sm text-red-600">{meterError}</p>
                            </div>
                        )}

                        {!meterClaimed && !meterSearchResult && !meterError && (
                            <p className="text-xs text-gray-400 mt-2">
                                💡 Don't have a meter? You can still register and claim later from your dashboard.
                            </p>
                        )}
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
                        You will be registered as a <strong>Consumer</strong>.
                    </p>
                </div>
            </div>
        </div>
    );
}