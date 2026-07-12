// app/dashboard/consumer/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    FileText,
    AlertCircle,
    CreditCard,
    Clock,
    CheckCircle,
    Zap,
    Home,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Calendar,
    ArrowRight,
    Loader2,
    Bell,
    RefreshCw,
    Package,
    User,
    Mail,
    Phone,
    MapPin,
    Building,
    Shield,
    ClipboardCheck,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    bgColor: string;
    subText?: string;
    trend?: 'up' | 'down' | 'neutral';
}

const StatCard = ({ title, value, icon, bgColor, subText, trend }: StatCardProps) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
                {subText && (
                    <p className={`text-xs flex items-center mt-1 ${trend === 'up' ? 'text-green-600' :
                        trend === 'down' ? 'text-red-600' :
                            'text-gray-500'
                        }`}>
                        {trend === 'up' && <TrendingUp size={14} className="mr-1" />}
                        {trend === 'down' && <TrendingDown size={14} className="mr-1" />}
                        {subText}
                    </p>
                )}
            </div>
            <div className={`p-3 rounded-xl ${bgColor}`}>
                {icon}
            </div>
        </div>
    </div>
);

interface RecentActivity {
    id: string;
    type: 'bill' | 'complaint' | 'payment' | 'connection';
    message: string;
    time: string;
    status: 'completed' | 'pending' | 'failed';
}

