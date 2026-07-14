// app/dashboard/admin/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
    Users,
    MapPin,
    TrendingUp,
    TrendingDown,
    Clock,
    CheckCircle,
    AlertCircle,
    FileText,
    DollarSign,
    BarChart3,
    ArrowUpRight,
    Activity,
    Calendar,
    Settings,
    Zap,
    Package,
    XCircle,
    RefreshCw,
    Loader2,
    UserCheck,
    UserX,
    Building,
    CreditCard,
    Shield,
    List,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    bgColor: string;
    isLoading?: boolean;
}

const StatCard = ({ title, value, icon, change, trend, bgColor, isLoading }: StatCardProps) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                {isLoading ? (
                    <div className="h-8 w-20 bg-gray-200 rounded animate-pulse mt-1"></div>
                ) : (
                    <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
                )}
                {change && !isLoading && (
                    <p className={`text-xs flex items-center mt-1 ${trend === 'up' ? 'text-green-600' :
                        trend === 'down' ? 'text-red-600' :
                            'text-gray-500'
                        }`}>
                        {trend === 'up' && <ArrowUpRight size={14} className="mr-1" />}
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

interface DashboardStats {
    totalUsers: number;
    totalConsumers: number;
    totalMeters: number;
    totalApplications: number;
    totalComplaints: number;
    totalBills: number;
    totalRevenue: number;
    pendingApplications: number;
    pendingComplaints: number;
    activeMeters: number;
    residential: number;
    commercial: number;
    industrial: number;
    registeredConsumers: number;
    unregisteredConsumers: number;
    claimedMeters: number;
    unclaimedMeters: number;
    substations: number;
}

interface SystemStatus {
    database: string;
    apiServer: string;
    paymentGateway: string;
    uptime: string;
}

export default function AdminDashboardPage() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0,
        totalConsumers: 0,
        totalMeters: 0,
        totalApplications: 0,
        totalComplaints: 0,
        totalBills: 0,
        totalRevenue: 0,
        pendingApplications: 0,
        pendingComplaints: 0,
        activeMeters: 0,
        residential: 0,
        commercial: 0,
        industrial: 0,
        registeredConsumers: 0,
        unregisteredConsumers: 0,
        claimedMeters: 0,
        unclaimedMeters: 0,
        substations: 0,
    });
    const [recentActivities, setRecentActivities] = useState<any[]>([]);
    const [systemStatus, setSystemStatus] = useState<SystemStatus>({
        database: 'Unknown',
        apiServer: 'Unknown',
        paymentGateway: 'Unknown',
        uptime: 'Unknown',
    });

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    // ✅ Currency formatter for BDT
    const formatBDT = (amount: number): string => {
        return new Intl.NumberFormat('bn-BD', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

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
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('auth_token');

            // ✅ Fetch all data in parallel
            const [
                usersRes,
                consumersRes,
                metersRes,
                applicationsRes,
                complaintsRes,
                billsRes,
                substationsRes,
                healthRes,
            ] = await Promise.all([
                fetch(`${API_URL}/api/admin/users`, {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json',
                    },
                }),
                fetch(`${API_URL}/api/billing/consumers/all`, {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json',
                    },
                }),
                fetch(`${API_URL}/api/meters/available`, {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json',
                    },
                }),
                fetch(`${API_URL}/api/connection-applications/all`, {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json',
                    },
                }),
                fetch(`${API_URL}/api/complaints/all`, {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json',
                    },
                }),
                fetch(`${API_URL}/api/billing/bills/all`, {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json',
                    },
                }),
                fetch(`${API_URL}/api/substations`, {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json',
                    },
                }),
                fetch(`${API_URL}/api/health`, {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json',
                    },
                }),
            ]);

            // ✅ Parse responses
            const usersData = usersRes.ok ? await usersRes.json() : { data: [] };
            const consumersData = consumersRes.ok ? await consumersRes.json() : { data: [] };
            const metersData = metersRes.ok ? await metersRes.json() : { data: [] };
            const applicationsData = applicationsRes.ok ? await applicationsRes.json() : { data: [] };
            const complaintsData = complaintsRes.ok ? await complaintsRes.json() : { data: [] };
            const billsData = billsRes.ok ? await billsRes.json() : { data: [] };
            const substationsData = substationsRes.ok ? await substationsRes.json() : { data: [] };
            const healthData = healthRes.ok ? await healthRes.json() : {};

            const users = usersData.data || [];
            const consumers = consumersData.data || [];
            const meters = metersData.data || [];
            const applications = applicationsData.data || [];
            const complaints = complaintsData.data || [];
            const bills = billsData.data || [];
            const substations = substationsData.data || [];

            // ✅ Calculate stats
            const totalUsers = users.length;
            const totalConsumers = consumers.length;
            const totalMeters = meters.length;
            const totalApplications = applications.length;
            const totalComplaints = complaints.length;
            const totalBills = bills.length;

            // ✅ Calculate revenue from bills (in BDT)
            const totalRevenue = bills.reduce((sum: number, bill: any) => {
                return sum + (bill.grandTotal || bill.totalAmount || 0);
            }, 0);

            // ✅ Pending counts
            const pendingApplications = applications.filter((a: any) =>
                ['pending_payment', 'payment_done', 'under_xen_review', 'forwarded_to_wing', 'team_sent'].includes(a.status)
            ).length;

            const pendingComplaints = complaints.filter((c: any) =>
                ['pending', 'in_progress'].includes(c.status)
            ).length;

            // ✅ Consumer types
            const residential = consumers.filter((c: any) => c.consumerType === 'residential').length;
            const commercial = consumers.filter((c: any) => c.consumerType === 'commercial').length;
            const industrial = consumers.filter((c: any) => c.consumerType === 'industrial').length;

            // ✅ Registration status
            const registeredConsumers = consumers.filter((c: any) => c.isRegistered).length;
            const unregisteredConsumers = consumers.filter((c: any) => !c.isRegistered).length;

            // ✅ Meter status
            const claimedMeters = meters.filter((m: any) => m.isClaimed).length;
            const unclaimedMeters = meters.filter((m: any) => !m.isClaimed).length;
            const activeMeters = meters.filter((m: any) => m.status === 'active' || m.isClaimed).length;

            setStats({
                totalUsers,
                totalConsumers,
                totalMeters,
                totalApplications,
                totalComplaints,
                totalBills,
                totalRevenue,
                pendingApplications,
                pendingComplaints,
                activeMeters,
                residential,
                commercial,
                industrial,
                registeredConsumers,
                unregisteredConsumers,
                claimedMeters,
                unclaimedMeters,
                substations: substations.length,
            });

            // ✅ Set system status
            setSystemStatus({
                database: healthData.status === 'ok' ? '✅ Operational' : '⚠️ Issues',
                apiServer: healthData.status === 'ok' ? '✅ Operational' : '⚠️ Issues',
                paymentGateway: '✅ Operational',
                uptime: healthData.uptime ? `${Math.floor(healthData.uptime / 60)}m ${Math.floor(healthData.uptime % 60)}s` : 'Unknown',
            });

            // ✅ Recent activities (combine latest from different collections)
            const activities = [
                ...applications.slice(0, 3).map((a: any) => ({
                    type: 'application',
                    title: `New connection application: ${a.applicationId}`,
                    time: a.createdAt,
                    status: a.status,
                    user: a.applicantName,
                })),
                ...complaints.slice(0, 3).map((c: any) => ({
                    type: 'complaint',
                    title: `New complaint: ${c.complaintId}`,
                    time: c.createdAt,
                    status: c.status,
                    user: c.consumerName,
                })),
                ...consumers.slice(0, 2).map((c: any) => ({
                    type: 'consumer',
                    title: `New consumer: ${c.name}`,
                    time: c.createdAt,
                    status: c.isRegistered ? 'Registered' : 'Pending',
                    user: c.name,
                })),
            ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
                .slice(0, 5);

            setRecentActivities(activities);

        } catch (error: any) {
            console.error('❌ Error fetching dashboard data:', error);
            setError(error.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchDashboardData();
        setRefreshing(false);
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            '✅ Operational': 'text-green-600',
            '⚠️ Issues': 'text-red-600',
            'Operational': 'text-green-600',
            'Issues': 'text-red-600',
        };
        return colors[status] || 'text-gray-600';
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'application':
                return <FileText size={16} className="text-blue-500" />;
            case 'complaint':
                return <AlertCircle size={16} className="text-red-500" />;
            case 'consumer':
                return <UserCheck size={16} className="text-emerald-500" />;
            default:
                return <Activity size={16} className="text-gray-500" />;
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
                <h3 className="text-lg font-semibold text-red-700">Failed to Load Dashboard</h3>
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

    // ✅ Prepare stat cards data with BDT formatting
    const statCards = [
        {
            title: 'Total Users',
            value: stats.totalUsers,
            icon: <Users size={20} className="text-white" />,
            change: `${stats.totalUsers > 0 ? '+' : ''}${stats.totalUsers}`,
            trend: stats.totalUsers > 0 ? 'up' as const : 'neutral' as const,
            bgColor: 'bg-purple-100'
        },
        {
            title: 'Total Consumers',
            value: stats.totalConsumers,
            icon: <UserCheck size={20} className="text-white" />,
            change: `${stats.registeredConsumers} registered`,
            trend: 'neutral' as const,
            bgColor: 'bg-blue-100'
        },
        {
            title: 'Total Meters',
            value: stats.totalMeters,
            icon: <Package size={20} className="text-white" />,
            change: `${stats.activeMeters} active`,
            trend: 'neutral' as const,
            bgColor: 'bg-emerald-100'
        },
        {
            title: 'Total Revenue',
            value: formatBDT(stats.totalRevenue),
            icon: <DollarSign size={20} className="text-white" />,
            change: `${stats.totalBills} bills generated`,
            trend: stats.totalRevenue > 0 ? 'up' as const : 'neutral' as const,
            bgColor: 'bg-green-100'
        },
        {
            title: 'Applications',
            value: stats.totalApplications,
            icon: <FileText size={20} className="text-white" />,
            change: `${stats.pendingApplications} pending`,
            trend: stats.pendingApplications > 0 ? 'down' as const : 'up' as const,
            bgColor: 'bg-orange-100'
        },
        {
            title: 'Complaints',
            value: stats.totalComplaints,
            icon: <AlertCircle size={20} className="text-white" />,
            change: `${stats.pendingComplaints} pending`,
            trend: stats.pendingComplaints > 0 ? 'down' as const : 'up' as const,
            bgColor: 'bg-red-100'
        },
        {
            title: 'Substations',
            value: stats.substations,
            icon: <MapPin size={20} className="text-white" />,
            change: `${stats.substations} total`,
            trend: 'neutral' as const,
            bgColor: 'bg-indigo-100'
        },
        {
            title: 'Registered Consumers',
            value: stats.registeredConsumers,
            icon: <Shield size={20} className="text-white" />,
            change: `${stats.unregisteredConsumers} pending`,
            trend: stats.registeredConsumers > stats.unregisteredConsumers ? 'up' as const : 'down' as const,
            bgColor: 'bg-teal-100'
        },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
                    <p className="text-gray-500 text-sm">Manage your power distribution system</p>
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
                    <button className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2">
                        <FileText size={16} />
                        <span>Generate Report</span>
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            {/* Consumer & Meter Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Consumer Breakdown */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                        <Users size={18} className="text-emerald-600" />
                        <span>Consumer Breakdown</span>
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-gray-50">
                            <span className="text-sm text-gray-600">Residential</span>
                            <div className="flex items-center space-x-3">
                                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded-full transition-all"
                                        style={{ width: `${stats.totalConsumers > 0 ? (stats.residential / stats.totalConsumers) * 100 : 0}%` }}
                                    />
                                </div>
                                <span className="text-sm font-medium text-gray-800">{stats.residential}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-50">
                            <span className="text-sm text-gray-600">Commercial</span>
                            <div className="flex items-center space-x-3">
                                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-purple-500 rounded-full transition-all"
                                        style={{ width: `${stats.totalConsumers > 0 ? (stats.commercial / stats.totalConsumers) * 100 : 0}%` }}
                                    />
                                </div>
                                <span className="text-sm font-medium text-gray-800">{stats.commercial}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-gray-600">Industrial</span>
                            <div className="flex items-center space-x-3">
                                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-orange-500 rounded-full transition-all"
                                        style={{ width: `${stats.totalConsumers > 0 ? (stats.industrial / stats.totalConsumers) * 100 : 0}%` }}
                                    />
                                </div>
                                <span className="text-sm font-medium text-gray-800">{stats.industrial}</span>
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-400">
                            <span>Total: {stats.totalConsumers}</span>
                            <span>Registered: {stats.registeredConsumers}</span>
                            <span>Pending: {stats.unregisteredConsumers}</span>
                        </div>
                    </div>
                </div>

                {/* Meter Status Breakdown */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                        <Package size={18} className="text-emerald-600" />
                        <span>Meter Status</span>
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-gray-50">
                            <span className="text-sm text-gray-600">Claimed</span>
                            <div className="flex items-center space-x-3">
                                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-green-500 rounded-full transition-all"
                                        style={{ width: `${stats.totalMeters > 0 ? (stats.claimedMeters / stats.totalMeters) * 100 : 0}%` }}
                                    />
                                </div>
                                <span className="text-sm font-medium text-green-600">{stats.claimedMeters}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-50">
                            <span className="text-sm text-gray-600">Unclaimed</span>
                            <div className="flex items-center space-x-3">
                                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-yellow-500 rounded-full transition-all"
                                        style={{ width: `${stats.totalMeters > 0 ? (stats.unclaimedMeters / stats.totalMeters) * 100 : 0}%` }}
                                    />
                                </div>
                                <span className="text-sm font-medium text-yellow-600">{stats.unclaimedMeters}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-gray-600">Active</span>
                            <div className="flex items-center space-x-3">
                                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full transition-all"
                                        style={{ width: `${stats.totalMeters > 0 ? (stats.activeMeters / stats.totalMeters) * 100 : 0}%` }}
                                    />
                                </div>
                                <span className="text-sm font-medium text-emerald-600">{stats.activeMeters}</span>
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-400">
                            <span>Total Meters: {stats.totalMeters}</span>
                            <span>Availability: {stats.unclaimedMeters}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                        <Zap size={18} className="text-emerald-600" />
                        <span>Quick Actions</span>
                    </h3>
                    <div className="space-y-2">
                        <button className="w-full text-left px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-3">
                            <Users size={18} className="text-emerald-600" />
                            <span>Manage Users</span>
                            <span className="ml-auto text-xs text-gray-400">{stats.totalUsers} users</span>
                        </button>
                        <button className="w-full text-left px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-3">
                            <MapPin size={18} className="text-emerald-600" />
                            <span>Manage Substations</span>
                            <span className="ml-auto text-xs text-gray-400">{stats.substations} substations</span>
                        </button>
                        <button className="w-full text-left px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-3">
                            <FileText size={18} className="text-emerald-600" />
                            <span>View Applications</span>
                            <span className="ml-auto text-xs text-gray-400">{stats.pendingApplications} pending</span>
                        </button>
                        <button className="w-full text-left px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-3">
                            <AlertCircle size={18} className="text-emerald-600" />
                            <span>View Complaints</span>
                            <span className="ml-auto text-xs text-gray-400">{stats.pendingComplaints} pending</span>
                        </button>
                        <button className="w-full text-left px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-3">
                            <Settings size={18} className="text-emerald-600" />
                            <span>System Settings</span>
                        </button>
                    </div>
                </div>

                {/* System Status & Recent Activity */}
                <div className="space-y-6">
                    {/* System Status */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                            <Activity size={18} className="text-emerald-600" />
                            <span>System Status</span>
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                <span className="text-sm text-gray-600">Database</span>
                                <span className={`text-sm font-medium ${getStatusColor(systemStatus.database)}`}>
                                    {systemStatus.database}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                <span className="text-sm text-gray-600">API Server</span>
                                <span className={`text-sm font-medium ${getStatusColor(systemStatus.apiServer)}`}>
                                    {systemStatus.apiServer}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                <span className="text-sm text-gray-600">Payment Gateway</span>
                                <span className={`text-sm font-medium ${getStatusColor(systemStatus.paymentGateway)}`}>
                                    {systemStatus.paymentGateway}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm text-gray-600">Uptime</span>
                                <span className="text-sm font-medium text-gray-800">{systemStatus.uptime}</span>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                            <Clock size={18} className="text-emerald-600" />
                            <span>Recent Activity</span>
                        </h3>
                        {recentActivities.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-4">No recent activity</p>
                        ) : (
                            <div className="space-y-3">
                                {recentActivities.map((activity, index) => (
                                    <div key={index} className="flex items-start space-x-3 py-2 border-b border-gray-50 last:border-0">
                                        <div className="p-1.5 bg-gray-50 rounded-lg flex-shrink-0">
                                            {getActivityIcon(activity.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-800 truncate">{activity.title}</p>
                                            <div className="flex items-center space-x-2 text-xs text-gray-400">
                                                <span>{activity.user}</span>
                                                <span>•</span>
                                                <span>{new Date(activity.time).toLocaleDateString()}</span>
                                                {activity.status && (
                                                    <>
                                                        <span>•</span>
                                                        <span className={`px-1.5 py-0.5 rounded text-xs ${activity.status === 'Registered' ? 'bg-green-100 text-green-700' :
                                                            activity.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                activity.status === 'completed' || activity.status === 'implemented' ? 'bg-emerald-100 text-emerald-700' :
                                                                    'bg-gray-100 text-gray-600'
                                                            }`}>
                                                            {activity.status}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}