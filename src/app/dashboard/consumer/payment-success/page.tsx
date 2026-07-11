// app/dashboard/consumer/payment-success/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Loader2, ArrowRight, Zap, XCircle } from 'lucide-react';

export default function PaymentSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<'success' | 'error'>('success');
    const [applicationId, setApplicationId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const sessionId = searchParams.get('session_id');
        const appId = searchParams.get('app_id');

        console.log('🔍 Payment success params:', { sessionId, appId });

        if (appId) {
            setApplicationId(appId);
        }

        // Verify payment with backend
        const verifyPayment = async () => {
            try {
                const token = localStorage.getItem('auth_token');

                console.log('📤 Verifying payment with backend...');

                const response = await fetch(`${API_URL}/api/payment-verify`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token ? `Bearer ${token}` : '',
                    },
                    body: JSON.stringify({
                        sessionId: sessionId || undefined,
                        applicationId: appId || undefined,
                    }),
                });

                const data = await response.json();
                console.log('📦 Payment verification response:', data);

                if (!response.ok) {
                    throw new Error(data.message || 'Payment verification failed');
                }

                setStatus('success');

                // Update application ID from response if not set
                if (data.data?.applicationId) {
                    setApplicationId(data.data.applicationId);
                }

            } catch (error: any) {
                console.error('❌ Payment verification error:', error);
                setStatus('error');
                setError(error.message || 'Failed to verify payment');
            } finally {
                setLoading(false);
            }
        };

        if (sessionId || appId) {
            verifyPayment();
        } else {
            setLoading(false);
            setStatus('error');
            setError('Missing payment information');
        }
    }, [searchParams, API_URL]);

    if (loading) {
        return (
            <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 size={48} className="animate-spin text-emerald-600 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-700">Verifying your payment...</h2>
                    <p className="text-gray-500 text-sm mt-2">Please wait while we confirm your payment</p>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen bg-emerald-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-red-100">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle size={40} className="text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Verification Failed</h2>
                    <p className="text-gray-600 mb-4">{error || 'We could not verify your payment. Please contact support.'}</p>
                    <div className="flex flex-col gap-3">
                        <Link
                            href="/dashboard/consumer/my-connections"
                            className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                            View My Applications
                        </Link>
                        <Link
                            href="/dashboard/consumer"
                            className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Go to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-emerald-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-emerald-100">
                {/* Success Icon */}
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={48} className="text-emerald-600" />
                </div>

                <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful! 🎉</h1>
                <p className="text-gray-600 mb-6">
                    Your payment has been processed successfully. Your connection application is now under review.
                </p>

                {/* Application ID */}
                {applicationId && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-500">Application ID</p>
                        <p className="text-lg font-bold text-emerald-700">{applicationId}</p>
                    </div>
                )}

                {/* Next Steps */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                    <h4 className="font-semibold text-blue-800 mb-2">What's Next?</h4>
                    <ul className="text-sm text-blue-700 space-y-1.5">
                        <li className="flex items-start space-x-2">
                            <span className="mt-0.5">1.</span>
                            <span>Your application will be reviewed by the XEN team</span>
                        </li>
                        <li className="flex items-start space-x-2">
                            <span className="mt-0.5">2.</span>
                            <span>You'll receive updates on your application status</span>
                        </li>
                        <li className="flex items-start space-x-2">
                            <span className="mt-0.5">3.</span>
                            <span>After approval, a meter will be assigned to you</span>
                        </li>
                        <li className="flex items-start space-x-2">
                            <span className="mt-0.5">4.</span>
                            <span>Connection will be implemented within 5-7 days</span>
                        </li>
                    </ul>
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-3">
                    <Link
                        href="/dashboard/consumer/my-connections"
                        className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2"
                    >
                        <Zap size={18} />
                        <span>View My Applications</span>
                    </Link>
                    <Link
                        href="/dashboard/consumer"
                        className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                    >
                        <ArrowRight size={18} />
                        <span>Go to Dashboard</span>
                    </Link>
                </div>

                {/* Reference */}
                <p className="text-xs text-gray-400 mt-6">
                    If you have any questions, please contact our support team.
                    <br />
                    Reference: {applicationId || 'N/A'}
                </p>
            </div>
        </div>
    );
}