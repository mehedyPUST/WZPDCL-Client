// app/dashboard/consumer/payment/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    CreditCard,
    Loader2,
    ArrowLeft,
    CheckCircle,
    AlertCircle,
    Shield,
    Lock,
    Zap,
    DollarSign,
    Clock,
    Calendar,
    FileText,
    X,
    Building,
    Home,
    Package,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';

interface Bill {
    _id?: string;
    billId: string;
    meterNo: string;
    consumerName: string;
    billingMonth: string;
    consumerType: string;
    totalAmount: number;
    dueDate: string;
    status: string;
    lateFee?: number;
    grandTotal?: number;
    previousReading?: number;
    currentReading?: number;
    unitsConsumed?: number;
}

export default function PaymentPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const billId = searchParams.get('billId');

    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [bill, setBill] = useState<Bill | null>(null);
    const [user, setUser] = useState<any>(null);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        // Check for payment status from URL
        const status = searchParams.get('status');
        if (status === 'success') {
            setPaymentSuccess(true);
            setTimeout(() => {
                router.push('/dashboard/consumer/my-bills');
            }, 3000);
        } else if (status === 'cancelled') {
            setPaymentError('Payment was cancelled');
        } else if (status === 'failed') {
            setPaymentError('Payment failed. Please try again.');
        }
    }, [searchParams, router]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!billId) {
                    setError('No bill selected');
                    setLoading(false);
                    return;
                }

                const { data } = await authClient.getSession();
                if (!data) {
                    router.push('/login');
                    return;
                }
                setUser(data.user);

                const token = localStorage.getItem('auth_token');
                const response = await fetch(
                    `${API_URL}/api/billing/bills/${billId}`,
                    {
                        headers: {
                            'Authorization': token ? `Bearer ${token}` : '',
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch bill details');
                }

                const result = await response.json();
                if (result.success) {
                    setBill(result.data);
                } else {
                    throw new Error(result.message || 'Bill not found');
                }

            } catch (error: any) {
                console.error('Error:', error);
                setError(error.message || 'Failed to load bill');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [billId, router, API_URL]);

    const handlePayNow = async () => {
        if (!bill) return;

        setProcessing(true);
        setPaymentError(null);

        try {
            const token = localStorage.getItem('auth_token');
            const amount = bill.grandTotal || bill.totalAmount || 0;

            console.log('💰 Initiating payment for bill:', bill.billId);
            console.log('💰 Amount:', amount);

            const response = await fetch(`${API_URL}/api/create-payment-session`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                },
                body: JSON.stringify({
                    billId: bill.billId,
                    amount: amount,
                    consumerId: user?.id || 'unknown',
                    consumerName: user?.name || bill.consumerName,
                    email: user?.email || '',
                    description: `Electricity bill payment for ${bill.billId} - ${bill.billingMonth}`,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create payment session');
            }

            if (data.success && data.url) {
                // ✅ Redirect to Stripe checkout
                window.location.href = data.url;
            } else {
                throw new Error('Payment session creation failed');
            }

        } catch (error: any) {
            console.error('Payment error:', error);
            setPaymentError(error.message || 'Failed to initiate payment');
            setProcessing(false);
        }
    };

    const formatCurrency = (amount: number) => {
        if (!amount) return '৳0';
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

    const getConsumerTypeIcon = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'residential': return <Home size={16} className="text-blue-500" />;
            case 'commercial': return <Building size={16} className="text-purple-500" />;
            case 'industrial': return <Zap size={16} className="text-orange-500" />;
            default: return <Package size={16} className="text-gray-500" />;
        }
    };

    const getConsumerTypeLabel = (type: string) => {
        const types: Record<string, string> = {
            residential: 'Residential',
            commercial: 'Commercial',
            industrial: 'Industrial',
        };
        return types[type] || type || 'N/A';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={40} className="animate-spin text-emerald-600" />
            </div>
        );
    }

    // ✅ Payment Success State
    if (paymentSuccess) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={48} className="text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful! 🎉</h2>
                    <p className="text-gray-500">Your bill has been paid successfully.</p>
                    <p className="text-sm text-gray-400 mt-2">Redirecting to bills...</p>
                    <button
                        onClick={() => router.push('/dashboard/consumer/my-bills')}
                        className="mt-4 px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                        Go to My Bills
                    </button>
                </div>
            </div>
        );
    }

    if (error || !bill) {
        return (
            <div className="max-w-md mx-auto mt-12">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <AlertCircle size={48} className="text-red-500 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-red-700">Payment Error</h3>
                    <p className="text-red-600 mt-2">{error || 'Bill not found'}</p>
                    <button
                        onClick={() => router.push('/dashboard/consumer/my-bills')}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Back to Bills
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                        <CreditCard size={24} className="text-emerald-600" />
                        <span>Pay Bill</span>
                    </h1>
                </div>
                <button
                    onClick={() => router.push('/dashboard/consumer/my-bills')}
                    className="text-sm text-gray-500 hover:text-gray-700"
                >
                    Cancel
                </button>
            </div>

            {/* Bill Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-sm font-medium text-gray-500 mb-4">Bill Summary</h2>
                <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-gray-50">
                        <span className="text-sm text-gray-600">Bill ID</span>
                        <span className="text-sm font-medium text-emerald-600">{bill.billId}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-50">
                        <span className="text-sm text-gray-600">Consumer</span>
                        <span className="text-sm font-medium">{bill.consumerName}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-50">
                        <span className="text-sm text-gray-600">Meter Number</span>
                        <span className="text-sm font-medium">{bill.meterNo}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-50">
                        <span className="text-sm text-gray-600">Billing Month</span>
                        <span className="text-sm font-medium">{bill.billingMonth}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-50">
                        <span className="text-sm text-gray-600">Consumer Type</span>
                        <span className="flex items-center space-x-1">
                            {getConsumerTypeIcon(bill.consumerType)}
                            <span className="text-sm font-medium">{getConsumerTypeLabel(bill.consumerType)}</span>
                        </span>
                    </div>
                    {bill.previousReading !== undefined && bill.currentReading !== undefined && (
                        <div className="flex items-center justify-between py-2 border-b border-gray-50">
                            <span className="text-sm text-gray-600">Reading</span>
                            <span className="text-sm font-medium">
                                {bill.previousReading} → {bill.currentReading} kWh
                                {bill.unitsConsumed && (
                                    <span className="text-xs text-gray-400 ml-1">
                                        ({bill.unitsConsumed} units)
                                    </span>
                                )}
                            </span>
                        </div>
                    )}
                    <div className="flex items-center justify-between py-2 border-b border-gray-50">
                        <span className="text-sm text-gray-600">Due Date</span>
                        <span className={`text-sm font-medium ${new Date(bill.dueDate) < new Date() && bill.status !== 'paid' ? 'text-red-600' : 'text-gray-600'}`}>
                            {formatDate(bill.dueDate)}
                            {new Date(bill.dueDate) < new Date() && bill.status !== 'paid' && (
                                <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Overdue</span>
                            )}
                        </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-50">
                        <span className="text-sm text-gray-600">Status</span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${bill.status === 'paid' ? 'bg-green-100 text-green-700' :
                            bill.status === 'unpaid' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                            }`}>
                            {bill.status?.charAt(0).toUpperCase() + bill.status?.slice(1)}
                        </span>
                    </div>
                    {bill.lateFee && bill.lateFee > 0 && (
                        <div className="flex items-center justify-between py-2 border-b border-red-100 bg-red-50 -mx-6 px-6">
                            <span className="text-sm text-red-600 font-medium">Late Fee</span>
                            <span className="text-sm font-medium text-red-600">+{formatCurrency(bill.lateFee)}</span>
                        </div>
                    )}
                    <div className="flex items-center justify-between py-2">
                        <span className="text-sm font-semibold text-gray-700">Total Amount</span>
                        <span className={`text-2xl font-bold ${bill.status === 'paid' ? 'text-green-600' : 'text-emerald-600'}`}>
                            {formatCurrency(bill.grandTotal || bill.totalAmount || 0)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-sm font-medium text-gray-500 mb-4">Payment Method</h2>
                <div className="space-y-3">
                    <div className={`flex items-center space-x-3 p-4 border-2 rounded-xl transition-all ${paymentMethod === 'card'
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}>
                        <input
                            type="radio"
                            checked={paymentMethod === 'card'}
                            onChange={() => setPaymentMethod('card')}
                            className="w-4 h-4 text-emerald-600"
                        />
                        <CreditCard size={20} className="text-emerald-600" />
                        <span className="font-medium">Credit / Debit Card</span>
                        <div className="ml-auto flex space-x-2">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">Visa</span>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">Mastercard</span>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">Amex</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-xl opacity-50 cursor-not-allowed">
                        <input
                            type="radio"
                            disabled
                            className="w-4 h-4 text-gray-400"
                        />
                        <Zap size={20} className="text-gray-400" />
                        <span className="text-gray-400">Mobile Banking (Coming Soon)</span>
                    </div>
                </div>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start space-x-3">
                <Shield size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm text-blue-700 font-medium">🔒 Secure Payment</p>
                    <p className="text-xs text-blue-600">
                        Your payment is encrypted and secured by Stripe. We do not store your card details.
                    </p>
                </div>
            </div>

            {/* Payment Error */}
            {paymentError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
                    <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-red-700 font-medium">Payment Failed</p>
                        <p className="text-xs text-red-600">{paymentError}</p>
                    </div>
                    <button
                        onClick={() => setPaymentError(null)}
                        className="ml-auto text-red-500 hover:text-red-700"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Pay Button */}
            {bill.status !== 'paid' ? (
                <button
                    onClick={handlePayNow}
                    disabled={processing}
                    className={`w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center space-x-2 transition-all ${processing
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg hover:shadow-emerald-200'
                        }`}
                >
                    {processing ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            <span>Processing...</span>
                        </>
                    ) : (
                        <>
                            <Lock size={18} />
                            <span>Pay {formatCurrency(bill.grandTotal || bill.totalAmount || 0)}</span>
                        </>
                    )}
                </button>
            ) : (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                    <CheckCircle size={24} className="text-green-600 mx-auto mb-2" />
                    <p className="text-green-700 font-medium">This bill has already been paid.</p>
                    <button
                        onClick={() => router.push('/dashboard/consumer/my-bills')}
                        className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Back to Bills
                    </button>
                </div>
            )}

            {/* Payment Info */}
            <div className="flex items-center justify-center space-x-6 text-xs text-gray-400">
                <span className="flex items-center space-x-1">
                    <Lock size={12} />
                    <span>Secure Payment</span>
                </span>
                <span>•</span>
                <span>SSL Encrypted</span>
                <span>•</span>
                <span>Powered by Stripe</span>
            </div>
        </div>
    );
}