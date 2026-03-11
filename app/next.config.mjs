/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // pdf.js needs canvas to be aliased to false in server context
    config.resolve.alias.canvas = false
    return config
  },
}

export default nextConfig;
