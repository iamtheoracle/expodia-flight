import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(process.env.BASE44_PUBLIC_HOST_SUFFIX
    ? { allowedDevOrigins: [`3000-${process.env.BASE44_PUBLIC_HOST_SUFFIX}`] }
    : {}),
};

export default nextConfig;
