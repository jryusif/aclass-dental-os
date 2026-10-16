/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
  env: {
    DATABASE_URL:
      process.env.DATABASE_URL ||
      'postgresql://neondb_owner:npg_L1QxBiHJRf6T@ep-little-bird-b45navj8-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require',
    DIRECT_URL:
      process.env.DIRECT_URL ||
      'postgresql://neondb_owner:npg_L1QxBiHJRf6T@ep-little-bird-b45navj8.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'aclass-dental-os-secure-token-2026-kom-ombo',
    NEXT_PUBLIC_APP_NAME: 'Cairo Dental Center',
  },
};

export default nextConfig;
