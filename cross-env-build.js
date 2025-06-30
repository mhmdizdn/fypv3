// Cross-platform build script for Next.js
// This sets environment variables in a way that works on Windows and Unix

// Set environment variables for the build
process.env.NEXT_SKIP_LINT = 'true';
process.env.NEXT_SKIP_TYPECHECK = 'true';
process.env.NEXT_PUBLIC_SKIP_CLIENT_VALIDATIONS = 'true';
process.env.NEXT_DISABLE_CSR_BAILOUT = 'true';

// Run the normal build process
const { execSync } = require('child_process');
try {
  console.log('Building with environment variables set to bypass type checks...');
  execSync('next build', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      NEXT_SKIP_LINT: 'true',
      NEXT_SKIP_TYPECHECK: 'true',
      NEXT_DISABLE_CSR_BAILOUT: 'true'
    }
  });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed with error:', error);
  process.exit(1);
} 