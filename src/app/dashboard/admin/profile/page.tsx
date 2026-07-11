// app/dashboard/profile/page.tsx
'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

interface ProfileData {
    name: string;
    email: string;
    mobile: string;
    nidNo: string;
    userType: 'existing_consumer' | 'applicant_new_connection';
    feederName: string;
    meterNo: string;
    role: string;
    address: string;
    designation: string;
    department: string;
    joinDate: string;
    profileImage: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [profile, setProfile] = useState<ProfileData>({
        name: 'Md. Mehedy Hasan',
        email: 'admin@wzpdc.gov.bd',
        mobile: '01712345678',
        nidNo: '12345678901234567',
        userType: 'existing_consumer',
        feederName: 'Trimohoni',
        meterNo: 'MTR-2026-001',
        role: 'admin',
        address: 'Boyra Main Road, Khulna',
        designation: 'System Administrator',
        department: 'Sales and Distribution Division-1',
        joinDate: '2020-01-15',
        profileImage: '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [passwordErrors, setPasswordErrors] = useState<{ [key: string]: string }>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveSuccess(false);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsSaving(false);
        setIsEditing(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
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
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSaving(false);
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    const handleLogout = async () => {
        try {
            await authClient.signOut();
            router.push('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const getRoleBadge = (role: string) => {
        const roles: Record<string, { color: string; label: string }> = {
            admin: { color: 'bg-purple-100 text-purple-700', label: 'Administrator' },
            xen: { color: 'bg-blue-100 text-blue-700', label: 'XEN' },
            connection_wing: { color: 'bg-orange-100 text-orange-700', label: 'Connection Wing' },
            complaint_manager: { color: 'bg-red-100 text-red-700', label: 'Complaint Manager' },
            billing_wings: { color: 'bg-teal-100 text-teal-700', label: 'Billing Wings' },
            customer: { color: 'bg-emerald-100 text-emerald-700', label: 'Customer' },
        };
        return roles[role] || roles.customer;
    };

    const roleBadge = getRoleBadge(profile.role);

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
                                        {profile.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            </div>
                            <button className="absolute bottom-0 right-0 p-1.5 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors">
                                <Camera size={14} />
                            </button>
                        </div>
                        <div className="text-white pb-2">
                            <h2 className="text-xl font-bold">{profile.name}</h2>
                            <p className="text-emerald-100 text-sm">{profile.designation}</p>
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
                                <Building size={18} className="text-gray-400" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">Department</p>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="department"
                                            value={profile.department}
                                            onChange={handleChange}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    ) : (
                                        <p className="text-sm font-medium text-gray-800">{profile.department}</p>
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
                                        <p className="text-sm font-medium text-gray-800">{profile.address}</p>
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
                                    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${roleBadge.color}`}>
                                        {roleBadge.label}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <Calendar size={18} className="text-gray-400" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-500">Join Date</p>
                                    {isEditing ? (
                                        <input
                                            type="date"
                                            name="joinDate"
                                            value={profile.joinDate}
                                            onChange={handleChange}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    ) : (
                                        <p className="text-sm font-medium text-gray-800">{profile.joinDate}</p>
                                    )}
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
                                    <p className="text-xs text-gray-500">Status</p>
                                    <p className="text-sm font-medium text-green-600 flex items-center space-x-1">
                                        <CheckCircle size={14} />
                                        <span>Active</span>
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
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                    placeholder="Enter current password"
                                />
                                {passwordErrors.currentPassword && (
                                    <p className="text-red-500 text-xs mt-1">{passwordErrors.currentPassword}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${passwordErrors.newPassword ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                    placeholder="Enter new password (min 8 characters)"
                                />
                                {passwordErrors.newPassword && (
                                    <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                    placeholder="Re-enter new password"
                                />
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