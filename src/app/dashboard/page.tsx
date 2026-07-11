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
                const { data } = await authClient.getSession();
                if (!data) {
                    router.push('/login');
                    return;
                }

                // ✅ Only consumer - no customer
                const roleMap: Record<string, string> = {
                    admin: '/dashboard/admin',
                    xen: '/dashboard/xen',
                    connection_wing: '/dashboard/connection_wing',
                    complaint_manager: '/dashboard/complaint_manager',
                    billing_wings: '/dashboard/billing_wings',
                    consumer: '/dashboard/consumer', // ✅ Only consumer
                };

                const redirectPath = roleMap[data.user.role] || '/dashboard/consumer';
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