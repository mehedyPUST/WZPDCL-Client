// app/dashboard/admin/users/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Plus,
    Filter,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    UserCheck,
    UserX,
    Mail,
    Phone,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Shield,
    User,
    Clock,
    Download,
    Upload,
    RefreshCw,
    X,
    Loader2,
    AlertCircle,
    CheckCircle,
    Save,
    UserCog,
    Ban,
    Unlock,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

interface User {
    id: string;
    _id?: string;
    name: string;
    email: string;
    mobile: string;
    nidNo?: string;
    role: string;
    status: 'active' | 'inactive' | 'pending';
    meterNo?: string;
    feederName?: string;
    createdAt: string;
    updatedAt: string;
    lastActive?: string;
    isActive: boolean;
    meters?: string[];
    claimedMeters?: any[];
}

interface RoleOption {
    value: string;
    label: string;
    color: string;
}

export default function AdminUsersPage() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [user, setUser] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
    const [showRoleModal, setShowRoleModal] = useState<string | null>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // ✅ Edit form state
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        mobile: '',
        nidNo: '',
        role: 'consumer',
        status: 'active',
        meterNo: '',
        feederName: '',
    });

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const ITEMS_PER_PAGE = 10;

    // ✅ Role options
    const roleOptions: RoleOption[] = [
        { value: 'admin', label: 'Admin', color: 'bg-purple-100 text-purple-700' },
        { value: 'xen', label: 'XEN', color: 'bg-blue-100 text-blue-700' },
        { value: 'connection_wing', label: 'Connection Wing', color: 'bg-orange-100 text-orange-700' },
        { value: 'complaint_manager', label: 'Complaint Manager', color: 'bg-red-100 text-red-700' },
        { value: 'billing_wings', label: 'Billing Wings', color: 'bg-teal-100 text-teal-700' },
        { value: 'consumer', label: 'Consumer', color: 'bg-emerald-100 text-emerald-700' },
        { value: 'applicant', label: 'Applicant', color: 'bg-yellow-100 text-yellow-700' },
    ];

    useEffect(() => {
        const getUser = async () => {
            try {
                const { data } = await authClient.getSession();
                setUser(data?.user || null);
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };
        getUser();
    }, []);

    useEffect(() => {
        if (user) {
            fetchUsers();
        }
    }, [user]);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('auth_token');

            const response = await fetch(`${API_URL}/api/admin/users`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch users');
            }

            const data = await response.json();

            if (data.success && data.data) {
                const processedUsers = data.data.map((u: any) => ({
                    id: u._id || u.id,
                    _id: u._id || u.id,
                    name: u.name || 'Unknown',
                    email: u.email || '',
                    mobile: u.mobile || '',
                    nidNo: u.nidNo || '',
                    role: u.role || 'consumer',
                    status: u.isActive ? 'active' : 'inactive',
                    isActive: u.isActive !== undefined ? u.isActive : true,
                    meterNo: u.meterNo || '',
                    feederName: u.feederName || '',
                    createdAt: u.createdAt || new Date().toISOString(),
                    updatedAt: u.updatedAt || new Date().toISOString(),
                    lastActive: u.lastActive || u.updatedAt || u.createdAt,
                    meters: u.meters || [],
                    claimedMeters: u.claimedMeters || [],
                }));
                setUsers(processedUsers);
            } else {
                setUsers([]);
            }

        } catch (error: any) {
            console.error('❌ Error fetching users:', error);
            setError(error.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchUsers();
        setRefreshing(false);
    };

    const getRoleBadge = (role: string) => {
        const found = roleOptions.find(r => r.value === role);
        return found || { color: 'bg-gray-100 text-gray-700', label: role || 'Unknown' };
    };

    const getStatusBadge = (status: string) => {
        const statuses: Record<string, { color: string; label: string; icon: any }> = {
            active: { color: 'bg-green-100 text-green-700', label: 'Active', icon: UserCheck },
            inactive: { color: 'bg-gray-100 text-gray-700', label: 'Inactive', icon: UserX },
            pending: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending', icon: Clock },
        };
        return statuses[status] || statuses.inactive;
    };

    // ✅ Update user status
    const updateUserStatus = async (userId: string, isActive: boolean) => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_URL}/api/admin/users/${userId}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ isActive }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update user status');
            }

            setSuccessMessage(`User ${isActive ? 'activated' : 'deactivated'} successfully`);
            await fetchUsers();
            setTimeout(() => setSuccessMessage(null), 3000);

        } catch (error: any) {
            console.error('❌ Error updating user status:', error);
            alert(error.message || 'Failed to update user status');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ✅ Update user role
    const updateUserRole = async (userId: string, newRole: string) => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_URL}/api/admin/users/${userId}/role`, {
                method: 'PATCH',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ role: newRole }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update user role');
            }

            setSuccessMessage(`User role updated successfully`);
            await fetchUsers();
            setShowRoleModal(null);
            setTimeout(() => setSuccessMessage(null), 3000);

        } catch (error: any) {
            console.error('❌ Error updating user role:', error);
            alert(error.message || 'Failed to update user role');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ✅ Delete user
    const deleteUser = async (userId: string) => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete user');
            }

            setSuccessMessage('User deleted successfully');
            await fetchUsers();
            setShowDeleteModal(null);
            setTimeout(() => setSuccessMessage(null), 3000);

        } catch (error: any) {
            console.error('❌ Error deleting user:', error);
            alert(error.message || 'Failed to delete user');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ✅ Update user (edit)
    const updateUser = async (userId: string) => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: editForm.name,
                    email: editForm.email,
                    mobile: editForm.mobile,
                    nidNo: editForm.nidNo,
                    role: editForm.role,
                    isActive: editForm.status === 'active',
                    meterNo: editForm.meterNo,
                    feederName: editForm.feederName,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update user');
            }

            setSuccessMessage('User updated successfully');
            await fetchUsers();
            setShowEditModal(false);
            setEditingUser(null);
            setTimeout(() => setSuccessMessage(null), 3000);

        } catch (error: any) {
            console.error('❌ Error updating user:', error);
            alert(error.message || 'Failed to update user');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ✅ Open edit modal
    const openEditModal = (user: User) => {
        setEditingUser(user);
        setEditForm({
            name: user.name,
            email: user.email,
            mobile: user.mobile || '',
            nidNo: user.nidNo || '',
            role: user.role || 'consumer',
            status: user.status || 'active',
            meterNo: user.meterNo || '',
            feederName: user.feederName || '',
        });
        setShowEditModal(true);
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.mobile?.includes(searchTerm) ||
            user.meterNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.nidNo?.includes(searchTerm) ||
            false;
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
        return matchesSearch && matchesRole && matchesStatus;
    });

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const toggleSelectAll = () => {
        if (selectedUsers.length === paginatedUsers.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(paginatedUsers.map(u => u.id));
        }
    };

    const toggleSelectUser = (id: string) => {
        setSelectedUsers(prev =>
            prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]
        );
    };

    // ✅ Bulk action: Activate users
    const bulkActivate = async () => {
        if (!confirm(`Activate ${selectedUsers.length} user(s)?`)) return;
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_URL}/api/admin/users/bulk`, {
                method: 'PATCH',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userIds: selectedUsers,
                    isActive: true,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to activate users');
            }

            setSuccessMessage(`${selectedUsers.length} user(s) activated`);
            await fetchUsers();
            setSelectedUsers([]);
            setTimeout(() => setSuccessMessage(null), 3000);

        } catch (error: any) {
            console.error('❌ Error bulk activating:', error);
            alert(error.message || 'Failed to activate users');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ✅ Bulk action: Deactivate users
    const bulkDeactivate = async () => {
        if (!confirm(`Deactivate ${selectedUsers.length} user(s)?`)) return;
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_URL}/api/admin/users/bulk`, {
                method: 'PATCH',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userIds: selectedUsers,
                    isActive: false,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to deactivate users');
            }

            setSuccessMessage(`${selectedUsers.length} user(s) deactivated`);
            await fetchUsers();
            setSelectedUsers([]);
            setTimeout(() => setSuccessMessage(null), 3000);

        } catch (error: any) {
            console.error('❌ Error bulk deactivating:', error);
            alert(error.message || 'Failed to deactivate users');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ✅ Bulk delete users
    const bulkDelete = async () => {
        if (!confirm(`Delete ${selectedUsers.length} user(s)? This action cannot be undone.`)) return;
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_URL}/api/admin/users/bulk`, {
                method: 'DELETE',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userIds: selectedUsers,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete users');
            }

            setSuccessMessage(`${selectedUsers.length} user(s) deleted`);
            await fetchUsers();
            setSelectedUsers([]);
            setTimeout(() => setSuccessMessage(null), 3000);

        } catch (error: any) {
            console.error('❌ Error bulk deleting:', error);
            alert(error.message || 'Failed to delete users');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={40} className="animate-spin text-emerald-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
                <AlertCircle size={48} className="text-red-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-red-700">Failed to Load Users</h3>
                <p className="text-red-600 mt-2">{error}</p>
                <button
                    onClick={handleRefresh}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    // ✅ Stats
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active').length;
    const inactiveUsers = users.filter(u => u.status === 'inactive').length;
    const pendingUsers = users.filter(u => u.status === 'pending').length;

    return (
        <div className="space-y-6">
            {/* Success Message */}
            {successMessage && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center space-x-3">
                    <CheckCircle size={20} className="text-emerald-600" />
                    <p className="text-sm text-emerald-700">{successMessage}</p>
                    <button
                        onClick={() => setSuccessMessage(null)}
                        className="ml-auto text-emerald-500 hover:text-emerald-700"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                        <Users size={24} className="text-emerald-600" />
                        <span>User Management</span>
                    </h1>
                    <p className="text-gray-500 text-sm">Manage all users in the system</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                        <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                    </button>
                    <button className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                        <Download size={16} />
                        <span>Export</span>
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                    >
                        <Plus size={16} />
                        <span>Add User</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                    <p className="text-sm text-gray-500">Total Users</p>
                    <p className="text-2xl font-bold text-gray-800">{totalUsers}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                    <p className="text-sm text-gray-500">Active</p>
                    <p className="text-2xl font-bold text-green-600">{activeUsers}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                    <p className="text-sm text-gray-500">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{pendingUsers}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                    <p className="text-sm text-gray-500">Inactive</p>
                    <p className="text-2xl font-bold text-gray-600">{inactiveUsers}</p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, mobile, NID, or meter number..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <select
                            value={filterRole}
                            onChange={(e) => {
                                setFilterRole(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                            <option value="all">All Roles</option>
                            {roleOptions.map(role => (
                                <option key={role.value} value={role.value}>{role.label}</option>
                            ))}
                        </select>
                        <select
                            value={filterStatus}
                            onChange={(e) => {
                                setFilterStatus(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilterRole('all');
                                setFilterStatus('all');
                                setCurrentPage(1);
                            }}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                        >
                            <RefreshCw size={16} />
                            <span>Reset</span>
                        </button>
                    </div>
                </div>
                <div className="mt-2 text-xs text-gray-400">
                    Found {filteredUsers.length} users
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3 w-10">
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                    />
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Meter No</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                        {searchTerm || filterRole !== 'all' || filterStatus !== 'all'
                                            ? 'No users match your filters.'
                                            : 'No users found in the system.'}
                                    </td>
                                </tr>
                            ) : (
                                paginatedUsers.map((user) => {
                                    const StatusBadge = getStatusBadge(user.status);
                                    const role = getRoleBadge(user.role);
                                    const StatusIcon = StatusBadge.icon;

                                    return (
                                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUsers.includes(user.id)}
                                                    onChange={() => toggleSelectUser(user.id)}
                                                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-sm font-bold text-emerald-600">
                                                            {user.name?.charAt(0).toUpperCase() || '?'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-800">{user.name}</p>
                                                        {user.nidNo && (
                                                            <p className="text-xs text-gray-400">NID: {user.nidNo}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm text-gray-600">{user.email}</p>
                                                <p className="text-xs text-gray-400">{user.mobile}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${role.color}`}>
                                                    {role.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-gray-600">{user.meterNo || '—'}</span>
                                                {user.meters && user.meters.length > 1 && (
                                                    <span className="text-xs text-gray-400 block">
                                                        +{user.meters.length - 1} more
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 w-fit ${StatusBadge.color}`}>
                                                    <StatusIcon size={12} />
                                                    <span>{StatusBadge.label}</span>
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm text-gray-600">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    Last: {new Date(user.lastActive || user.updatedAt).toLocaleDateString()}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center space-x-1">
                                                    {/* ✅ Status Toggle */}
                                                    <button
                                                        onClick={() => updateUserStatus(user.id, !user.isActive)}
                                                        disabled={isSubmitting}
                                                        className={`p-1.5 rounded-lg transition-colors ${user.isActive
                                                            ? 'hover:bg-red-50 text-green-600'
                                                            : 'hover:bg-green-50 text-gray-400'
                                                            }`}
                                                        title={user.isActive ? 'Deactivate' : 'Activate'}
                                                    >
                                                        {user.isActive ? (
                                                            <UserCheck size={16} />
                                                        ) : (
                                                            <UserX size={16} />
                                                        )}
                                                    </button>

                                                    {/* ✅ Edit */}
                                                    <button
                                                        onClick={() => openEditModal(user)}
                                                        className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors text-blue-500"
                                                        title="Edit"
                                                    >
                                                        <Edit size={16} />
                                                    </button>

                                                    {/* ✅ Change Role */}
                                                    <button
                                                        onClick={() => setShowRoleModal(user.id)}
                                                        className="p-1.5 hover:bg-purple-50 rounded-lg transition-colors text-purple-500"
                                                        title="Change Role"
                                                    >
                                                        <UserCog size={16} />
                                                    </button>

                                                    {/* ✅ Delete */}
                                                    <button
                                                        onClick={() => setShowDeleteModal(user.id)}
                                                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-red-500"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-4">
                        <p className="text-sm text-gray-500">
                            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users
                        </p>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${currentPage === pageNum
                                            ? 'bg-emerald-600 text-white'
                                            : 'border border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            {totalPages > 5 && currentPage < totalPages - 2 && (
                                <span className="text-gray-400">...</span>
                            )}
                            {totalPages > 5 && currentPage < totalPages - 2 && (
                                <button
                                    onClick={() => setCurrentPage(totalPages)}
                                    className={`px-3 py-1 rounded-lg text-sm transition-colors border border-gray-200 hover:bg-gray-50`}
                                >
                                    {totalPages}
                                </button>
                            )}
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Selected Actions */}
                {selectedUsers.length > 0 && (
                    <div className="px-6 py-3 bg-emerald-50 border-t border-emerald-100 flex items-center justify-between flex-wrap gap-4">
                        <p className="text-sm text-emerald-700">
                            {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                        </p>
                        <div className="flex items-center space-x-2 flex-wrap gap-2">
                            <button
                                onClick={bulkActivate}
                                disabled={isSubmitting}
                                className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-1"
                            >
                                <UserCheck size={14} />
                                <span>Activate</span>
                            </button>
                            <button
                                onClick={bulkDeactivate}
                                disabled={isSubmitting}
                                className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-1"
                            >
                                <UserX size={14} />
                                <span>Deactivate</span>
                            </button>
                            <button
                                onClick={bulkDelete}
                                disabled={isSubmitting}
                                className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-1"
                            >
                                <Trash2 size={14} />
                                <span>Delete</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ✅ Edit User Modal */}
            {showEditModal && editingUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                                <Edit size={20} className="text-blue-500" />
                                <span>Edit User</span>
                            </h3>
                            <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile *</label>
                                    <input
                                        type="text"
                                        value={editForm.mobile}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, mobile: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">NID</label>
                                    <input
                                        type="text"
                                        value={editForm.nidNo}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, nidNo: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                                    <select
                                        value={editForm.role}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                                    >
                                        {roleOptions.map(role => (
                                            <option key={role.value} value={role.value}>{role.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={editForm.status}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="pending">Pending</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Meter No</label>
                                    <input
                                        type="text"
                                        value={editForm.meterNo}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, meterNo: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Feeder</label>
                                    <input
                                        type="text"
                                        value={editForm.feederName}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, feederName: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end space-x-3 pt-4 mt-4 border-t border-gray-100">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => updateUser(editingUser.id)}
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                            >
                                {isSubmitting ? (
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
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ Change Role Modal */}
            {showRoleModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                                <UserCog size={20} className="text-purple-500" />
                                <span>Change Role</span>
                            </h3>
                            <button onClick={() => setShowRoleModal(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <p className="text-sm text-gray-600 mb-4">
                            Select a new role for this user.
                        </p>

                        <div className="space-y-2">
                            {roleOptions.map(role => {
                                const userToEdit = users.find(u => u.id === showRoleModal);
                                const isCurrentRole = userToEdit?.role === role.value;

                                return (
                                    <button
                                        key={role.value}
                                        onClick={() => updateUserRole(showRoleModal, role.value)}
                                        disabled={isSubmitting || isCurrentRole}
                                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${isCurrentRole
                                            ? 'bg-emerald-50 border border-emerald-200 cursor-default'
                                            : 'hover:bg-gray-50 border border-transparent hover:border-gray-200'
                                            }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${role.color}`}>
                                                {role.label}
                                            </span>
                                            {isCurrentRole && (
                                                <span className="text-xs text-emerald-600 font-medium">(Current)</span>
                                            )}
                                        </div>
                                        {!isCurrentRole && (
                                            <ChevronRight size={16} className="text-gray-400" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex items-center justify-end pt-4 mt-4 border-t border-gray-100">
                            <button
                                onClick={() => setShowRoleModal(null)}
                                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                                <Trash2 size={20} className="text-red-500" />
                                <span>Delete User</span>
                            </h3>
                            <button onClick={() => setShowDeleteModal(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <p className="text-sm text-red-700">
                                Are you sure you want to delete this user? This action cannot be undone.
                            </p>
                        </div>

                        <div className="flex items-center justify-end space-x-3 pt-4 mt-4 border-t border-gray-100">
                            <button
                                onClick={() => setShowDeleteModal(null)}
                                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => deleteUser(showDeleteModal)}
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        <span>Deleting...</span>
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={16} />
                                        <span>Delete User</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}