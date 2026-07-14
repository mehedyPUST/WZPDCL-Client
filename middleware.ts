// middleware.ts - Root Level
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes (accessible without login)
const publicRoutes = ['/', '/login', '/register', '/api/auth/callback/google'];

// ✅ API routes that should be public (no auth required)
const publicApiRoutes = [
    '/api/health',
    '/api/auth/sign-up/email',
];

// ✅ API routes that need auth but should bypass middleware check
const protectedApiRoutes = [
    '/api/auth/change-password',
    '/api/admin/users',
    '/api/billing/',
    '/api/complaints',
    '/api/connection-applications',
    '/api/connection-wing/',
    '/api/meters/',
    '/api/transactions/',
    '/api/substations',
    '/api/xen/',
    '/api/consumer/',
    '/api/payment-verify',
    '/api/create-payment-session',
];

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

    // ✅ 2. Allow public API routes (no auth needed)
    if (publicApiRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // ✅ 3. For API routes, just check if session exists, don't redirect
    if (pathname.startsWith('/api/')) {
        // Check if this is a protected API route
        const isProtectedApi = protectedApiRoutes.some(route => pathname.startsWith(route));

        // If it's not a protected API route, let it through
        if (!isProtectedApi) {
            return NextResponse.next();
        }

        // ✅ FIX: Use correct cookie name - 'wzpdcl.session' instead of 'better-auth.session'
        const sessionCookie = request.cookies.get('wzpdcl.session')?.value;  // ✅ Changed

        // If no session, return 401 Unauthorized (let the API handle it)
        if (!sessionCookie) {
            return new NextResponse(
                JSON.stringify({
                    success: false,
                    message: 'Unauthorized. Please login.',
                }),
                {
                    status: 401,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        // Let the API handle the auth validation
        return NextResponse.next();
    }

    // ✅ 4. For dashboard routes, validate session
    if (pathname.startsWith('/dashboard')) {
        // ✅ FIX: Use correct cookie name - 'wzpdcl.session'
        const sessionCookie = request.cookies.get('wzpdcl.session')?.value;  // ✅ Changed

        // If trying to access dashboard without session, redirect to login
        if (!sessionCookie) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        try {
            // Get user role from session
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
        // ✅ FIX: Use correct cookie name - 'wzpdcl.session'
        const sessionToken = request.cookies.get('wzpdcl.session')?.value;  // ✅ Changed

        if (!sessionToken) {
            return null;
        }

        // Try to decode the JWT session token
        try {
            const parts = sessionToken.split('.');
            if (parts.length === 3) {
                const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

                // Better Auth stores role in the user object
                if (payload.user && payload.user.role) {
                    return payload.user.role;
                }
                if (payload.role) {
                    return payload.role;
                }
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