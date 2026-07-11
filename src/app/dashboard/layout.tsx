// app/dashboard/layout.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardNavbar from '@/components/DashboardNavbar';
import { authClient } from '@/lib/auth-client';
import { Loader2 } from 'lucide-react';

// ✅ Role to dashboard mapping
const roleDashboardMap: Record<string, string> = {
    admin: '/dashboard/admin',
    xen: '/dashboard/xen',
    connection_wing: '/dashboard/connection_wing',
    complaint_manager: '/dashboard/complaint_manager',
    billing_wings: '/dashboard/billing_wings',
    consumer: '/dashboard/consumer',
};

// ✅ Allowed roles for each dashboard path
const roleAccessMap: Record<string, string[]> = {
    '/dashboard/admin': ['admin'],
    '/dashboard/xen': ['xen'],
    '/dashboard/connection_wing': ['connection_wing'],
    '/dashboard/complaint_manager': ['complaint_manager'],
    '/dashboard/billing_wings': ['billing_wings'],
    '/dashboard/consumer': ['consumer'],
    '/dashboard/profile': ['admin', 'xen', 'connection_wing', 'complaint_manager', 'billing_wings', 'consumer'],
};

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

                // ✅ 1. If user goes to /dashboard, redirect to role-specific dashboard
                if (pathname === '/dashboard') {
                    const redirectPath = roleDashboardMap[data.user.role] || '/dashboard/consumer';
                    router.push(redirectPath);
                    return;
                }

                // ✅ 2. Check if user has access to this route
                const allowedRoles = roleAccessMap[pathname] || [];

                // If route is not in the map, check if it's a sub-route
                const matchingRoute = Object.keys(roleAccessMap).find(route =>
                    pathname.startsWith(route + '/')
                );

                const matchedRoles = matchingRoute ? roleAccessMap[matchingRoute] : allowedRoles;

                // If user role is not allowed, redirect to access denied
                if (matchedRoles.length > 0 && !matchedRoles.includes(data.user.role)) {
                    router.push('/access-denied');
                    return;
                }

                // ✅ 3. Check if user is trying to access a dashboard that doesn't match their role
                const dashboardMatch = Object.keys(roleDashboardMap).find(role =>
                    pathname.startsWith(`/dashboard/${role}`)
                );

                if (dashboardMatch && dashboardMatch !== data.user.role) {
                    // User is trying to access another role's dashboard
                    router.push('/access-denied');
                    return;
                }

            } catch (error) {
                console.error('Error fetching user:', error);
                router.push('/login');
            } finally {
                setLoading(false);
            }
        };
        getUser();
    }, [router, pathname]);

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