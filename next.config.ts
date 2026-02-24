import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // This suppresses the middleware proxy warning
    cpus: 1,
  },
  // Reduce build output
  productionBrowserSourceMaps: false,
  // Optimize output
  compress: true,
  images: {
    // Allow local images from public folder
    remotePatterns: [],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
