// app/dashboard/admin/reports/page.tsx
'use client';

import React, { useState } from 'react';
import {
    BarChart3,
    Download,
    Calendar,
    Filter,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Users,
    Zap,
    FileText,
    PieChart,
    LineChart,
    Activity,
    Clock,
    CheckCircle,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Printer,
    Mail,
    Share2,
    Eye,
    RefreshCw,
    ArrowUpRight,
    ArrowDownRight,
    Building,
    Home,
    CreditCard,
    MapPin,
    Search, // ✅ Fixed: Added Search import
} from 'lucide-react';

interface ReportData {
    id: string;
    title: string;
    type: 'collection' | 'consumption' | 'complaints' | 'connections' | 'revenue';
    generatedAt: string;
    period: string;
    status: 'completed' | 'pending' | 'processing';
    format: 'pdf' | 'excel' | 'csv';
    size: string;
}

export default function AdminReportsPage() {
    const [period, setPeriod] = useState('this_month');
    const [reportType, setReportType] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedReport, setSelectedReport] = useState<string | null>(null);

    // Report data
    const reports: ReportData[] = [
        {
            id: '1',
            title: 'Monthly Bill Collection Summary',
            type: 'collection',
            generatedAt: '2026-07-10 10:30 AM',
            period: 'July 2026',
            status: 'completed',
            format: 'pdf',
            size: '2.4 MB',
        },
        {
            id: '2',
            title: 'Energy Consumption Analysis - Q2 2026',
            type: 'consumption',
            generatedAt: '2026-07-08 03:15 PM',
            period: 'Q2 2026',
            status: 'completed',
            format: 'excel',
            size: '4.8 MB',
        },
        {
            id: '3',
            title: 'Customer Complaints Report',
            type: 'complaints',
            generatedAt: '2026-07-05 09:00 AM',
            period: 'January - June 2026',
            status: 'pending',
            format: 'csv',
            size: '1.2 MB',
        },
        {
            id: '4',
            title: 'New Connection Applications Review',
            type: 'connections',
            generatedAt: '2026-07-03 11:45 AM',
            period: '2026',
            status: 'completed',
            format: 'pdf',
            size: '3.6 MB',
        },
        {
            id: '5',
            title: 'Revenue Collection Report - FY 2025-26',
            type: 'revenue',
            generatedAt: '2026-07-01 04:20 PM',
            period: 'FY 2025-26',
            status: 'processing',
            format: 'excel',
            size: '5.2 MB',
        },
    ];

    // Dashboard stats
    const stats = [
        {
            label: 'Total Reports',
            value: '48',
            change: '+12%',
            trend: 'up',
            icon: FileText,
            color: 'bg-blue-100 text-blue-600'
        },
        {
            label: 'Monthly Collection',
            value: '₹45,230',
            change: '+15.2%',
            trend: 'up',
            icon: DollarSign,
            color: 'bg-green-100 text-green-600'
        },
        {
            label: 'Collection Rate',
            value: '94.8%',
            change: '+2.3%',
            trend: 'up',
            icon: TrendingUp,
            color: 'bg-emerald-100 text-emerald-600'
        },
        {
            label: 'New Connections',
            value: '127',
            change: '-3.5%',
            trend: 'down',
            icon: Users,
            color: 'bg-purple-100 text-purple-600'
        },
    ];

    // Chart data - Monthly Collection
    const monthlyData = [
        { month: 'Jan', collection: 32000, target: 35000 },
        { month: 'Feb', collection: 28500, target: 35000 },
        { month: 'Mar', collection: 38000, target: 35000 },
        { month: 'Apr', collection: 42000, target: 40000 },
        { month: 'May', collection: 39500, target: 40000 },
        { month: 'Jun', collection: 45230, target: 42000 },
    ];

    // Chart data - Consumption by Consumer Type
    const consumptionData = [
        { type: 'Residential', value: 45, color: 'bg-blue-500' },
        { type: 'Commercial', value: 30, color: 'bg-emerald-500' },
        { type: 'Industrial', value: 15, color: 'bg-purple-500' },
        { type: 'Others', value: 10, color: 'bg-yellow-500' },
    ];

    // Chart data - Complaints by Category
    const complaintsData = [
        { category: 'Voltage Issue', count: 28 },
        { category: 'Billing Error', count: 22 },
        { category: 'Power Outage', count: 35 },
        { category: 'Meter Issue', count: 15 },
        { category: 'Other', count: 10 },
    ];

    const getStatusBadge = (status: string) => {
        const statuses: Record<string, { color: string; label: string }> = {
            completed: { color: 'bg-green-100 text-green-700', label: 'Completed' },
            pending: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending' },
            processing: { color: 'bg-blue-100 text-blue-700', label: 'Processing' },
        };
        return statuses[status] || statuses.pending;
    };

    const getTypeBadge = (type: string) => {
        const types: Record<string, { color: string; label: string }> = {
            collection: { color: 'bg-emerald-100 text-emerald-700', label: 'Collection' },
            consumption: { color: 'bg-blue-100 text-blue-700', label: 'Consumption' },
            complaints: { color: 'bg-red-100 text-red-700', label: 'Complaints' },
            connections: { color: 'bg-purple-100 text-purple-700', label: 'Connections' },
            revenue: { color: 'bg-amber-100 text-amber-700', label: 'Revenue' },
        };
        return types[type] || types.collection;
    };

    const getFormatIcon = (format: string) => {
        const formats: Record<string, string> = {
            pdf: '📄',
            excel: '📊',
            csv: '📋',
        };
        return formats[format] || '📄';
    };

    const filteredReports = reports.filter(report => {
        const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = reportType === 'all' || report.type === reportType;
        return matchesSearch && matchesType;
    });

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                        <BarChart3 size={24} className="text-emerald-600" />
                        <span>Reports & Analytics</span>
                    </h1>
                    <p className="text-gray-500 text-sm">View and generate system reports and analytics</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                        <RefreshCw size={16} />
                        <span>Refresh</span>
                    </button>
                    <button className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2">
                        <FileText size={16} />
                        <span>Generate Report</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight;
                    return (
                        <div key={index} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">{stat.label}</p>
                                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                                    <p className={`text-xs flex items-center ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        <TrendIcon size={14} className="mr-0.5" />
                                        {stat.change}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-xl ${stat.color}`}>
                                    <Icon size={20} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Collection Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-800">Monthly Collection</h3>
                        <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                            <option>2026</option>
                            <option>2025</option>
                            <option>2024</option>
                        </select>
                    </div>
                    <div className="space-y-3">
                        {monthlyData.map((item, index) => {
                            const percentage = (item.collection / item.target) * 100;
                            const isOver = item.collection >= item.target;
                            return (
                                <div key={index} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">{item.month}</span>
                                        <span className="font-medium text-gray-800">₹{item.collection.toLocaleString()}</span>
                                    </div>
                                    <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`absolute top-0 left-0 h-full rounded-full transition-all ${isOver ? 'bg-emerald-500' : 'bg-blue-500'
                                                }`}
                                            style={{ width: `${Math.min(percentage, 100)}%` }}
                                        />
                                        <div
                                            className="absolute top-0 left-0 h-full border-r-2 border-red-500"
                                            style={{ left: '100%' }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-gray-400">
                                        <span>Target: ₹{item.target.toLocaleString()}</span>
                                        <span className={isOver ? 'text-emerald-600' : 'text-blue-600'}>
                                            {isOver ? '✅ On Track' : `${Math.round(percentage)}%`}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Consumption by Type */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-800">Consumption by Consumer Type</h3>
                        <button className="text-sm text-emerald-600 hover:text-emerald-700">View Details</button>
                    </div>
                    <div className="space-y-4">
                        {consumptionData.map((item, index) => (
                            <div key={index} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">{item.type}</span>
                                    <span className="font-medium text-gray-800">{item.value}%</span>
                                </div>
                                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${item.color}`}
                                        style={{ width: `${item.value}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                        <div className="pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Total Consumption</span>
                                <span className="font-bold text-gray-800">24,587 MWh</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Complaints Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800">Complaints by Category</h3>
                    <button className="text-sm text-emerald-600 hover:text-emerald-700">View All</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    {complaintsData.map((item, index) => {
                        const colors = [
                            'bg-blue-100 text-blue-600',
                            'bg-red-100 text-red-600',
                            'bg-yellow-100 text-yellow-600',
                            'bg-purple-100 text-purple-600',
                            'bg-gray-100 text-gray-600',
                        ];
                        const total = complaintsData.reduce((sum, d) => sum + d.count, 0);
                        const percentage = Math.round((item.count / total) * 100);
                        return (
                            <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${colors[index]} mb-2`}>
                                    <span className="text-sm font-bold">{percentage}%</span>
                                </div>
                                <p className="text-sm font-medium text-gray-800">{item.category}</p>
                                <p className="text-xs text-gray-500">{item.count} complaints</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Reports List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <FileText size={20} className="text-gray-400" />
                        <h3 className="font-semibold text-gray-800">Generated Reports</h3>
                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                            {reports.length}
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search reports..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                            <option value="all">All Types</option>
                            <option value="collection">Collection</option>
                            <option value="consumption">Consumption</option>
                            <option value="complaints">Complaints</option>
                            <option value="connections">Connections</option>
                            <option value="revenue">Revenue</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Report Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Generated</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Format</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredReports.map((report) => {
                                const StatusBadge = getStatusBadge(report.status);
                                const TypeBadge = getTypeBadge(report.type);
                                return (
                                    <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-gray-800">{report.title}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${TypeBadge.color}`}>
                                                {TypeBadge.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">{report.period}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600">{report.generatedAt}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${StatusBadge.color}`}>
                                                {StatusBadge.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">
                                                {getFormatIcon(report.format)} {report.format.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center space-x-2">
                                                <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="View">
                                                    <Eye size={16} className="text-gray-500" />
                                                </button>
                                                <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Download">
                                                    <Download size={16} className="text-emerald-600" />
                                                </button>
                                                <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Share">
                                                    <Share2 size={16} className="text-blue-500" />
                                                </button>
                                                <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Print">
                                                    <Printer size={16} className="text-gray-500" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Report Generation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-6 text-white">
                    <h3 className="text-lg font-semibold">Quick Reports</h3>
                    <p className="text-sm text-emerald-100 mt-1">Generate common reports instantly</p>
                    <div className="mt-4 space-y-2">
                        <button className="w-full text-left px-4 py-2.5 bg-emerald-500/30 hover:bg-emerald-500/50 rounded-lg transition-colors flex items-center space-x-3">
                            <FileText size={18} />
                            <span className="text-sm">Monthly Collection Report</span>
                        </button>
                        <button className="w-full text-left px-4 py-2.5 bg-emerald-500/30 hover:bg-emerald-500/50 rounded-lg transition-colors flex items-center space-x-3">
                            <Users size={18} />
                            <span className="text-sm">Customer Summary Report</span>
                        </button>
                        <button className="w-full text-left px-4 py-2.5 bg-emerald-500/30 hover:bg-emerald-500/50 rounded-lg transition-colors flex items-center space-x-3">
                            <AlertCircle size={18} />
                            <span className="text-sm">Complaints Analysis Report</span>
                        </button>
                    </div>
                </div>

                <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Report Schedule</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-gray-50">
                            <div>
                                <p className="text-sm font-medium text-gray-800">Monthly Collection Report</p>
                                <p className="text-xs text-gray-500">Last day of every month</p>
                            </div>
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">Active</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-50">
                            <div>
                                <p className="text-sm font-medium text-gray-800">Weekly Performance Report</p>
                                <p className="text-xs text-gray-500">Every Friday at 5:00 PM</p>
                            </div>
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">Active</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <p className="text-sm font-medium text-gray-800">Quarterly Review Report</p>
                                <p className="text-xs text-gray-500">End of each quarter</p>
                            </div>
                            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">Pending</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}