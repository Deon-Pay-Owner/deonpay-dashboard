/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Optimize CSS compilation for production
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  compress: true,
  // Ensure Tailwind CSS is properly compiled
  transpilePackages: [],
  // Force clean build - Nov 19, 2025
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },
}

module.exports = nextConfig
