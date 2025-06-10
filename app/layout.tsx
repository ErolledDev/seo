import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Dynamic SEO Redirects - Meta Tag Optimization System',
  description: 'Create unique, indexable landing pages with dynamic meta tags for optimal SEO performance and search engine visibility.',
  keywords: 'SEO, meta tags, redirects, dynamic pages, search engine optimization, indexable pages',
  authors: [{ name: 'SEO Redirects System' }],
  openGraph: {
    title: 'Dynamic SEO Redirects - Meta Tag Optimization System',
    description: 'Create unique, indexable landing pages with dynamic meta tags for optimal SEO performance.',
    type: 'website',
    siteName: 'SEO Redirects',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dynamic SEO Redirects - Meta Tag Optimization System',
    description: 'Create unique, indexable landing pages with dynamic meta tags for optimal SEO performance.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}