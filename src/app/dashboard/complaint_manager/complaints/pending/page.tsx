// app/dashboard/complaint_manager/complaints/pending/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    AlertCircle,
    Search,
    Eye,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Loader2,
    CheckCircle,
    Clock,
    XCircle,
    User,
    Phone,
    Mail,
    Home,
    MapPin,
    Zap,
    Package,
    Filter,
    X,
    MessageSquare,
    Send,
    Calendar,
    ArrowLeft,
    Check,
    UserCheck,
    UserX,
    FileText,
    Activity,
    Plus,
    TrendingUp,
    TrendingDown,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

interface Complaint {
    _id?: string;
    complaintId: string;
    meterNo: string;
    subject: string;
    category: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    status: 'pending' | 'under_action' | 'solved' | 'rejected';
    feederName: string;
    transformerNo: string;
    contactNumber: string;
    address: string;
    consumerId: string;
    consumerName: string;
    assignedTo?: string;
    resolvedAt?: string;
    remarks?: string;
    createdAt: string;
    updatedAt: string;
}

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    bgColor: string;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
}

const StatCard = ({ title, value, icon, bgColor, change, trend }: StatCardProps) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
                {change && (
                    <p className={`text-xs flex items-center mt-1 ${trend === 'up' ? 'text-green-600' :
                        trend === 'down' ? 'text-red-600' :
                            'text-gray-500'
                        }`}>
                        {trend === 'up' && <TrendingUp size={14} className="mr-1" />}
                        {trend === 'down' && <TrendingDown size={14} className="mr-1" />}
                        {change}
                    </p>
                )}
            </div>
            <div className={`p-3 rounded-xl ${bgColor}`}>
                {icon}
            </div>
        </div>
    </div>
);

