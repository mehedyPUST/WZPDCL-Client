// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['i.ibb.co.com', 'i.ibb.co', 'ibb.co.com', 'ibb.co'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.ibb.co.com',
            },
            {
                protocol: 'https',
                hostname: '**.ibb.co',
            },
            {
                protocol: 'https',
                hostname: '**.ibb.co.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
    // ✅ If you have other configs, keep them
};

module.exports = nextConfig;