// lib/auth-client.ts
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://wzpdcl-server.vercel.app',
    basePath: '/api/auth',
    fetchOptions: {
        credentials: 'include',
    },
    // ✅ Cookie prefix টা backend এর সাথে match করতে হবে
    cookies: {
        prefix: 'wzpdcl', // ✅ backend এ cookiePrefix: 'wzpdcl' দিয়েছেন
    },
});