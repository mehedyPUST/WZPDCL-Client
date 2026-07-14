// app/dashboard/xen/all-transactions/page.tsx
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
    CreditCard,
    DollarSign,
    Download,
    Printer,
    Filter,
    X,
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    BarChart3,
    PieChart,
    Activity,
    Calendar,
    User,
    Home,
    Building,
    Package,
    Zap,
    AlertCircle,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

interface Transaction {
    _id?: string;
    transactionId: string;
    type: 'connection_fee' | 'bill_payment' | 'refund' | 'adjustment';
    category: string;
    amount: number;
    status: 'completed' | 'pending' | 'failed' | 'refunded';
    paymentMethod: 'stripe' | 'cash' | 'bank_transfer' | 'mobile_banking';
    consumerName: string;
    meterNo: string;
    referenceId: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
}

export default function XenAllTransactionsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPaymentMethod, setFilterPaymentMethod] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [stats, setStats] = useState({
        total: 0,
        totalAmount: 0,
        completed: 0,
        pending: 0,
        failed: 0,
        refunded: 0,
    });
    const [user, setUser] = useState<any>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

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
            fetchTransactions();
        }
    }, [user]);

    const fetchTransactions = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('auth_token');

            const response = await fetch(
                `${API_URL}/api/transactions/all`,
                {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch transactions');
            }

            const data = await response.json();

            if (data.success && data.data) {
                const transactionsData = data.data;

                if (transactionsData.length === 0) {
                    setTransactions([]);
                    setStats({
                        total: 0,
                        totalAmount: 0,
                        completed: 0,
                        pending: 0,
                        failed: 0,
                        refunded: 0,
                    });
                    setError('No transactions found in the system.');
                    setLoading(false);
                    return;
                }

                setTransactions(transactionsData);
                updateStats(transactionsData);
                setError(null);
            } else {
                throw new Error(data.message || 'No transaction data received');
            }

        } catch (error: any) {
            console.error('❌ Error fetching transactions:', error);
            setError(error.message || 'Failed to load transactions');
            setTransactions([]);
            setStats({
                total: 0,
                totalAmount: 0,
                completed: 0,
                pending: 0,
                failed: 0,
                refunded: 0,
            });
        } finally {
            setLoading(false);
        }
    };

    const updateStats = (transactionsData: Transaction[]) => {
        const total = transactionsData.length;
        const totalAmount = transactionsData.reduce((sum, t) => sum + (t.amount || 0), 0);
        const completed = transactionsData.filter(t => t.status === 'completed').length;
        const pending = transactionsData.filter(t => t.status === 'pending').length;
        const failed = transactionsData.filter(t => t.status === 'failed').length;
        const refunded = transactionsData.filter(t => t.status === 'refunded').length;

        setStats({
            total,
            totalAmount,
            completed,
            pending,
            failed,
            refunded,
        });
    };

    const getTypeBadge = (type: string) => {
        const types: Record<string, { color: string; label: string; icon: any }> = {
            connection_fee: { color: 'bg-blue-100 text-blue-700', label: 'Connection Fee', icon: Zap },
            bill_payment: { color: 'bg-green-100 text-green-700', label: 'Bill Payment', icon: DollarSign },
            refund: { color: 'bg-yellow-100 text-yellow-700', label: 'Refund', icon: ArrowLeft },
            adjustment: { color: 'bg-purple-100 text-purple-700', label: 'Adjustment', icon: Activity },
        };
        return types[type] || types.bill_payment;
    };

    const getStatusBadge = (status: string) => {
        const statuses: Record<string, { color: string; label: string; icon: any }> = {
            completed: { color: 'bg-green-100 text-green-700', label: 'Completed', icon: CheckCircle },
            pending: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending', icon: Clock },
            failed: { color: 'bg-red-100 text-red-700', label: 'Failed', icon: XCircle },
            refunded: { color: 'bg-blue-100 text-blue-700', label: 'Refunded', icon: ArrowLeft },
        };
        return statuses[status] || statuses.pending;
    };

    const getPaymentMethodBadge = (method: string) => {
        const methods: Record<string, { color: string; label: string }> = {
            stripe: { color: 'bg-purple-100 text-purple-700', label: 'Stripe' },
            cash: { color: 'bg-green-100 text-green-700', label: 'Cash' },
            bank_transfer: { color: 'bg-blue-100 text-blue-700', label: 'Bank Transfer' },
            mobile_banking: { color: 'bg-orange-100 text-orange-700', label: 'Mobile Banking' },
        };
        return methods[method] || methods.stripe;
    };

    const formatCurrency = (amount: number) => {
        return `৳${Math.abs(amount).toLocaleString()}`;
    };

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = t.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.consumerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.meterNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.category?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || t.type === filterType;
        const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
        const matchesPaymentMethod = filterPaymentMethod === 'all' || t.paymentMethod === filterPaymentMethod;
        return matchesSearch && matchesType && matchesStatus && matchesPaymentMethod;
    });

    const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
    const paginatedTransactions = filteredTransactions.slice(
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

    if (error && transactions.length === 0) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
                <AlertCircle size={48} className="text-red-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-red-700">Failed to Load Transactions</h3>
                <p className="text-red-600 mt-2">{error}</p>
                <button
                    onClick={fetchTransactions}
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
                        <span>All Transactions</span>
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {transactions.length} transactions found
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => {
                            setIsRefreshing(true);
                            fetchTransactions().finally(() => setIsRefreshing(false));
                        }}
                        disabled={isRefreshing}
                        className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                        <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                    </button>
                    {transactions.length > 0 && (
                        <button className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                            <Download size={16} />
                            <span>Export</span>
                        </button>
                    )}
                    <button
                        onClick={() => router.push('/dashboard/xen')}
                        className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                    >
                        <ArrowLeft size={16} />
                        <span>Back</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Transactions</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-blue-100">
                            <FileText size={20} className="text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Amount</p>
                            <p className="text-2xl font-bold text-gray-800">{formatCurrency(stats.totalAmount)}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-100">
                            <DollarSign size={20} className="text-emerald-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Completed</p>
                            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-green-100">
                            <CheckCircle size={20} className="text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Pending</p>
                            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-yellow-100">
                            <Clock size={20} className="text-yellow-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by transaction ID, consumer, meter, or category..."
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
                            value={filterType}
                            onChange={(e) => {
                                setFilterType(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                            <option value="all">All Types</option>
                            <option value="connection_fee">Connection Fee</option>
                            <option value="bill_payment">Bill Payment</option>
                            <option value="refund">Refund</option>
                            <option value="adjustment">Adjustment</option>
                        </select>
                        <select
                            value={filterStatus}
                            onChange={(e) => {
                                setFilterStatus(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                            <option value="all">All Status</option>
                            <option value="completed">Completed</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                            <option value="refunded">Refunded</option>
                        </select>
                        <select
                            value={filterPaymentMethod}
                            onChange={(e) => {
                                setFilterPaymentMethod(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        >
                            <option value="all">All Methods</option>
                            <option value="stripe">Stripe</option>
                            <option value="cash">Cash</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="mobile_banking">Mobile Banking</option>
                        </select>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilterType('all');
                                setFilterStatus('all');
                                setFilterPaymentMethod('all');
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
                    Found {filteredTransactions.length} transactions
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Consumer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {paginatedTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            {/* Empty State Icon */}
                                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center animate-pulse">
                                                {searchTerm || filterType !== 'all' || filterStatus !== 'all' || filterPaymentMethod !== 'all' ? (
                                                    <Search size={48} className="text-gray-400" />
                                                ) : (
                                                    <DollarSign size={48} className="text-gray-400" />
                                                )}
                                            </div>

                                            {/* Main Message */}
                                            <h3 className="text-xl font-semibold text-gray-700">
                                                {searchTerm || filterType !== 'all' || filterStatus !== 'all' || filterPaymentMethod !== 'all'
                                                    ? 'No transactions match your filters'
                                                    : 'No transactions yet'}
                                            </h3>

                                            {/* Description */}
                                            <p className="text-sm text-gray-500 max-w-md text-center">
                                                {searchTerm || filterType !== 'all' || filterStatus !== 'all' || filterPaymentMethod !== 'all'
                                                    ? 'Try adjusting your search terms or clearing the filters below'
                                                    : 'When consumers make payments, transactions will appear here'}
                                            </p>

                                            {/* Action Buttons */}
                                            <div className="flex items-center space-x-3 mt-2">
                                                {(searchTerm || filterType !== 'all' || filterStatus !== 'all' || filterPaymentMethod !== 'all') && (
                                                    <button
                                                        onClick={() => {
                                                            setSearchTerm('');
                                                            setFilterType('all');
                                                            setFilterStatus('all');
                                                            setFilterPaymentMethod('all');
                                                            setCurrentPage(1);
                                                        }}
                                                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                                                    >
                                                        <RefreshCw size={16} />
                                                        <span>Clear Filters</span>
                                                    </button>
                                                )}

                                                <button
                                                    onClick={fetchTransactions}
                                                    className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                                                >
                                                    <RefreshCw size={16} />
                                                    <span>Refresh</span>
                                                </button>
                                            </div>

                                            {/* Tip */}
                                            <p className="text-xs text-gray-400 mt-4">
                                                💡 Transactions are created when consumers make payments
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedTransactions.map((transaction) => {
                                    const TypeBadge = getTypeBadge(transaction.type);
                                    const StatusBadge = getStatusBadge(transaction.status);
                                    const PaymentMethodBadge = getPaymentMethodBadge(transaction.paymentMethod);
                                    const StatusIcon = StatusBadge.icon;

                                    return (
                                        <tr key={transaction.transactionId || transaction._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-gray-800">{transaction.transactionId}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-800">{transaction.consumerName}</p>
                                                <p className="text-xs text-gray-400">{transaction.meterNo}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${TypeBadge.color}`}>
                                                    {TypeBadge.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-sm font-medium ${(transaction.amount || 0) < 0 ? 'text-red-600' : 'text-gray-800'
                                                    }`}>
                                                    {(transaction.amount || 0) < 0 ? '-' : ''}৳{Math.abs(transaction.amount || 0).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${PaymentMethodBadge.color}`}>
                                                    {PaymentMethodBadge.label}
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
                                                    onClick={() => {
                                                        setSelectedTransaction(transaction);
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
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-4">
                        <p className="text-sm text-gray-500">
                            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)} of {filteredTransactions.length} transactions
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

            {/* Details Modal */}
            {showDetailsModal && selectedTransaction && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-emerald-100 rounded-full">
                                    <FileText size={20} className="text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">Transaction Details</h3>
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
                                <p className="text-xs text-gray-500">Transaction ID</p>
                                <p className="text-sm font-medium">{selectedTransaction.transactionId}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Status</p>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(selectedTransaction.status).color}`}>
                                    {getStatusBadge(selectedTransaction.status).label}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Type</p>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeBadge(selectedTransaction.type).color}`}>
                                    {getTypeBadge(selectedTransaction.type).label}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Amount</p>
                                <p className={`text-lg font-bold ${(selectedTransaction.amount || 0) < 0 ? 'text-red-600' : 'text-gray-800'}`}>
                                    {(selectedTransaction.amount || 0) < 0 ? '-' : ''}৳{Math.abs(selectedTransaction.amount || 0).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Payment Method</p>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentMethodBadge(selectedTransaction.paymentMethod).color}`}>
                                    {getPaymentMethodBadge(selectedTransaction.paymentMethod).label}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Consumer</p>
                                <p className="text-sm font-medium">{selectedTransaction.consumerName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Meter Number</p>
                                <p className="text-sm font-medium">{selectedTransaction.meterNo}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Reference ID</p>
                                <p className="text-sm font-medium">{selectedTransaction.referenceId}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-xs text-gray-500">Category</p>
                                <p className="text-sm font-medium">{selectedTransaction.category}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-xs text-gray-500">Description</p>
                                <p className="text-sm text-gray-600">{selectedTransaction.description}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Created At</p>
                                <p className="text-sm text-gray-600">{new Date(selectedTransaction.createdAt).toLocaleString()}</p>
                            </div>
                            {selectedTransaction.completedAt && (
                                <div>
                                    <p className="text-xs text-gray-500">Completed At</p>
                                    <p className="text-sm text-green-600">{new Date(selectedTransaction.completedAt).toLocaleString()}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end space-x-3 pt-4 mt-4 border-t border-gray-100">
                            <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                                <Printer size={16} />
                                <span>Print</span>
                            </button>
                            <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                                <Download size={16} />
                                <span>Download Receipt</span>
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