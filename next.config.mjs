/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        BACKEND_URL: 'http://localhost:3000'
    },
    images: {
        domains: ['localhost', 'hatrabbits.com'],
    },
};

export default nextConfig;