import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@sanity/insert-menu', '@sanity/ui'],
  webpack(config, { dev, isServer }) {
    // Add react-is to resolve fallback for client-side bundles
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'react-is': require.resolve('react-is'),
      };
    }
    
    // Ensure react-is is properly resolved
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-is': require.resolve('react-is'),
    };
    
    return config;
  },
};

export default nextConfig;
