// app/dashboard/layout.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardNavbar from '@/components/DashboardNavbar';
import { authClient } from '@/lib/auth-client';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        const getUser = async () => {
            try {
                const { data, error } = await authClient.getSession();
                if (error || !data) {
                    router.push('/login');
                    return;
                }
                setUser(data.user);
            } catch (error) {
                console.error('Error fetching user:', error);
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };
        getUser();
    }, [router]);

    // ✅ Redirect to role-specific dashboard - Only consumer
    useEffect(() => {
        if (user && pathname === '/dashboard') {
            const roleMap: Record<string, string> = {
                admin: '/dashboard/admin',
                xen: '/dashboard/xen',
                connection_wing: '/dashboard/connection_wing',
                complaint_manager: '/dashboard/complaint_manager',
                billing_wings: '/dashboard/billing_wings',
                consumer: '/dashboard/consumer', // ✅ Only consumer
            };
            const redirectPath = roleMap[user.role] || '/dashboard/consumer';
            router.push(redirectPath);
        }
    }, [user, pathname, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
                <Loader2 size={40} className="animate-spin text-emerald-600" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="flex flex-1">
                <DashboardSidebar
                    user={user}
                    isOpen={sidebarOpen}
                    setIsOpen={setSidebarOpen}
                    pathname={pathname || ''}
                />
                <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
                    <DashboardNavbar
                        user={user}
                        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                        sidebarOpen={sidebarOpen}
                    />
                    <main className="p-6">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}