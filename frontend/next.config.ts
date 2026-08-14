import type { NextConfig } from "next";

// Ensure CLERK_SECRET_KEY fallback in dev if missing
if (!process.env.CLERK_SECRET_KEY) {
  process.env.CLERK_SECRET_KEY = "sk_test_placeholder_clerk_secret_key";
}

const nextConfig: NextConfig = {
  env: {
    CLERK_SECRET_KEY:
      process.env.CLERK_SECRET_KEY || "sk_test_placeholder_clerk_secret_key",
  },
  images: {
    qualities: [75, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.aceternity.com",
      },
    ],
  },
};

export default nextConfig;
