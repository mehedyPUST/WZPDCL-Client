// app/dashboard/consumer/my-bills/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    FileText,
    Loader2,
    ArrowLeft,
    RefreshCw,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    DollarSign,
    Calendar,
    Download,
    Printer,
    Eye,
    CreditCard,
    Search,
    Filter,
    ChevronDown,
    ChevronUp,
    Home,
    Building,
    Zap,
    Package,
    TrendingUp,
    TrendingDown,
    X,
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

interface Meter {
    _id?: string;
    meterNo: string;
    meterType: string;
    feederName: string;
    consumerName: string;
    consumerType: string;
    isClaimed: boolean;
}

interface BillSummary {
    totalBills: number;
    totalAmount: number;
    totalPaid: number;
    totalUnpaid: number;
    paidCount: number;
    unpaidCount: number;
    pendingCount: number;
}

export default function MyBillsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const [meters, setMeters] = useState<Meter[]>([]);
    const [bills, setBills] = useState<Bill[]>([]);
    const [selectedMeter, setSelectedMeter] = useState(searchParams.get('meter') || '');
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showBillModal, setShowBillModal] = useState(false);
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
    const [summary, setSummary] = useState<BillSummary>({
        totalBills: 0,
        totalAmount: 0,
        totalPaid: 0,
        totalUnpaid: 0,
        paidCount: 0,
        unpaidCount: 0,
        pendingCount: 0,
    });

    // ✅ Payment Modal States
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentBill, setPaymentBill] = useState<Bill | null>(null);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    // ✅ Check for payment status from URL
    useEffect(() => {
        const status = searchParams.get('payment');
        if (status === 'success') {
            setPaymentSuccess(true);
            setTimeout(() => {
                setPaymentSuccess(false);
                // Refresh bills
                if (selectedMeter) {
                    fetchBills(selectedMeter);
                }
                router.replace('/dashboard/consumer/my-bills');
            }, 3000);
        } else if (status === 'cancelled') {
            setPaymentError('Payment was cancelled');
            setTimeout(() => {
                setPaymentError(null);
                router.replace('/dashboard/consumer/my-bills');
            }, 3000);
        } else if (status === 'failed') {
            setPaymentError('Payment failed. Please try again.');
            setTimeout(() => {
                setPaymentError(null);
                router.replace('/dashboard/consumer/my-bills');
            }, 3000);
        }
    }, [searchParams, router]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const { data, error: authError } = await authClient.getSession();
                if (authError || !data) {
                    router.push('/login');
                    return;
                }
                setUser(data.user);

                const token = localStorage.getItem('auth_token');

                // ✅ Fetch user's meters
                const meterRes = await fetch(
                    `${API_URL}/api/user/meters/${data.user.id}`,
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
                        setMeters(meterData.data.meters || []);
                        if (!selectedMeter && meterData.data.meters && meterData.data.meters.length > 0) {
                            setSelectedMeter(meterData.data.meters[0].meterNo);
                        }
                    }
                }

                if (selectedMeter) {
                    await fetchBills(selectedMeter, token);
                }

            } catch (error: any) {
                console.error('Error fetching data:', error);
                setError(error.message || 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router, API_URL, selectedMeter]);

    const fetchBills = async (meterNo: string, token?: string | null) => {
        try {
            const authToken = token || localStorage.getItem('auth_token');
            const billRes = await fetch(
                `${API_URL}/api/billing/bills/meter/${meterNo}`,
                {
                    headers: {
                        'Authorization': authToken ? `Bearer ${authToken}` : '',
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (billRes.ok) {
                const billData = await billRes.json();
                if (billData.success) {
                    setBills(billData.data || []);
                    calculateSummary(billData.data || []);
                    setError(null);
                }
            } else {
                setBills([]);
                calculateSummary([]);
            }
        } catch (error) {
            console.error('Error fetching bills:', error);
            setBills([]);
            calculateSummary([]);
        }
    };

    const calculateSummary = (billsData: Bill[]) => {
        const total = billsData.length;
        const paid = billsData.filter(b => b.status === 'paid');
        const unpaid = billsData.filter(b => b.status === 'unpaid');
        const pending = billsData.filter(b => b.status === 'pending');

        const totalAmount = billsData.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        const totalPaid = paid.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        const totalUnpaid = unpaid.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

        setSummary({
            totalBills: total,
            totalAmount,
            totalPaid,
            totalUnpaid,
            paidCount: paid.length,
            unpaidCount: unpaid.length,
            pendingCount: pending.length,
        });
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        if (selectedMeter) {
            await fetchBills(selectedMeter);
        }
        setIsRefreshing(false);
    };

    const handleMeterChange = (meterNo: string) => {
        setSelectedMeter(meterNo);
        setFilterStatus('all');
        setSearchTerm('');
        router.push(`/dashboard/consumer/my-bills?meter=${meterNo}`);
    };

    const getStatusBadge = (status: string) => {
        const statuses: Record<string, { color: string; label: string; icon: any }> = {
            paid: { color: 'bg-green-100 text-green-700', label: 'Paid', icon: CheckCircle },
            unpaid: { color: 'bg-red-100 text-red-700', label: 'Unpaid', icon: XCircle },
            pending: { color: 'bg-yellow-100 text-yellow-700', label: 'Pending', icon: Clock },
        };
        return statuses[status] || statuses.pending;
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            paid: 'text-green-600',
            unpaid: 'text-red-600',
            pending: 'text-yellow-600',
        };
        return colors[status] || 'text-gray-600';
    };

    const formatDate = (date: string) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatCurrency = (amount: number) => {
        return `৳${amount.toLocaleString()}`;
    };

    const filteredBills = bills.filter(bill => {
        const matchesSearch = bill.billId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bill.consumerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bill.billingMonth.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || bill.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const handleViewBill = (bill: Bill) => {
        setSelectedBill(bill);
        setShowBillModal(true);
    };

    // ✅ Handle Payment - Open Payment Modal (like My Connections)
    const handlePayBill = (bill: Bill) => {
        setPaymentBill(bill);
        setPaymentError(null);
        setShowPaymentModal(true);
    };

    // ✅ Process Payment - Same as My Connections
    const processPayment = async () => {
        if (!paymentBill) return;

        setIsProcessingPayment(true);
        setPaymentError(null);

        try {
            const token = localStorage.getItem('auth_token');
            const amount = paymentBill.grandTotal || paymentBill.totalAmount || 0;

            console.log('🔍 Creating payment session for bill:', paymentBill.billId);

            const response = await fetch(`${API_URL}/api/create-payment-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: JSON.stringify({
                    billId: paymentBill.billId,
                    amount: amount,
                    consumerId: user?.id,
                    consumerName: user?.name || paymentBill.consumerName,
                    email: user?.email || '',
                    description: `Electricity Bill Payment - ${paymentBill.billId} (${paymentBill.billingMonth})`,
                }),
            });

            const data = await response.json();
            console.log('📦 Payment response:', data);

            if (!response.ok) {
                throw new Error(data.message || data.error || 'Failed to create payment session');
            }

            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL received');
            }

        } catch (error: any) {
            console.error('❌ Payment error:', error);
            setPaymentError(error.message || 'Payment processing failed. Please try again.');
            setIsProcessingPayment(false);
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
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                        <FileText size={24} className="text-emerald-600" />
                        <span>My Bills</span>
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {meters.length} meter(s) connected to your account
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                        <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                    </button>
                    <button
                        onClick={() => router.push('/dashboard/consumer')}
                        className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                    >
                        <ArrowLeft size={16} />
                        <span>Back</span>
                    </button>
                </div>
            </div>

            {/* Payment Success Message */}
            {paymentSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
                    <CheckCircle size={20} className="text-green-600" />
                    <p className="text-green-700">Payment successful! Your bill has been paid.</p>
                </div>
            )}

            {/* Payment Error Message */}
            {paymentError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                    <AlertCircle size={20} className="text-red-600" />
                    <p className="text-red-700">{paymentError}</p>
                    <button
                        onClick={() => setPaymentError(null)}
                        className="ml-auto text-red-500 hover:text-red-700"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                    <AlertCircle size={20} className="text-red-600" />
                    <p className="text-sm text-red-700">{error}</p>
                    <button
                        onClick={() => setError(null)}
                        className="ml-auto text-red-500 hover:text-red-700"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
            )}

            {/* Meter Selector */}
            {meters.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center space-x-2">
                            <Package size={18} className="text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">Select Meter:</span>
                        </div>
                        <div className="flex-1 flex flex-wrap gap-2">
                            {meters.map((meter) => (
                                <button
                                    key={meter.meterNo}
                                    onClick={() => handleMeterChange(meter.meterNo)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedMeter === meter.meterNo
                                        ? 'bg-emerald-600 text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {meter.meterNo}
                                    {meter.consumerType && (
                                        <span className="ml-1 text-xs opacity-70">
                                            ({meter.consumerType})
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* No Meters Message */}
            {meters.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <AlertCircle size={24} className="text-yellow-600 mx-auto mb-2" />
                    <p className="text-yellow-700">No meters found. Please claim a meter first.</p>
                    <button
                        onClick={() => router.push('/dashboard/consumer/my-meters')}
                        className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                        Go to My Meters
                    </button>
                </div>
            )}

            {/* Bills Section */}
            {selectedMeter && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Total Bills</p>
                                    <p className="text-2xl font-bold text-gray-800">{summary.totalBills}</p>
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
                                    <p className="text-2xl font-bold text-gray-800">{formatCurrency(summary.totalAmount)}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-emerald-100">
                                    <DollarSign size={20} className="text-emerald-600" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Paid</p>
                                    <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalPaid)}</p>
                                    <p className="text-xs text-gray-400">{summary.paidCount} bills</p>
                                </div>
                                <div className="p-3 rounded-xl bg-green-100">
                                    <CheckCircle size={20} className="text-green-600" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Due</p>
                                    <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalUnpaid)}</p>
                                    <p className="text-xs text-gray-400">{summary.unpaidCount} bills</p>
                                </div>
                                <div className="p-3 rounded-xl bg-red-100">
                                    <AlertCircle size={20} className="text-red-600" />
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
                                    placeholder="Search by bill ID, consumer, or month..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                                >
                                    <option value="all">All Status</option>
                                    <option value="paid">Paid</option>
                                    <option value="unpaid">Unpaid</option>
                                    <option value="pending">Pending</option>
                                </select>
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setFilterStatus('all');
                                    }}
                                    className="px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                                >
                                    <RefreshCw size={16} />
                                    <span>Reset</span>
                                </button>
                            </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-400">
                            Found {filteredBills.length} bill(s)
                        </div>
                    </div>

                    {/* Bills List */}
                    {filteredBills.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                            <FileText size={48} className="text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700">No Bills Found</h3>
                            <p className="text-gray-500 mt-2">
                                {bills.length === 0
                                    ? `No bills available for meter ${selectedMeter}`
                                    : 'No bills match your search or filter'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredBills.map((bill) => {
                                const StatusBadge = getStatusBadge(bill.status);
                                const StatusIcon = StatusBadge.icon;

                                return (
                                    <div
                                        key={bill.billId}
                                        className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`p-2 rounded-lg ${bill.status === 'paid' ? 'bg-green-100' :
                                                        bill.status === 'unpaid' ? 'bg-red-100' :
                                                            'bg-yellow-100'
                                                        }`}>
                                                        <StatusIcon size={16} className={getStatusColor(bill.status)} />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-800">{bill.billId}</p>
                                                        <p className="text-sm text-gray-500">{bill.consumerName}</p>
                                                    </div>
                                                </div>
                                                <div className="mt-2 flex flex-wrap gap-4 text-sm">
                                                    <span className="text-gray-600">
                                                        <Calendar size={14} className="inline mr-1" />
                                                        {bill.billingMonth}
                                                    </span>
                                                    <span className="text-gray-600">
                                                        <DollarSign size={14} className="inline mr-1" />
                                                        {formatCurrency(bill.totalAmount)}
                                                    </span>
                                                    {bill.dueDate && (
                                                        <span className="text-gray-600">
                                                            <Clock size={14} className="inline mr-1" />
                                                            Due: {formatDate(bill.dueDate)}
                                                        </span>
                                                    )}
                                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${StatusBadge.color}`}>
                                                        {StatusBadge.label}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleViewBill(bill)}
                                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => {/* Download bill */ }}
                                                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                    <Download size={18} />
                                                </button>
                                                {bill.status !== 'paid' && (
                                                    <button
                                                        onClick={() => handlePayBill(bill)}
                                                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-1 text-sm"
                                                    >
                                                        <CreditCard size={16} />
                                                        <span>Pay Now</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {/* Bill Details Modal */}
            {showBillModal && selectedBill && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-emerald-100 rounded-full">
                                    <FileText size={20} className="text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">Bill Details</h3>
                            </div>
                            <button
                                onClick={() => setShowBillModal(false)}
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
                                <p className="text-sm font-medium capitalize">{selectedBill.consumerType}</p>
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
                                    <p className="text-sm font-medium text-red-600">৳{selectedBill.lateFee.toFixed(2)}</p>
                                </div>
                            )}
                            <div className="col-span-2 border-t border-gray-100 pt-4">
                                <p className="text-xs text-gray-500">Total Amount</p>
                                <p className={`text-2xl font-bold ${selectedBill.status === 'unpaid' ? 'text-red-600' : 'text-gray-800'}`}>
                                    {formatCurrency(selectedBill.totalAmount)}
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
                            <button
                                onClick={() => {/* Print bill */ }}
                                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                            >
                                <Printer size={16} />
                                <span>Print</span>
                            </button>
                            <button
                                onClick={() => {/* Download bill */ }}
                                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                            >
                                <Download size={16} />
                                <span>Download</span>
                            </button>
                            {selectedBill.status !== 'paid' && (
                                <button
                                    onClick={() => {
                                        setShowBillModal(false);
                                        handlePayBill(selectedBill);
                                    }}
                                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                                >
                                    <CreditCard size={16} />
                                    <span>Pay Now</span>
                                </button>
                            )}
                            <button
                                onClick={() => setShowBillModal(false)}
                                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ Payment Modal - Same as My Connections */}
            {showPaymentModal && paymentBill && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-emerald-100 rounded-full">
                                    <CreditCard size={20} className="text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">Pay Bill</h3>
                            </div>
                            <button
                                onClick={() => {
                                    setShowPaymentModal(false);
                                    setPaymentBill(null);
                                    setPaymentError(null);
                                }}
                                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-sm text-gray-600">Bill ID</span>
                                    <span className="text-sm font-medium">{paymentBill.billId}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-t border-gray-200">
                                    <span className="text-sm text-gray-600">Consumer</span>
                                    <span className="text-sm font-medium">{paymentBill.consumerName}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-t border-gray-200">
                                    <span className="text-sm text-gray-600">Meter Number</span>
                                    <span className="text-sm font-medium">{paymentBill.meterNo}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-t border-gray-200">
                                    <span className="text-sm text-gray-600">Billing Month</span>
                                    <span className="text-sm font-medium">{paymentBill.billingMonth}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-t border-gray-200">
                                    <span className="text-sm text-gray-600">Due Date</span>
                                    <span className="text-sm font-medium text-red-600">{formatDate(paymentBill.dueDate)}</span>
                                </div>
                                {paymentBill.lateFee && paymentBill.lateFee > 0 && (
                                    <div className="flex items-center justify-between py-2 border-t border-red-200 bg-red-50 -mx-4 px-4">
                                        <span className="text-sm text-red-600 font-medium">Late Fee</span>
                                        <span className="text-sm font-medium text-red-600">+{formatCurrency(paymentBill.lateFee)}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between py-2 border-t border-gray-200">
                                    <span className="text-sm font-semibold text-gray-800">Total Amount</span>
                                    <span className="text-xl font-bold text-emerald-600">
                                        {formatCurrency(paymentBill.grandTotal || paymentBill.totalAmount || 0)}
                                    </span>
                                </div>
                            </div>

                            {paymentError && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
                                    <AlertCircle size={16} className="text-red-600" />
                                    <p className="text-sm text-red-700">{paymentError}</p>
                                </div>
                            )}

                            <p className="text-xs text-gray-500 text-center">
                                You will be redirected to Stripe to complete your payment securely.
                            </p>

                            <div className="flex items-center justify-end space-x-3 pt-4">
                                <button
                                    onClick={() => {
                                        setShowPaymentModal(false);
                                        setPaymentBill(null);
                                        setPaymentError(null);
                                    }}
                                    className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={processPayment}
                                    disabled={isProcessingPayment}
                                    className={`px-6 py-2 bg-emerald-600 text-white rounded-lg transition-colors flex items-center space-x-2 ${isProcessingPayment ? 'opacity-70 cursor-not-allowed' : 'hover:bg-emerald-700'
                                        }`}
                                >
                                    {isProcessingPayment ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard size={16} />
                                            <span>Pay {formatCurrency(paymentBill.grandTotal || paymentBill.totalAmount || 0)}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}