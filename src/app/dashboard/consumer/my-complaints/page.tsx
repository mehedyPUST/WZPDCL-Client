// app/dashboard/consumer/my-complaints/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
    AlertCircle,
    Plus,
    Search,
    Clock,
    CheckCircle,
    XCircle,
    Eye,
    ChevronLeft,
    ChevronRight,
    Download,
    RefreshCw,
    FileText,
    Loader2,
    X,
    Send,
    CreditCard,
    Zap,
    Package,
    Phone,
    MapPin,
    ChevronDown,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

interface Complaint {
    _id?: string;
    complaintId: string;
    meterNo: string;
    subject: string;
    category: string;
    description: string;
    status: 'pending' | 'under_action' | 'solved' | 'rejected';
    priority: 'low' | 'medium' | 'high';
    feederName: string;
    transformerNo: string;
    contactNumber: string;
    address: string;
    consumerId: string;
    consumerName: string;
    assignedTo?: string;
    resolvedAt?: string;
    createdAt: string;
    updatedAt: string;
}

interface Meter {
    _id?: string;
    meterNo: string;
    meterType: string;
    feederName: string;
    consumerName: string;
    consumerType: string;
    isClaimed: boolean;
}

export default function ConsumerComplaintsPage() {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [showNewComplaint, setShowNewComplaint] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const [meters, setMeters] = useState<Meter[]>([]);
    const [loadingMeters, setLoadingMeters] = useState(false);

    const [newComplaint, setNewComplaint] = useState({
        subject: '',
        category: '',
        description: '',
        priority: 'medium',
        meterNo: '',
        feederName: '',
        transformerNo: '',
        contactNumber: '',
        address: '',
    });

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const ITEMS_PER_PAGE = 5;

    const categories = [
        'Voltage Issue',
        'Power Outage',
        'Billing Error',
        'Meter Issue',
        'Technical Fault',
        'Transformer Issue',
        'Line Fault',
        'Other',
    ];

    const feederOptions = ['Trimohoni', 'Circuit-Hose', 'DC-Court', 'N.S-Road'];
    const transformerOptions = ['TR-01', 'TR-02', 'TR-03', 'TR-04', 'TR-05', 'TR-06', 'TR-07', 'TR-08', 'TR-09', 'TR-10'];

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
            fetchComplaints();
            fetchUserMeters();
        }
    }, [user]);

    const fetchComplaints = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_URL}/api/complaints/consumer/${user?.id}`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch complaints');
            }

            setComplaints(data.data || []);
        } catch (error: any) {
            console.error('Error fetching complaints:', error);
            setError(error.message || 'Failed to load complaints');
        } finally {
            setLoading(false);
        }
    };

    // ✅ Fetch user's meters for selection
    const fetchUserMeters = async () => {
        setLoadingMeters(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(
                `${API_URL}/api/user/meters/${user?.id}`,
                {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setMeters(data.data.meters || []);

                    // ✅ Auto-select first meter if available
                    if (data.data.meters && data.data.meters.length > 0) {
                        const firstMeter = data.data.meters[0];
                        setNewComplaint(prev => ({
                            ...prev,
                            meterNo: firstMeter.meterNo,
                            feederName: firstMeter.feederName || '',
                        }));
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching meters:', error);
        } finally {
            setLoadingMeters(false);
        }
    };

    // ✅ Handle meter selection
    const handleMeterSelect = (meterNo: string) => {
        const selectedMeter = meters.find(m => m.meterNo === meterNo);
        if (selectedMeter) {
            setNewComplaint(prev => ({
                ...prev,
                meterNo: selectedMeter.meterNo,
                feederName: selectedMeter.feederName || '',
            }));
        }
    };

    const getStatusBadge = (status: string) => {
        const statuses: Record<string, { color: string; label: string; icon: any }> = {
            pending: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending', icon: Clock },
            under_action: { color: 'bg-blue-100 text-blue-700', label: 'Under Action', icon: Loader2 },
            solved: { color: 'bg-green-100 text-green-700', label: 'Solved', icon: CheckCircle },
            rejected: { color: 'bg-red-100 text-red-700', label: 'Rejected', icon: XCircle },
        };
        return statuses[status] || statuses.pending;
    };

    const getPriorityBadge = (priority: string) => {
        const priorities: Record<string, { color: string; label: string }> = {
            low: { color: 'bg-gray-100 text-gray-700', label: 'Low' },
            medium: { color: 'bg-yellow-100 text-yellow-700', label: 'Medium' },
            high: { color: 'bg-red-100 text-red-700', label: 'High' },
        };
        return priorities[priority] || priorities.medium;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_URL}/api/complaints`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: JSON.stringify({
                    ...newComplaint,
                    consumerId: user?.id || 'unknown',
                    consumerName: user?.name || 'Unknown Consumer',
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit complaint');
            }

            setComplaints(prev => [data.data, ...prev]);
            setNewComplaint({
                subject: '',
                category: '',
                description: '',
                priority: 'medium',
                meterNo: '',
                feederName: '',
                transformerNo: '',
                contactNumber: '',
                address: '',
            });
            setShowNewComplaint(false);
        } catch (error: any) {
            console.error('Error submitting complaint:', error);
            setError(error.message || 'Failed to submit complaint');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredComplaints = complaints.filter(complaint => {
        const matchesSearch = complaint.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            complaint.complaintId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            complaint.meterNo.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || complaint.status === filterStatus;
        const matchesPriority = filterPriority === 'all' || complaint.priority === filterPriority;
        return matchesSearch && matchesStatus && matchesPriority;
    });

    const totalPages = Math.ceil(filteredComplaints.length / ITEMS_PER_PAGE);
    const paginatedComplaints = filteredComplaints.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const stats = [
        { label: 'Total Complaints', value: complaints.length, icon: FileText, color: 'bg-blue-100 text-blue-600' },
        { label: 'Pending', value: complaints.filter(c => c.status === 'pending').length, icon: Clock, color: 'bg-yellow-100 text-yellow-600' },
        { label: 'Under Action', value: complaints.filter(c => c.status === 'under_action').length, icon: Loader2, color: 'bg-blue-100 text-blue-600' },
        { label: 'Solved', value: complaints.filter(c => c.status === 'solved').length, icon: CheckCircle, color: 'bg-green-100 text-green-600' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={40} className="animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                        <AlertCircle size={24} className="text-emerald-600" />
                        <span>My Complaints</span>
                    </h1>
                    <p className="text-gray-500 text-sm">Track and manage your complaints</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button onClick={fetchComplaints} className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                        <RefreshCw size={16} />
                        <span>Refresh</span>
                    </button>
                    <button onClick={() => setShowNewComplaint(true)} className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2">
                        <Plus size={16} />
                        <span>New Complaint</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">{stat.label}</p>
                                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                                </div>
                                <div className={`p-3 rounded-xl ${stat.color}`}>
                                    <Icon size={20} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search complaints..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="under_action">Under Action</option>
                            <option value="solved">Solved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <select
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                            <option value="all">All Priority</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilterStatus('all');
                                setFilterPriority('all');
                            }}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                        >
                            <RefreshCw size={16} />
                            <span>Reset</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedComplaints.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No complaints found.</td>
                                </tr>
                            ) : (
                                paginatedComplaints.map((complaint) => {
                                    const StatusBadge = getStatusBadge(complaint.status);
                                    const PriorityBadge = getPriorityBadge(complaint.priority);
                                    const StatusIcon = StatusBadge.icon;

                                    return (
                                        <tr key={complaint.complaintId} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-gray-800">{complaint.complaintId}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-800">{complaint.subject}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-600">{complaint.category}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${PriorityBadge.color}`}>
                                                    {PriorityBadge.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 w-fit ${StatusBadge.color}`}>
                                                    <StatusIcon size={12} />
                                                    <span>{StatusBadge.label}</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => setSelectedComplaint(complaint)}
                                                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                    <Eye size={16} className="text-gray-500" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-sm text-gray-500">Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredComplaints.length)} of {filteredComplaints.length}</p>
                        <div className="flex items-center space-x-2">
                            <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                <ChevronLeft size={16} />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button key={page} onClick={() => setCurrentPage(page)} className={`px-3 py-1 rounded-lg text-sm transition-colors ${currentPage === page ? 'bg-emerald-600 text-white' : 'border border-gray-200 hover:bg-gray-50'}`}>
                                    {page}
                                </button>
                            ))}
                            <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* New Complaint Modal */}
            {showNewComplaint && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">New Complaint</h3>
                            <button onClick={() => setShowNewComplaint(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                                <AlertCircle size={16} className="text-red-600" />
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Subject <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={newComplaint.subject}
                                    onChange={(e) => setNewComplaint(prev => ({ ...prev, subject: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="Brief subject"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={newComplaint.category}
                                    onChange={(e) => setNewComplaint(prev => ({ ...prev, category: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Priority
                                </label>
                                <select
                                    value={newComplaint.priority}
                                    onChange={(e) => setNewComplaint(prev => ({ ...prev, priority: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>

                            {/* ✅ Meter Number - Select from user's meters */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Meter Number <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Package size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <select
                                        value={newComplaint.meterNo}
                                        onChange={(e) => handleMeterSelect(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                                        required
                                        disabled={loadingMeters}
                                    >
                                        <option value="">Select Meter</option>
                                        {meters.map((meter) => (
                                            <option key={meter.meterNo} value={meter.meterNo}>
                                                {meter.meterNo} {meter.consumerType ? `(${meter.consumerType})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    {loadingMeters && (
                                        <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
                                    )}
                                </div>
                                {meters.length === 0 && !loadingMeters && (
                                    <p className="text-xs text-yellow-600 mt-1">
                                        ⚠️ No meters found. Please claim a meter first.
                                    </p>
                                )}
                            </div>

                            {/* ✅ Feeder Name - Auto-filled from meter selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Feeder Name <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Zap size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={newComplaint.feederName}
                                        onChange={(e) => setNewComplaint(prev => ({ ...prev, feederName: e.target.value }))}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="Auto-filled from meter selection"
                                        required
                                        disabled
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Auto-filled based on meter selection</p>
                            </div>

                            {/* ✅ Transformer Number - Optional */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Transformer Number <span className="text-gray-400 text-xs">(Optional)</span>
                                </label>
                                <div className="relative">
                                    <Package size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <select
                                        value={newComplaint.transformerNo}
                                        onChange={(e) => setNewComplaint(prev => ({ ...prev, transformerNo: e.target.value }))}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                                    >
                                        <option value="">Select Transformer (Optional)</option>
                                        {transformerOptions.map((tr) => (
                                            <option key={tr} value={tr}>{tr}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Contact Number <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={newComplaint.contactNumber}
                                        onChange={(e) => setNewComplaint(prev => ({ ...prev, contactNumber: e.target.value }))}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="017XX-XXXXXX"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Address <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <MapPin size={18} className="absolute left-3 top-3 text-gray-400" />
                                    <textarea
                                        value={newComplaint.address}
                                        onChange={(e) => setNewComplaint(prev => ({ ...prev, address: e.target.value }))}
                                        rows={2}
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="Complete address"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={newComplaint.description}
                                    onChange={(e) => setNewComplaint(prev => ({ ...prev, description: e.target.value }))}
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="Describe your complaint in detail"
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowNewComplaint(false)}
                                    className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || meters.length === 0}
                                    className={`px-4 py-2 bg-emerald-600 text-white rounded-lg flex items-center space-x-2 transition-colors ${isSubmitting || meters.length === 0
                                        ? 'opacity-70 cursor-not-allowed'
                                        : 'hover:bg-emerald-700'
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            <span>Submitting...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send size={16} />
                                            <span>Submit Complaint</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {selectedComplaint && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Complaint Details</h3>
                            <button onClick={() => setSelectedComplaint(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500">Complaint ID</p>
                                    <p className="text-sm font-medium">{selectedComplaint.complaintId}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Status</p>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(selectedComplaint.status).color}`}>
                                        {getStatusBadge(selectedComplaint.status).label}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Category</p>
                                    <p className="text-sm font-medium">{selectedComplaint.category}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Priority</p>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadge(selectedComplaint.priority).color}`}>
                                        {getPriorityBadge(selectedComplaint.priority).label}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Meter</p>
                                    <p className="text-sm font-medium">{selectedComplaint.meterNo}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Feeder</p>
                                    <p className="text-sm font-medium">{selectedComplaint.feederName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Transformer</p>
                                    <p className="text-sm font-medium">{selectedComplaint.transformerNo || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Assigned To</p>
                                    <p className="text-sm font-medium">{selectedComplaint.assignedTo || 'Not Assigned'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Created</p>
                                    <p className="text-sm font-medium">{new Date(selectedComplaint.createdAt).toLocaleString()}</p>
                                </div>
                                {selectedComplaint.resolvedAt && (
                                    <div>
                                        <p className="text-xs text-gray-500">Resolved</p>
                                        <p className="text-sm font-medium text-green-600">{new Date(selectedComplaint.resolvedAt).toLocaleString()}</p>
                                    </div>
                                )}
                            </div>
                            <div className="border-t pt-4">
                                <p className="text-xs text-gray-500">Subject</p>
                                <p className="text-sm font-medium">{selectedComplaint.subject}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Description</p>
                                <p className="text-sm text-gray-600">{selectedComplaint.description}</p>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={() => setSelectedComplaint(null)}
                                    className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}