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
            <div className={`p-3 rounded-xl ${bgColor}`}>
                {icon}
            </div>
        </div>
    </div>
);

export default function XenAllTransactionsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
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
            fetchTransactions();
        }
    }, [user]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(
                `${API_URL}/api/transactions/all`,
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
                    setTransactions(data.data);
                    updateStats(data.data);
                    setLoading(false);
                    return;
                }
            }

            // Mock data fallback
            const mockTransactions = getMockTransactions();
            setTransactions(mockTransactions);
            updateStats(mockTransactions);

        } catch (error) {
            console.error('Error fetching transactions:', error);
            const mockTransactions = getMockTransactions();
            setTransactions(mockTransactions);
            updateStats(mockTransactions);
        } finally {
            setLoading(false);
        }
    };

    const getMockTransactions = (): Transaction[] => {
        const types: ('connection_fee' | 'bill_payment' | 'refund' | 'adjustment')[] =
            ['connection_fee', 'bill_payment', 'refund', 'adjustment'];
        const statuses: ('completed' | 'pending' | 'failed' | 'refunded')[] =
            ['completed', 'pending', 'failed', 'refunded'];
        const paymentMethods: ('stripe' | 'cash' | 'bank_transfer' | 'mobile_banking')[] =
            ['stripe', 'cash', 'bank_transfer', 'mobile_banking'];
        const consumers = [
            { name: 'John Doe', meter: 'MTR-2026-001' },
            { name: 'Jane Smith', meter: 'MTR-2026-002' },
            { name: 'Robert Johnson', meter: 'MTR-2026-003' },
            { name: 'Emily Davis', meter: 'MTR-2026-004' },
            { name: 'Michael Brown', meter: 'MTR-2026-005' },
            { name: 'Sarah Wilson', meter: 'MTR-2026-006' },
            { name: 'David Lee', meter: 'MTR-2026-007' },
            { name: 'Lisa Kim', meter: 'MTR-2026-008' },
            { name: 'James Taylor', meter: 'MTR-2026-009' },
            { name: 'Maria Garcia', meter: 'MTR-2026-010' },
        ];

        const categories = {
            connection_fee: ['New Connection Fee', 'Upgrade Fee', 'Meter Installation Fee'],
            bill_payment: ['Monthly Bill Payment', 'Partial Payment', 'Advance Payment'],
            refund: ['Refund - Overpayment', 'Refund - Cancellation', 'Refund - Adjustment'],
            adjustment: ['Late Fee Adjustment', 'Discount Adjustment', 'VAT Adjustment'],
        };

        const descriptions = {
            connection_fee: ['New connection fee payment', 'Upgrade to commercial connection', 'Meter installation fee'],
            bill_payment: ['Monthly bill payment for residential', 'Partial bill payment', 'Advance payment for next month'],
            refund: ['Refund for overpayment', 'Refund for cancelled application', 'Refund for adjustment'],
            adjustment: ['Late fee waived', 'Discount applied', 'VAT adjustment'],
        };

        return consumers.map((consumer, index) => {
            const type = types[Math.floor(Math.random() * types.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
            const category = categories[type][Math.floor(Math.random() * categories[type].length)];
            const description = descriptions[type][Math.floor(Math.random() * descriptions[type].length)];
            const amount = Math.floor(Math.random() * 50000) + 1000;
            const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
            const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
            const hour = String(Math.floor(Math.random() * 24)).padStart(2, '0');
            const minute = String(Math.floor(Math.random() * 60)).padStart(2, '0');

            return {
                transactionId: `TXN-${String(index + 1).padStart(4, '0')}`,
                type,
                category,
                amount: type === 'refund' || type === 'adjustment' ? -amount : amount,
                status,
                paymentMethod,
                consumerName: consumer.name,
                meterNo: consumer.meter,
                referenceId: `REF-${String(index + 1).padStart(4, '0')}`,
                description,
                createdAt: `2026-${month}-${day}T${hour}:${minute}:00Z`,
                updatedAt: `2026-${month}-${day}T${hour}:${minute}:00Z`,
                completedAt: status === 'completed' ? `2026-${month}-${day}T${hour}:${minute}:00Z` : undefined,
            };
        });
    };

    const updateStats = (transactionsData: Transaction[]) => {
        const total = transactionsData.length;
        const totalAmount = transactionsData.reduce((sum, t) => sum + t.amount, 0);
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

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = t.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.consumerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.meterNo.toLowerCase().includes(searchTerm.toLowerCase());
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

    const statCards = [
        { title: 'Total Transactions', value: stats.total, icon: FileText, bgColor: 'bg-blue-100', change: '', trend: 'neutral' as const },
        { title: 'Total Amount', value: `৳${stats.totalAmount.toLocaleString()}`, icon: DollarSign, bgColor: 'bg-emerald-100', change: '', trend: 'neutral' as const },
        { title: 'Completed', value: stats.completed, icon: CheckCircle, bgColor: 'bg-green-100', change: `${stats.completed} done`, trend: 'up' as const },
        { title: 'Pending', value: stats.pending, icon: Clock, bgColor: 'bg-yellow-100', change: `${stats.pending} waiting`, trend: 'down' as const },
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
                        <DollarSign size={24} className="text-emerald-600" />
                        <span>All Transactions</span>
                    </h1>
                    <p className="text-gray-500 text-sm">View all financial transactions</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={fetchTransactions}
                        className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                    >
                        <RefreshCw size={16} />
                        <span>Refresh</span>
                    </button>
                    <button className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                        <Download size={16} />
                        <span>Export</span>
                    </button>
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
                            placeholder="Search by transaction ID, consumer, or meter..."
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
                            <option value="connection_fee">Connection Fee</option>
                            <option value="bill_payment">Bill Payment</option>
                            <option value="refund">Refund</option>
                            <option value="adjustment">Adjustment</option>
                        </select>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
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
                            onChange={(e) => setFilterPaymentMethod(e.target.value)}
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
                            }}
                            className="px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                        >
                            <RefreshCw size={16} />
                            <span>Reset</span>
                        </button>
                    </div>
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
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        No transactions found.
                                    </td>
                                </tr>
                            ) : (
                                paginatedTransactions.map((transaction) => {
                                    const TypeBadge = getTypeBadge(transaction.type);
                                    const StatusBadge = getStatusBadge(transaction.status);
                                    const PaymentMethodBadge = getPaymentMethodBadge(transaction.paymentMethod);
                                    const StatusIcon = StatusBadge.icon;

                                    return (
                                        <tr key={transaction.transactionId} className="hover:bg-gray-50 transition-colors">
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
                                                <span className={`text-sm font-medium ${transaction.amount < 0 ? 'text-red-600' : 'text-gray-800'
                                                    }`}>
                                                    {transaction.amount < 0 ? '-' : ''}৳{Math.abs(transaction.amount).toLocaleString()}
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
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
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
                                <p className={`text-lg font-bold ${selectedTransaction.amount < 0 ? 'text-red-600' : 'text-gray-800'}`}>
                                    {selectedTransaction.amount < 0 ? '-' : ''}৳{Math.abs(selectedTransaction.amount).toLocaleString()}
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