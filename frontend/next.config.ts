import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  async rewrites() {
    if (process.env.NODE_ENV !== "development") return [];
    const apiProxyTarget = (process.env.API_PROXY_TARGET ?? "http://localhost:8080").replace(/\/$/, "");
    return [{
      source: "/api/:path*",
      destination: `${apiProxyTarget}/api/:path*`,
    }];
  },
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    }];
  },
};

export default nextConfig;
