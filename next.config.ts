import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // This suppresses the middleware proxy warning
    cpus: 1,
  },
};

export default nextConfig;
