/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
  webpack: (config) => {
    return config;
  },
};

module.exports = nextConfig;
