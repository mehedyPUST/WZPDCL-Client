// app/access-denied/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, XCircle, Home, ArrowLeft, LogIn, LayoutDashboard } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

export default function AccessDeniedPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUser = async () => {
            try {
                const { data } = await authClient.getSession();
                setUser(data?.user || null);
            } catch (error) {
                console.error('Error fetching user:', error);
            } finally {
                setLoading(false);
            }
        };
        getUser();
    }, []);

    const getDashboardPath = (role: string) => {
        const paths: Record<string, string> = {
            admin: '/dashboard/admin',
            xen: '/dashboard/xen',
            connection_wing: '/dashboard/connection_wing',
            complaint_manager: '/dashboard/complaint_manager',
            billing_wings: '/dashboard/billing_wings',
            consumer: '/dashboard/consumer',
        };
        return paths[role] || '/dashboard/consumer';
    };

    const handleGoBack = () => {
        router.back();
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                        <Shield size={48} className="text-red-600" />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Access Denied</h1>
                <p className="text-gray-500 mb-6">
                    You don't have permission to access this page.
                </p>

                {/* User Info */}
                {!loading && user && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                        <p className="text-sm text-gray-600">
                            <span className="font-medium">Logged in as:</span> {user.name}
                        </p>
                        <p className="text-sm text-gray-600">
                            <span className="font-medium">Role:</span>
                            <span className="ml-2 px-2 py-0.5 bg-gray-200 rounded-full text-xs">
                                {user.role}
                            </span>
                        </p>
                        <p className="text-sm text-gray-600">
                            <span className="font-medium">Email:</span> {user.email}
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="space-y-3">
                    {user ? (
                        <>
                            <Link
                                href={getDashboardPath(user.role)}
                                className="w-full px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2"
                            >
                                <LayoutDashboard size={18} />
                                <span>Go to My Dashboard</span>
                            </Link>
                            <button
                                onClick={handleGoBack}
                                className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                            >
                                <ArrowLeft size={18} />
                                <span>Go Back</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="w-full px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2"
                            >
                                <LogIn size={18} />
                                <span>Login</span>
                            </Link>
                            <Link
                                href="/"
                                className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                            >
                                <Home size={18} />
                                <span>Go Home</span>
                            </Link>
                        </>
                    )}
                </div>

                {/* Footer */}
                <p className="text-xs text-gray-400 mt-6">
                    If you believe this is an error, please contact your administrator.
                </p>
            </div>
        </div>
    );
}