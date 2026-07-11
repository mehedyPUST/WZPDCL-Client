// app/dashboard/xen/new-connection-applications/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    FileText,
    AlertCircle,
    CheckCircle,
    Clock,
    Users,
    Zap,
    MapPin,
    Search,
    Eye,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Loader2,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Calendar,
    ArrowRight,
    Filter,
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
    Printer,
    Download,
    PieChart,
    BarChart3,
    Activity,
    ThumbsUp,
    ThumbsDown,
    Clock as ClockIcon,
    MessageSquare,
    FileCheck,
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
    status: 'pending_payment' | 'payment_done' | 'under_xen_review' | 'forwarded_to_wing' | 'implemented' | 'rejected';
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

export default function XenNewConnectionApplicationsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [applications, setApplications] = useState<ConnectionApplication[]>([]);
    const [selectedApp, setSelectedApp] = useState<ConnectionApplication | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
    const [reviewRemarks, setReviewRemarks] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        implemented: 0,
        totalAmount: 0,
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
            fetchApplications();
        }
    }, [user]);

    const fetchApplications = async () => {
        setLoading(true);
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

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch applications');
            }

            const apps = data.data || [];

            // ✅ Filter: Only show applications that have payment done
            const filteredApps = apps.filter((app: ConnectionApplication) =>
                app.status === 'payment_done' ||
                app.status === 'under_xen_review' ||
                app.status === 'forwarded_to_wing' ||
                app.status === 'implemented' ||
                app.status === 'rejected'
            );

            setApplications(filteredApps);

            // Update stats
            const total = filteredApps.length;
            const pending = filteredApps.filter((a: ConnectionApplication) => a.status === 'payment_done' || a.status === 'under_xen_review').length;
            const approved = filteredApps.filter((a: ConnectionApplication) => a.status === 'forwarded_to_wing').length;
            const rejected = filteredApps.filter((a: ConnectionApplication) => a.status === 'rejected').length;
            const implemented = filteredApps.filter((a: ConnectionApplication) => a.status === 'implemented').length;
            const totalAmount = filteredApps.reduce((sum, a) => sum + a.feeAmount, 0);

            setStats({
                total,
                pending,
                approved,
                rejected,
                implemented,
                totalAmount,
            });

        } catch (error) {
            console.error('Error fetching applications:', error);
            // Use mock data on error
            const mockApps = getMockApplications();
            setApplications(mockApps);
            const total = mockApps.length;
            const pending = mockApps.filter((a: ConnectionApplication) => a.status === 'payment_done' || a.status === 'under_xen_review').length;
            const approved = mockApps.filter((a: ConnectionApplication) => a.status === 'forwarded_to_wing').length;
            const rejected = mockApps.filter((a: ConnectionApplication) => a.status === 'rejected').length;
            const implemented = mockApps.filter((a: ConnectionApplication) => a.status === 'implemented').length;
            const totalAmount = mockApps.reduce((sum, a) => sum + a.feeAmount, 0);

            setStats({
                total,
                pending,
                approved,
                rejected,
                implemented,
                totalAmount,
            });
        } finally {
            setLoading(false);
        }
    };

    const getMockApplications = (): ConnectionApplication[] => {
        return [
            {
                applicationId: 'APP-2026-8835',
                applicantName: 'Md. Kamal Hossain',
                email: 'kamal@example.com',
                mobile: '01712345678',
                nidNo: '12345678901234567',
                address: 'House #12, Road #5, Trimohoni, Kushtia',
                connectionType: 'residential',
                loadRequired: 5,
                voltageLevel: '220',
                purpose: 'New house construction',
                feederName: 'Trimohoni',
                transformerNo: 'TR-01',
                poleNumber: 'P-123',
                nearestLandmark: 'Near Trimohoni Bazar',
                consumerId: 'user123',
                status: 'payment_done',
                paymentStatus: 'paid',
                feeAmount: 5000,
                assignedMeterNo: null,
                implementedAt: null,
                xenRemarks: null,
                connectionWingRemarks: null,
                createdAt: '2026-07-10T10:00:00Z',
                updatedAt: '2026-07-10T10:00:00Z',
            },
            {
                applicationId: 'APP-2026-8836',
                applicantName: 'Ms. Fatema Begum',
                email: 'fatema@example.com',
                mobile: '01712345679',
                nidNo: '12345678901234568',
                address: 'House #5, Circuit-Hose, Kushtia',
                connectionType: 'commercial',
                loadRequired: 15,
                voltageLevel: '380',
                purpose: 'New retail shop',
                feederName: 'Circuit-Hose',
                transformerNo: 'TR-03',
                poleNumber: 'P-456',
                nearestLandmark: 'Near Circuit-Hose School',
                consumerId: 'user124',
                status: 'under_xen_review',
                paymentStatus: 'paid',
                feeAmount: 10000,
                assignedMeterNo: null,
                implementedAt: null,
                xenRemarks: null,
                connectionWingRemarks: null,
                createdAt: '2026-07-09T14:30:00Z',
                updatedAt: '2026-07-09T14:30:00Z',
            },
            {
                applicationId: 'APP-2026-8837',
                applicantName: 'Md. Rahim Uddin',
                email: 'rahim@example.com',
                mobile: '01712345680',
                nidNo: '12345678901234569',
                address: 'Plot #10, DC-Court, Kushtia',
                connectionType: 'industrial',
                loadRequired: 30,
                voltageLevel: '11000',
                purpose: 'Small factory',
                feederName: 'DC-Court',
                transformerNo: 'TR-02',
                poleNumber: 'P-789',
                nearestLandmark: 'Opposite DC-Court',
                consumerId: 'user125',
                status: 'forwarded_to_wing',
                paymentStatus: 'paid',
                feeAmount: 15000,
                assignedMeterNo: 'MTR-2026-010',
                implementedAt: null,
                xenRemarks: 'Approved. Send to connection wing.',
                connectionWingRemarks: null,
                createdAt: '2026-07-08T09:15:00Z',
                updatedAt: '2026-07-09T11:00:00Z',
            },
            {
                applicationId: 'APP-2026-8838',
                applicantName: 'Ms. Nasrin Akter',
                email: 'nasrin@example.com',
                mobile: '01712345681',
                nidNo: '12345678901234570',
                address: 'House #20, N.S-Road, Kushtia',
                connectionType: 'residential',
                loadRequired: 3,
                voltageLevel: '220',
                purpose: 'New apartment',
                feederName: 'N.S-Road',
                transformerNo: 'TR-05',
                poleNumber: 'P-321',
                nearestLandmark: 'Near N.S-Road Market',
                consumerId: 'user126',
                status: 'implemented',
                paymentStatus: 'paid',
                feeAmount: 5000,
                assignedMeterNo: 'MTR-2026-011',
                implementedAt: '2026-07-10T08:00:00Z',
                xenRemarks: 'Approved. Implemented.',
                connectionWingRemarks: 'Connection completed.',
                createdAt: '2026-07-05T16:45:00Z',
                updatedAt: '2026-07-10T08:00:00Z',
            },
            {
                applicationId: 'APP-2026-8839',
                applicantName: 'Md. Shafiqul Islam',
                email: 'shafiq@example.com',
                mobile: '01712345682',
                nidNo: '12345678901234571',
                address: 'House #8, Trimohoni, Kushtia',
                connectionType: 'commercial',
                loadRequired: 10,
                voltageLevel: '380',
                purpose: 'Restaurant',
                feederName: 'Trimohoni',
                transformerNo: 'TR-01',
                poleNumber: 'P-654',
                nearestLandmark: 'Near Trimohoni Bridge',
                consumerId: 'user127',
                status: 'rejected',
                paymentStatus: 'paid',
                feeAmount: 10000,
                assignedMeterNo: null,
                implementedAt: null,
                xenRemarks: 'Insufficient load capacity in the area.',
                connectionWingRemarks: null,
                createdAt: '2026-07-07T11:30:00Z',
                updatedAt: '2026-07-08T09:00:00Z',
            },
        ];
    };

    const getStatusBadge = (status: string) => {
        const statuses: Record<string, { color: string; label: string; icon: any }> = {
            pending_payment: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending Payment', icon: Clock },
            payment_done: { color: 'bg-blue-100 text-blue-700', label: 'Payment Done', icon: CheckCircle },
            under_xen_review: { color: 'bg-purple-100 text-purple-700', label: 'Under Review', icon: Loader2 },
            forwarded_to_wing: { color: 'bg-orange-100 text-orange-700', label: 'Forwarded to Wing', icon: Send },
            implemented: { color: 'bg-green-100 text-green-700', label: 'Implemented', icon: CheckCircle },
            rejected: { color: 'bg-red-100 text-red-700', label: 'Rejected', icon: XCircle },
        };
        return statuses[status] || statuses.pending_payment;
    };

    const getConnectionTypeLabel = (type: string) => {
        const types: Record<string, string> = {
            residential: 'Residential',
            commercial: 'Commercial',
            industrial: 'Industrial',
        };
        return types[type] || type;
    };

    const handleReview = (app: ConnectionApplication, action: 'approve' | 'reject') => {
        setSelectedApp(app);
        setReviewAction(action);
        setReviewRemarks('');
        setShowReviewModal(true);
    };

    const submitReview = async () => {
        if (!selectedApp) return;
        setIsSubmitting(true);

        try {
            const token = localStorage.getItem('auth_token');

            let newStatus = '';
            if (reviewAction === 'approve') {
                newStatus = 'forwarded_to_wing';
            } else {
                newStatus = 'rejected';
            }

            const response = await fetch(
                `${API_URL}/api/connection-applications/${selectedApp.applicationId}/status`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token ? `Bearer ${token}` : '',
                    },
                    body: JSON.stringify({
                        status: newStatus,
                        xenRemarks: reviewRemarks || (reviewAction === 'approve' ? 'Approved for implementation' : 'Rejected'),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update status');
            }

            await fetchApplications();

            setShowReviewModal(false);
            setSelectedApp(null);
            setReviewAction(null);
            setReviewRemarks('');

        } catch (error) {
            console.error('Review error:', error);
            alert('Failed to submit review. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredApplications = applications.filter(app => {
        const matchesSearch = app.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.mobile.includes(searchTerm) ||
            app.address.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
        const matchesType = filterType === 'all' || app.connectionType === filterType;
        return matchesSearch && matchesStatus && matchesType;
    });

    const totalPages = Math.ceil(filteredApplications.length / ITEMS_PER_PAGE);
    const paginatedApps = filteredApplications.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const statCards = [
        { title: 'Total Applications', value: stats.total, icon: FileText, bgColor: 'bg-blue-100', change: '', trend: 'neutral' as const },
        { title: 'Pending Review', value: stats.pending, icon: Clock, bgColor: 'bg-yellow-100', change: `${stats.pending} waiting`, trend: 'down' as const },
        { title: 'Approved', value: stats.approved, icon: ThumbsUp, bgColor: 'bg-green-100', change: `${stats.approved} forwarded`, trend: 'up' as const },
        { title: 'Rejected', value: stats.rejected, icon: ThumbsDown, bgColor: 'bg-red-100', change: `${stats.rejected} rejected`, trend: 'down' as const },
        { title: 'Total Amount', value: `৳${stats.totalAmount.toLocaleString()}`, icon: DollarSign, bgColor: 'bg-emerald-100', change: '', trend: 'neutral' as const },
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
                        <span>New Connection Applications</span>
                    </h1>
                    <p className="text-gray-500 text-sm">Review and manage new connection applications</p>
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
                        onClick={() => router.push('/dashboard/xen/all-transactions')}
                        className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    >
                        <FileText size={16} />
                        <span>Transactions</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
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
                            placeholder="Search by application ID, name, mobile, or address..."
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
                            <option value="implemented">Implemented</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                            <option value="all">All Types</option>
                            <option value="residential">Residential</option>
                            <option value="commercial">Commercial</option>
                            <option value="industrial">Industrial</option>
                        </select>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilterStatus('all');
                                setFilterType('all');
                            }}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                        >
                            <RefreshCw size={16} />
                            <span>Reset</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Applications Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Application ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Load</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedApps.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
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
                                                <span className="text-sm font-medium text-gray-800">৳{app.feeAmount.toLocaleString()}</span>
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
                                                            setSelectedApp(app);
                                                            setShowDetailsModal(true);
                                                        }}
                                                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} className="text-gray-500" />
                                                    </button>
                                                    {app.status === 'payment_done' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleReview(app, 'approve')}
                                                                className="p-1.5 hover:bg-green-100 rounded-lg transition-colors"
                                                                title="Approve"
                                                            >
                                                                <ThumbsUp size={16} className="text-green-600" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleReview(app, 'reject')}
                                                                className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                                                                title="Reject"
                                                            >
                                                                <ThumbsDown size={16} className="text-red-600" />
                                                            </button>
                                                        </>
                                                    )}
                                                    {app.status === 'under_xen_review' && (
                                                        <span className="text-xs text-purple-600 font-medium">Under Review</span>
                                                    )}
                                                    {app.status === 'forwarded_to_wing' && (
                                                        <span className="text-xs text-orange-600 font-medium">Forwarded</span>
                                                    )}
                                                    {app.status === 'implemented' && (
                                                        <span className="text-xs text-green-600 font-medium">✅ Implemented</span>
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

            {/* Application Details Modal */}
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
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500">Application ID</p>
                                <p className="text-sm font-medium">{selectedApp.applicationId}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Status</p>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(selectedApp.status).color}`}>
                                    {getStatusBadge(selectedApp.status).label}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Applicant Name</p>
                                <p className="text-sm font-medium">{selectedApp.applicantName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Connection Type</p>
                                <p className="text-sm font-medium">{getConnectionTypeLabel(selectedApp.connectionType)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Mobile</p>
                                <p className="text-sm font-medium">{selectedApp.mobile}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Email</p>
                                <p className="text-sm font-medium">{selectedApp.email}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Load Required</p>
                                <p className="text-sm font-medium">{selectedApp.loadRequired} kW</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Voltage Level</p>
                                <p className="text-sm font-medium">{selectedApp.voltageLevel}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Feeder</p>
                                <p className="text-sm font-medium">{selectedApp.feederName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Transformer</p>
                                <p className="text-sm font-medium">{selectedApp.transformerNo || 'N/A'}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-xs text-gray-500">Address</p>
                                <p className="text-sm font-medium">{selectedApp.address}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-xs text-gray-500">Purpose</p>
                                <p className="text-sm font-medium">{selectedApp.purpose}</p>
                            </div>
                            {selectedApp.xenRemarks && (
                                <div className="col-span-2">
                                    <p className="text-xs text-gray-500">XEN Remarks</p>
                                    <p className="text-sm text-gray-600">{selectedApp.xenRemarks}</p>
                                </div>
                            )}
                            {selectedApp.connectionWingRemarks && (
                                <div className="col-span-2">
                                    <p className="text-xs text-gray-500">Wing Remarks</p>
                                    <p className="text-sm text-gray-600">{selectedApp.connectionWingRemarks}</p>
                                </div>
                            )}
                            {selectedApp.assignedMeterNo && (
                                <div className="col-span-2">
                                    <p className="text-xs text-gray-500">Assigned Meter</p>
                                    <p className="text-sm font-bold text-emerald-600">{selectedApp.assignedMeterNo}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-xs text-gray-500">Created At</p>
                                <p className="text-sm text-gray-600">{new Date(selectedApp.createdAt).toLocaleString()}</p>
                            </div>
                            {selectedApp.implementedAt && (
                                <div>
                                    <p className="text-xs text-gray-500">Implemented At</p>
                                    <p className="text-sm text-green-600">{new Date(selectedApp.implementedAt).toLocaleString()}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end space-x-3 pt-4 mt-4 border-t border-gray-100">
                            {selectedApp.status === 'payment_done' && (
                                <>
                                    <button
                                        onClick={() => {
                                            setShowDetailsModal(false);
                                            handleReview(selectedApp, 'reject');
                                        }}
                                        className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                    >
                                        <ThumbsDown size={16} className="inline mr-1" />
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowDetailsModal(false);
                                            handleReview(selectedApp, 'approve');
                                        }}
                                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                                    >
                                        <ThumbsUp size={16} className="inline mr-1" />
                                        Approve
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

            {/* Review Modal */}
            {showReviewModal && selectedApp && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-full ${reviewAction === 'approve' ? 'bg-green-100' : 'bg-red-100'
                                    }`}>
                                    {reviewAction === 'approve' ? (
                                        <ThumbsUp size={20} className="text-green-600" />
                                    ) : (
                                        <ThumbsDown size={20} className="text-red-600" />
                                    )}
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {reviewAction === 'approve' ? 'Approve Application' : 'Reject Application'}
                                </h3>
                            </div>
                            <button
                                onClick={() => {
                                    setShowReviewModal(false);
                                    setSelectedApp(null);
                                    setReviewAction(null);
                                }}
                                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">Application:</span> {selectedApp.applicationId}
                            </p>
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">Applicant:</span> {selectedApp.applicantName}
                            </p>
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">Type:</span> {getConnectionTypeLabel(selectedApp.connectionType)}
                            </p>
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">Load:</span> {selectedApp.loadRequired} kW
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Remarks <span className="text-gray-400 text-xs">(Optional)</span>
                            </label>
                            <textarea
                                value={reviewRemarks}
                                onChange={(e) => setReviewRemarks(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder={reviewAction === 'approve' ?
                                    'Add any notes for approval...' :
                                    'Reason for rejection...'
                                }
                            />
                        </div>

                        <div className="flex items-center justify-end space-x-3 pt-4 mt-4 border-t border-gray-100">
                            <button
                                onClick={() => {
                                    setShowReviewModal(false);
                                    setSelectedApp(null);
                                    setReviewAction(null);
                                }}
                                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitReview}
                                disabled={isSubmitting}
                                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${reviewAction === 'approve'
                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                        : 'bg-red-600 hover:bg-red-700 text-white'
                                    } ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        {reviewAction === 'approve' ? <ThumbsUp size={16} /> : <ThumbsDown size={16} />}
                                        <span>{reviewAction === 'approve' ? 'Approve' : 'Reject'}</span>
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