import type { NextConfig } from "next";

// When BACKEND_PROXY_TARGET is set, same-origin /api/* requests are proxied to the
// backend. This lets the app run behind a single public origin (e.g. a tunnel or a
// single reverse proxy) without CORS. Unset in normal local dev (direct API URL).
const backendProxyTarget = process.env.BACKEND_PROXY_TARGET;

const nextConfig: NextConfig = {
  async rewrites() {
    if (!backendProxyTarget) return [];
    return [
      {
        source: "/api/:path*",
        destination: `${backendProxyTarget}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
