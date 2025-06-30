// No TypeScript check build script
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Force environment variables
process.env.NEXT_SKIP_TYPE_CHECK = "true";  
process.env.NEXT_DISABLE_ESLINT = "true";
process.env.NEXT_DISABLE_SOURCEMAPS = "true";
process.env.NEXT_TELEMETRY_DISABLED = "true";
process.env.NODE_OPTIONS = "--max_old_space_size=4096";

// Execute the build
try {
  console.log("Building with TypeScript checks disabled...");
  
  // Create .env.local file if it doesn't exist to ensure our settings are picked up
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(
      envPath,
      `NEXT_SKIP_TYPE_CHECK=true
NEXT_DISABLE_ESLINT=true
NEXT_DISABLE_SOURCEMAPS=true
NEXT_TELEMETRY_DISABLED=true`
    );
    console.log("Created .env.local with build bypass settings");
  }
  
  // Run the build
  execSync('npx next build', {
    stdio: 'inherit',
    env: {
      ...process.env,
      NEXT_SKIP_TYPE_CHECK: "true",
      NEXT_DISABLE_ESLINT: "true",
      NEXT_DISABLE_SOURCEMAPS: "true",
      NEXT_TELEMETRY_DISABLED: "true",
      NEXT_TYPESCRIPT_CHECK: "0",
      SKIP_TYPESCRIPT_CHECK: "1",
      NODE_ENV: "production"
    }
  });
  
  console.log("Build completed successfully!");
} catch (error) {
  console.error("Build failed:", error);
  process.exit(1);
} 