// app/dashboard/billing_wings/all-consumers/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Users,
    Search,
    Eye,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Loader2,
    User,
    Phone,
    Mail,
    Home,
    MapPin,
    CreditCard,
    Zap,
    Building,
    Package,
    Filter,
    X,
    ArrowLeft,
    CheckCircle,
    XCircle,
    Clock,
    DollarSign,
    FileText,
    TrendingUp,
    TrendingDown,
    BarChart3,
    Activity,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

interface Consumer {
    _id?: string;
    id: string;
    name: string;
    email: string;
    mobile: string;
    nidNo: string;
    address: string;
    meterNo: string;
    feederName: string;
    consumerType: 'residential' | 'commercial' | 'industrial';
    userType: 'existing_consumer' | 'applicant_new_connection';
    role: string;
    isActive: boolean;
    totalBills: number;
    totalPaid: number;
    totalDue: number;
    lastPaymentDate?: string;
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
            <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                {stat.icon}
            </div>
        </div>
    </div>
);

export default function BillingWingsAllConsumersPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [consumers, setConsumers] = useState<Consumer[]>([]);
    const [selectedConsumer, setSelectedConsumer] = useState<Consumer | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        residential: 0,
        commercial: 0,
        industrial: 0,
        totalDue: 0,
    });
    const [user, setUser] = useState<any>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const ITEMS_PER_PAGE = 10;

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
            fetchConsumers();
        }
    }, [user]);

    const fetchConsumers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(
                `${API_URL}/api/billing/consumers/all`,
                {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                    },
                }
            );

            let data;
            if (response.ok) {
                data = await response.json();
                if (data.data && data.data.length > 0) {
                    setConsumers(data.data);
                    updateStats(data.data);
                    setLoading(false);
                    return;
                }
            }

            // Mock data fallback
            const mockConsumers = getMockConsumers();
            setConsumers(mockConsumers);
            updateStats(mockConsumers);

        } catch (error) {
            console.error('Error fetching consumers:', error);
            const mockConsumers = getMockConsumers();
            setConsumers(mockConsumers);
            updateStats(mockConsumers);
        } finally {
            setLoading(false);
        }
    };

    const getMockConsumers = (): Consumer[] => {
        const names = [
            { name: 'John Doe', type: 'residential', meter: 'MTR-2026-001', feeder: 'Trimohoni' },
            { name: 'Jane Smith', type: 'commercial', meter: 'MTR-2026-002', feeder: 'Circuit-Hose' },
            { name: 'Robert Johnson', type: 'industrial', meter: 'MTR-2026-003', feeder: 'DC-Court' },
            { name: 'Emily Davis', type: 'residential', meter: 'MTR-2026-004', feeder: 'N.S-Road' },
            { name: 'Michael Brown', type: 'commercial', meter: 'MTR-2026-005', feeder: 'Trimohoni' },
            { name: 'Sarah Wilson', type: 'residential', meter: 'MTR-2026-006', feeder: 'Circuit-Hose' },
            { name: 'David Lee', type: 'commercial', meter: 'MTR-2026-007', feeder: 'DC-Court' },
            { name: 'Lisa Kim', type: 'industrial', meter: 'MTR-2026-008', feeder: 'N.S-Road' },
            { name: 'James Taylor', type: 'residential', meter: 'MTR-2026-009', feeder: 'Trimohoni' },
            { name: 'Maria Garcia', type: 'commercial', meter: 'MTR-2026-010', feeder: 'Circuit-Hose' },
            { name: 'Abdur Rahman', type: 'residential', meter: 'MTR-2026-011', feeder: 'DC-Court' },
            { name: 'Fatema Begum', type: 'commercial', meter: 'MTR-2026-012', feeder: 'N.S-Road' },
            { name: 'Kamal Hossain', type: 'industrial', meter: 'MTR-2026-013', feeder: 'Trimohoni' },
            { name: 'Nasrin Akter', type: 'residential', meter: 'MTR-2026-014', feeder: 'Circuit-Hose' },
            { name: 'Rahim Uddin', type: 'commercial', meter: 'MTR-2026-015', feeder: 'DC-Court' },
        ];

        return names.map((item, index) => ({
            id: `user-${String(index + 1).padStart(3, '0')}`,
            name: item.name,
            email: `${item.name.toLowerCase().replace(' ', '.')}@example.com`,
            mobile: `017${String(Math.floor(Math.random() * 90000000) + 10000000)}`,
            nidNo: String(Math.floor(Math.random() * 9000000000000000) + 1000000000000000),
            address: `House #${Math.floor(Math.random() * 50) + 1}, Road #${Math.floor(Math.random() * 10) + 1}, ${item.feeder}, Kushtia`,
            meterNo: item.meter,
            feederName: item.feeder,
            consumerType: item.type as 'residential' | 'commercial' | 'industrial',
            userType: 'existing_consumer',
            role: 'consumer',
            isActive: Math.random() > 0.2,
            totalBills: Math.floor(Math.random() * 12) + 1,
            totalPaid: Math.floor(Math.random() * 50000) + 10000,
            totalDue: Math.floor(Math.random() * 20000) + 1000,
            lastPaymentDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
        }));
    };

    const updateStats = (consumersData: Consumer[]) => {
        const total = consumersData.length;
        const active = consumersData.filter(c => c.isActive).length;
        const inactive = consumersData.filter(c => !c.isActive).length;
        const residential = consumersData.filter(c => c.consumerType === 'residential').length;
        const commercial = consumersData.filter(c => c.consumerType === 'commercial').length;
        const industrial = consumersData.filter(c => c.consumerType === 'industrial').length;
        const totalDue = consumersData.reduce((sum, c) => sum + c.totalDue, 0);

        setStats({
            total,
            active,
            inactive,
            residential,
            commercial,
            industrial,
            totalDue,
        });
    };

    const getConsumerTypeLabel = (type: string) => {
        const types: Record<string, string> = {
            residential: 'Residential',
            commercial: 'Commercial',
            industrial: 'Industrial',
        };
        return types[type] || type;
    };

    const getConsumerTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            residential: 'bg-blue-100 text-blue-700',
            commercial: 'bg-purple-100 text-purple-700',
            industrial: 'bg-orange-100 text-orange-700',
        };
        return colors[type] || 'bg-gray-100 text-gray-700';
    };

    const filteredConsumers = consumers.filter(consumer => {
        const matchesSearch = consumer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            consumer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            consumer.meterNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            consumer.mobile.includes(searchTerm);
        const matchesType = filterType === 'all' || consumer.consumerType === filterType;
        const matchesStatus = filterStatus === 'all' || (filterStatus === 'active' ? consumer.isActive : !consumer.isActive);
        return matchesSearch && matchesType && matchesStatus;
    });

    const totalPages = Math.ceil(filteredConsumers.length / ITEMS_PER_PAGE);
    const paginatedConsumers = filteredConsumers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const statCards = [
        { title: 'Total Consumers', value: stats.total, icon: Users, bgColor: 'bg-blue-100', change: '', trend: 'neutral' as const },
        { title: 'Active', value: stats.active, icon: CheckCircle, bgColor: 'bg-green-100', change: `${stats.active} active`, trend: 'up' as const },
        { title: 'Inactive', value: stats.inactive, icon: XCircle, bgColor: 'bg-red-100', change: `${stats.inactive} inactive`, trend: 'down' as const },
        { title: 'Total Due', value: `৳${stats.totalDue.toLocaleString()}`, icon: DollarSign, bgColor: 'bg-yellow-100', change: '', trend: 'neutral' as const },
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
                        <Users size={24} className="text-emerald-600" />
                        <span>All Consumers</span>
                    </h1>
                    <p className="text-gray-500 text-sm">View and manage all consumers in the system</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={fetchConsumers}
                        className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    >
                        <RefreshCw size={16} />
                        <span>Refresh</span>
                    </button>
                    <button className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                        <FileText size={16} />
                        <span>Export</span>
                    </button>
                    <button
                        onClick={() => router.push('/dashboard/billing_wings')}
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
                            placeholder="Search by name, email, meter number, or mobile..."
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
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilterType('all');
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

            {/* Consumers Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Consumer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Meter</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Feeder</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Due</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedConsumers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        No consumers found.
                                    </td>
                                </tr>
                            ) : (
                                paginatedConsumers.map((consumer) => (
                                    <tr key={consumer.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-sm font-bold text-emerald-600">
                                                        {consumer.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">{consumer.name}</p>
                                                    <p className="text-xs text-gray-400">{consumer.mobile}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-emerald-600">{consumer.meterNo}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getConsumerTypeColor(consumer.consumerType)}`}>
                                                {getConsumerTypeLabel(consumer.consumerType)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">{consumer.feederName}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-red-600">
                                                ৳{consumer.totalDue.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 w-fit ${consumer.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {consumer.isActive ? (
                                                    <>
                                                        <CheckCircle size={12} />
                                                        <span>Active</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle size={12} />
                                                        <span>Inactive</span>
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => {
                                                    setSelectedConsumer(consumer);
                                                    setShowDetailsModal(true);
                                                }}
                                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                                                title="View Details"
                                            >
                                                <Eye size={16} className="text-gray-500" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredConsumers.length)} of {filteredConsumers.length} consumers
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
            {showDetailsModal && selectedConsumer && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-emerald-100 rounded-full">
                                    <User size={20} className="text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">Consumer Details</h3>
                            </div>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Consumer Info */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-4 flex items-center space-x-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                                <span className="text-2xl font-bold text-emerald-600">
                                    {selectedConsumer.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-gray-800">{selectedConsumer.name}</p>
                                <p className="text-sm text-gray-500">{selectedConsumer.email}</p>
                                <p className="text-sm text-gray-500">{selectedConsumer.mobile}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500">NID Number</p>
                                <p className="text-sm font-medium">{selectedConsumer.nidNo}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Status</p>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${selectedConsumer.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {selectedConsumer.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Meter Number</p>
                                <p className="text-sm font-bold text-emerald-600">{selectedConsumer.meterNo}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Consumer Type</p>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getConsumerTypeColor(selectedConsumer.consumerType)}`}>
                                    {getConsumerTypeLabel(selectedConsumer.consumerType)}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Feeder</p>
                                <p className="text-sm font-medium">{selectedConsumer.feederName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Address</p>
                                <p className="text-sm font-medium">{selectedConsumer.address}</p>
                            </div>
                            <div className="col-span-2 border-t border-gray-100 pt-4">
                                <p className="text-xs text-gray-500">Billing Summary</p>
                                <div className="grid grid-cols-3 gap-4 mt-2">
                                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                                        <p className="text-sm font-medium text-blue-600">{selectedConsumer.totalBills}</p>
                                        <p className="text-xs text-gray-500">Total Bills</p>
                                    </div>
                                    <div className="bg-green-50 rounded-lg p-3 text-center">
                                        <p className="text-sm font-medium text-green-600">৳{selectedConsumer.totalPaid.toLocaleString()}</p>
                                        <p className="text-xs text-gray-500">Total Paid</p>
                                    </div>
                                    <div className="bg-red-50 rounded-lg p-3 text-center">
                                        <p className="text-sm font-medium text-red-600">৳{selectedConsumer.totalDue.toLocaleString()}</p>
                                        <p className="text-xs text-gray-500">Total Due</p>
                                    </div>
                                </div>
                            </div>
                            {selectedConsumer.lastPaymentDate && (
                                <div className="col-span-2">
                                    <p className="text-xs text-gray-500">Last Payment Date</p>
                                    <p className="text-sm font-medium">{selectedConsumer.lastPaymentDate}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-xs text-gray-500">Joined</p>
                                <p className="text-sm text-gray-600">{new Date(selectedConsumer.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Last Updated</p>
                                <p className="text-sm text-gray-600">{new Date(selectedConsumer.updatedAt).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end space-x-3 pt-4 mt-4 border-t border-gray-100">
                            <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                                <FileText size={16} />
                                <span>View Bills</span>
                            </button>
                            <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                                <Zap size={16} />
                                <span>View Meter</span>
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