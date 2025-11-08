import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@sanity/insert-menu', '@sanity/ui'],
  
  // Suppress punycode deprecation warnings
  serverExternalPackages: ['punycode'],
  
  // Turbopack configuration (now stable)
  turbopack: {
    resolveAlias: {
      'react-is': require.resolve('react-is'),
    },
  },
  
  webpack(config, { dev, isServer }) {
    // Suppress punycode deprecation warnings
    if (dev) {
      config.ignoreWarnings = [
        /punycode/,
        /DEP0040/
      ];
    }
    
    // Only apply webpack config when not using turbopack (production builds)
    if (process.env.NODE_ENV === 'production') {
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
    }
    
    return config;
  },
};

export default nextConfig;
