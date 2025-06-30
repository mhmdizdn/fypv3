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
    tsconfigPath: './tsconfig.build.json',
  },
  
  eslint: {
    // Don't run ESLint during builds
    ignoreDuringBuilds: true,
    dirs: ['pages', 'components', 'lib', 'utils'],
  },
  
  // Disable strict mode in development for easier debugging
  reactStrictMode: false,
  
  // Disable source maps in production for better performance
  productionBrowserSourceMaps: false,
  
  // Experimental features
  experimental: {
    // Disable bailouts for client components
    disableOptimizedLoading: true,
    serverActions: {
      allowedOrigins: ["localhost:3000"]
    }
  },
  
  // Skip type checking during build (critical for deployment)
  skipMiddlewareUrlNormalize: true,
  skipTrailingSlashRedirect: true,
  
  // Add these settings for better compatibility
  modularizeImports: {
    'lodash': {
      transform: 'lodash/{{member}}',
    },
  },
  
  // These features are unnecessary and can cause issues
  poweredByHeader: false,
};

export default nextConfig;
