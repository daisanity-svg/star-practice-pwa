import { execSync } from 'child_process';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**'
      }
    ]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb'
    }
  },
  env: {
    NEXT_PUBLIC_COMMIT_HASH: execSync('git rev-parse --short HEAD').toString().trim()
  }
};

export default nextConfig;
