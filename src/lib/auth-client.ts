import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
    baseURL: '', // ✅ খালি রাখুন - proxy ব্যবহার করবে
    basePath: '/api/auth',
    fetchOptions: {
        credentials: 'include',
    },
});