// app/api/auth/callback/google/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    console.log('🔍 Google OAuth Callback received:');
    console.log('  - code:', code ? '✅ Present' : '❌ Missing');
    console.log('  - state:', state ? '✅ Present' : '❌ Missing');
    console.log('  - error:', error || 'None');

    if (error) {
        console.error('❌ Google OAuth error:', error);
        return NextResponse.redirect(new URL(`/login?error=${error}`, request.url));
    }

    if (!code || !state) {
        console.error('❌ Missing code or state');
        return NextResponse.redirect(new URL('/login?error=missing_parameters', request.url));
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    try {
        console.log('📤 Forwarding to backend...');
        const response = await fetch(
            `${API_URL}/api/auth/callback/google?code=${code}&state=${state}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        const data = await response.json();
        console.log('📦 Backend response:', data);

        if (!response.ok) {
            throw new Error(data.message || 'OAuth callback failed');
        }

        console.log('✅ OAuth successful, redirecting to dashboard');
        return NextResponse.redirect(new URL('/dashboard', request.url));

    } catch (error: any) {
        console.error('❌ OAuth callback error:', error);
        return NextResponse.redirect(
            new URL(`/login?error=${encodeURIComponent(error.message || 'oauth_failed')}`, request.url)
        );
    }
}