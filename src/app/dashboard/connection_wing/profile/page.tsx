// app/dashboard/connection_wing/profile/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    User,
    Mail,
    Phone,
    Edit2,
    Save,
    X,
    Lock,
    LogOut,
    Shield,
    Loader2,
    Building,
    Eye,
    EyeOff,
    CheckCircle,
    AlertCircle,
    Users,
    MapPin,
    Package,
    Zap,
    Calendar,
    FileText,
    Globe,
    CreditCard,
    Home,
    Key,
    Camera,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

interface ProfileData {
    id: string;
    name: string;
    email: string;
    mobile: string;
    nidNo: string;
    role: string;
    address: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    department: string;
    designation: string;
    totalConsumersAdded: number;
    totalMetersAdded: number;
    totalApplicationsProcessed: number;
}

export default function ConnectionWingProfilePage() {
    const router = useRouter();

    // Core states
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
        role: 'connection_wing',
        address: '',
        isActive: true,
        createdAt: '',
        updatedAt: '',
        department: 'Connection Wing',
        designation: 'Connection Wing Officer',
        totalConsumersAdded: 0,
        totalMetersAdded: 0,
        totalApplicationsProcessed: 0,
    });

    // Edit form state
    const [editData, setEditData] = useState({
        name: '',
        mobile: '',
        nidNo: '',
        address: '',
    });

    // Password modal state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await authClient.getSession();
                if (data?.user) {
                    // ✅ FIX: Use type assertion for custom fields
                    const user = data.user as any;

                    // ✅ Fetch stats from API
                    let totalConsumersAdded = 0;
                    let totalMetersAdded = 0;
                    let totalApplicationsProcessed = 0;

                    try {
                        const token = localStorage.getItem('auth_token');

                        // Fetch consumers count
                        const consumersRes = await fetch(
                            `${API_URL}/api/billing/consumers/all`,
                            {
                                headers: {
                                    'Authorization': token ? `Bearer ${token}` : '',
                                    'Content-Type': 'application/json',
                                },
                            }
                        );
                        if (consumersRes.ok) {
                            const consumersData = await consumersRes.json();
                            totalConsumersAdded = consumersData.data?.length || 0;
                        }

                        // Fetch meters count
                        const metersRes = await fetch(
                            `${API_URL}/api/meters/available`,
                            {
                                headers: {
                                    'Authorization': token ? `Bearer ${token}` : '',
                                    'Content-Type': 'application/json',
                                },
                            }
                        );
                        if (metersRes.ok) {
                            const metersData = await metersRes.json();
                            totalMetersAdded = metersData.data?.length || 0;
                        }

                        // Fetch applications count
                        const appsRes = await fetch(
                            `${API_URL}/api/connection-wing/applications`,
                            {
                                headers: {
                                    'Authorization': token ? `Bearer ${token}` : '',
                                    'Content-Type': 'application/json',
                                },
                            }
                        );
                        if (appsRes.ok) {
                            const appsData = await appsRes.json();
                            totalApplicationsProcessed = appsData.data?.length || 0;
                        }

                    } catch (error) {
                        console.error('Error fetching stats:', error);
                    }

                    setProfile({
                        id: user.id || '',
                        name: user.name || '',
                        email: user.email || '',
                        mobile: user.mobile || '',
                        nidNo: user.nidNo || '',
                        role: user.role || 'connection_wing',
                        address: user.address || '',
                        isActive: user.isActive !== undefined ? user.isActive : true,
                        createdAt: user.createdAt || new Date().toISOString(),
                        updatedAt: user.updatedAt || new Date().toISOString(),
                        department: 'Connection Wing',
                        designation: 'Connection Wing Officer',
                        totalConsumersAdded,
                        totalMetersAdded,
                        totalApplicationsProcessed,
                    });

                    setEditData({
                        name: user.name || '',
                        mobile: user.mobile || '',
                        nidNo: user.nidNo || '',
                        address: user.address || '',
                    });
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError('Failed to load profile.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [API_URL]);

    const handleLogout = async () => {
        try {
            await authClient.signOut();
            router.push('/');
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    const handleEditToggle = () => {
        if (isEditing) {
            // Cancel editing, reset data to original profile data
            setEditData({
                name: profile.name || '',
                mobile: profile.mobile || '',
                nidNo: profile.nidNo || '',
                address: profile.address || '',
            });
        }
        setIsEditing(!isEditing);
        setSaveSuccess(false);
        setError(null);
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        setError(null);
        try {
            const token = localStorage.getItem('auth_token');

            const response = await fetch(`${API_URL}/api/auth/update-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: JSON.stringify({
                    name: editData.name,
                    mobile: editData.mobile,
                    nidNo: editData.nidNo,
                    address: editData.address,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to update profile');
            }

            setProfile({
                ...profile,
                name: editData.name,
                mobile: editData.mobile,
                nidNo: editData.nidNo,
                address: editData.address,
                updatedAt: new Date().toISOString(),
            });
            setIsEditing(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to save profile.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError(null);

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('New passwords do not match.');
            return;
        }
        if (passwordData.newPassword.length < 8) {
            setPasswordError('Password must be at least 8 characters.');
            return;
        }

        setIsChangingPassword(true);
        try {
            const token = localStorage.getItem('auth_token');

            const response = await fetch(`${API_URL}/api/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to change password');
            }

            setShowPasswordModal(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err: any) {
            setPasswordError(err.message || 'Failed to change password. Please check your current password.');
        } finally {
            setIsChangingPassword(false);
        }
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

    const getRoleDisplay = (role: string) => {
        const roles: Record<string, string> = {
            admin: 'Administrator',
            xen: 'Executive Engineer (XEN)',
            connection_wing: 'Connection Wing Officer',
            complaint_manager: 'Complaint Manager',
            billing_wings: 'Billing Wings Officer',
            consumer: 'Consumer',
            applicant: 'Applicant',
        };
        return roles[role] || role;
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
                            onClick={handleEditToggle}
                            className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                        >
                            <Edit2 size={16} />
                            <span>Edit Profile</span>
                        </button>
                    ) : (
                        <div className="flex space-x-2">
                            <button
                                onClick={handleSaveProfile}
                                disabled={isSaving}
                                className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                <span>Save</span>
                            </button>
                            <button
                                onClick={handleEditToggle}
                                disabled={isSaving}
                                className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                            >
                                <X size={16} />
                                <span>Cancel</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Success/Error Messages */}
            {saveSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center space-x-2">
                    <CheckCircle size={18} />
                    <span>Changes saved successfully!</span>
                </div>
            )}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            {/* Stats Cards - Connection Wing Specific */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Consumers Added</p>
                            <p className="text-2xl font-bold text-emerald-600">{profile.totalConsumersAdded}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-100">
                            <Users size={20} className="text-emerald-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Meters Added</p>
                            <p className="text-2xl font-bold text-blue-600">{profile.totalMetersAdded}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-blue-100">
                            <Package size={20} className="text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Applications Processed</p>
                            <p className="text-2xl font-bold text-orange-600">{profile.totalApplicationsProcessed}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-orange-100">
                            <FileText size={20} className="text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Cover/Header */}
                <div className="h-32 bg-gradient-to-r from-orange-600 to-orange-700 relative">
                    <div className="absolute bottom-0 left-8 transform translate-y-1/2 flex items-end space-x-4">
                        <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg">
                            <div className="w-full h-full rounded-full bg-orange-100 flex items-center justify-center">
                                <span className="text-3xl font-bold text-orange-600">
                                    {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                            </div>
                        </div>
                        <div className="text-white pb-2">
                            <h2 className="text-xl font-bold">{profile?.name || 'User'}</h2>
                            <p className="text-orange-100 text-sm">{profile.designation}</p>
                        </div>
                    </div>
                </div>

                <div className="pt-14 pb-6 px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                            {/* Name Field */}
                            <div className="flex items-center space-x-3">
                                <User size={18} className="text-gray-400" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">Full Name</p>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editData.name}
                                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                        />
                                    ) : (
                                        <p className="text-sm font-medium text-gray-800">{profile?.name || 'N/A'}</p>
                                    )}
                                </div>
                            </div>

                            {/* Email Field (Read-only) */}
                            <div className="flex items-center space-x-3">
                                <Mail size={18} className="text-gray-400" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">Email</p>
                                    <p className="text-sm font-medium text-gray-800">{profile?.email || 'N/A'}</p>
                                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                                </div>
                            </div>

                            {/* Mobile Field */}
                            <div className="flex items-center space-x-3">
                                <Phone size={18} className="text-gray-400" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">Mobile</p>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            value={editData.mobile}
                                            onChange={(e) => setEditData({ ...editData, mobile: e.target.value })}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                        />
                                    ) : (
                                        <p className="text-sm font-medium text-gray-800">{profile?.mobile || 'N/A'}</p>
                                    )}
                                </div>
                            </div>

                            {/* NID Field */}
                            <div className="flex items-center space-x-3">
                                <CreditCard size={18} className="text-gray-400" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">NID Number</p>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editData.nidNo}
                                            onChange={(e) => setEditData({ ...editData, nidNo: e.target.value })}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                        />
                                    ) : (
                                        <p className="text-sm font-medium text-gray-800">{profile?.nidNo || 'N/A'}</p>
                                    )}
                                </div>
                            </div>

                            {/* Address Field */}
                            <div className="flex items-center space-x-3">
                                <Home size={18} className="text-gray-400" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">Address</p>
                                    {isEditing ? (
                                        <textarea
                                            value={editData.address}
                                            onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                                            rows={2}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                        />
                                    ) : (
                                        <p className="text-sm font-medium text-gray-800">{profile?.address || 'Not provided'}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <Shield size={18} className="text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">Role</p>
                                    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getRoleColor(profile.role)}`}>
                                        {getRoleDisplay(profile.role)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Building size={18} className="text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">Department</p>
                                    <p className="text-sm font-medium text-gray-800">{profile.department}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <MapPin size={18} className="text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">Designation</p>
                                    <p className="text-sm font-medium text-gray-800">{profile.designation}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Calendar size={18} className="text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">Account Created</p>
                                    <p className="text-sm font-medium text-gray-800">
                                        {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Globe size={18} className="text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">Account Status</p>
                                    <p className={`text-sm font-medium flex items-center space-x-1 ${profile.isActive ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        <CheckCircle size={14} />
                                        <span>{profile.isActive ? 'Active' : 'Inactive'}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <button
                                    onClick={handleLogout}
                                    className="w-full px-4 py-2.5 bg-red-50 text-red-600 text-sm rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center space-x-2"
                                >
                                    <LogOut size={16} />
                                    <span>Logout from all devices</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
                        <button
                            onClick={() => {
                                setShowPasswordModal(false);
                                setPasswordError(null);
                                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                            }}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                            <Lock size={20} className="text-emerald-600" />
                            <span>Change Password</span>
                        </h3>

                        <form onSubmit={handleChangePassword} className="space-y-4">
                            {passwordError && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm flex items-center space-x-2">
                                    <AlertCircle size={16} />
                                    <span>{passwordError}</span>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.current ? 'text' : 'password'}
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.new ? 'text' : 'password'}
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.confirm ? 'text' : 'password'}
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPasswordModal(false);
                                        setPasswordError(null);
                                    }}
                                    className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isChangingPassword}
                                    className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                                >
                                    {isChangingPassword ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    <span>Update Password</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}