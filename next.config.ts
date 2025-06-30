import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"]
    },
  },
  output: 'standalone',
  images: {
    domains: ['localhost'],
  },
};

export default nextConfig;
