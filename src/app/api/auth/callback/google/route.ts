// app/api/auth/callback/google/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code || !state) {
        return NextResponse.redirect(new URL('/login?error=missing_params', request.url));
    }

    // Forward to backend
    const backendUrl = `https://wzpdcl-server.vercel.app/api/auth/callback/google?code=${code}&state=${state}`;

    try {
        const response = await fetch(backendUrl, {
            headers: {
                'Cookie': request.headers.get('cookie') || '',
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (data?.url) {
            // If backend returns a redirect URL
            return NextResponse.redirect(data.url);
        }

        if (data?.user) {
            // Login successful - redirect to dashboard
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }

        // Something went wrong
        return NextResponse.redirect(new URL('/login?error=google_auth_failed', request.url));

    } catch (error) {
        console.error('Google callback error:', error);
        return NextResponse.redirect(new URL('/login?error=google_auth_failed', request.url));
    }
}