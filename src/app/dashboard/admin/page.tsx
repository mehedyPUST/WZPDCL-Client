// app/dashboard/admin/page.tsx
'use client';

import React from 'react';
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
} from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    bgColor: string;
}

const StatCard = ({ title, value, icon, change, trend, bgColor }: StatCardProps) => (
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

export default function AdminDashboardPage() {
    const stats = [
        {
            title: 'Total Users',
            value: '1,892',
            icon: <Users size={20} className="text-white" />,
            change: '+12.5%',
            trend: 'up' as const,
            bgColor: 'bg-purple-100'
        },
        {
            title: 'Active Meters',
            value: '1,247',
            icon: <Activity size={20} className="text-white" />,
            change: '+8.3%',
            trend: 'up' as const,
            bgColor: 'bg-blue-100'
        },
        {
            title: 'Monthly Revenue',
            value: '₹45,230',
            icon: <DollarSign size={20} className="text-white" />,
            change: '+15.2%',
            trend: 'up' as const,
            bgColor: 'bg-green-100'
        },
        {
            title: 'Substations',
            value: '12',
            icon: <MapPin size={20} className="text-white" />,
            change: '+1',
            trend: 'up' as const,
            bgColor: 'bg-orange-100'
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
                    <p className="text-gray-500 text-sm">Manage your power distribution system</p>
                </div>
                <button className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2">
                    <FileText size={16} />
                    <span>Generate Report</span>
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
                    <div className="space-y-2">
                        <button className="w-full text-left px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-3">
                            <Users size={18} className="text-emerald-600" />
                            <span>Manage Users</span>
                        </button>
                        <button className="w-full text-left px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-3">
                            <MapPin size={18} className="text-emerald-600" />
                            <span>Manage Substations</span>
                        </button>
                        <button className="w-full text-left px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-3">
                            <Settings size={18} className="text-emerald-600" />
                            <span>System Settings</span>
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">System Status</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-gray-50">
                            <span className="text-sm text-gray-600">Database</span>
                            <span className="text-sm text-green-600">✅ Operational</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-50">
                            <span className="text-sm text-gray-600">API Server</span>
                            <span className="text-sm text-green-600">✅ Operational</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-50">
                            <span className="text-sm text-gray-600">Payment Gateway</span>
                            <span className="text-sm text-green-600">✅ Operational</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-gray-600">Uptime</span>
                            <span className="text-sm font-medium">99.98%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}