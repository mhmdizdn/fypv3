// Cross-environment build script optimized for Vercel
const { execSync } = require('child_process');

console.log("Starting cross-environment build process...");

try {
  // Generate Prisma client first - critical step
  console.log("Generating Prisma client...");
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      // Ensure DATABASE_URL exists for Prisma
      DATABASE_URL: process.env.DATABASE_URL || "postgresql://placeholder:placeholder@localhost:5432/placeholder"
    }
  });
  console.log("Prisma client generated successfully!");
  
  // Then build the Next.js app with reduced options to avoid issues
  console.log("Building Next.js application...");
  execSync('npx next build', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      // Only use critical flags
      NEXT_SKIP_TYPE_CHECK: "true",
      NEXT_DISABLE_ESLINT: "true",
      NEXT_TELEMETRY_DISABLED: "true",
      NODE_ENV: "production"
    }
  });
  
  console.log("Build completed successfully!");
} catch (error) {
  console.error("Build failed:", error);
  process.exit(1);
} 