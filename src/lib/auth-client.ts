// lib/auth-client.ts
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
    baseURL: '', // ✅ Proxy এর মাধ্যমে কাজ করবে
    basePath: '/api/auth',
    fetchOptions: {
        credentials: 'include',
    },
});