export default function ComplaintManagerPendingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showActionModal, setShowActionModal] = useState(false);
    const [actionType, setActionType] = useState<'under_action' | 'solved' | 'rejected' | null>(null);
    const [actionRemarks, setActionRemarks] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPriority, setFilterPriority] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        underAction: 0,
        solved: 0,
        rejected: 0,
        highPriority: 0,
    });
    const [user, setUser] = useState<any>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const ITEMS_PER_PAGE = 5;

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
        }
    }, [user]);

    const fetchComplaints = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(
                `${API_URL}/api/complaints/all`,
                {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch complaints');
            }

            const allComplaints = data.data || [];

            // Filter only pending and under_action complaints for this page
            const pendingComplaints = allComplaints.filter(
                (c: Complaint) => c.status === 'pending' || c.status === 'under_action'
            );

            setComplaints(pendingComplaints);

            // Update stats
            const total = allComplaints.length;
            const pending = allComplaints.filter((c: Complaint) => c.status === 'pending').length;
            const underAction = allComplaints.filter((c: Complaint) => c.status === 'under_action').length;
            const solved = allComplaints.filter((c: Complaint) => c.status === 'solved').length;
            const rejected = allComplaints.filter((c: Complaint) => c.status === 'rejected').length;
            const highPriority = allComplaints.filter((c: Complaint) => c.priority === 'high').length;

            setStats({
                total,
                pending,
                underAction,
                solved,
                rejected,
                highPriority,
            });

        } catch (error) {
            console.error('Error fetching complaints:', error);
            // Mock data fallback
            const mockComplaints = getMockComplaints();
            setComplaints(mockComplaints);
            const allComplaints = mockComplaints;
            const total = allComplaints.length;
            const pending = allComplaints.filter((c: Complaint) => c.status === 'pending').length;
            const underAction = allComplaints.filter((c: Complaint) => c.status === 'under_action').length;
            const solved = allComplaints.filter((c: Complaint) => c.status === 'solved').length;
            const rejected = allComplaints.filter((c: Complaint) => c.status === 'rejected').length;
            const highPriority = allComplaints.filter((c: Complaint) => c.priority === 'high').length;

            setStats({
                total,
                pending,
                underAction,
                solved,
                rejected,
                highPriority,
            });
        } finally {
            setLoading(false);
        }
    };

    const getMockComplaints = (): Complaint[] => {
        return [
            {
                complaintId: 'CMP-001',
                meterNo: 'MTR-2026-001',
                subject: 'Voltage Fluctuation in Trimohoni Area',
                category: 'Voltage Issue',
                description: 'Experiencing frequent voltage fluctuations causing damage to appliances. The voltage drops below 180V during peak hours.',
                priority: 'high',
                status: 'pending',
                feederName: 'Trimohoni',
                transformerNo: 'TR-01',
                contactNumber: '01712345678',
                address: 'House #12, Trimohoni, Kushtia',
                consumerId: 'user123',
                consumerName: 'Md. Kamal Hossain',
                assignedTo: 'Not Assigned',
                remarks: '',
                createdAt: '2026-07-10T10:00:00Z',
                updatedAt: '2026-07-10T10:00:00Z',
            },
            {
                complaintId: 'CMP-002',
                meterNo: 'MTR-2026-002',
                subject: 'Incorrect Billing Amount',
                category: 'Billing Error',
                description: 'Bill for June 2026 shows ৳2,450 but actual consumption is much lower.',
                priority: 'medium',
                status: 'pending',
                feederName: 'Circuit-Hose',
                transformerNo: 'TR-03',
                contactNumber: '01712345679',
                address: 'House #5, Circuit-Hose, Kushtia',
                consumerId: 'user124',
                consumerName: 'Ms. Fatema Begum',
                assignedTo: 'Not Assigned',
                remarks: '',
                createdAt: '2026-07-09T14:30:00Z',
                updatedAt: '2026-07-09T14:30:00Z',
            },
            {
                complaintId: 'CMP-003',
                meterNo: 'MTR-2026-003',
                subject: 'Power Outage in DC-Court Area',
                category: 'Power Outage',
                description: 'No electricity for the last 4 hours in DC-Court area.',
                priority: 'high',
                status: 'under_action',
                feederName: 'DC-Court',
                transformerNo: 'TR-02',
                contactNumber: '01712345680',
                address: 'Plot #10, DC-Court, Kushtia',
                consumerId: 'user125',
                consumerName: 'Md. Rahim Uddin',
                assignedTo: 'Mr. Kamal Hossain',
                remarks: 'Team dispatched to site.',
                createdAt: '2026-07-08T09:15:00Z',
                updatedAt: '2026-07-09T11:00:00Z',
            },
            {
                complaintId: 'CMP-004',
                meterNo: 'MTR-2026-004',
                subject: 'Meter Not Working Properly',
                category: 'Meter Issue',
                description: 'Meter stops working intermittently. Digital display goes blank.',
                priority: 'medium',
                status: 'pending',
                feederName: 'N.S-Road',
                transformerNo: 'TR-05',
                contactNumber: '01712345681',
                address: 'House #20, N.S-Road, Kushtia',
                consumerId: 'user126',
                consumerName: 'Ms. Nasrin Akter',
                assignedTo: 'Not Assigned',
                remarks: '',
                createdAt: '2026-07-07T11:20:00Z',
                updatedAt: '2026-07-07T11:20:00Z',
            },
            {
                complaintId: 'CMP-005',
                meterNo: 'MTR-2026-005',
                subject: 'High Voltage Complaint',
                category: 'Voltage Issue',
                description: 'Voltage is consistently high at 250V+ damaging electronic devices.',
                priority: 'high',
                status: 'pending',
                feederName: 'Trimohoni',
                transformerNo: 'TR-01',
                contactNumber: '01712345682',
                address: 'House #8, Trimohoni, Kushtia',
                consumerId: 'user127',
                consumerName: 'Md. Shafiqul Islam',
                assignedTo: 'Not Assigned',
                remarks: '',
                createdAt: '2026-07-06T16:30:00Z',
                updatedAt: '2026-07-06T16:30:00Z',
            },
        ];
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

    const openActionModal = (complaint: Complaint, type: 'under_action' | 'solved' | 'rejected') => {
        setSelectedComplaint(complaint);
        setActionType(type);
        setActionRemarks('');
        setAssignedTo('');
        setShowActionModal(true);
    };

    const updateStatus = async () => {
        if (!selectedComplaint || !actionType) return;

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(
                `${API_URL}/api/complaints/${selectedComplaint.complaintId}/status`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token ? `Bearer ${token}` : '',
                    },
                    body: JSON.stringify({
                        status: actionType,
                        assignedTo: assignedTo || user?.name || 'Unknown',
                        remarks: actionRemarks || `${actionType.replace('_', ' ')} by complaint manager`,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update status');
            }

            await fetchComplaints();
            setShowActionModal(false);
            setSelectedComplaint(null);
            setActionType(null);
            setActionRemarks('');
            setAssignedTo('');

        } catch (error) {
            console.error('Update status error:', error);
            alert('Failed to update complaint status. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getActionLabel = () => {
        switch (actionType) {
            case 'under_action':
                return 'Start Action';
            case 'solved':
                return 'Mark as Solved';
            case 'rejected':
                return 'Reject Complaint';
            default:
                return '';
        }
    };

    const getActionColor = () => {
        switch (actionType) {
            case 'under_action':
                return 'bg-blue-600 hover:bg-blue-700';
            case 'solved':
                return 'bg-green-600 hover:bg-green-700';
            case 'rejected':
                return 'bg-red-600 hover:bg-red-700';
            default:
                return 'bg-emerald-600 hover:bg-emerald-700';
        }
    };

    const filteredComplaints = complaints.filter(complaint => {
        const matchesSearch = complaint.complaintId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            complaint.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            complaint.consumerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            complaint.meterNo.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPriority = filterPriority === 'all' || complaint.priority === filterPriority;
        return matchesSearch && matchesPriority;
    });

    const totalPages = Math.ceil(filteredComplaints.length / ITEMS_PER_PAGE);
    const paginatedComplaints = filteredComplaints.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const statCards = [
        { title: 'Total Complaints', value: stats.total, icon: FileText, bgColor: 'bg-blue-100', change: '', trend: 'neutral' as const },
        { title: 'Pending', value: stats.pending, icon: Clock, bgColor: 'bg-yellow-100', change: `${stats.pending} waiting`, trend: 'down' as const },
        { title: 'Under Action', value: stats.underAction, icon: Loader2, bgColor: 'bg-purple-100', change: `${stats.underAction} in progress`, trend: 'neutral' as const },
        { title: 'High Priority', value: stats.highPriority, icon: AlertCircle, bgColor: 'bg-red-100', change: `${stats.highPriority} urgent`, trend: 'down' as const },
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
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                        <AlertCircle size={24} className="text-emerald-600" />
                        <span>Pending Complaints</span>
                    </h1>
                    <p className="text-gray-500 text-sm">Review and manage pending consumer complaints</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={fetchComplaints}
                        className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    >
                        <RefreshCw size={16} />
                        <span>Refresh</span>
                    </button>
                    <button
                        onClick={() => router.push('/dashboard/complaint_manager')}
                        className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                    >
                        <ArrowLeft size={16} />
                        <span>Back</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">{stat.title}</p>
                                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                                </div>
                                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                                    <Icon size={20} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by complaint ID, subject, consumer, or meter..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    <div className="flex flex-wrap gap-3">
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

            {/* Complaints Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Consumer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedComplaints.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        No pending complaints found.
                                    </td>
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
                                                <p className="text-sm text-gray-800">{complaint.consumerName}</p>
                                                <p className="text-xs text-gray-400">{complaint.meterNo}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-800">{complaint.subject}</p>
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
                                                <div className="flex items-center justify-center space-x-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedComplaint(complaint);
                                                            setShowDetailsModal(true);
                                                        }}
                                                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} className="text-gray-500" />
                                                    </button>
                                                    {complaint.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => openActionModal(complaint, 'under_action')}
                                                                className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
                                                                title="Start Action"
                                                            >
                                                                <Activity size={16} className="text-blue-600" />
                                                            </button>
                                                        </>
                                                    )}
                                                    {complaint.status === 'under_action' && (
                                                        <>
                                                            <button
                                                                onClick={() => openActionModal(complaint, 'solved')}
                                                                className="p-1.5 hover:bg-green-100 rounded-lg transition-colors"
                                                                title="Mark as Solved"
                                                            >
                                                                <CheckCircle size={16} className="text-green-600" />
                                                            </button>
                                                            <button
                                                                onClick={() => openActionModal(complaint, 'rejected')}
                                                                className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                                                                title="Reject"
                                                            >
                                                                <XCircle size={16} className="text-red-600" />
                                                            </button>
                                                        </>
                                                    )}
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
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredComplaints.length)} of {filteredComplaints.length} complaints
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
            </div>

            {/* Details Modal */}
            {showDetailsModal && selectedComplaint && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-emerald-100 rounded-full">
                                    <FileText size={20} className="text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">Complaint Details</h3>
                            </div>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

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
                                <p className="text-xs text-gray-500">Priority</p>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadge(selectedComplaint.priority).color}`}>
                                    {getPriorityBadge(selectedComplaint.priority).label}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Consumer</p>
                                <p className="text-sm font-medium">{selectedComplaint.consumerName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Meter</p>
                                <p className="text-sm font-medium">{selectedComplaint.meterNo}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Contact</p>
                                <p className="text-sm font-medium">{selectedComplaint.contactNumber}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Feeder</p>
                                <p className="text-sm font-medium">{selectedComplaint.feederName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Transformer</p>
                                <p className="text-sm font-medium">{selectedComplaint.transformerNo}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-xs text-gray-500">Address</p>
                                <p className="text-sm font-medium">{selectedComplaint.address}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-xs text-gray-500">Subject</p>
                                <p className="text-sm font-medium">{selectedComplaint.subject}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-xs text-gray-500">Description</p>
                                <p className="text-sm text-gray-600">{selectedComplaint.description}</p>
                            </div>
                            {selectedComplaint.remarks && (
                                <div className="col-span-2">
                                    <p className="text-xs text-gray-500">Remarks</p>
                                    <p className="text-sm text-gray-600">{selectedComplaint.remarks}</p>
                                </div>
                            )}
                            {selectedComplaint.assignedTo && (
                                <div>
                                    <p className="text-xs text-gray-500">Assigned To</p>
                                    <p className="text-sm font-medium">{selectedComplaint.assignedTo}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-xs text-gray-500">Created At</p>
                                <p className="text-sm text-gray-600">{new Date(selectedComplaint.createdAt).toLocaleString()}</p>
                            </div>
                            {selectedComplaint.resolvedAt && (
                                <div>
                                    <p className="text-xs text-gray-500">Resolved At</p>
                                    <p className="text-sm text-green-600">{new Date(selectedComplaint.resolvedAt).toLocaleString()}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end space-x-3 pt-4 mt-4 border-t border-gray-100">
                            {selectedComplaint.status === 'pending' && (
                                <button
                                    onClick={() => {
                                        setShowDetailsModal(false);
                                        openActionModal(selectedComplaint, 'under_action');
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                                >
                                    <Activity size={16} />
                                    <span>Start Action</span>
                                </button>
                            )}
                            {selectedComplaint.status === 'under_action' && (
                                <>
                                    <button
                                        onClick={() => {
                                            setShowDetailsModal(false);
                                            openActionModal(selectedComplaint, 'solved');
                                        }}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                                    >
                                        <CheckCircle size={16} />
                                        <span>Mark Solved</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowDetailsModal(false);
                                            openActionModal(selectedComplaint, 'rejected');
                                        }}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                                    >
                                        <XCircle size={16} />
                                        <span>Reject</span>
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Modal */}
            {showActionModal && selectedComplaint && actionType && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-full ${actionType === 'under_action' ? 'bg-blue-100' :
                                    actionType === 'solved' ? 'bg-green-100' :
                                        'bg-red-100'
                                    }`}>
                                    {actionType === 'under_action' && <Activity size={20} className="text-blue-600" />}
                                    {actionType === 'solved' && <CheckCircle size={20} className="text-green-600" />}
                                    {actionType === 'rejected' && <XCircle size={20} className="text-red-600" />}
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">{getActionLabel()}</h3>
                            </div>
                            <button
                                onClick={() => setShowActionModal(false)}
                                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <p className="text-sm text-gray-600"><span className="font-medium">Complaint:</span> {selectedComplaint.complaintId}</p>
                            <p className="text-sm text-gray-600"><span className="font-medium">Consumer:</span> {selectedComplaint.consumerName}</p>
                            <p className="text-sm text-gray-600"><span className="font-medium">Subject:</span> {selectedComplaint.subject}</p>
                            <p className="text-sm text-gray-600"><span className="font-medium">Priority:</span> {getPriorityBadge(selectedComplaint.priority).label}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Assigned To
                            </label>
                            <input
                                type="text"
                                value={assignedTo}
                                onChange={(e) => setAssignedTo(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="Enter assignee name"
                            />
                        </div>

                        <div className="mt-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Remarks <span className="text-gray-400 text-xs">(Optional)</span>
                            </label>
                            <textarea
                                value={actionRemarks}
                                onChange={(e) => setActionRemarks(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder={`Add notes for ${getActionLabel().toLowerCase()}...`}
                            />
                        </div>

                        <div className="flex items-center justify-end space-x-3 pt-4 mt-4 border-t border-gray-100">
                            <button
                                onClick={() => setShowActionModal(false)}
                                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={updateStatus}
                                disabled={isSubmitting}
                                className={`px-4 py-2 text-white rounded-lg transition-colors flex items-center space-x-2 ${getActionColor()} ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        {actionType === 'under_action' && <Activity size={16} />}
                                        {actionType === 'solved' && <CheckCircle size={16} />}
                                        {actionType === 'rejected' && <XCircle size={16} />}
                                        <span>{getActionLabel()}</span>
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