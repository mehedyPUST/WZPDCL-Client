// lib/auth-client.ts
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    basePath: '/api/auth',
    // ✅ CRITICAL: Enable credentials for cookies
    fetchOptions: {
        credentials: 'include',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    },
    // ✅ For production cookie handling
    cookies: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        domain: process.env.NODE_ENV === 'production' ? '.vercel.app' : undefined,
    },
});