import { withPayload } from '@payloadcms/next/withPayload';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '127.0.0.1' },
      { protocol: 'http', hostname: '0.0.0.0' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'globdot.com' },
      { protocol: 'https', hostname: 'www.globdot.com' },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/media/file/:path*',
        destination: '/media/:path*',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/studio',
        destination: '/admin',
        permanent: true,
      },
    ];
  },
};

export default withPayload(nextConfig);
