import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: false,
  reactCompiler: false,
  experimental: {
    optimizePackageImports: ['antd'],
  },
  transpilePackages: ['antd', '@ant-design/cssinjs'],
  allowedDevOrigins: ['*.replit.dev', '*.repl.co', '*.riker.replit.dev'],
};

export default nextConfig;
