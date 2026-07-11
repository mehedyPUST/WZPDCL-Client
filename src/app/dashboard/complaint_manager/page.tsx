// app/dashboard/complaint_manager/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    AlertCircle,
    CheckCircle,
    Clock,
    FileText,
    Loader2,
    TrendingUp,
    TrendingDown,
    Activity,
    Users,
    Zap,
    MapPin,
    Search,
    Eye,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Filter,
    MessageSquare,
    User,
    Phone,
    Mail,
    Home,
    Package,
    Calendar,
    ArrowRight,
    BarChart3,
    PieChart,
    Download,
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
    consumerName: string;
    contactNumber: string;
    address: string;
    createdAt: string;
    assignedTo?: string;
}

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    bgColor: string;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    onClick?: () => void;
}

const StatCard = ({ title, value, icon, bgColor, change, trend, onClick }: StatCardProps) => (
    <div
        onClick={onClick}
        className={`bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
    >
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
                {change && (
                    <p className={`text-xs flex items-center mt-1 ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
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

export default function ComplaintManagerDashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        underAction: 0,
        solved: 0,
        rejected: 0,
        highPriority: 0,
        mediumPriority: 0,
        lowPriority: 0,
        resolutionRate: 0,
    });
    const [user, setUser] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${API_URL}/api/complaints/all`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                },
            });

            let data;
            if (response.ok) {
                data = await response.json();
                const allComplaints = data.data || [];
                setComplaints(allComplaints);

                // Get recent complaints (last 5)
                const sorted = [...allComplaints].sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                setRecentComplaints(sorted.slice(0, 5));

                // Calculate stats
                const total = allComplaints.length;
                const pending = allComplaints.filter((c: Complaint) => c.status === 'pending').length;
                const underAction = allComplaints.filter((c: Complaint) => c.status === 'under_action').length;
                const solved = allComplaints.filter((c: Complaint) => c.status === 'solved').length;
                const rejected = allComplaints.filter((c: Complaint) => c.status === 'rejected').length;
                const highPriority = allComplaints.filter((c: Complaint) => c.priority === 'high').length;
                const mediumPriority = allComplaints.filter((c: Complaint) => c.priority === 'medium').length;
                const lowPriority = allComplaints.filter((c: Complaint) => c.priority === 'low').length;
                const resolutionRate = total > 0 ? Math.round((solved / total) * 100) : 0;

                setStats({
                    total,
                    pending,
                    underAction,
                    solved,
                    rejected,
                    highPriority,
                    mediumPriority,
                    lowPriority,
                    resolutionRate,
                });

                setLoading(false);
                return;
            }

            // Mock data fallback
            const mockData = getMockComplaints();
            setComplaints(mockData);
            setRecentComplaints(mockData.slice(0, 5));

            const total = mockData.length;
            const pending = mockData.filter((c: Complaint) => c.status === 'pending').length;
            const underAction = mockData.filter((c: Complaint) => c.status === 'under_action').length;
            const solved = mockData.filter((c: Complaint) => c.status === 'solved').length;
            const rejected = mockData.filter((c: Complaint) => c.status === 'rejected').length;
            const highPriority = mockData.filter((c: Complaint) => c.priority === 'high').length;
            const mediumPriority = mockData.filter((c: Complaint) => c.priority === 'medium').length;
            const lowPriority = mockData.filter((c: Complaint) => c.priority === 'low').length;
            const resolutionRate = total > 0 ? Math.round((solved / total) * 100) : 0;

            setStats({
                total,
                pending,
                underAction,
                solved,
                rejected,
                highPriority,
                mediumPriority,
                lowPriority,
                resolutionRate,
            });

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            const mockData = getMockComplaints();
            setComplaints(mockData);
            setRecentComplaints(mockData.slice(0, 5));
        } finally {
            setLoading(false);
        }
    };

    const getMockComplaints = (): Complaint[] => {
        const categories = ['Voltage Issue', 'Power Outage', 'Billing Error', 'Meter Issue', 'Technical Fault'];
        const statuses: ('pending' | 'under_action' | 'solved' | 'rejected')[] = ['pending', 'under_action', 'solved', 'rejected'];
        const priorities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
        const consumers = [
            { name: 'Md. Kamal Hossain', meter: 'MTR-2026-001', phone: '01712345678', address: 'House #12, Trimohoni, Kushtia' },
            { name: 'Ms. Fatema Begum', meter: 'MTR-2026-002', phone: '01712345679', address: 'House #5, Circuit-Hose, Kushtia' },
            { name: 'Md. Rahim Uddin', meter: 'MTR-2026-003', phone: '01712345680', address: 'Plot #10, DC-Court, Kushtia' },
            { name: 'Ms. Nasrin Akter', meter: 'MTR-2026-004', phone: '01712345681', address: 'House #20, N.S-Road, Kushtia' },
            { name: 'Md. Shafiqul Islam', meter: 'MTR-2026-005', phone: '01712345682', address: 'House #8, Trimohoni, Kushtia' },
            { name: 'Ms. Jannatul Ferdous', meter: 'MTR-2026-006', phone: '01712345683', address: 'House #15, Circuit-Hose, Kushtia' },
            { name: 'Md. Abdur Rahman', meter: 'MTR-2026-007', phone: '01712345684', address: 'Plot #5, DC-Court, Kushtia' },
            { name: 'Ms. Salma Khatun', meter: 'MTR-2026-008', phone: '01712345685', address: 'House #3, N.S-Road, Kushtia' },
        ];

        const subjects = [
            'Voltage Fluctuation in Area',
            'Incorrect Billing Amount',
            'Power Outage Issue',
            'Meter Not Working',
            'High Voltage Complaint',
            'Frequent Power Cut',
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
                description: `Experiencing ${subject.toLowerCase()} in ${consumer.address.split(',')[1]?.trim() || 'the area'}. Please resolve this issue as soon as possible.`,
                priority,
                status,
                consumerName: consumer.name,
                contactNumber: consumer.phone,
                address: consumer.address,
                assignedTo: status === 'pending' ? 'Not Assigned' : ['Mr. Kamal', 'Mr. Rahim', 'Ms. Nasrin'][Math.floor(Math.random() * 3)],
                createdAt: `2026-${month}-${day}T${hour}:${minute}:00Z`,
            };
        });
    };

    const getStatusBadge = (status: string) => {
        const statuses: Record<string, { color: string; label: string; icon: any }> = {
            pending: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending', icon: Clock },
            under_action: { color: 'bg-blue-100 text-blue-700', label: 'Under Action', icon: Activity },
            solved: { color: 'bg-green-100 text-green-700', label: 'Solved', icon: CheckCircle },
            rejected: { color: 'bg-red-100 text-red-700', label: 'Rejected', icon: AlertCircle },
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

    const filteredRecent = recentComplaints.filter(c =>
        c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.consumerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.complaintId.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                        <span>Complaint Manager Dashboard</span>
                    </h1>
                    <p className="text-gray-500 text-sm">Manage and resolve consumer complaints</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={fetchDashboardData}
                        className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    >
                        <RefreshCw size={16} />
                        <span>Refresh</span>
                    </button>
                    <button
                        onClick={() => router.push('/dashboard/complaint_manager/complaints/pending')}
                        className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                    >
                        <FileText size={16} />
                        <span>View All</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <StatCard
                    title="Total Complaints"
                    value={stats.total}
                    icon={<FileText size={20} className="text-white" />}
                    bgColor="bg-blue-100"
                    onClick={() => router.push('/dashboard/complaint_manager/complaints/all')}
                />
                <StatCard
                    title="Pending"
                    value={stats.pending}
                    icon={<Clock size={20} className="text-white" />}
                    bgColor="bg-yellow-100"
                    change={`${stats.pending} waiting`}
                    trend="down"
                    onClick={() => router.push('/dashboard/complaint_manager/complaints/pending')}
                />
                <StatCard
                    title="Under Action"
                    value={stats.underAction}
                    icon={<Activity size={20} className="text-white" />}
                    bgColor="bg-purple-100"
                    change={`${stats.underAction} in progress`}
                    trend="neutral"
                />
                <StatCard
                    title="Solved"
                    value={stats.solved}
                    icon={<CheckCircle size={20} className="text-white" />}
                    bgColor="bg-green-100"
                    change={`${stats.resolutionRate}% rate`}
                    trend="up"
                />
                <StatCard
                    title="High Priority"
                    value={stats.highPriority}
                    icon={<AlertCircle size={20} className="text-white" />}
                    bgColor="bg-red-100"
                    change={`${stats.highPriority} urgent`}
                    trend="down"
                />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-6 text-white">
                    <h3 className="text-lg font-semibold">Quick Actions</h3>
                    <p className="text-sm text-red-100 mt-1">Manage complaints efficiently</p>
                    <div className="mt-4 space-y-2">
                        <button
                            onClick={() => router.push('/dashboard/complaint_manager/complaints/pending')}
                            className="w-full text-left px-4 py-2.5 bg-red-500/30 hover:bg-red-500/50 rounded-lg transition-colors flex items-center space-x-3"
                        >
                            <Clock size={18} />
                            <span className="text-sm">View Pending Complaints</span>
                        </button>
                        <button
                            onClick={() => router.push('/dashboard/complaint_manager/complaints/all')}
                            className="w-full text-left px-4 py-2.5 bg-red-500/30 hover:bg-red-500/50 rounded-lg transition-colors flex items-center space-x-3"
                        >
                            <FileText size={18} />
                            <span className="text-sm">View All Complaints</span>
                        </button>
                        <button className="w-full text-left px-4 py-2.5 bg-red-500/30 hover:bg-red-500/50 rounded-lg transition-colors flex items-center space-x-3">
                            <Download size={18} />
                            <span className="text-sm">Export Report</span>
                        </button>
                    </div>
                </div>

                <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Complaint Summary</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                            <p className="text-xs text-gray-500">Pending</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <p className="text-2xl font-bold text-purple-600">{stats.underAction}</p>
                            <p className="text-xs text-gray-500">Under Action</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <p className="text-2xl font-bold text-green-600">{stats.solved}</p>
                            <p className="text-xs text-gray-500">Solved</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                            <p className="text-xs text-gray-500">Rejected</p>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Resolution Rate</span>
                            <span className="text-sm font-bold text-green-600">{stats.resolutionRate}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                            <div
                                className="h-2 bg-green-500 rounded-full transition-all duration-500"
                                style={{ width: `${stats.resolutionRate}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Complaints */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800">Recent Complaints</h3>
                    <div className="flex items-center space-x-2">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <button
                            onClick={() => router.push('/dashboard/complaint_manager/complaints/all')}
                            className="text-sm text-emerald-600 hover:text-emerald-700"
                        >
                            View All
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Consumer</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredRecent.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-4 text-center text-gray-500">
                                        No recent complaints
                                    </td>
                                </tr>
                            ) : (
                                filteredRecent.map((complaint) => {
                                    const StatusBadge = getStatusBadge(complaint.status);
                                    const PriorityBadge = getPriorityBadge(complaint.priority);
                                    const StatusIcon = StatusBadge.icon;

                                    return (
                                        <tr key={complaint.complaintId} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 text-sm font-medium text-gray-800">{complaint.complaintId}</td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm text-gray-800">{complaint.consumerName}</p>
                                                <p className="text-xs text-gray-400">{complaint.meterNo}</p>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">{complaint.subject}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${PriorityBadge.color}`}>
                                                    {PriorityBadge.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 w-fit ${StatusBadge.color}`}>
                                                    <StatusIcon size={12} />
                                                    <span>{StatusBadge.label}</span>
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => router.push(`/dashboard/complaint_manager/complaints/pending`)}
                                                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
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
            </div>
        </div>
    );
}