import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      // Service Worker: nunca cachear (debe actualizarse siempre)
      {
        source: "/sw.js",
        headers: [
          { key: "Service-Worker-Allowed", value: "/" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
      // Iconos PWA: cache 1 año (cambios via hash de nombre)
      {
        source: "/icons/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // Figuras SVG decorativas: cache 1 semana (pueden actualizarse)
      {
        source: "/figuras/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" },
        ],
      },
      // Screenshots PWA manifest: cache 1 semana
      {
        source: "/screenshots/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" },
        ],
      },
    ];
  },
};

export default nextConfig;
