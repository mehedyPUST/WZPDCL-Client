// lib/auth-client.ts
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    // ✅ Important: Enable credentials for cookies
    fetchOptions: {
        credentials: 'include',
    },
});