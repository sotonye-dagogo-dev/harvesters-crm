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
};

export default nextConfig;