export default function ConsumerDashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState({
        currentBill: '0',
        dueDate: 'N/A',
        complaints: 0,
        meterStatus: 'Inactive',
        totalBills: 0,
        totalPaid: 0,
        metersCount: 0,
    });
    const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Get user session
                const { data, error: sessionError } = await authClient.getSession();
                if (sessionError || !data) {
                    router.push('/login');
                    return;
                }
                setUser(data.user);

                const token = localStorage.getItem('auth_token');
                const userId = data.user?.id;

                if (!userId) {
                    setError('User ID not found');
                    setLoading(false);
                    return;
                }

                // ✅ Fetch user's meters
                let meters = [];
                let meterError = null;
                try {
                    const meterRes = await fetch(
                        `${API_URL}/api/user/meters/${userId}`,
                        {
                            headers: {
                                'Authorization': token ? `Bearer ${token}` : '',
                                'Content-Type': 'application/json',
                            },
                        }
                    );
                    if (meterRes.ok) {
                        const meterData = await meterRes.json();
                        if (meterData.success) {
                            meters = meterData.data.meters || [];
                        } else {
                            meterError = meterData.message || 'Failed to fetch meters';
                        }
                    } else {
                        meterError = `HTTP ${meterRes.status}: Failed to fetch meters`;
                    }
                } catch (error) {
                    console.error('Error fetching meters:', error);
                    meterError = error instanceof Error ? error.message : 'Network error';
                }

                const meterNo = data.user?.meterNo || (meters.length > 0 ? meters[0]?.meterNo : null);

                // ✅ Fetch bills
                let billsData = [];
                let billError = null;
                if (meterNo) {
                    try {
                        const billsRes = await fetch(
                            `${API_URL}/api/consumer/bills/${meterNo}`,
                            {
                                headers: {
                                    'Authorization': token ? `Bearer ${token}` : '',
                                },
                            }
                        );
                        if (billsRes.ok) {
                            const billsResult = await billsRes.json();
                            if (billsResult.success) {
                                billsData = billsResult.data || [];
                            } else {
                                billError = billsResult.message || 'Failed to fetch bills';
                            }
                        } else {
                            billError = `HTTP ${billsRes.status}: Failed to fetch bills`;
                        }
                    } catch (error) {
                        console.error('Error fetching bills:', error);
                        billError = error instanceof Error ? error.message : 'Network error';
                    }
                }

                // ✅ Calculate stats from real data
                const unpaidBills = billsData.filter((b: any) => b.status === 'unpaid' || b.status === 'pending');
                const currentUnpaid = unpaidBills.length > 0 ? unpaidBills[0] : null;
                const paidBills = billsData.filter((b: any) => b.status === 'paid');
                const totalPaid = paidBills.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0);

                // ✅ Fetch complaints count
                let complaintsCount = 0;
                let complaintError = null;
                try {
                    const complaintsRes = await fetch(
                        `${API_URL}/api/complaints/consumer/${userId}`,
                        {
                            headers: {
                                'Authorization': token ? `Bearer ${token}` : '',
                            },
                        }
                    );
                    if (complaintsRes.ok) {
                        const complaintsResult = await complaintsRes.json();
                        if (complaintsResult.success) {
                            complaintsCount = complaintsResult.data?.length || 0;
                        } else {
                            complaintError = complaintsResult.message || 'Failed to fetch complaints';
                        }
                    } else {
                        complaintError = `HTTP ${complaintsRes.status}: Failed to fetch complaints`;
                    }
                } catch (error) {
                    console.error('Error fetching complaints:', error);
                    complaintError = error instanceof Error ? error.message : 'Network error';
                }

                setStats({
                    currentBill: currentUnpaid ? `৳${currentUnpaid.totalAmount.toLocaleString()}` : '৳0',
                    dueDate: currentUnpaid?.dueDate || 'No due bill',
                    complaints: complaintsCount,
                    meterStatus: data.user?.isActive ? 'Active' : 'Inactive',
                    totalBills: billsData.length,
                    totalPaid: totalPaid,
                    metersCount: meters.length,
                });

                // ✅ Set recent activities from real data
                const activities: RecentActivity[] = [];

                // Add bill activities
                billsData.slice(0, 3).forEach((b: any) => {
                    activities.push({
                        id: b.billId || `bill-${Date.now()}`,
                        type: b.status === 'paid' ? 'payment' : 'bill',
                        message: b.status === 'paid'
                            ? `Bill ${b.billId || 'N/A'} paid for ${b.billingMonth || ''}`
                            : `Bill ${b.billId || 'N/A'} generated for ${b.billingMonth || ''}`,
                        time: b.paidAt ? new Date(b.paidAt).toLocaleDateString() :
                            b.createdAt ? new Date(b.createdAt).toLocaleDateString() :
                                new Date().toLocaleDateString(),
                        status: b.status === 'paid' ? 'completed' : 'pending',
                    });
                });

                // Add meter claimed activity
                if (meters.length > 0 && meters[0]?.claimedAt) {
                    activities.unshift({
                        id: `meter-${Date.now()}`,
                        type: 'connection',
                        message: `Meter ${meters[0]?.meterNo || ''} claimed successfully`,
                        time: new Date(meters[0].claimedAt).toLocaleDateString(),
                        status: 'completed',
                    });
                }

                // Sort by time (newest first)
                activities.sort((a, b) => {
                    const dateA = new Date(a.time);
                    const dateB = new Date(b.time);
                    return dateB.getTime() - dateA.getTime();
                });

                setRecentActivities(activities.slice(0, 5));

                // ✅ Set error if any
                if (meterError || billError || complaintError) {
                    const errors = [meterError, billError, complaintError].filter(Boolean);
                    if (errors.length > 0) {
                        setError(errors.join('; '));
                    }
                }

            } catch (error: any) {
                console.error('Error fetching dashboard data:', error);
                setError(error.message || 'Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [router, API_URL]);

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'bill': return <FileText size={16} className="text-blue-500" />;
            case 'complaint': return <AlertCircle size={16} className="text-red-500" />;
            case 'payment': return <CreditCard size={16} className="text-green-500" />;
            case 'connection': return <Zap size={16} className="text-emerald-500" />;
            default: return <FileText size={16} className="text-gray-500" />;
        }
    };

    const getActivityStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700';
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'failed': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={40} className="animate-spin text-emerald-600" />
            </div>
        );
    }

    if (error && !user) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
                <AlertCircle size={48} className="text-red-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-red-700">Failed to Load Dashboard</h3>
                <p className="text-red-600 mt-2">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-6 text-white">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Welcome back, {user?.name || 'Consumer'}! 👋</h1>
                        <p className="text-emerald-100 mt-1">Manage your electricity account, bills, and complaints</p>
                    </div>
                    <div className="bg-emerald-500/30 p-3 rounded-xl hidden sm:block">
                        <Home size={32} className="text-white" />
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Current Bill"
                    value={stats.currentBill}
                    icon={<CreditCard size={20} className="text-white" />}
                    bgColor="bg-blue-100"
                    subText={stats.dueDate !== 'No due bill' ? `Due: ${stats.dueDate}` : 'No pending bills'}
                    trend={stats.dueDate !== 'No due bill' ? 'down' : 'neutral'}
                />
                <StatCard
                    title="My Meters"
                    value={stats.metersCount}
                    icon={<Package size={20} className="text-white" />}
                    bgColor="bg-purple-100"
                    subText={stats.metersCount > 0 ? `${stats.metersCount} meter(s) connected` : 'No meters'}
                    trend={stats.metersCount > 0 ? 'up' : 'neutral'}
                />
                <StatCard
                    title="Complaints"
                    value={stats.complaints}
                    icon={<AlertCircle size={20} className="text-white" />}
                    bgColor="bg-red-100"
                    subText={stats.complaints > 0 ? `${stats.complaints} active` : 'No complaints'}
                    trend={stats.complaints > 0 ? 'down' : 'up'}
                />
                <StatCard
                    title="Meter Status"
                    value={stats.meterStatus}
                    icon={<CheckCircle size={20} className="text-white" />}
                    bgColor="bg-green-100"
                />
            </div>

            {/* Quick Actions & Account Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
                    <div className="space-y-2">
                        <button
                            onClick={() => router.push('/dashboard/consumer/my-meters')}
                            className="w-full text-left px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-3"
                        >
                            <Package size={18} className="text-emerald-600" />
                            <span>My Meters</span>
                            <ArrowRight size={16} className="ml-auto text-gray-400" />
                        </button>
                        <button
                            onClick={() => router.push('/dashboard/consumer/my-bills')}
                            className="w-full text-left px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-3"
                        >
                            <FileText size={18} className="text-emerald-600" />
                            <span>View My Bills</span>
                            <ArrowRight size={16} className="ml-auto text-gray-400" />
                        </button>
                        <button
                            onClick={() => router.push('/dashboard/consumer/my-complaints')}
                            className="w-full text-left px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-3"
                        >
                            <AlertCircle size={18} className="text-emerald-600" />
                            <span>Report Complaint</span>
                            <ArrowRight size={16} className="ml-auto text-gray-400" />
                        </button>
                        <button
                            onClick={() => router.push('/dashboard/consumer/new-connection')}
                            className="w-full text-left px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-3"
                        >
                            <Zap size={18} className="text-emerald-600" />
                            <span>New Connection</span>
                            <ArrowRight size={16} className="ml-auto text-gray-400" />
                        </button>
                        <button
                            onClick={() => router.push('/dashboard/consumer/my-connections')}
                            className="w-full text-left px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-3"
                        >
                            <Home size={18} className="text-emerald-600" />
                            <span>My Connections</span>
                            <ArrowRight size={16} className="ml-auto text-gray-400" />
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Account Summary</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-gray-50">
                            <span className="text-sm text-gray-600">Name</span>
                            <span className="text-sm font-medium">{user?.name || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-50">
                            <span className="text-sm text-gray-600">Email</span>
                            <span className="text-sm font-medium">{user?.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-50">
                            <span className="text-sm text-gray-600">Mobile</span>
                            <span className="text-sm font-medium">{user?.mobile || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-50">
                            <span className="text-sm text-gray-600">Meter Number</span>
                            <span className="text-sm font-medium text-emerald-600">{user?.meterNo || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-50">
                            <span className="text-sm text-gray-600">Total Meters</span>
                            <span className="text-sm font-medium">{stats.metersCount}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-50">
                            <span className="text-sm text-gray-600">Total Bills</span>
                            <span className="text-sm font-medium">{stats.totalBills}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-50">
                            <span className="text-sm text-gray-600">Total Paid</span>
                            <span className="text-sm font-medium text-green-600">৳{stats.totalPaid.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-gray-600">Account Status</span>
                            <span className={`text-sm font-medium ${stats.meterStatus === 'Active' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {stats.meterStatus === 'Active' ? '✅ Active' : '❌ Inactive'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            {recentActivities.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-800 flex items-center space-x-2">
                            <Clock size={18} className="text-emerald-600" />
                            <span>Recent Activity</span>
                        </h3>
                        <button
                            onClick={() => router.push('/dashboard/consumer/my-bills')}
                            className="text-sm text-emerald-600 hover:text-emerald-700"
                        >
                            View All
                        </button>
                    </div>
                    <div className="space-y-3">
                        {recentActivities.map((activity) => (
                            <div key={activity.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                        {getActivityIcon(activity.type)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{activity.message}</p>
                                        <p className="text-xs text-gray-400">{activity.time}</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActivityStatusColor(activity.status)}`}>
                                    {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Error Warning (if any partial errors) */}
            {error && user && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center space-x-3">
                    <AlertCircle size={18} className="text-yellow-600" />
                    <p className="text-sm text-yellow-700">{error}</p>
                    <button
                        onClick={() => setError(null)}
                        className="ml-auto text-yellow-500 hover:text-yellow-700"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}