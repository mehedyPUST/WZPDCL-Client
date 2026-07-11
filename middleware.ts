// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Check for Better Auth session cookie
    const sessionCookie = request.cookies.get('better-auth.session')?.value;
    const { pathname } = request.nextUrl;

    console.log('🔍 Middleware - Path:', pathname);
    console.log('🔍 Middleware - Session cookie:', sessionCookie ? '✅ Present' : '❌ Missing');

    const publicRoutes = ['/', '/login', '/register', '/api/auth/callback/google'];
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    // If trying to access protected route without session
    if (!isPublicRoute && !sessionCookie) {
        console.log('🔒 Redirecting to login (no session)');
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If logged in and trying to access login/register
    if (sessionCookie && (pathname === '/login' || pathname === '/register')) {
        console.log('✅ Already logged in, redirecting to dashboard');
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|public).*)',
    ],
};