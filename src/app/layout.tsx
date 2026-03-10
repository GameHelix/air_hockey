import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Air Hockey — Neon Arena',
  description: 'A fast-paced neon air hockey game with AI opponent. Play in your browser!',
  icons: {
    icon: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0a14',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="antialiased h-full bg-[#0a0a14]" style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
