import type { NextConfig } from "next";

import { MAX_IMAGE_SIZE_MB } from "./lib/constants";

const nextConfig: NextConfig = {
  // Pin the workspace root — otherwise Turbopack walks up and picks up the
  // package-lock.json in the home directory.
  turbopack: { root: __dirname },
  // The floating dev badge sits over the sidebar's account row, which puts it
  // in every screenshot taken while measuring a frame.
  devIndicators: false,
  experimental: {
    // `forbidden()` is how a section layout turns a missing permission into a
    // 403 screen; it is still behind this flag.
    authInterrupts: true,
    serverActions: {
      bodySizeLimit: `${MAX_IMAGE_SIZE_MB + 1}mb`,
    },
  },
  allowedDevOrigins: ['192.168.1.114'],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: `/${/^cloudinary:\/\/[^:@/]+:[^:@/]+@([^:@/]+)$/.exec(process.env.CLOUDINARY_URL ?? "")?.[1] ?? "*"}/**`,
      },
    ],
  },
};

export default nextConfig;
