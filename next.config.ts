/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker or server deployments
  output: 'standalone',
  
  // Configure images for proper functionality
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Ignore TypeScript and ESLint errors during build for deployment
  typescript: {
    // This doesn't mean TS isn't checked at all, it means builds won't fail
    ignoreBuildErrors: true,
  },
  
  eslint: {
    // Don't run ESLint during builds
    ignoreDuringBuilds: true,
  },
  
  // Disable strict mode in development for easier debugging
  reactStrictMode: false,
  
  // Experimental features
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"]
    }
  },
};

export default nextConfig;
