/** @type {import('next').NextConfig} */

const nextConfig = {
    experimental: {
        ppr: 'incremental',
    },
    images: {
        domains: ['i.pravatar.cc'],
    }
};

export default nextConfig;
