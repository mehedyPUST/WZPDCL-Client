// app/dashboard/consumer/payment-success/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

export default function PaymentSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const appId = searchParams.get('app_id');
    const billId = searchParams.get('bill_id');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('Verifying payment...');

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                const token = localStorage.getItem('auth_token');

                // Determine which ID to use
                const body: any = { sessionId };
                if (appId) body.applicationId = appId;
                if (billId) body.billId = billId;

                const response = await fetch(`${API_URL}/api/payment-verify`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token ? `Bearer ${token}` : '',
                    },
                    body: JSON.stringify(body),
                });

                const data = await response.json();
                console.log('Payment verification:', data);

                if (data.success) {
                    setMessage('Payment successful! Redirecting...');
                } else {
                    setMessage('Payment verification failed. Please contact support.');
                }

                setTimeout(() => {
                    if (appId) {
                        router.push('/dashboard/consumer/my-connections');
                    } else if (billId) {
                        router.push('/dashboard/consumer/my-bills');
                    } else {
                        router.push('/dashboard/consumer');
                    }
                }, 3000);

            } catch (error) {
                console.error('Verification error:', error);
                setMessage('Payment verification failed. Please contact support.');
                setTimeout(() => {
                    router.push('/dashboard/consumer');
                }, 3000);
            } finally {
                setLoading(false);
            }
        };

        if (sessionId || appId || billId) {
            verifyPayment();
        } else {
            router.push('/dashboard/consumer');
        }
    }, [sessionId, appId, billId, router, API_URL]);

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
                {loading ? (
                    <>
                        <Loader2 size={64} className="animate-spin text-emerald-600 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-700">{message}</h2>
                    </>
                ) : (
                    <>
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle size={48} className="text-emerald-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful! 🎉</h2>
                        <p className="text-gray-500">{message}</p>
                        <button
                            onClick={() => {
                                if (appId) {
                                    router.push('/dashboard/consumer/my-connections');
                                } else if (billId) {
                                    router.push('/dashboard/consumer/my-bills');
                                } else {
                                    router.push('/dashboard/consumer');
                                }
                            }}
                            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                            Go to Dashboard
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}