// app/dashboard/connection_wing/page.tsx
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
    status: 'pending_payment' | 'payment_done' | 'under_xen_review' | 'forwarded_to_wing' | 'team_sent' | 'in_progress' | 'connection_completed' | 'implemented' | 'rejected';
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

export default function ConnectionWingDashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [applications, setApplications] = useState<ConnectionApplication[]>([]);
    const [selectedApp, setSelectedApp] = useState<ConnectionApplication | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showAssignMeterModal, setShowAssignMeterModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        pendingXen: 0,
        forwardedToWing: 0,
        inProgress: 0,
        completed: 0,
    });
    const [user, setUser] = useState<any>(null);

    // Meter assignment form
    const [meterForm, setMeterForm] = useState({
        meterNo: '',
        initialReading: '',
        connectionWingRemarks: '',
    });

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
                `${API_URL}/api/connection-wing/applications`,
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
            setApplications(apps);

            // Update stats
            const total = apps.length;
            const forwardedToWing = apps.filter((a: ConnectionApplication) => a.status === 'forwarded_to_wing').length;
            const teamSent = apps.filter((a: ConnectionApplication) => a.status === 'team_sent').length;
            const inProgress = apps.filter((a: ConnectionApplication) => a.status === 'in_progress').length;
            const completed = apps.filter((a: ConnectionApplication) => a.status === 'connection_completed' || a.status === 'implemented').length;

            setStats({
                total,
                pendingXen: 0,
                forwardedToWing: forwardedToWing + teamSent,
                inProgress,
                completed,
            });

        } catch (error) {
            console.error('Error fetching applications:', error);
            // Mock data
            const mockApps = getMockApplications();
            setApplications(mockApps);
            const total = mockApps.length;
            const forwardedToWing = mockApps.filter((a: ConnectionApplication) => a.status === 'forwarded_to_wing').length;
            const teamSent = mockApps.filter((a: ConnectionApplication) => a.status === 'team_sent').length;
            const inProgress = mockApps.filter((a: ConnectionApplication) => a.status === 'in_progress').length;
            const completed = mockApps.filter((a: ConnectionApplication) => a.status === 'connection_completed' || a.status === 'implemented').length;

            setStats({
                total,
                pendingXen: 0,
                forwardedToWing: forwardedToWing + teamSent,
                inProgress,
                completed,
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
                status: 'forwarded_to_wing',
                paymentStatus: 'paid',
                feeAmount: 5000,
                assignedMeterNo: null,
                implementedAt: null,
                xenRemarks: 'Approved. Send to connection wing.',
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
                status: 'team_sent',
                paymentStatus: 'paid',
                feeAmount: 10000,
                assignedMeterNo: null,
                implementedAt: null,
                xenRemarks: 'Approved.',
                connectionWingRemarks: 'Team assigned for implementation.',
                createdAt: '2026-07-09T14:30:00Z',
                updatedAt: '2026-07-10T08:00:00Z',
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
                status: 'in_progress',
                paymentStatus: 'paid',
                feeAmount: 15000,
                assignedMeterNo: null,
                implementedAt: null,
                xenRemarks: 'Approved.',
                connectionWingRemarks: 'Installation in progress.',
                createdAt: '2026-07-08T09:15:00Z',
                updatedAt: '2026-07-10T09:00:00Z',
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
                status: 'connection_completed',
                paymentStatus: 'paid',
                feeAmount: 5000,
                assignedMeterNo: 'MTR-2026-011',
                implementedAt: '2026-07-10T08:00:00Z',
                xenRemarks: 'Approved.',
                connectionWingRemarks: 'Connection completed successfully.',
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
                status: 'forwarded_to_wing',
                paymentStatus: 'paid',
                feeAmount: 10000,
                assignedMeterNo: null,
                implementedAt: null,
                xenRemarks: 'Approved.',
                connectionWingRemarks: null,
                createdAt: '2026-07-07T11:30:00Z',
                updatedAt: '2026-07-08T09:00:00Z',
            },
        ];
    };

    const getStatusBadge = (status: string) => {
        const statuses: Record<string, { color: string; label: string; icon: any }> = {
            forwarded_to_wing: { color: 'bg-blue-100 text-blue-700', label: 'New Assignment', icon: Clock },
            team_sent: { color: 'bg-purple-100 text-purple-700', label: 'Team Sent', icon: Send },
            in_progress: { color: 'bg-yellow-100 text-yellow-700', label: 'In Progress', icon: Loader2 },
            connection_completed: { color: 'bg-orange-100 text-orange-700', label: 'Completed - Pending Meter', icon: CheckCircle },
            implemented: { color: 'bg-green-100 text-green-700', label: 'Implemented', icon: CheckCircle },
            rejected: { color: 'bg-red-100 text-red-700', label: 'Rejected', icon: XCircle },
        };
        return statuses[status] || statuses.forwarded_to_wing;
    };

    const getConnectionTypeLabel = (type: string) => {
        const types: Record<string, string> = {
            residential: 'Residential',
            commercial: 'Commercial',
            industrial: 'Industrial',
        };
        return types[type] || type;
    };

    const updateStatus = async (app: ConnectionApplication, newStatus: string) => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(
                `${API_URL}/api/connection-wing/applications/${app.applicationId}/status`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token ? `Bearer ${token}` : '',
                    },
                    body: JSON.stringify({
                        status: newStatus,
                        connectionWingRemarks: `${newStatus.replace('_', ' ')} by connection wing`,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update status');
            }

            await fetchApplications();
        } catch (error) {
            console.error('Update status error:', error);
            alert('Failed to update status. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openAssignMeterModal = (app: ConnectionApplication) => {
        setSelectedApp(app);
        setMeterForm({
            meterNo: '',
            initialReading: '',
            connectionWingRemarks: '',
        });
        setShowAssignMeterModal(true);
    };

    const submitAssignMeter = async () => {
        if (!selectedApp) return;

        if (!meterForm.meterNo) {
            alert('Please enter a meter number');
            return;
        }
        if (!meterForm.initialReading) {
            alert('Please enter initial meter reading');
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(
                `${API_URL}/api/connection-wing/applications/${selectedApp.applicationId}/assign-meter`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token ? `Bearer ${token}` : '',
                    },
                    body: JSON.stringify({
                        meterNo: meterForm.meterNo,
                        initialReading: Number(meterForm.initialReading),
                        connectionWingRemarks: meterForm.connectionWingRemarks || 'Meter assigned',
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to assign meter');
            }

            setShowAssignMeterModal(false);
            setSelectedApp(null);
            await fetchApplications();

        } catch (error) {
            console.error('Assign meter error:', error);
            alert('Failed to assign meter. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusActions = (app: ConnectionApplication) => {
        switch (app.status) {
            case 'forwarded_to_wing':
                return (
                    <button
                        onClick={() => updateStatus(app, 'team_sent')}
                        className="px-3 py-1 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-1"
                    >
                        <Send size={14} />
                        <span>Send Team</span>
                    </button>
                );
            case 'team_sent':
                return (
                    <button
                        onClick={() => updateStatus(app, 'in_progress')}
                        className="px-3 py-1 bg-yellow-600 text-white text-xs rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-1"
                    >
                        <Activity size={14} />
                        <span>Start Work</span>
                    </button>
                );
            case 'in_progress':
                return (
                    <button
                        onClick={() => updateStatus(app, 'connection_completed')}
                        className="px-3 py-1 bg-orange-600 text-white text-xs rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-1"
                    >
                        <CheckCircle size={14} />
                        <span>Complete</span>
                    </button>
                );
            case 'connection_completed':
                return (
                    <button
                        onClick={() => openAssignMeterModal(app)}
                        className="px-3 py-1 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-1"
                    >
                        <Plus size={14} />
                        <span>Assign Meter</span>
                    </button>
                );
            default:
                return null;
        }
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
        { title: 'Total Applications', value: stats.total, icon: FileText, bgColor: 'bg-blue-100', change: '', trend: 'neutral' as const },
        { title: 'Awaiting Action', value: stats.forwardedToWing, icon: Clock, bgColor: 'bg-yellow-100', change: `${stats.forwardedToWing} pending`, trend: 'down' as const },
        { title: 'In Progress', value: stats.inProgress, icon: Activity, bgColor: 'bg-purple-100', change: `${stats.inProgress} ongoing`, trend: 'neutral' as const },
        { title: 'Completed', value: stats.completed, icon: CheckCircle, bgColor: 'bg-green-100', change: `${stats.completed} done`, trend: 'up' as const },
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
                        <Zap size={24} className="text-emerald-600" />
                        <span>Connection Wing Dashboard</span>
                    </h1>
                    <p className="text-gray-500 text-sm">Manage and implement new connections</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={fetchApplications}
                        className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    >
                        <RefreshCw size={16} />
                        <span>Refresh</span>
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
                            <option value="forwarded_to_wing">New Assignment</option>
                            <option value="team_sent">Team Sent</option>
                            <option value="in_progress">In Progress</option>
                            <option value="connection_completed">Pending Meter</option>
                            <option value="implemented">Implemented</option>
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

            {/* Applications Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Application ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedApps.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
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
                                                    {getStatusActions(app)}
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

            {/* Details Modal */}
            {showDetailsModal && selectedApp && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Application Details</h3>
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
                            {getStatusActions(selectedApp)}
                            <button onClick={() => setShowDetailsModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Meter Modal */}
            {showAssignMeterModal && selectedApp && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Assign Meter</h3>
                            <button onClick={() => setShowAssignMeterModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Meter Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={meterForm.meterNo}
                                    onChange={(e) => setMeterForm(prev => ({ ...prev, meterNo: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="e.g., MTR-2026-012"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Initial Reading (kWh) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={meterForm.initialReading}
                                    onChange={(e) => setMeterForm(prev => ({ ...prev, initialReading: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="Enter initial meter reading"
                                    step="0.01"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Remarks (Optional)
                                </label>
                                <textarea
                                    value={meterForm.connectionWingRemarks}
                                    onChange={(e) => setMeterForm(prev => ({ ...prev, connectionWingRemarks: e.target.value }))}
                                    rows={2}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="Any additional notes"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end space-x-3 pt-4 mt-4 border-t border-gray-100">
                            <button
                                onClick={() => setShowAssignMeterModal(false)}
                                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitAssignMeter}
                                disabled={isSubmitting}
                                className={`px-4 py-2 bg-emerald-600 text-white rounded-lg transition-colors flex items-center space-x-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-emerald-700'
                                    }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        <span>Assigning...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={16} />
                                        <span>Assign Meter</span>
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