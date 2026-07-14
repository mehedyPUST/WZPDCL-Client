/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'i.ibb.co.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
    async rewrites() {
        return [
            {
                source: '/api/auth/:path*',
                destination: 'https://wzpdcl-server.vercel.app/api/auth/:path*',
            },
            {
                source: '/api/:path*',
                destination: 'https://wzpdcl-server.vercel.app/api/:path*',
            },
        ];
    },
};

module.exports = nextConfig;