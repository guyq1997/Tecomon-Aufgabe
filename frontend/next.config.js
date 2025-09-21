/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5050',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `http://backend:${process.env.BACKEND_INTERNAL_PORT || 5050}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;


