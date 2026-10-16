const { execSync } = require('child_process');

const DEFAULT_DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_L1QxBiHJRf6T@ep-little-bird-b45navj8-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require';

const DEFAULT_DIRECT_URL =
  process.env.DIRECT_URL ||
  'postgresql://neondb_owner:npg_L1QxBiHJRf6T@ep-little-bird-b45navj8.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require';

process.env.DATABASE_URL = DEFAULT_DATABASE_URL;
process.env.DIRECT_URL = DEFAULT_DIRECT_URL;

console.log('✓ Build environment initialized with database URL.');

try {
  console.log('→ Running npx prisma generate...');
  execSync('npx prisma generate', { stdio: 'inherit', env: process.env, shell: true });

  console.log('→ Running npx next build...');
  execSync('npx next build', { stdio: 'inherit', env: process.env, shell: true });
} catch (error) {
  console.error('Build step failed:', error.message);
  process.exit(1);
}
