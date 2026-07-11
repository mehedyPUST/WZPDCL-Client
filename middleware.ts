// middleware.ts - Root Level
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes (accessible without login)
const publicRoutes = ['/', '/login', '/register', '/api/auth/callback/google'];

// Role to dashboard path mapping
const roleDashboardMap: Record<string, string> = {
    admin: '/dashboard/admin',
    xen: '/dashboard/xen',
    connection_wing: '/dashboard/connection_wing',
    complaint_manager: '/dashboard/complaint_manager',
    billing_wings: '/dashboard/billing_wings',
    consumer: '/dashboard/consumer',
};

// Allowed routes per role
const roleRouteMap: Record<string, string[]> = {
    admin: [
        '/dashboard/admin',
        '/dashboard/admin/users',
        '/dashboard/admin/substations',
        '/dashboard/admin/reports',
        '/dashboard/admin/settings',
        '/dashboard/profile',
    ],
    xen: [
        '/dashboard/xen',
        '/dashboard/xen/substations',
        '/dashboard/xen/new-connection-applications',
        '/dashboard/xen/all-transactions',
        '/dashboard/xen/all-complaints',
        '/dashboard/profile',
    ],
    connection_wing: [
        '/dashboard/connection_wing',
        '/dashboard/connection_wing/applications',
        '/dashboard/connection_wing/completed',
        '/dashboard/connection_wing/add-meter',
        '/dashboard/profile',
    ],
    complaint_manager: [
        '/dashboard/complaint_manager',
        '/dashboard/complaint_manager/complaints/pending',
        '/dashboard/complaint_manager/complaints/all',
        '/dashboard/profile',
    ],
    billing_wings: [
        '/dashboard/billing_wings',
        '/dashboard/billing_wings/all-bills',
        '/dashboard/billing_wings/all-consumers',
        '/dashboard/billing_wings/generate-bills',
        '/dashboard/profile',
    ],
    consumer: [
        '/dashboard/consumer',
        '/dashboard/consumer/my-bills',
        '/dashboard/consumer/my-complaints',
        '/dashboard/consumer/new-connection',
        '/dashboard/consumer/my-connections',
        '/dashboard/profile',
    ],
};

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // ✅ 1. Allow public routes
    if (publicRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // ✅ 2. Get session from Better Auth
    const sessionCookie = request.cookies.get('better-auth.session')?.value;

    // If trying to access dashboard without session, redirect to login
    if (!sessionCookie && pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // ✅ 3. For dashboard routes, validate role-based access
    if (pathname.startsWith('/dashboard')) {
        try {
            // Get user role from session (you can also decode the JWT)
            // For now, we'll check the path pattern
            const userRole = await getUserRoleFromSession(request);

            if (!userRole) {
                return NextResponse.redirect(new URL('/login', request.url));
            }

            // Check if user is trying to access their own dashboard
            const dashboardPath = roleDashboardMap[userRole];
            if (!dashboardPath) {
                return NextResponse.redirect(new URL('/login', request.url));
            }

            // Check if the requested path is allowed for this role
            const allowedPaths = roleRouteMap[userRole] || [];
            const isAllowed = allowedPaths.some(route => pathname.startsWith(route));

            // If trying to access root dashboard, redirect to role-specific
            if (pathname === '/dashboard') {
                return NextResponse.redirect(new URL(dashboardPath, request.url));
            }

            // If not allowed, show access denied
            if (!isAllowed) {
                return NextResponse.redirect(new URL('/access-denied', request.url));
            }

            // Redirect to role-specific dashboard if trying to access wrong one
            const requestedRole = Object.keys(roleDashboardMap).find(
                role => pathname.startsWith(`/dashboard/${role}`)
            );

            if (requestedRole && requestedRole !== userRole) {
                return NextResponse.redirect(new URL('/access-denied', request.url));
            }

            return NextResponse.next();

        } catch (error) {
            console.error('Middleware error:', error);
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

// Helper function to get user role from session
async function getUserRoleFromSession(request: NextRequest): Promise<string | null> {
    try {
        // Get the session cookie
        const sessionToken = request.cookies.get('better-auth.session')?.value;

        if (!sessionToken) {
            return null;
        }

        // For Better Auth, we need to decode the session or fetch from API
        // Since we can't make API calls in middleware easily,
        // we'll decode the JWT session token

        try {
            // Better Auth session token is a JWT
            const parts = sessionToken.split('.');
            if (parts.length === 3) {
                const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
                return payload.role || null;
            }
        } catch (e) {
            // If we can't decode, try to get from a custom cookie
            const roleCookie = request.cookies.get('user_role')?.value;
            if (roleCookie) {
                return roleCookie;
            }
        }

        return null;
    } catch (error) {
        console.error('Error getting user role:', error);
        return null;
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|public).*)',
    ],
};