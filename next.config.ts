import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000, // 1 year — images are immutable hashed assets
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [38, 64, 96, 110, 128, 170, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  serverExternalPackages: ["@libsql/client", "bcryptjs"],
};

export default nextConfig;

