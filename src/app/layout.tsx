import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: '터미널 포트폴리오',
  description: '이상민 포트폴리오 웹사이트에 오신 것을 환영합니다! 프로젝트, 기술 스택 및 연락처 정보를 탐색해 보세요.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <div className="h-screen w-screen flex justify-center items-start">
          {children}
        </div>
      </body>
    </html>
  );
}