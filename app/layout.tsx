import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '星見練習本',
  description: '手機優先的兒童英文與注音練習 PWA',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: '星見練習本',
    statusBarStyle: 'default'
  }
};

export const viewport: Viewport = {
  themeColor: '#FFF8EC',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
