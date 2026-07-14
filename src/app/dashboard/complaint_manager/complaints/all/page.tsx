// app/dashboard/complaint_manager/complaints/all/page.tsx
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
    BarChart3,
    PieChart,
    Download,
    Printer,
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

export default function ComplaintManagerAllPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        underAction: 0,
        solved: 0,
        rejected: 0,
        highPriority: 0,
        mediumPriority: 0,
        lowPriority: 0,
    });
    const [user, setUser] = useState<any>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const ITEMS_PER_PAGE = 10;

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
            setComplaints(allComplaints);

            // Update stats
            const total = allComplaints.length;
            const pending = allComplaints.filter((c: Complaint) => c.status === 'pending').length;
            const underAction = allComplaints.filter((c: Complaint) => c.status === 'under_action').length;
            const solved = allComplaints.filter((c: Complaint) => c.status === 'solved').length;
            const rejected = allComplaints.filter((c: Complaint) => c.status === 'rejected').length;
            const highPriority = allComplaints.filter((c: Complaint) => c.priority === 'high').length;
            const mediumPriority = allComplaints.filter((c: Complaint) => c.priority === 'medium').length;
            const lowPriority = allComplaints.filter((c: Complaint) => c.priority === 'low').length;

            setStats({
                total,
                pending,
                underAction,
                solved,
                rejected,
                highPriority,
                mediumPriority,
                lowPriority,
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
            const mediumPriority = allComplaints.filter((c: Complaint) => c.priority === 'medium').length;
            const lowPriority = allComplaints.filter((c: Complaint) => c.priority === 'low').length;

            setStats({
                total,
                pending,
                underAction,
                solved,
                rejected,
                highPriority,
                mediumPriority,
                lowPriority,
            });
        } finally {
            setLoading(false);
        }
    };

    const getMockComplaints = (): Complaint[] => {
        const categories = ['Voltage Issue', 'Power Outage', 'Billing Error', 'Meter Issue', 'Technical Fault', 'Transformer Issue', 'Line Fault', 'Other'];
        const statuses: ('pending' | 'under_action' | 'solved' | 'rejected')[] = ['pending', 'under_action', 'solved', 'rejected'];
        const priorities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
        const consumers = [
            { name: 'Md. Kamal Hossain', meter: 'MTR-2026-001', feeder: 'Trimohoni', phone: '01712345678' },
            { name: 'Ms. Fatema Begum', meter: 'MTR-2026-002', feeder: 'Circuit-Hose', phone: '01712345679' },
            { name: 'Md. Rahim Uddin', meter: 'MTR-2026-003', feeder: 'DC-Court', phone: '01712345680' },
            { name: 'Ms. Nasrin Akter', meter: 'MTR-2026-004', feeder: 'N.S-Road', phone: '01712345681' },
            { name: 'Md. Shafiqul Islam', meter: 'MTR-2026-005', feeder: 'Trimohoni', phone: '01712345682' },
            { name: 'Ms. Jannatul Ferdous', meter: 'MTR-2026-006', feeder: 'Circuit-Hose', phone: '01712345683' },
            { name: 'Md. Abdur Rahman', meter: 'MTR-2026-007', feeder: 'DC-Court', phone: '01712345684' },
            { name: 'Ms. Salma Khatun', meter: 'MTR-2026-008', feeder: 'N.S-Road', phone: '01712345685' },
            { name: 'Md. Abul Kalam', meter: 'MTR-2026-009', feeder: 'Trimohoni', phone: '01712345686' },
            { name: 'Ms. Laila Akter', meter: 'MTR-2026-010', feeder: 'Circuit-Hose', phone: '01712345687' },
            { name: 'Md. Shahidul Islam', meter: 'MTR-2026-011', feeder: 'DC-Court', phone: '01712345688' },
            { name: 'Ms. Marium Begum', meter: 'MTR-2026-012', feeder: 'N.S-Road', phone: '01712345689' },
        ];

        const subjects = [
            'Voltage Fluctuation in Area',
            'Incorrect Billing Amount',
            'Power Outage Issue',
            'Meter Not Working',
            'High Voltage Complaint',
            'Frequent Power Cut',
            'Billing Discrepancy',
            'Transformer Issue',
            'Line Fault',
            'No Electricity for Hours'
        ];

        return consumers.map((consumer, index) => {
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const priority = priorities[Math.floor(Math.random() * priorities.length)];
            const category = categories[Math.floor(Math.random() * categories.length)];
            const subject = subjects[Math.floor(Math.random() * subjects.length)];
            const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
            const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
            const hour = String(Math.floor(Math.random() * 24)).padStart(2, '0');
            const minute = String(Math.floor(Math.random() * 60)).padStart(2, '0');

            return {
                complaintId: `CMP-${String(index + 1).padStart(3, '0')}`,
                meterNo: consumer.meter,
                subject,
                category,
                description: `Experiencing ${subject.toLowerCase()} in ${consumer.feeder} area. Please resolve this issue as soon as possible.`,
                priority,
                status,
                feederName: consumer.feeder,
                transformerNo: `TR-${String(Math.floor(Math.random() * 10) + 1).padStart(2, '0')}`,
                contactNumber: consumer.phone,
                address: `House #${Math.floor(Math.random() * 50) + 1}, ${consumer.feeder}, Kushtia`,
                consumerId: `user${String(index + 1).padStart(3, '0')}`,
                consumerName: consumer.name,
                assignedTo: status === 'pending' ? 'Not Assigned' : ['Mr. Kamal', 'Mr. Rahim', 'Ms. Nasrin'][Math.floor(Math.random() * 3)],
                remarks: status === 'pending' ? '' : ['Issue resolved', 'Work in progress', 'Team dispatched'][Math.floor(Math.random() * 3)],
                resolvedAt: status === 'solved' ? `2026-${month}-${day}T${hour}:${minute}:00Z` : undefined,
                createdAt: `2026-${month}-${day}T${hour}:${minute}:00Z`,
                updatedAt: `2026-${month}-${day}T${hour}:${minute}:00Z`,
            };
        });
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

    const filteredComplaints = complaints.filter(complaint => {
        const matchesSearch = complaint.complaintId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            complaint.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            complaint.consumerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            complaint.meterNo.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || complaint.status === filterStatus;
        const matchesPriority = filterPriority === 'all' || complaint.priority === filterPriority;
        return matchesSearch && matchesStatus && matchesPriority;
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
        { title: 'Solved', value: stats.solved, icon: CheckCircle, bgColor: 'bg-green-100', change: `${stats.solved} resolved`, trend: 'up' as const },
        { title: 'Rejected', value: stats.rejected, icon: XCircle, bgColor: 'bg-red-100', change: `${stats.rejected} rejected`, trend: 'down' as const },
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
                        <FileText size={24} className="text-emerald-600" />
                        <span>All Complaints</span>
                    </h1>
                    <p className="text-gray-500 text-sm">View and manage all consumer complaints</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={fetchComplaints}
                        className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    >
                        <RefreshCw size={16} />
                        <span>Refresh</span>
                    </button>
                    <button className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                        <Download size={16} />
                        <span>Export</span>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
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

            {/* Complaints Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Consumer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedComplaints.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                                        No complaints found.
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
                                                <p className="text-sm text-gray-600">
                                                    {new Date(complaint.createdAt).toLocaleDateString()}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
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
                                        router.push(`/dashboard/complaint_manager/complaints/pending`);
                                    }}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                                >
                                    Take Action
                                </button>
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
        </div>
    );
}