import type { Metadata } from 'next';
import { Fraunces, Newsreader } from 'next/font/google';
import { RevealObserver } from '@/components/RevealObserver';
import { site } from '@/content/site';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--font-fraunces',
  display: 'swap',
});

const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--font-newsreader',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://genevievebosah.com'),
  title: site.meta.title,
  description: site.hero.lead,
  alternates: { canonical: '/' },
  openGraph: {
    title: site.meta.title,
    description: site.hero.lead,
    url: '/',
    siteName: `${site.brand.first} ${site.brand.last}`,
    locale: 'en_GB',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${newsreader.variable}`}>
      <body>
        {children}
        <RevealObserver />
      </body>
    </html>
  );
}
