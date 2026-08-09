const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

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

      "@/components": path.resolve(__dirname, "components"),
      "@/hooks": path.resolve(__dirname, "hooks"),
      "@/lib": path.resolve(__dirname, "src/lib")
    };

    return config;
  },

  // Prevent Next.js from rewriting tsconfig.json
  typescript: {
    tsconfigPath: "./tsconfig.json"
  }
};

module.exports = nextConfig;
