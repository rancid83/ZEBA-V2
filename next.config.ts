import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  reactCompiler: false,
  experimental: {
    optimizePackageImports: ['antd'],
  },
  transpilePackages: ['antd', '@ant-design/cssinjs'],
};

export default nextConfig;
