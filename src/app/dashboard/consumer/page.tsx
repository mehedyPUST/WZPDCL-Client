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
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState({
        currentBill: '0',
        dueDate: 'N/A',
        complaints: 0,
        meterStatus: 'Inactive',
        totalBills: 0,
        totalPaid: 0,
    });
    const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Get user session
                const { data, error } = await authClient.getSession();
                if (error || !data) {
                    router.push('/login');
                    return;
                }
                setUser(data.user);

                // Fetch real data from API
                const token = localStorage.getItem('auth_token');
                const meterNo = data.user?.meterNo || 'MTR-2026-001';

                // Fetch bills
                const billsRes = await fetch(
                    `${API_URL}/api/consumer/bills/${meterNo}`,
                    {
                        headers: {
                            'Authorization': token ? `Bearer ${token}` : '',
                        },
                    }
                );
                let billsData = [];
                if (billsRes.ok) {
                    const billsResult = await billsRes.json();
                    billsData = billsResult.data || [];
                }

                // If no bills, use mock data
                if (billsData.length === 0) {
                    billsData = getMockBills();
                }

                // Calculate stats
                const unpaidBills = billsData.filter((b: any) => b.status === 'unpaid');
                const currentUnpaid = unpaidBills.length > 0 ? unpaidBills[0] : null;
                const paidBills = billsData.filter((b: any) => b.status === 'paid');
                const totalPaid = paidBills.reduce((sum: number, b: any) => sum + b.totalAmount, 0);

                setStats({
                    currentBill: currentUnpaid ? `৳${currentUnpaid.totalAmount.toLocaleString()}` : '৳0',
                    dueDate: currentUnpaid?.dueDate || 'No due bill',
                    complaints: 0, // Will be fetched from complaints API
                    meterStatus: data.user?.isActive ? 'Active' : 'Inactive',
                    totalBills: billsData.length,
                    totalPaid: totalPaid,
                });

                // Set recent activities
                const activities: RecentActivity[] = [
                    ...billsData.slice(0, 3).map((b: any) => ({
                        id: b.billId || `bill-${Date.now()}`,
                        type: b.status === 'paid' ? 'payment' : 'bill',
                        message: b.status === 'paid'
                            ? `Bill ${b.billId || 'N/A'} paid for ${b.billingMonth || ''}`
                            : `Bill ${b.billId || 'N/A'} generated for ${b.billingMonth || ''}`,
                        time: new Date(b.createdAt || Date.now()).toLocaleDateString(),
                        status: b.status === 'paid' ? 'completed' : 'pending',
                    })),
                ];

                setRecentActivities(activities);

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                // Use mock data on error
                const mockBills = getMockBills();
                const unpaid = mockBills.filter((b: any) => b.status === 'unpaid');
                const current = unpaid.length > 0 ? unpaid[0] : null;
                const paid = mockBills.filter((b: any) => b.status === 'paid');
                const totalPaid = paid.reduce((sum: number, b: any) => sum + b.totalAmount, 0);

                setStats({
                    currentBill: current ? `৳${current.totalAmount.toLocaleString()}` : '৳0',
                    dueDate: current?.dueDate || 'No due bill',
                    complaints: 2,
                    meterStatus: 'Active',
                    totalBills: mockBills.length,
                    totalPaid: totalPaid,
                });

                setRecentActivities([
                    { id: '1', type: 'bill', message: 'Bill B-2026-002 generated for May 2026', time: '2026-07-10', status: 'pending' },
                    { id: '2', type: 'payment', message: 'Bill B-2026-001 paid successfully', time: '2026-07-05', status: 'completed' },
                    { id: '3', type: 'complaint', message: 'Complaint #CMP-001 resolved', time: '2026-07-03', status: 'completed' },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [router, API_URL]);

    // Mock bills for demo
    const getMockBills = () => {
        return [
            {
                billId: 'B-2026-001',
                billingMonth: 'June 2026',
                totalAmount: 2587.50,
                dueDate: '2026-07-15',
                status: 'paid',
                createdAt: '2026-07-01',
            },
            {
                billId: 'B-2026-002',
                billingMonth: 'May 2026',
                totalAmount: 1987.50,
                dueDate: '2026-06-15',
                status: 'unpaid',
                createdAt: '2026-06-01',
            },
            {
                billId: 'B-2026-003',
                billingMonth: 'April 2026',
                totalAmount: 1950.00,
                dueDate: '2026-05-15',
                status: 'pending',
                createdAt: '2026-05-01',
            },
            {
                billId: 'B-2026-004',
                billingMonth: 'March 2026',
                totalAmount: 2025.00,
                dueDate: '2026-04-15',
                status: 'paid',
                createdAt: '2026-04-01',
            },
        ];
    };

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

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Consumer Dashboard</h1>
                    <p className="text-gray-500 text-sm">Manage your electricity account</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors relative">
                        <Bell size={18} className="text-gray-500" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="p-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    >
                        <RefreshCw size={18} className="text-gray-500" />
                    </button>
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
                    trend={stats.dueDate !== 'No due bill' ? 'up' : 'neutral'}
                />
                <StatCard
                    title="Due Date"
                    value={stats.dueDate}
                    icon={<Calendar size={20} className="text-white" />}
                    bgColor="bg-yellow-100"
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
                            <span className="text-sm text-gray-600">Meter Number</span>
                            <span className="text-sm font-medium">{user?.meterNo || 'MTR-2026-001'}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-50">
                            <span className="text-sm text-gray-600">Feeder</span>
                            <span className="text-sm font-medium">{user?.feederName || 'Trimohoni'}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-50">
                            <span className="text-sm text-gray-600">Consumer Type</span>
                            <span className="text-sm font-medium">Residential</span>
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
                        <h3 className="font-semibold text-gray-800">Recent Activity</h3>
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
        </div>
    );
}