const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Enable Turbopack safely
  turbopack: {},

  webpack: (config, { nextRuntime }) => {
    if (nextRuntime === "edge") return config;

    const existingAlias =
      typeof config.resolve.alias === "object" && config.resolve.alias !== null
        ? config.resolve.alias
        : {};

    config.resolve.alias = {
      ...existingAlias,

      "@": path.resolve(__dirname),

      // Correct alias: components live in /components, NOT /src/components
      "@/components": path.resolve(__dirname, "components"),
      "@/hooks": path.resolve(__dirname, "hooks"),

      // lib *is* inside src/lib
      "@/lib": path.resolve(__dirname, "src/lib"),

      // nextauth lives inside src/lib/auth
      "@/auth": path.resolve(__dirname, "src/lib/auth/nextauth.ts")
    };

    return config;
  }
};

module.exports = nextConfig;
