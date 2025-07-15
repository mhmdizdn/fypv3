/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker or server deployments
  output: 'standalone',
  
  // Configure images for proper functionality
  images: {
    domains: ['localhost'], // Add your domain here
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Ignore TypeScript and ESLint errors during build for deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // FORCE production mode - disable all development features
  reactStrictMode: false,
  
  // External packages that should not be bundled
  serverExternalPackages: ["prisma", "@prisma/client"],
  
  // Experimental features
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "188.166.219.104", "188.166.219.104:3000"]
    }
  },
  
  // Remove ALL console statements and development indicators
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? true : false,
  },
  
  // Disable development overlay in production
  devIndicators: {
    buildActivity: false,
    buildActivityPosition: 'bottom-right',
  },
  
  // More aggressive webpack optimization
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    // Force production mode
    config.mode = 'production';
    
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 30000,
        maxSize: 150000,
      };
    }
    
    return config;
  }
};

export default nextConfig;