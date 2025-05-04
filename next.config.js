/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // GitHub Pages 배포를 위한 설정
  // 저장소 이름이 username.github.io 형태이므로 basePath와 assetPrefix는 빈 문자열로 설정
  basePath: '',
  assetPrefix: '',
  images: {
    unoptimized: true,
  },
  output: 'export',
  trailingSlash: true,
}

module.exports = nextConfig