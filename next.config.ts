import type { NextConfig } from "next";

// Backend URL from environment variable (defaults to localhost:8000 for development)
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

// Check if we're in production mode
const isProduction = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // Use standalone output for Docker deployment in production
  output: isProduction ? "standalone" : undefined,

  // Proxy API requests to backend to avoid CORS issues (development only)
  // In production, API calls go directly to api.domain.com
  async rewrites() {
    // Skip rewrites in production - frontend calls API directly
    if (isProduction) {
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
  
  // Allow external images from the backend
  images: {
    remotePatterns: [
      // Development patterns
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
      },
      // Production patterns
      {
        protocol: "https",
        hostname: "api.mediann.de",
      },
      {
        protocol: "https",
        hostname: "admin.mediann.de",
      },
      {
        protocol: "https",
        hostname: "mediann.de",
      },
      // AWS S3 (if used for media storage)
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
      },
    ],
  },

  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

export default nextConfig;
