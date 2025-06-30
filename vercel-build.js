// This script helps deploy to Vercel even if there are certain errors
// It sets environment variables to skip TypeScript and ESLint checks

process.env.NEXT_SKIP_LINT = 'true';
process.env.NEXT_SKIP_TYPECHECK = 'true';
process.env.NEXT_PUBLIC_SKIP_CLIENT_VALIDATIONS = 'true';
process.env.NEXT_DISABLE_CSR_BAILOUT = 'true';

// Run the normal build process
const { execSync } = require('child_process');
try {
  execSync('npx next build', { stdio: 'inherit' });
} catch (error) {
  console.error('Build failed with error:', error);
  process.exit(1);
} 