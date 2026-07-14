import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code || !state) {
        return NextResponse.redirect(new URL('/login?error=missing_params', request.url));
    }

    const backendUrl = `https://wzpdcl-server.vercel.app/api/auth/callback/google?code=${code}&state=${state}`;

    try {
        const response = await fetch(backendUrl, {
            headers: {
                'Cookie': request.headers.get('cookie') || '',
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        if (data?.url) return NextResponse.redirect(data.url);
        if (data?.user) return NextResponse.redirect(new URL('/dashboard', request.url));
        return NextResponse.redirect(new URL('/login?error=google_auth_failed', request.url));
    } catch {
        return NextResponse.redirect(new URL('/login?error=google_auth_failed', request.url));
    }
}
