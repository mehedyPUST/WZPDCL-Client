'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Clock,
    CheckCircle,
    AlertCircle,
    CreditCard,
    Zap,
    Users,
    Calendar,
    Search,
    Eye,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Loader2,
    Download,
    Printer,
    Plus,
    Filter,
    X,
    BarChart3,
    PieChart,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Building,
    Home,
    Package,
    MapPin,
    Send,
    Check,
    ListChecks,
    Award,
    FileText,
    UserCheck,
    UserX,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

interface Bill {
    _id?: string;
    billId: string;
    meterNo: string;
    consumerName: string;
    billingMonth: string;
    consumerType: 'residential' | 'commercial' | 'industrial';
    previousReading: number;
    currentReading: number;
    unitsConsumed: number;
    ratePerUnit: number;
    totalAmount: number;
    dueDate: string;
    status: 'paid' | 'unpaid' | 'pending';
    paidAt?: string;
    paymentMethod?: string;
    lateFee?: number;
    vatAmount?: number;
    grandTotal?: number;
    createdAt: string;
    updatedAt: string;
}

interface DashboardStats {
    totalBills: number;
    totalAmount: number;
    collectedAmount: number;
    pendingAmount: number;
    collectionRate: number;
    unpaidCount: number;
    paidCount: number;
    pendingCount: number;
    residentialCount: number;
    commercialCount: number;
    industrialCount: number;
    totalConsumers: number;
    registeredConsumers: number;
}

