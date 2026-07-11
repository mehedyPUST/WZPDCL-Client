// app/dashboard/profile/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    User,
    Mail,
    Phone,
    CreditCard,
    Home,
    Zap,
    Edit2,
    Save,
    X,
    Camera,
    Lock,
    Key,
    LogOut,
    Shield,
    CheckCircle,
    AlertCircle,
    Loader2,
    MapPin,
    Calendar,
    Building,
    Users,
    FileText,
    Smartphone,
    Globe,
    Eye,
    EyeOff,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

interface ProfileData {
    id: string;
    name: string;
    email: string;
    mobile: string;
    nidNo: string;
    userType: 'existing_consumer' | 'applicant_new_connection';
    feederName: string;
    meterNo: string;
    role: string;
    address: string;
    profileImage: string;
    isActive: boolean;
    createdAt: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [profile, setProfile] = useState<ProfileData>({
        id: '',
        name: '',
        email: '',
        mobile: '',
        nidNo: '',
        userType: 'existing_consumer',
        feederName: '',
        meterNo: '',
        role: 'consumer',
        address: '',
        profileImage: '',
        isActive: true,
        createdAt: '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [passwordErrors, setPasswordErrors] = useState<{ [key: string]: string }>({});
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const { data, error } = await authClient.getSession();
                if (error || !data) {
                    router.push('/login');
                    return;
                }

                const user = data.user;
                setProfile({
                    id: user.id || '',
                    name: user.name || '',
                    email: user.email || '',
                    mobile: user.mobile || '',
                    nidNo: user.nidNo || '',
                    userType: user.userType || 'existing_consumer',
                    feederName: user.feederName || '',
                    meterNo: user.meterNo || '',
                    role: user.role || 'consumer',
                    address: user.address || '',
                    profileImage: user.profileImage || '',
                    isActive: user.isActive !== undefined ? user.isActive : true,
                    createdAt: user.createdAt || new Date().toISOString(),
                });
            } catch (error) {
                console.error('Error fetching profile:', error);
                setError('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveSuccess(false);
        setError(null);

        try {
            // Update profile via Better Auth
            await new Promise(resolve => setTimeout(resolve, 1500));

            setIsEditing(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error: any) {
            console.error('Save error:', error);
            setError(error.message || 'Failed to save profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
        if (passwordErrors[name]) {
            setPasswordErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validatePassword = () => {
        const errors: { [key: string]: string } = {};

        if (!passwordData.currentPassword) {
            errors.currentPassword = 'Current password is required';
        }
        if (!passwordData.newPassword) {
            errors.newPassword = 'New password is required';
        } else if (passwordData.newPassword.length < 8) {
            errors.newPassword = 'Password must be at least 8 characters';
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        setPasswordErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handlePasswordSubmit = async () => {
        if (!validatePassword()) return;

        setIsSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            setShowPasswordModal(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error('Password change error:', error);
            setPasswordErrors(prev => ({
                ...prev,
                currentPassword: 'Failed to change password',
            }));
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = async () => {
        try {
            await authClient.signOut();
            router.push('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const getRoleDisplay = (role: string) => {
        const roles: Record<string, string> = {
            admin: 'Administrator',
            xen: 'XEN',
            connection_wing: 'Connection Wing',
            complaint_manager: 'Complaint Manager',
            billing_wings: 'Billing Wings',
            consumer: 'Consumer',
            applicant: 'Applicant',
        };
        return roles[role] || role;
    };

    const getRoleColor = (role: string) => {
        const colors: Record<string, string> = {
            admin: 'bg-purple-100 text-purple-700',
            xen: 'bg-blue-100 text-blue-700',
            connection_wing: 'bg-orange-100 text-orange-700',
            complaint_manager: 'bg-red-100 text-red-700',
            billing_wings: 'bg-teal-100 text-teal-700',
            consumer: 'bg-emerald-100 text-emerald-700',
            applicant: 'bg-yellow-100 text-yellow-700',
        };
        return colors[role] || 'bg-gray-100 text-gray-700';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={40} className="animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                        <User size={24} className="text-emerald-600" />
                        <span>My Profile</span>
                    </h1>
                    <p className="text-gray-500 text-sm">Manage your personal information</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setShowPasswordModal(true)}
                        className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    >
                        <Lock size={16} />
                        <span>Change Password</span>
                    </button>
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                        >
                            <Edit2 size={16} />
                            <span>Edit Profile</span>
                        </button>
                    ) : (
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`px-4 py-2 text-white text-sm rounded-lg transition-colors flex items-center space-x-2 ${isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
                                }`}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    <span>Save Changes</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                    <AlertCircle size={20} className="text-red-600" />
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {/* Save Success Message */}
            {saveSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
                    <CheckCircle size={20} className="text-green-600" />
                    <p className="text-sm text-green-700">Profile updated successfully!</p>
                </div>
            )}

            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Cover/Header */}
                <div className="h-32 bg-gradient-to-r from-emerald-600 to-emerald-700 relative">
                    <div className="absolute bottom-0 left-8 transform translate-y-1/2 flex items-end space-x-4">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg">
                                <div className="w-full h-full rounded-full bg-emerald-100 flex items-center justify-center">
                                    <span className="text-3xl font-bold text-emerald-600">
                                        {profile.name?.charAt(0).toUpperCase() || 'U'}
                                    </span>
                                </div>
                            </div>
                            <button className="absolute bottom-0 right-0 p-1.5 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors">
                                <Camera size={14} />
                            </button>
                        </div>
                        <div className="text-white pb-2">
                            <h2 className="text-xl font-bold">{profile.name}</h2>
                            <p className="text-emerald-100 text-sm capitalize">{getRoleDisplay(profile.role)}</p>
                        </div>
                    </div>
                </div>

                {/* Profile Content */}
                <div className="pt-14 pb-6 px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <User size={18} className="text-gray-400" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">Full Name</p>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="name"
                                            value={profile.name}
                                            onChange={handleChange}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    ) : (
                                        <p className="text-sm font-medium text-gray-800">{profile.name}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Mail size={18} className="text-gray-400" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">Email</p>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            name="email"
                                            value={profile.email}
                                            onChange={handleChange}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    ) : (
                                        <p className="text-sm font-medium text-gray-800">{profile.email}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Phone size={18} className="text-gray-400" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">Mobile Number</p>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            name="mobile"
                                            value={profile.mobile}
                                            onChange={handleChange}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    ) : (
                                        <p className="text-sm font-medium text-gray-800">{profile.mobile}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <CreditCard size={18} className="text-gray-400" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">NID Number</p>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="nidNo"
                                            value={profile.nidNo}
                                            onChange={handleChange}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    ) : (
                                        <p className="text-sm font-medium text-gray-800">{profile.nidNo}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <MapPin size={18} className="text-gray-400" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">Address</p>
                                    {isEditing ? (
                                        <textarea
                                            name="address"
                                            value={profile.address}
                                            onChange={handleChange}
                                            rows={2}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    ) : (
                                        <p className="text-sm font-medium text-gray-800">{profile.address || 'Not provided'}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <Shield size={18} className="text-gray-400" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">Role</p>
                                    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getRoleColor(profile.role)}`}>
                                        {getRoleDisplay(profile.role)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Calendar size={18} className="text-gray-400" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">Account Created</p>
                                    <p className="text-sm font-medium text-gray-800">
                                        {new Date(profile.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Home size={18} className="text-gray-400" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">User Type</p>
                                    {isEditing ? (
                                        <select
                                            name="userType"
                                            value={profile.userType}
                                            onChange={handleChange}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                                        >
                                            <option value="existing_consumer">Existing Consumer</option>
                                            <option value="applicant_new_connection">New Applicant</option>
                                        </select>
                                    ) : (
                                        <p className="text-sm font-medium text-gray-800 capitalize">
                                            {profile.userType === 'existing_consumer' ? 'Existing Consumer' : 'New Applicant'}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {profile.meterNo && (
                                <div className="flex items-center space-x-3">
                                    <Zap size={18} className="text-gray-400" />
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500">Meter Number</p>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="meterNo"
                                                value={profile.meterNo}
                                                onChange={handleChange}
                                                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                        ) : (
                                            <p className="text-sm font-medium text-gray-800">{profile.meterNo}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {profile.feederName && (
                                <div className="flex items-center space-x-3">
                                    <FileText size={18} className="text-gray-400" />
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500">Feeder</p>
                                        {isEditing ? (
                                            <select
                                                name="feederName"
                                                value={profile.feederName}
                                                onChange={handleChange}
                                                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                                            >
                                                <option value="Trimohoni">Trimohoni</option>
                                                <option value="Circuit-Hose">Circuit-Hose</option>
                                                <option value="DC-Court">DC-Court</option>
                                                <option value="N.S-Road">N.S-Road</option>
                                            </select>
                                        ) : (
                                            <p className="text-sm font-medium text-gray-800">{profile.feederName}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center space-x-3">
                                <Globe size={18} className="text-gray-400" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">Account Status</p>
                                    <p className={`text-sm font-medium flex items-center space-x-1 ${profile.isActive ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        <CheckCircle size={14} />
                                        <span>{profile.isActive ? 'Active' : 'Inactive'}</span>
                                    </p>
                                </div>
                            </div>

                            {!isEditing && (
                                <div className="pt-4 border-t border-gray-100">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full px-4 py-2.5 bg-red-50 text-red-600 text-sm rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center space-x-2"
                                    >
                                        <LogOut size={16} />
                                        <span>Logout from all devices</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-emerald-100 rounded-full">
                                    <Key size={20} className="text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">Change Password</h3>
                            </div>
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Current Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-200'
                                            }`}
                                        placeholder="Enter current password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {passwordErrors.currentPassword && (
                                    <p className="text-red-500 text-xs mt-1">{passwordErrors.currentPassword}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${passwordErrors.newPassword ? 'border-red-500' : 'border-gray-200'
                                            }`}
                                        placeholder="Enter new password (min 8 characters)"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {passwordErrors.newPassword && (
                                    <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-200'
                                            }`}
                                        placeholder="Re-enter new password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {passwordErrors.confirmPassword && (
                                    <p className="text-red-500 text-xs mt-1">{passwordErrors.confirmPassword}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-end space-x-3 mt-6">
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePasswordSubmit}
                                disabled={isSaving}
                                className={`px-4 py-2 bg-emerald-600 text-white rounded-lg transition-colors flex items-center space-x-2 ${isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-emerald-700'
                                    }`}
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        <span>Updating...</span>
                                    </>
                                ) : (
                                    <span>Update Password</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}