/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // GitHub Pages 배포를 위한 설정
  // username.github.io 저장소에 배포하므로 basePath와 assetPrefix는 빈 문자열로 설정
  output: 'export',  // 정적 HTML 내보내기 설정
  images: {
    unoptimized: true,  // 이미지 최적화 비활성화 (GitHub Pages에 필요)
  },
  trailingSlash: true,  // 각 페이지 끝에 슬래시 추가
}

module.exports = nextConfig