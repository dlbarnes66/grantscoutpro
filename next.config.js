// next.config.js
const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ⭐ Force Webpack instead of Turbopack
  // Next.js 16 requires this flag to disable Turbopack
  webpack: (config, { nextRuntime }) => {
    // Prevent Turbopack from taking over
    if (nextRuntime === "edge") return config;

    const existingAlias =
      typeof config.resolve.alias === "object" && config.resolve.alias !== null
        ? config.resolve.alias
        : {};

    config.resolve.alias = Object.assign({}, existingAlias, {
      "@": path.resolve(__dirname, "src"),
      "@/app": path.resolve(__dirname, "src/app"),
      "@/components": path.resolve(__dirname, "src/components"),
      "@/hooks": path.resolve(__dirname, "src/hooks"),
      "@/lib": path.resolve(__dirname, "src/lib"),
      "@/auth": path.resolve(__dirname, "src/auth.ts")
    });

    return config;
  },

  // ⭐ Explicitly disable Turbopack
  // This is the key — without this, Turbopack ignores your aliases
  experimental: {
    turbo: false
  }
};

module.exports = nextConfig;
