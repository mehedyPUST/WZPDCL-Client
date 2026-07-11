import { betterAuth } from "better-auth"

export const auth = betterAuth({
    // Enable email/password authentication
    emailAndPassword: {
        enabled: true
    },
    // Configure Google OAuth
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }
    },
    // Essential: Base URL for your app
    baseURL: process.env.BETTER_AUTH_URL,
    // Essential: Secret key (generate with `openssl rand -base64 32`)
    secret: process.env.BETTER_AUTH_SECRET!,
})