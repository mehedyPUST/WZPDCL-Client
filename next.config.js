/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverActions: {
            allowedOrigins: ['localhost:3000', 'wzpdcl-client.vercel.app'],
        },
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: process.env.NEXT_PUBLIC_API_URL
                    ? `${process.env.NEXT_PUBLIC_API_URL}/:path*`
                    : 'http://localhost:5000/api/:path*',
            },
        ];
    },
};

module.exports = nextConfig;