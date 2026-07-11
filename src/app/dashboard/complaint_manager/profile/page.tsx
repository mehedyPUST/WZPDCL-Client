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
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

export default function ComplaintManagerProfilePage() {
    const router = useRouter();

    // Core states
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [profile, setProfile] = useState<any>({
        name: '',
        email: '',
        mobile: '',
        role: 'complaint_manager',
    });

    // Edit form state
    const [editData, setEditData] = useState({ name: '', mobile: '' });

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

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await authClient.getSession();
                if (data?.user) {
                    setProfile(data.user);
                    setEditData({ name: data.user.name || '', mobile: data.user.mobile || '' });
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError('Failed to load profile.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

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
            setEditData({ name: profile.name || '', mobile: profile.mobile || '' });
        }
        setIsEditing(!isEditing);
        setSaveSuccess(false);
        setError(null);
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        setError(null);
        try {
            // TODO: Replace with your actual API call to update profile
            // await authClient.updateProfile(editData);
            await new Promise(resolve => setTimeout(resolve, 800)); // Mock API delay

            setProfile({ ...profile, ...editData });
            setIsEditing(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            setError('Failed to save profile.');
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
        if (passwordData.newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters.');
            return;
        }

        setIsChangingPassword(true);
        try {
            // TODO: Replace with your actual API call to change password
            // await authClient.changePassword(passwordData);
            await new Promise(resolve => setTimeout(resolve, 800)); // Mock API delay

            setShowPasswordModal(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err: any) {
            setPasswordError(err.message || 'Failed to change password.');
        } finally {
            setIsChangingPassword(false);
        }
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

            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-red-600 to-red-700 relative">
                    <div className="absolute bottom-0 left-8 transform translate-y-1/2 flex items-end space-x-4">
                        <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg">
                            <div className="w-full h-full rounded-full bg-red-100 flex items-center justify-center">
                                <span className="text-3xl font-bold text-red-600">
                                    {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                            </div>
                        </div>
                        <div className="text-white pb-2">
                            <h2 className="text-xl font-bold">{profile?.name || 'User'}</h2>
                            <p className="text-red-100 text-sm">Complaint Manager</p>
                        </div>
                    </div>
                </div>

                <div className="pt-14 pb-6 px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
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
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                        />
                                    ) : (
                                        <p className="text-sm font-medium text-gray-800">{profile?.mobile || 'N/A'}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <Shield size={18} className="text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">Role</p>
                                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                                        Complaint Manager
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Building size={18} className="text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">Department</p>
                                    <p className="text-sm font-medium text-gray-800">Complaint Management</p>
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
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm pr-10"
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
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm pr-10"
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
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm pr-10"
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