export default function BillingWingsDashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [bills, setBills] = useState<Bill[]>([]);
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [stats, setStats] = useState<DashboardStats>({
        totalBills: 0,
        totalAmount: 0,
        collectedAmount: 0,
        pendingAmount: 0,
        collectionRate: 0,
        unpaidCount: 0,
        paidCount: 0,
        pendingCount: 0,
        residentialCount: 0,
        commercialCount: 0,
        industrialCount: 0,
        totalConsumers: 0,
        registeredConsumers: 0,
    });
    const [user, setUser] = useState<any>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<string>('');

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
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('auth_token');

            // ✅ Fetch bills
            const billsRes = await fetch(
                `${API_URL}/api/billing/bills/all?limit=1000`,
                {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json',
                    },
                }
            );

            let billsData: Bill[] = [];
            if (billsRes.ok) {
                const billsResult = await billsRes.json();
                if (billsResult.success) {
                    billsData = billsResult.data || [];
                }
            }

            setBills(billsData);

            // ✅ Fetch consumers
            let consumersData: any[] = [];
            const consumersRes = await fetch(
                `${API_URL}/api/billing/consumers/all`,
                {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (consumersRes.ok) {
                const consumersResult = await consumersRes.json();
                if (consumersResult.success) {
                    consumersData = consumersResult.data || [];
                }
            }

            // ✅ Calculate stats
            const total = billsData.length;
            const paidBills = billsData.filter(b => b.status === 'paid');
            const unpaidBills = billsData.filter(b => b.status === 'unpaid');
            const pendingBills = billsData.filter(b => b.status === 'pending');

            const totalAmount = billsData.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
            const collectedAmount = paidBills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
            const pendingAmount = unpaidBills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

            const collectionRate = totalAmount > 0 ? (collectedAmount / totalAmount) * 100 : 0;

            const residentialCount = billsData.filter(b => b.consumerType === 'residential').length;
            const commercialCount = billsData.filter(b => b.consumerType === 'commercial').length;
            const industrialCount = billsData.filter(b => b.consumerType === 'industrial').length;

            const totalConsumers = consumersData.length;
            const registeredConsumers = consumersData.filter((c: any) => c.isRegistered).length;

            setStats({
                totalBills: total,
                totalAmount,
                collectedAmount,
                pendingAmount,
                collectionRate,
                unpaidCount: unpaidBills.length,
                paidCount: paidBills.length,
                pendingCount: pendingBills.length,
                residentialCount,
                commercialCount,
                industrialCount,
                totalConsumers,
                registeredConsumers,
            });

            setLastUpdated(new Date().toLocaleString());

        } catch (error: any) {
            console.error('❌ Error fetching dashboard data:', error);
            setError(error.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statuses: Record<string, { color: string; label: string; icon: any }> = {
            paid: { color: 'bg-green-100 text-green-700', label: 'Paid', icon: CheckCircle },
            unpaid: { color: 'bg-red-100 text-red-700', label: 'Unpaid', icon: AlertCircle },
            pending: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending', icon: Clock },
        };
        return statuses[status] || statuses.pending;
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

    const handleViewDetails = (bill: Bill) => {
        setSelectedBill(bill);
        setShowDetailsModal(true);
    };

    const formatCurrency = (amount: number) => {
        return `৳${amount.toLocaleString()}`;
    };

    const formatDate = (date: string) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const filteredBills = bills.filter(bill => {
        const matchesSearch = bill.billId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bill.consumerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bill.meterNo?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || bill.status === filterStatus;
        const matchesType = filterType === 'all' || bill.consumerType === filterType;
        return matchesSearch && matchesStatus && matchesType;
    });

    const totalPages = Math.ceil(filteredBills.length / ITEMS_PER_PAGE);
    const paginatedBills = filteredBills.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={40} className="animate-spin text-emerald-600" />
            </div>
        );
    }

    if (error && bills.length === 0) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
                <AlertCircle size={48} className="text-red-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-red-700">Failed to Load Dashboard</h3>
                <p className="text-red-600 mt-2">{error}</p>
                <button
                    onClick={fetchDashboardData}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                    Try Again
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
                        <DollarSign size={24} className="text-emerald-600" />
                        <span>Billing Dashboard</span>
                    </h1>
                    <div className="flex items-center space-x-3 text-sm text-gray-500">
                        <span>{bills.length} bills</span>
                        <span>•</span>
                        <span>{stats.totalConsumers} consumers</span>
                        {lastUpdated && (
                            <>
                                <span>•</span>
                                <span className="text-xs text-gray-400">Updated: {lastUpdated}</span>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => {
                            setIsRefreshing(true);
                            fetchDashboardData().finally(() => setIsRefreshing(false));
                        }}
                        disabled={isRefreshing}
                        className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                        <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                    </button>
                    <button
                        onClick={() => router.push('/dashboard/billing_wings/generate-bills')}
                        className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                    >
                        <Plus size={16} />
                        <span>Generate Bills</span>
                    </button>
                    {bills.length > 0 && (
                        <button className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                            <Download size={16} />
                            <span>Export</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Bills</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.totalBills}</p>
                            <p className="text-xs text-gray-400 mt-1">
                                {stats.paidCount} paid • {stats.unpaidCount} unpaid
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-blue-100">
                            <FileText size={20} className="text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Amount</p>
                            <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalAmount)}</p>
                            <p className="text-xs text-gray-400 mt-1">
                                {stats.totalBills} bills generated
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-100">
                            <DollarSign size={20} className="text-emerald-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Collection Rate</p>
                            <p className="text-2xl font-bold text-green-600">{stats.collectionRate.toFixed(1)}%</p>
                            <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                                <div
                                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(stats.collectionRate, 100)}%` }}
                                />
                            </div>
                        </div>
                        <div className="p-3 rounded-xl bg-green-100">
                            <TrendingUp size={20} className="text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Pending Amount</p>
                            <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.pendingAmount)}</p>
                            <p className="text-xs text-gray-400 mt-1">
                                {stats.unpaidCount} bills due
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-red-100">
                            <Clock size={20} className="text-red-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-100">
                    <p className="text-xs text-gray-500">Residential</p>
                    <p className="text-lg font-bold text-blue-600">{stats.residentialCount}</p>
                    <p className="text-xs text-gray-400">{stats.totalBills > 0 ? Math.round((stats.residentialCount / stats.totalBills) * 100) : 0}%</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-100">
                    <p className="text-xs text-gray-500">Commercial</p>
                    <p className="text-lg font-bold text-purple-600">{stats.commercialCount}</p>
                    <p className="text-xs text-gray-400">{stats.totalBills > 0 ? Math.round((stats.commercialCount / stats.totalBills) * 100) : 0}%</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-100">
                    <p className="text-xs text-gray-500">Industrial</p>
                    <p className="text-lg font-bold text-orange-600">{stats.industrialCount}</p>
                    <p className="text-xs text-gray-400">{stats.totalBills > 0 ? Math.round((stats.industrialCount / stats.totalBills) * 100) : 0}%</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-100">
                    <p className="text-xs text-gray-500">Total Consumers</p>
                    <p className="text-lg font-bold text-gray-800">{stats.totalConsumers}</p>
                    <p className="text-xs text-gray-400">{stats.registeredConsumers} registered</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-100">
                    <p className="text-xs text-gray-500">Collection Status</p>
                    <p className="text-lg font-bold text-emerald-600">{stats.paidCount}</p>
                    <p className="text-xs text-gray-400">{stats.unpaidCount} pending</p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by bill ID, consumer name, or meter number..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <select
                            value={filterStatus}
                            onChange={(e) => {
                                setFilterStatus(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                            <option value="all">All Status</option>
                            <option value="paid">Paid</option>
                            <option value="unpaid">Unpaid</option>
                            <option value="pending">Pending</option>
                        </select>
                        <select
                            value={filterType}
                            onChange={(e) => {
                                setFilterType(e.target.value);
                                setCurrentPage(1);
                            }}
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
                                setCurrentPage(1);
                            }}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                        >
                            <RefreshCw size={16} />
                            <span>Reset</span>
                        </button>
                    </div>
                </div>
                <div className="mt-2 text-xs text-gray-400">
                    Found {filteredBills.length} bills
                </div>
            </div>

            {/* Bills Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bill ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Consumer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Meter</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedBills.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                                            ? 'No bills match your filters.'
                                            : 'No bills found in the system. Generate bills to get started.'}
                                    </td>
                                </tr>
                            ) : (
                                paginatedBills.map((bill) => {
                                    const StatusBadge = getStatusBadge(bill.status);
                                    const StatusIcon = StatusBadge.icon;

                                    return (
                                        <tr key={bill.billId || bill._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-gray-800">{bill.billId}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-800">{bill.consumerName}</p>
                                                <p className="text-xs text-gray-400">{bill.consumerType}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-600">{bill.meterNo}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-600">{bill.billingMonth}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-sm font-medium ${bill.status === 'unpaid' ? 'text-red-600' : 'text-gray-800'}`}>
                                                    {formatCurrency(bill.totalAmount || 0)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 w-fit ${StatusBadge.color}`}>
                                                    <StatusIcon size={12} />
                                                    <span>{StatusBadge.label}</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleViewDetails(bill)}
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
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-4">
                        <p className="text-sm text-gray-500">
                            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredBills.length)} of {filteredBills.length} bills
                        </p>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${currentPage === pageNum
                                            ? 'bg-emerald-600 text-white'
                                            : 'border border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            {totalPages > 5 && currentPage < totalPages - 2 && (
                                <span className="text-gray-400">...</span>
                            )}
                            {totalPages > 5 && currentPage < totalPages - 2 && (
                                <button
                                    onClick={() => setCurrentPage(totalPages)}
                                    className={`px-3 py-1 rounded-lg text-sm transition-colors border border-gray-200 hover:bg-gray-50`}
                                >
                                    {totalPages}
                                </button>
                            )}
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

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-6 text-white">
                    <h3 className="text-lg font-semibold">Quick Actions</h3>
                    <p className="text-sm text-emerald-100 mt-1">Common billing tasks</p>
                    <div className="mt-4 space-y-2">
                        <button
                            onClick={() => router.push('/dashboard/billing_wings/generate-bills')}
                            className="w-full text-left px-4 py-2.5 bg-emerald-500/30 hover:bg-emerald-500/50 rounded-lg transition-colors flex items-center space-x-3"
                        >
                            <Plus size={18} />
                            <span className="text-sm">Generate Monthly Bills</span>
                        </button>
                        <button
                            onClick={() => router.push('/dashboard/billing_wings/all-consumers')}
                            className="w-full text-left px-4 py-2.5 bg-emerald-500/30 hover:bg-emerald-500/50 rounded-lg transition-colors flex items-center space-x-3"
                        >
                            <Users size={18} />
                            <span className="text-sm">View All Consumers</span>
                        </button>
                        <button
                            onClick={() => router.push('/dashboard/billing_wings/all-bills')}
                            className="w-full text-left px-4 py-2.5 bg-emerald-500/30 hover:bg-emerald-500/50 rounded-lg transition-colors flex items-center space-x-3"
                        >
                            <FileText size={18} />
                            <span className="text-sm">View All Bills</span>
                        </button>
                    </div>
                </div>

                <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Collection Summary</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-green-50 rounded-lg p-4 text-center border border-green-100">
                            <p className="text-2xl font-bold text-green-600">
                                {stats.collectionRate.toFixed(1)}%
                            </p>
                            <p className="text-xs text-gray-500">Collection Rate</p>
                            <p className="text-xs text-gray-400 mt-1">
                                {stats.paidCount} paid / {stats.totalBills} total
                            </p>
                        </div>
                        <div className="bg-emerald-50 rounded-lg p-4 text-center border border-emerald-100">
                            <p className="text-2xl font-bold text-emerald-600">
                                {formatCurrency(stats.collectedAmount)}
                            </p>
                            <p className="text-xs text-gray-500">Collected Amount</p>
                            <p className="text-xs text-gray-400 mt-1">
                                From {stats.paidCount} bills
                            </p>
                        </div>
                        <div className="bg-red-50 rounded-lg p-4 text-center border border-red-100">
                            <p className="text-2xl font-bold text-red-600">
                                {formatCurrency(stats.pendingAmount)}
                            </p>
                            <p className="text-xs text-gray-500">Pending Amount</p>
                            <p className="text-xs text-gray-400 mt-1">
                                {stats.unpaidCount} bills pending
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Modal */}
            {showDetailsModal && selectedBill && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-emerald-100 rounded-full">
                                    <FileText size={20} className="text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">Bill Details</h3>
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
                                <p className="text-xs text-gray-500">Bill ID</p>
                                <p className="text-sm font-medium">{selectedBill.billId}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Status</p>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(selectedBill.status).color}`}>
                                    {getStatusBadge(selectedBill.status).label}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Consumer</p>
                                <p className="text-sm font-medium">{selectedBill.consumerName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Meter Number</p>
                                <p className="text-sm font-medium">{selectedBill.meterNo}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Billing Month</p>
                                <p className="text-sm font-medium">{selectedBill.billingMonth}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Consumer Type</p>
                                <p className="text-sm font-medium">{getConsumerTypeLabel(selectedBill.consumerType)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Previous Reading</p>
                                <p className="text-sm font-medium">{selectedBill.previousReading} kWh</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Current Reading</p>
                                <p className="text-sm font-medium">{selectedBill.currentReading} kWh</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Units Consumed</p>
                                <p className="text-sm font-medium">{selectedBill.unitsConsumed} kWh</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Rate per Unit</p>
                                <p className="text-sm font-medium">৳{selectedBill.ratePerUnit}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Due Date</p>
                                <p className="text-sm font-medium">{formatDate(selectedBill.dueDate)}</p>
                            </div>
                            {selectedBill.paidAt && (
                                <div>
                                    <p className="text-xs text-gray-500">Paid At</p>
                                    <p className="text-sm font-medium text-green-600">{formatDate(selectedBill.paidAt)}</p>
                                </div>
                            )}
                            {selectedBill.paymentMethod && (
                                <div>
                                    <p className="text-xs text-gray-500">Payment Method</p>
                                    <p className="text-sm font-medium">{selectedBill.paymentMethod}</p>
                                </div>
                            )}
                            {selectedBill.lateFee && selectedBill.lateFee > 0 && (
                                <div>
                                    <p className="text-xs text-gray-500">Late Fee</p>
                                    <p className="text-sm font-medium text-red-600">+{formatCurrency(selectedBill.lateFee)}</p>
                                </div>
                            )}
                            <div className="col-span-2 border-t border-gray-100 pt-4">
                                <p className="text-xs text-gray-500">Total Amount</p>
                                <p className={`text-2xl font-bold ${selectedBill.status === 'unpaid' ? 'text-red-600' : 'text-gray-800'}`}>
                                    {formatCurrency(selectedBill.grandTotal || selectedBill.totalAmount || 0)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Created</p>
                                <p className="text-sm text-gray-600">{formatDate(selectedBill.createdAt)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Last Updated</p>
                                <p className="text-sm text-gray-600">{formatDate(selectedBill.updatedAt)}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end space-x-3 pt-4 mt-4 border-t border-gray-100">
                            <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                                <Printer size={16} />
                                <span>Print</span>
                            </button>
                            <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                                <Download size={16} />
                                <span>Download</span>
                            </button>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
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