import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import '../globals.css';
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

const contentIsProduction = process.env.CONTENT_MODE === 'production';
const gaId = process.env.NEXT_PUBLIC_GA_ID?.trim();

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://globdot.com'),
  title: 'Globdot — One world. Every angle.',
  description: 'Independent global news, context and analysis connecting the events shaping our world.',
  icons: {
    icon: '/globdot-icon.svg',
    shortcut: '/globdot-icon.svg',
    apple: '/globdot-icon.svg',
  },
  openGraph: {
    title: 'Globdot — One world. Every angle.',
    description: 'Independent global news, context and analysis connecting the events shaping our world.',
    url: 'https://globdot.com',
    siteName: 'Globdot',
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Globdot — One world. Every angle.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Globdot — One world. Every angle.',
    description: 'Independent global news, context and analysis connecting the events shaping our world.',
    images: ['/og.png'],
  },
  robots: contentIsProduction
    ? { index: true, follow: true }
    : { index: false, follow: false, nocache: true },
};

export default function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {Boolean(gaId) && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}');
                `,
              }}
            />
          </>
        )}
        <SiteHeader />
        {children}
        <SiteFooter />
        <AnalyticsBeacon />
      </body>
    </html>
  );
}
