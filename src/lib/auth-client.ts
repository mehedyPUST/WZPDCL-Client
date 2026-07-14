import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://wzpdcl-server.vercel.app',
    basePath: '/api/auth',
    fetchOptions: {
        credentials: 'include', // ✅ CRITICAL
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
        },
    },
    // ✅ Add cookie options
    cookies: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    },
});