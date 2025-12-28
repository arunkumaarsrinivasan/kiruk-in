import type { NextConfig } from "next";

if (process.env.NODE_ENV === "development") {
  const filteredCodes = new Set(["DEP0040"]);
  const filteredTerms = ["punycode"];

  process.on("warning", (warning) => {
    const message = warning?.message ?? "";
    const warningCode = (warning as NodeJS.ErrnoException)?.code ?? "";
    const shouldFilter =
      filteredCodes.has(warningCode) ||
      filteredTerms.some((term) => message.includes(term));

    if (!shouldFilter) {
      console.warn(warning);
    }
  });
}

const nextConfig: NextConfig = {
  serverExternalPackages: ["punycode"],
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Compression
  compress: true,
  
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react', '@hackernoon/pixel-icon-library'],
  },
};

export default nextConfig;
