'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    FileText,
    Search,
    Eye,
    ChevronLeft,
    ChevronRight,
    RefreshCw,
    Loader2,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
    DollarSign,
    Download,
    Printer,
    X,
    ArrowLeft,
    TrendingUp,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

interface Bill {
    _id?: string;
    billId: string;
    meterNo: string;
    consumerName: string;
    consumerEmail?: string;
    consumerMobile?: string;
    consumerAddress?: string;
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
    isRegisteredUser?: boolean;
    isClaimed?: boolean;
    createdAt: string;
    updatedAt: string;
}

// ✅ FIXED: formatCurrency using Intl.NumberFormat
const formatCurrency = (amount: any): string => {
    if (amount === null || amount === undefined || amount === '') {
        return '৳0';
    }

    // Clean the string
    let str = String(amount).trim();
    str = str.replace(/,/g, '');
    str = str.replace(/[^0-9.-]/g, '');

    const num = parseFloat(str);
    if (isNaN(num)) return '৳0';

    // ✅ Use Intl.NumberFormat for proper formatting
    const formatted = new Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
    }).format(num);

    return `৳${formatted}`;
};

export default function BillingWingsAllBillsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [bills, setBills] = useState<Bill[]>([]);
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [filterMonth, setFilterMonth] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [stats, setStats] = useState({
        totalBills: 0,
        totalAmount: 0,
        paidAmount: 0,
        unpaidAmount: 0,
        paidCount: 0,
        unpaidCount: 0,
        pendingCount: 0,
        collectionRate: 0,
        registeredCount: 0,
        unregisteredCount: 0,
    });
    const [user, setUser] = useState<any>(null);
    const [selectedBills, setSelectedBills] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
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
            fetchBills();
        }
    }, [user]);

    const fetchBills = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('auth_token');

            const response = await fetch(
                `${API_URL}/api/billing/bills/all?limit=1000`,
                {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to fetch bills');
            }

            const result = await response.json();
            const billsData = result.success && result.data ? result.data : [];

            setBills(billsData);
            updateStats(billsData);
            setError(null);
        } catch (error: any) {
            console.error('❌ Error fetching bills:', error);
            setError(error.message || 'Failed to load bills');
            setBills([]);
            setStats({
                totalBills: 0,
                totalAmount: 0,
                paidAmount: 0,
                unpaidAmount: 0,
                paidCount: 0,
                unpaidCount: 0,
                pendingCount: 0,
                collectionRate: 0,
                registeredCount: 0,
                unregisteredCount: 0,
            });
        } finally {
            setLoading(false);
        }
    };

    const updateStats = (billsData: Bill[]) => {
        const total = billsData.length;
        const totalAmount = billsData.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
        const paidAmount = billsData.filter(b => b.status === 'paid').reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
        const unpaidAmount = billsData.filter(b => b.status === 'unpaid').reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
        const paidCount = billsData.filter(b => b.status === 'paid').length;
        const unpaidCount = billsData.filter(b => b.status === 'unpaid').length;
        const pendingCount = billsData.filter(b => b.status === 'pending').length;
        const collectionRate = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;
        const registeredCount = billsData.filter(b => b.isRegisteredUser).length;
        const unregisteredCount = billsData.filter(b => b.isRegisteredUser === false && b.consumerName !== 'N/A').length;

        setStats({
            totalBills: total,
            totalAmount,
            paidAmount,
            unpaidAmount,
            paidCount,
            unpaidCount,
            pendingCount,
            collectionRate,
            registeredCount,
            unregisteredCount,
        });
    };

    const getStatusBadge = (status: string) => {
        const statuses: Record<string, { color: string; label: string; icon: any }> = {
            paid: { color: 'bg-green-100 text-green-700', label: 'Paid', icon: CheckCircle },
            unpaid: { color: 'bg-red-100 text-red-700', label: 'Unpaid', icon: XCircle },
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

    const getUniqueMonths = () => {
        const months = bills.map(b => b.billingMonth);
        return ['all', ...Array.from(new Set(months))];
    };

    const toggleSelectBill = (billId: string) => {
        setSelectedBills(prev =>
            prev.includes(billId)
                ? prev.filter(id => id !== billId)
                : [...prev, billId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedBills.length === paginatedBills.length) {
            setSelectedBills([]);
        } else {
            setSelectedBills(paginatedBills.map(b => b.billId));
        }
    };

    const filteredBills = bills.filter(bill => {
        const matchesSearch = bill.billId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bill.consumerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bill.meterNo.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || bill.status === filterStatus;
        const matchesType = filterType === 'all' || bill.consumerType === filterType;
        const matchesMonth = filterMonth === 'all' || bill.billingMonth === filterMonth;
        return matchesSearch && matchesStatus && matchesType && matchesMonth;
    });

    const totalPages = Math.ceil(filteredBills.length / ITEMS_PER_PAGE);
    const paginatedBills = filteredBills.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const months = getUniqueMonths();

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
                <h3 className="text-lg font-semibold text-red-700">Failed to Load Bills</h3>
                <p className="text-red-600 mt-2">{error}</p>
                <button
                    onClick={fetchBills}
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
                        <FileText size={24} className="text-emerald-600" />
                        <span>All Bills</span>
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {bills.length} bills found
                        {stats.registeredCount > 0 && (
                            <span className="ml-2 text-xs text-emerald-600">
                                ({stats.registeredCount} registered users)
                            </span>
                        )}
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => {
                            setIsRefreshing(true);
                            fetchBills().finally(() => setIsRefreshing(false));
                        }}
                        disabled={isRefreshing}
                        className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                        <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                    </button>
                    {bills.length > 0 && (
                        <button className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                            <Download size={16} />
                            <span>Export</span>
                        </button>
                    )}
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
                {[
                    {
                        title: 'Total Bills',
                        value: stats.totalBills,
                        icon: FileText,
                        bgColor: 'bg-blue-100',
                        change: `${stats.registeredCount} registered, ${stats.unregisteredCount} unregistered`
                    },
                    {
                        title: 'Total Amount',
                        value: formatCurrency(stats.totalAmount),
                        icon: DollarSign,
                        bgColor: 'bg-emerald-100'
                    },
                    {
                        title: 'Collection Rate',
                        value: `${stats.collectionRate.toFixed(1)}%`,
                        icon: TrendingUp,
                        bgColor: 'bg-green-100',
                        change: `${stats.paidCount} paid`
                    },
                    {
                        title: 'Unpaid',
                        value: stats.unpaidCount,
                        icon: AlertCircle,
                        bgColor: 'bg-red-100',
                        change: formatCurrency(stats.unpaidAmount)
                    },
                ].map((stat, index) => {
                    const Icon = stat.icon as React.ElementType;
                    return (
                        <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">{stat.title}</p>
                                    <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                                    {stat.change && <p className="text-xs text-gray-500 mt-1">{stat.change}</p>}
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
                        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                            <option value="all">All Status</option>
                            <option value="paid">Paid</option>
                            <option value="unpaid">Unpaid</option>
                            <option value="pending">Pending</option>
                        </select>
                        <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }} className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                            <option value="all">All Types</option>
                            <option value="residential">Residential</option>
                            <option value="commercial">Commercial</option>
                            <option value="industrial">Industrial</option>
                        </select>
                        <select value={filterMonth} onChange={(e) => { setFilterMonth(e.target.value); setCurrentPage(1); }} className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                            <option value="all">All Months</option>
                            {months.filter(m => m !== 'all').map((month) => (
                                <option key={month} value={month}>{month}</option>
                            ))}
                        </select>
                        <button onClick={() => { setSearchTerm(''); setFilterStatus('all'); setFilterType('all'); setFilterMonth('all'); setCurrentPage(1); }} className="px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                            <RefreshCw size={16} />
                            <span>Reset</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Bills Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3 w-10">
                                    <input type="checkbox" checked={selectedBills.length === paginatedBills.length && paginatedBills.length > 0} onChange={toggleSelectAll} className="w-4 h-4 text-emerald-600" />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bill ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Consumer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Meter</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedBills.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                                        No bills match your filters.
                                    </td>
                                </tr>
                            ) : (
                                paginatedBills.map((bill) => {
                                    const StatusBadge = getStatusBadge(bill.status);
                                    const StatusIcon = StatusBadge.icon;
                                    return (
                                        <tr key={bill._id || bill.billId} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <input type="checkbox" checked={selectedBills.includes(bill.billId)} onChange={() => toggleSelectBill(bill.billId)} className="w-4 h-4 text-emerald-600" />
                                            </td>
                                            <td className="px-6 py-4 font-medium">{bill.billId}</td>
                                            <td className="px-6 py-4">{bill.consumerName}</td>
                                            <td className="px-6 py-4">{bill.meterNo}</td>
                                            <td className="px-6 py-4">{bill.billingMonth}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getConsumerTypeColor(bill.consumerType)}`}>
                                                    {getConsumerTypeLabel(bill.consumerType)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-medium">
                                                {formatCurrency(bill.grandTotal || bill.totalAmount)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center space-x-1 ${StatusBadge.color}`}>
                                                    <StatusIcon size={12} />
                                                    <span>{StatusBadge.label}</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button onClick={() => { setSelectedBill(bill); setShowDetailsModal(true); }} className="p-1.5 hover:bg-gray-100 rounded">
                                                    <Eye size={16} />
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

            {/* Details Modal */}
            {showDetailsModal && selectedBill && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold">Bill Details</h3>
                            <button onClick={() => setShowDetailsModal(false)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><span className="text-gray-500">Bill ID:</span> <strong>{selectedBill.billId}</strong></div>
                            <div><span className="text-gray-500">Amount:</span> <strong className="text-xl">{formatCurrency(selectedBill.grandTotal || selectedBill.totalAmount)}</strong></div>
                            <div><span className="text-gray-500">Consumer:</span> <strong>{selectedBill.consumerName}</strong></div>
                            <div><span className="text-gray-500">Meter:</span> <strong>{selectedBill.meterNo}</strong></div>
                            <div><span className="text-gray-500">Month:</span> <strong>{selectedBill.billingMonth}</strong></div>
                            <div><span className="text-gray-500">Status:</span> <strong>{selectedBill.status}</strong></div>
                            <div><span className="text-gray-500">Due Date:</span> <strong>{selectedBill.dueDate}</strong></div>
                            {selectedBill.paidAt && (
                                <div><span className="text-gray-500">Paid At:</span> <strong>{new Date(selectedBill.paidAt).toLocaleDateString()}</strong></div>
                            )}
                            {selectedBill.paymentMethod && (
                                <div><span className="text-gray-500">Payment Method:</span> <strong>{selectedBill.paymentMethod}</strong></div>
                            )}
                            {selectedBill.lateFee && selectedBill.lateFee > 0 && (
                                <div><span className="text-gray-500">Late Fee:</span> <strong>{formatCurrency(selectedBill.lateFee)}</strong></div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setShowDetailsModal(false)} className="px-6 py-2 border rounded-lg">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}