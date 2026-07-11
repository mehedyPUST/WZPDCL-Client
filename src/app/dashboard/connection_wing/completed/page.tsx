// app/dashboard/connection_wing/completed/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    CheckCircle,
    FileText,
    Clock,
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
    Download,
    Printer,
    ArrowLeft,
    ListChecks,
    Zap,
    Award,
    Filter,
    AlertCircle,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

interface CompletedApplication {
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
    status: 'implemented' | 'connection_completed';
    paymentStatus: 'pending' | 'paid';
    feeAmount: number;
    assignedMeterNo: string;
    implementedAt: string;
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

export default function ConnectionWingCompletedPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [completedApps, setCompletedApps] = useState<CompletedApplication[]>([]);
    const [selectedApp, setSelectedApp] = useState<CompletedApplication | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({
        total: 0,
        residential: 0,
        commercial: 0,
        industrial: 0,
        totalLoad: 0,
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
            fetchCompletedApplications();
        }
    }, [user]);

    // app/dashboard/connection_wing/completed/page.tsx - Updated fetch function

    const fetchCompletedApplications = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('auth_token');

            console.log('🔍 Fetching applications from API...');

            const response = await fetch(
                `${API_URL}/api/connection-wing/applications`,
                {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log('📦 Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ API Error:', errorData);
                throw new Error(errorData.message || 'Failed to fetch applications');
            }

            const data = await response.json();
            console.log('📦 Full API Response:', data);
            console.log('📦 Number of applications:', data.data?.length || 0);

            const allApps = data.data || [];

            // ✅ Log all statuses to see what's available
            const statuses = allApps.map((a: any) => a.status);
            console.log('📊 All statuses:', [...new Set(statuses)]);

            // ✅ Filter: Only show implemented and connection_completed
            const filtered = allApps.filter((a: any) =>
                a.status === 'implemented' || a.status === 'connection_completed'
            );

            console.log('✅ Filtered applications:', filtered.length);

            setCompletedApps(filtered);

            // Update stats
            const total = filtered.length;
            const residential = filtered.filter((a: any) => a.connectionType === 'residential').length;
            const commercial = filtered.filter((a: any) => a.connectionType === 'commercial').length;
            const industrial = filtered.filter((a: any) => a.connectionType === 'industrial').length;
            const totalLoad = filtered.reduce((sum: number, a: any) => sum + (a.loadRequired || 0), 0);

            setStats({
                total,
                residential,
                commercial,
                industrial,
                totalLoad,
            });

        } catch (error: any) {
            console.error('❌ Error fetching completed applications:', error);
            setError(error.message || 'Failed to load completed applications');
            setCompletedApps([]);
            setStats({
                total: 0,
                residential: 0,
                commercial: 0,
                industrial: 0,
                totalLoad: 0,
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statuses: Record<string, { color: string; label: string; icon: any }> = {
            implemented: { color: 'bg-green-100 text-green-700', label: 'Fully Implemented', icon: CheckCircle },
            connection_completed: { color: 'bg-orange-100 text-orange-700', label: 'Completed - Pending Meter', icon: Clock },
        };
        return statuses[status] || statuses.implemented;
    };

    const getConnectionTypeLabel = (type: string) => {
        const types: Record<string, string> = {
            residential: 'Residential',
            commercial: 'Commercial',
            industrial: 'Industrial',
        };
        return types[type] || type;
    };

    const getConnectionTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            residential: 'bg-blue-100 text-blue-700',
            commercial: 'bg-purple-100 text-purple-700',
            industrial: 'bg-orange-100 text-orange-700',
        };
        return colors[type] || 'bg-gray-100 text-gray-700';
    };

    const filteredApps = completedApps.filter(app => {
        const matchesSearch = app.applicationId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.applicantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.mobile?.includes(searchTerm) ||
            app.assignedMeterNo?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || app.connectionType === filterType;
        return matchesSearch && matchesType;
    });

    const totalPages = Math.ceil(filteredApps.length / ITEMS_PER_PAGE);
    const paginatedApps = filteredApps.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const statCards = [
        { title: 'Total Implemented', value: stats.total, icon: CheckCircle, bgColor: 'bg-green-100', change: '', trend: 'neutral' as const },
        { title: 'Residential', value: stats.residential, icon: Home, bgColor: 'bg-blue-100', change: `${stats.residential} connections`, trend: 'up' as const },
        { title: 'Commercial', value: stats.commercial, icon: Building, bgColor: 'bg-purple-100', change: `${stats.commercial} connections`, trend: 'up' as const },
        { title: 'Total Load', value: `${stats.totalLoad} kW`, icon: Zap, bgColor: 'bg-yellow-100', change: '', trend: 'neutral' as const },
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
                <AlertCircle size={40} className="text-red-500 mx-auto mb-2" />
                <p className="text-red-600">{error}</p>
                <button
                    onClick={fetchCompletedApplications}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (completedApps.length === 0 && !loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                <Award size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700">No Completed Connections</h3>
                <p className="text-gray-500 mt-2">There are no completed connections yet.</p>
                <button
                    onClick={() => router.push('/dashboard/connection_wing/applications')}
                    className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                    View Pending Applications
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                        <Award size={24} className="text-emerald-600" />
                        <span>Completed Connections</span>
                    </h1>
                    <p className="text-gray-500 text-sm">View all implemented and completed connections</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={fetchCompletedApplications}
                        className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    >
                        <RefreshCw size={16} />
                        <span>Refresh</span>
                    </button>
                    <button
                        onClick={() => router.push('/dashboard/connection_wing')}
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
                            placeholder="Search by application ID, name, mobile, or meter number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    <div className="flex flex-wrap gap-3">
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

            {/* Completed Applications Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Application ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Meter No</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Load</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedApps.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        No completed connections found.
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
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getConnectionTypeColor(app.connectionType)}`}>
                                                    {getConnectionTypeLabel(app.connectionType)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-emerald-600">{app.assignedMeterNo}</span>
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

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredApps.length)} of {filteredApps.length} applications
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
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-emerald-100 rounded-full">
                                    <FileText size={20} className="text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">Connection Details</h3>
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
                                <p className="text-xs text-gray-500">Applicant</p>
                                <p className="text-sm font-medium">{selectedApp.applicantName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Connection Type</p>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getConnectionTypeColor(selectedApp.connectionType)}`}>
                                    {getConnectionTypeLabel(selectedApp.connectionType)}
                                </span>
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
                                <p className="text-sm font-medium">{selectedApp.transformerNo}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-xs text-gray-500">Address</p>
                                <p className="text-sm font-medium">{selectedApp.address}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-xs text-gray-500">Purpose</p>
                                <p className="text-sm font-medium">{selectedApp.purpose}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-xs text-gray-500">Assigned Meter Number</p>
                                <p className="text-lg font-bold text-emerald-600">{selectedApp.assignedMeterNo}</p>
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
                            <div>
                                <p className="text-xs text-gray-500">Created At</p>
                                <p className="text-sm text-gray-600">{new Date(selectedApp.createdAt).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Implemented At</p>
                                <p className="text-sm font-medium text-green-600">{new Date(selectedApp.implementedAt).toLocaleString()}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-xs text-gray-500">Fee Amount</p>
                                <p className="text-lg font-bold text-emerald-600">৳{selectedApp.feeAmount.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end space-x-3 pt-4 mt-4 border-t border-gray-100">
                            <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                                <Printer size={16} />
                                <span>Print Certificate</span>
                            </button>
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