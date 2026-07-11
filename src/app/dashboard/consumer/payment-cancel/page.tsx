// app/dashboard/consumer/payment-cancel/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { XCircle } from 'lucide-react';

export default function PaymentCancelPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const appId = searchParams.get('app_id');
    const billId = searchParams.get('bill_id');

    useEffect(() => {
        setTimeout(() => {
            if (appId) {
                router.push('/dashboard/consumer/my-connections');
            } else if (billId) {
                router.push('/dashboard/consumer/my-bills');
            } else {
                router.push('/dashboard/consumer');
            }
        }, 3000);
    }, [appId, billId, router]);

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle size={48} className="text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Cancelled</h2>
                <p className="text-gray-500">You cancelled the payment. No charges were made.</p>
                <p className="text-sm text-gray-400 mt-2">Redirecting...</p>
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
            </div>
        </div>
    );
}