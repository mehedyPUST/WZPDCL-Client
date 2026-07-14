// app/dashboard/xen/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Zap,
    FileText,
    CheckCircle,
    Clock,
    Users,
    MapPin,
    Search,
    Eye,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Loader2,
    TrendingUp,
    TrendingDown,
    Calendar,
    X,
    User,
    Phone,
    Mail,
    Home,
    CreditCard,
    Building,
    Package,
    Send,
    Check,
    XCircle,
    ArrowRight,
    Filter,
    Activity,
    Plus,
    ListChecks,
    AlertTriangle,
    Save,
    BarChart3,
    PieChart,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

interface ConnectionApplication {
    _id?: string;
    applicationId: string;
    applicantName: string;
    email: string;
    mobile: string;
    nidNo: string;
    address: string;
    connectionType: 'residential' | 'commercial' | 'industrial';
    loadRequired: number;
    voltageLevel: string;
    purpose: string;
    feederName: string;
    transformerNo: string;
    poleNumber: string;
    nearestLandmark: string;
    consumerId: string;
    status: 'pending_payment' | 'payment_done' | 'under_xen_review' | 'forwarded_to_wing' | 'team_sent' | 'connection_completed' | 'implemented' | 'rejected';
    paymentStatus: 'pending' | 'paid';
    feeAmount: number;
    assignedMeterNo: string | null;
    implementedAt: string | null;
    xenRemarks: string | null;
    connectionWingRemarks: string | null;
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

export default function XenDashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [applications, setApplications] = useState<ConnectionApplication[]>([]);
    const [selectedApp, setSelectedApp] = useState<ConnectionApplication | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [stats, setStats] = useState({
        total: 0,
        paymentDone: 0,
        underReview: 0,
        forwardedToWing: 0,
        teamSent: 0,
        connectionCompleted: 0,
        implemented: 0,
        rejected: 0,
    });
    const [user, setUser] = useState<any>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://wzpdcl-server.vercel.app';
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
            fetchApplications();
        }
    }, [user]);

    const fetchApplications = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(
                `${API_URL}/api/connection-applications/all`,
                {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch applications');
            }

            const data = await response.json();
            const apps = data.data || [];
            setApplications(apps);

            const total = apps.length;
            const paymentDone = apps.filter((a: ConnectionApplication) => a.status === 'payment_done').length;
            const underReview = apps.filter((a: ConnectionApplication) => a.status === 'under_xen_review').length;
            const forwardedToWing = apps.filter((a: ConnectionApplication) => a.status === 'forwarded_to_wing').length;
            const teamSent = apps.filter((a: ConnectionApplication) => a.status === 'team_sent').length;
            const connectionCompleted = apps.filter((a: ConnectionApplication) => a.status === 'connection_completed').length;
            const implemented = apps.filter((a: ConnectionApplication) => a.status === 'implemented').length;
            const rejected = apps.filter((a: ConnectionApplication) => a.status === 'rejected').length;

            setStats({
                total,
                paymentDone,
                underReview,
                forwardedToWing,
                teamSent,
                connectionCompleted,
                implemented,
                rejected,
            });

        } catch (error: any) {
            console.error('Error fetching applications:', error);
            setError(error.message || 'Failed to load applications');
            setApplications([]);
            setStats({
                total: 0,
                paymentDone: 0,
                underReview: 0,
                forwardedToWing: 0,
                teamSent: 0,
                connectionCompleted: 0,
                implemented: 0,
                rejected: 0,
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statuses: Record<string, { color: string; label: string; icon: any }> = {
            payment_done: { color: 'bg-blue-100 text-blue-700', label: 'Payment Done', icon: CheckCircle },
            under_xen_review: { color: 'bg-purple-100 text-purple-700', label: 'Under Review', icon: Loader2 },
            forwarded_to_wing: { color: 'bg-indigo-100 text-indigo-700', label: 'Forwarded to Wing', icon: Send },
            team_sent: { color: 'bg-purple-100 text-purple-700', label: 'Team Sent', icon: Send },
            connection_completed: { color: 'bg-orange-100 text-orange-700', label: 'Connection Completed', icon: CheckCircle },
            implemented: { color: 'bg-green-100 text-green-700', label: '✅ Implemented', icon: CheckCircle },
            rejected: { color: 'bg-red-100 text-red-700', label: 'Rejected', icon: XCircle },
        };
        return statuses[status] || statuses.payment_done;
    };

    const getConnectionTypeLabel = (type: string) => {
        const types: Record<string, string> = {
            residential: 'Residential',
            commercial: 'Commercial',
            industrial: 'Industrial',
        };
        return types[type] || type;
    };

    const filteredApplications = applications.filter(app => {
        const matchesSearch = app.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.mobile.includes(searchTerm);
        const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredApplications.length / ITEMS_PER_PAGE);
    const paginatedApps = filteredApplications.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const statCards = [
        { title: 'Total', value: stats.total, icon: FileText, bgColor: 'bg-blue-100', change: '', trend: 'neutral' as const },
        { title: 'Payment Done', value: stats.paymentDone, icon: CheckCircle, bgColor: 'bg-blue-100', change: `${stats.paymentDone} paid`, trend: 'up' as const },
        { title: 'Under Review', value: stats.underReview, icon: Loader2, bgColor: 'bg-purple-100', change: `${stats.underReview} pending`, trend: 'neutral' as const },
        { title: 'Forwarded to Wing', value: stats.forwardedToWing, icon: Send, bgColor: 'bg-indigo-100', change: `${stats.forwardedToWing} sent`, trend: 'up' as const },
        { title: 'Team Sent', value: stats.teamSent, icon: Send, bgColor: 'bg-purple-100', change: `${stats.teamSent} dispatched`, trend: 'neutral' as const },
        { title: 'Connection Completed', value: stats.connectionCompleted, icon: CheckCircle, bgColor: 'bg-orange-100', change: `${stats.connectionCompleted} done`, trend: 'up' as const },
        { title: 'Implemented', value: stats.implemented, icon: CheckCircle, bgColor: 'bg-green-100', change: `${stats.implemented} active`, trend: 'up' as const },
        { title: 'Rejected', value: stats.rejected, icon: XCircle, bgColor: 'bg-red-100', change: `${stats.rejected} rejected`, trend: 'down' as const },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={40} className="animate-spin text-emerald-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <AlertTriangle size={40} className="text-red-500 mx-auto mb-2" />
                <p className="text-red-600">{error}</p>
                <button
                    onClick={fetchApplications}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                        <Zap size={24} className="text-emerald-600" />
                        <span>XEN Dashboard</span>
                    </h1>
                    <p className="text-gray-500 text-sm">Monitor all connection applications progress</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={fetchApplications}
                        className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    >
                        <RefreshCw size={16} />
                        <span>Refresh</span>
                    </button>
                    <button
                        onClick={() => router.push('/dashboard/xen/new-connection-applications')}
                        className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                    >
                        <FileText size={16} />
                        <span>Review Applications</span>
                    </button>
                </div>
            </div>

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

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Application Progress Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
                    <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-2xl font-bold text-blue-600">{stats.paymentDone}</p>
                        <p className="text-xs text-gray-500">Payment Done</p>
                    </div>
                    <div className="flex items-center justify-center text-gray-400">
                        <ArrowRight size={20} />
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-2xl font-bold text-purple-600">{stats.underReview}</p>
                        <p className="text-xs text-gray-500">Under Review</p>
                    </div>
                    <div className="flex items-center justify-center text-gray-400">
                        <ArrowRight size={20} />
                    </div>
                    <div className="text-center p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                        <p className="text-2xl font-bold text-indigo-600">{stats.forwardedToWing}</p>
                        <p className="text-xs text-gray-500">Forwarded to Wing</p>
                    </div>
                    <div className="flex items-center justify-center text-gray-400">
                        <ArrowRight size={20} />
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-2xl font-bold text-purple-600">{stats.teamSent}</p>
                        <p className="text-xs text-gray-500">Team Sent</p>
                    </div>
                    <div className="flex items-center justify-center text-gray-400">
                        <ArrowRight size={20} />
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <p className="text-2xl font-bold text-orange-600">{stats.connectionCompleted}</p>
                        <p className="text-xs text-gray-500">Connection Completed</p>
                    </div>
                    <div className="flex items-center justify-center text-gray-400">
                        <ArrowRight size={20} />
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-2xl font-bold text-green-600">{stats.implemented}</p>
                        <p className="text-xs text-gray-500">Implemented</p>
                    </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                    <span>Total: {stats.total} applications</span>
                    <span>Completion Rate: {stats.total > 0 ? Math.round((stats.implemented / stats.total) * 100) : 0}%</span>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by application ID, name, or mobile..."
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
                            <option value="payment_done">Payment Done</option>
                            <option value="under_xen_review">Under Review</option>
                            <option value="forwarded_to_wing">Forwarded to Wing</option>
                            <option value="team_sent">Team Sent</option>
                            <option value="connection_completed">Connection Completed</option>
                            <option value="implemented">Implemented</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <button
                            onClick={() => {
                                setSearchTerm('');
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

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Application ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Load</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedApps.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        No applications found.
                                    </td>
                                </tr>
                            ) : (
                                paginatedApps.map((app) => {
                                    const StatusBadge = getStatusBadge(app.status);
                                    const StatusIcon = StatusBadge.icon;

                                    return (
                                        <tr key={app.applicationId} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-gray-800">{app.applicationId}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-800">{app.applicantName}</p>
                                                <p className="text-xs text-gray-400">{app.mobile}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-600">{getConnectionTypeLabel(app.connectionType)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-600">{app.loadRequired} kW</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 w-fit ${StatusBadge.color}`}>
                                                    <StatusIcon size={12} />
                                                    <span>{StatusBadge.label}</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => {
                                                        setSelectedApp(app);
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

                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredApplications.length)} of {filteredApplications.length} applications
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

            {showDetailsModal && selectedApp && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-emerald-100 rounded-full">
                                    <FileText size={20} className="text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">Application Details</h3>
                            </div>
                            <button onClick={() => setShowDetailsModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div><p className="text-xs text-gray-500">Application ID</p><p className="text-sm font-medium">{selectedApp.applicationId}</p></div>
                            <div><p className="text-xs text-gray-500">Status</p><span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(selectedApp.status).color}`}>{getStatusBadge(selectedApp.status).label}</span></div>
                            <div><p className="text-xs text-gray-500">Applicant</p><p className="text-sm font-medium">{selectedApp.applicantName}</p></div>
                            <div><p className="text-xs text-gray-500">Type</p><p className="text-sm font-medium">{getConnectionTypeLabel(selectedApp.connectionType)}</p></div>
                            <div><p className="text-xs text-gray-500">Mobile</p><p className="text-sm font-medium">{selectedApp.mobile}</p></div>
                            <div><p className="text-xs text-gray-500">Email</p><p className="text-sm font-medium">{selectedApp.email}</p></div>
                            <div><p className="text-xs text-gray-500">Load</p><p className="text-sm font-medium">{selectedApp.loadRequired} kW</p></div>
                            <div><p className="text-xs text-gray-500">Feeder</p><p className="text-sm font-medium">{selectedApp.feederName}</p></div>
                            <div className="col-span-2"><p className="text-xs text-gray-500">Address</p><p className="text-sm font-medium">{selectedApp.address}</p></div>
                            {selectedApp.xenRemarks && (
                                <div className="col-span-2"><p className="text-xs text-gray-500">XEN Remarks</p><p className="text-sm text-gray-600">{selectedApp.xenRemarks}</p></div>
                            )}
                            {selectedApp.connectionWingRemarks && (
                                <div className="col-span-2"><p className="text-xs text-gray-500">Wing Remarks</p><p className="text-sm text-gray-600">{selectedApp.connectionWingRemarks}</p></div>
                            )}
                            {selectedApp.assignedMeterNo && (
                                <div className="col-span-2"><p className="text-xs text-gray-500">Assigned Meter</p><p className="text-sm font-bold text-emerald-600">{selectedApp.assignedMeterNo}</p></div>
                            )}
                            <div><p className="text-xs text-gray-500">Created</p><p className="text-sm text-gray-600">{new Date(selectedApp.createdAt).toLocaleString()}</p></div>
                            {selectedApp.implementedAt && (
                                <div><p className="text-xs text-gray-500">Implemented</p><p className="text-sm text-green-600">{new Date(selectedApp.implementedAt).toLocaleString()}</p></div>
                            )}
                        </div>

                        <div className="flex items-center justify-end space-x-3 pt-4 mt-4 border-t border-gray-100">
                            <button onClick={() => setShowDetailsModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}