// app/dashboard/admin/users/page.tsx
'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

interface User {
    id: string;
    name: string;
    email: string;
    mobile: string;
    role: string;
    status: 'active' | 'inactive' | 'pending';
    meterNo?: string;
    feederName?: string;
    userType: 'existing_consumer' | 'applicant_new_connection';
    createdAt: string;
    lastActive: string;
}

export default function AdminUsersPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

    // Mock users data
    const users: User[] = [
        {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            mobile: '01712345678',
            role: 'admin',
            status: 'active',
            meterNo: 'MTR-001',
            feederName: 'Trimohoni',
            userType: 'existing_consumer',
            createdAt: '2025-01-15',
            lastActive: '2026-07-10',
        },
        {
            id: '2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            mobile: '01712345679',
            role: 'xen',
            status: 'active',
            meterNo: 'MTR-002',
            feederName: 'Circuit-Hose',
            userType: 'existing_consumer',
            createdAt: '2025-02-20',
            lastActive: '2026-07-09',
        },
        {
            id: '3',
            name: 'Robert Johnson',
            email: 'robert@example.com',
            mobile: '01712345680',
            role: 'customer',
            status: 'inactive',
            meterNo: 'MTR-003',
            feederName: 'DC-Court',
            userType: 'existing_consumer',
            createdAt: '2025-03-10',
            lastActive: '2026-06-28',
        },
        {
            id: '4',
            name: 'Emily Davis',
            email: 'emily@example.com',
            mobile: '01712345681',
            role: 'customer',
            status: 'pending',
            userType: 'applicant_new_connection',
            createdAt: '2026-07-01',
            lastActive: '2026-07-01',
        },
        {
            id: '5',
            name: 'Michael Brown',
            email: 'michael@example.com',
            mobile: '01712345682',
            role: 'connection_wing',
            status: 'active',
            meterNo: 'MTR-005',
            feederName: 'N.S-Road',
            userType: 'existing_consumer',
            createdAt: '2025-04-05',
            lastActive: '2026-07-08',
        },
        {
            id: '6',
            name: 'Sarah Wilson',
            email: 'sarah@example.com',
            mobile: '01712345683',
            role: 'complaint_manager',
            status: 'active',
            userType: 'applicant_new_connection',
            createdAt: '2025-05-12',
            lastActive: '2026-07-07',
        },
        {
            id: '7',
            name: 'David Lee',
            email: 'david@example.com',
            mobile: '01712345684',
            role: 'billing_wings',
            status: 'active',
            meterNo: 'MTR-007',
            feederName: 'Trimohoni',
            userType: 'existing_consumer',
            createdAt: '2025-06-18',
            lastActive: '2026-07-06',
        },
        {
            id: '8',
            name: 'Lisa Kim',
            email: 'lisa@example.com',
            mobile: '01712345685',
            role: 'customer',
            status: 'active',
            meterNo: 'MTR-008',
            feederName: 'Circuit-Hose',
            userType: 'existing_consumer',
            createdAt: '2026-01-22',
            lastActive: '2026-07-05',
        },
    ];

    const getRoleBadge = (role: string) => {
        const roles: Record<string, { color: string; label: string }> = {
            admin: { color: 'bg-purple-100 text-purple-700', label: 'Admin' },
            xen: { color: 'bg-blue-100 text-blue-700', label: 'XEN' },
            connection_wing: { color: 'bg-orange-100 text-orange-700', label: 'Connection Wing' },
            complaint_manager: { color: 'bg-red-100 text-red-700', label: 'Complaint Manager' },
            billing_wings: { color: 'bg-teal-100 text-teal-700', label: 'Billing Wings' },
            customer: { color: 'bg-emerald-100 text-emerald-700', label: 'Customer' },
        };
        return roles[role] || { color: 'bg-gray-100 text-gray-700', label: role };
    };

    const getStatusBadge = (status: string) => {
        const statuses: Record<string, { color: string; label: string; icon: any }> = {
            active: { color: 'bg-green-100 text-green-700', label: 'Active', icon: UserCheck },
            inactive: { color: 'bg-gray-100 text-gray-700', label: 'Inactive', icon: UserX },
            pending: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending', icon: Clock },
        };
        return statuses[status] || statuses.inactive;
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.mobile.includes(searchTerm) ||
            user.meterNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            false;
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
        return matchesSearch && matchesRole && matchesStatus;
    });

    const totalPages = Math.ceil(filteredUsers.length / 5);
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * 5, currentPage * 5);

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

    const handleDelete = (id: string) => {
        setShowDeleteModal(id);
    };

    const confirmDelete = () => {
        // Delete logic here
        setShowDeleteModal(null);
    };

    return (
        <div className="space-y-6">
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
                    <p className="text-2xl font-bold text-gray-800">{users.length}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                    <p className="text-sm text-gray-500">Active</p>
                    <p className="text-2xl font-bold text-green-600">{users.filter(u => u.status === 'active').length}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                    <p className="text-sm text-gray-500">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{users.filter(u => u.status === 'pending').length}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                    <p className="text-sm text-gray-500">Inactive</p>
                    <p className="text-2xl font-bold text-gray-600">{users.filter(u => u.status === 'inactive').length}</p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, mobile, or meter number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                            <option value="all">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="xen">XEN</option>
                            <option value="connection_wing">Connection Wing</option>
                            <option value="complaint_manager">Complaint Manager</option>
                            <option value="billing_wings">Billing Wings</option>
                            <option value="customer">Customer</option>
                        </select>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
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
                            }}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                        >
                            <RefreshCw size={16} />
                            <span>Reset</span>
                        </button>
                    </div>
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
                            {paginatedUsers.map((user) => {
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
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">{user.name}</p>
                                                    <p className="text-xs text-gray-500">{user.userType === 'existing_consumer' ? 'Existing Consumer' : 'New Applicant'}</p>
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
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 w-fit ${StatusBadge.color}`}>
                                                <StatusIcon size={12} />
                                                <span>{StatusBadge.label}</span>
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm text-gray-600">{user.createdAt}</p>
                                            <p className="text-xs text-gray-400">Last: {user.lastActive}</p>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center space-x-2">
                                                <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="View">
                                                    <Eye size={16} className="text-gray-500" />
                                                </button>
                                                <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                                                    <Edit size={16} className="text-blue-500" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} className="text-red-500" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Showing {((currentPage - 1) * 5) + 1} to {Math.min(currentPage * 5, filteredUsers.length)} of {filteredUsers.length} users
                        </p>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${currentPage === page
                                            ? 'bg-emerald-600 text-white'
                                            : 'border border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
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
                    <div className="px-6 py-3 bg-emerald-50 border-t border-emerald-100 flex items-center justify-between">
                        <p className="text-sm text-emerald-700">
                            {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                        </p>
                        <div className="flex items-center space-x-2">
                            <button className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-1">
                                <UserCheck size={14} />
                                <span>Activate</span>
                            </button>
                            <button className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-1">
                                <UserX size={14} />
                                <span>Deactivate</span>
                            </button>
                            <button className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-1">
                                <Trash2 size={14} />
                                <span>Delete</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}