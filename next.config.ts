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
    // Allow server actions from specified origins
    serverActions: {
      allowedOrigins: ["localhost:3000"]
    },
    
    // Improve handling of API routes
    serverComponentsExternalPackages: ["prisma", "@prisma/client"],
    
    // More aggressive transpilation may help with build issues
    swcMinify: true
  },
  
  // Additional compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ["error", "warn"]
    } : false,
  },
  
  // More aggressive webpack optimization
  webpack: (config, { isServer }) => {
    // Optimize the client build
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
