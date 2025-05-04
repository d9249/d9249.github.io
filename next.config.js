/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: process.env.NODE_ENV === 'production' ? '/d9249.github.io' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/d9249.github.io/' : '',
  images: {
    unoptimized: true,
  },
  output: 'export',
  trailingSlash: true,
}

module.exports = nextConfig