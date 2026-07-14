// app/dashboard/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { Loader2 } from 'lucide-react';

export default function DashboardRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        const checkRole = async () => {
            try {
                // ✅ Add credentials: 'include' to get session
                const { data } = await authClient.getSession({
                    fetchOptions: {
                        credentials: 'include',
                    },
                });

                console.log('📦 Dashboard session check:', data);

                if (!data) {
                    console.log('❌ No session found, redirecting to login');
                    router.push('/login');
                    return;
                }

                // ✅ FIX: Use type assertion for custom fields
                const userData = data.user as any;

                // ✅ Role-based redirect mapping
                const roleMap: Record<string, string> = {
                    admin: '/dashboard/admin',
                    xen: '/dashboard/xen',
                    connection_wing: '/dashboard/connection_wing',
                    complaint_manager: '/dashboard/complaint_manager',
                    billing_wings: '/dashboard/billing_wings',
                    consumer: '/dashboard/consumer',
                };

                const redirectPath = roleMap[userData.role] || '/dashboard/consumer';
                console.log(`✅ Redirecting to: ${redirectPath}`);
                router.push(redirectPath);
            } catch (error) {
                console.error('Error:', error);
                router.push('/login');
            }
        };

        checkRole();
    }, [router]);

    return (
        <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
            <Loader2 size={40} className="animate-spin text-emerald-600" />
        </div>
    );
}