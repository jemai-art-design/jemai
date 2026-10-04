import type { NextConfig } from "next";

import { MAX_IMAGE_SIZE_MB } from "./lib/constants";

// Uploads go to the account in CLOUDINARY_URL, but the space photography in
// `lib/spaces.ts` is hosted on a separate account, so both clouds are served.
const uploadCloudName = /^cloudinary:\/\/[^:@/]+:[^:@/]+@([^:@/]+)$/.exec(process.env.CLOUDINARY_URL ?? "")?.[1] ?? "*";
const cloudNames = [...new Set([uploadCloudName, "iwhhzsrd"])];

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
    remotePatterns: cloudNames.map((cloudName) => ({
      protocol: "https" as const,
      hostname: "res.cloudinary.com",
      pathname: `/${cloudName}/**`,
    })),
  },
};

export default nextConfig;
