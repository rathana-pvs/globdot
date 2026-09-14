import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { AnalyticsBeacon } from '@/components/analytics-beacon';

const geistSans = Geist({
  variable: '--font-ui',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://globdot.com'),
  title: 'Globdot — One world. Every angle.',
  description: 'Independent global news, context and analysis connecting the events shaping our world.',
  openGraph: { title: 'Globdot — One world. Every angle.', description: 'Independent global news, context and analysis connecting the events shaping our world.', url: 'https://globdot.com', siteName: 'Globdot', type: 'website', images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Globdot — One world. Every angle.' }] },
  twitter: { card: 'summary_large_image', title: 'Globdot — One world. Every angle.', description: 'Independent global news, context and analysis connecting the events shaping our world.', images: ['/og.png'] },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}><SiteHeader />{children}<SiteFooter /><AnalyticsBeacon /></body>
    </html>
  );
}
