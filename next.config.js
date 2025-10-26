/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['www.instagram.com', 'www.tiktok.com', 'substack.com'],
  },
}

module.exports = nextConfig

