import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import RedirectPage from '@/components/RedirectPage';

interface SearchParams {
  title?: string;
  desc?: string;
  image?: string;
  url?: string;
  keywords?: string;
  site_name?: string;
  type?: string;
}

interface Props {
  searchParams: SearchParams;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { title, desc, image, url, keywords, site_name, type } = searchParams;

  // If no parameters are provided, return default metadata
  if (!title && !desc && !url) {
    return {
      title: 'Redirect Page',
      description: 'Dynamic redirect page',
    };
  }

  const currentUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/u?${new URLSearchParams(searchParams as Record<string, string>).toString()}`;

  return {
    title: title || 'Redirect Page',
    description: desc || 'Dynamic redirect page',
    keywords: keywords || undefined,
    openGraph: {
      title: title || 'Redirect Page',
      description: desc || 'Dynamic redirect page',
      url: currentUrl,
      siteName: site_name || 'Dynamic Redirects',
      type: (type as any) || 'website',
      images: image ? [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title || 'Redirect Page',
        }
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: title || 'Redirect Page',
      description: desc || 'Dynamic redirect page',
      images: image ? [image] : undefined,
    },
    alternates: {
      canonical: currentUrl,
    },
  };
}

export default function RedirectRoute({ searchParams }: Props) {
  const { title, desc, image, url, keywords, site_name, type } = searchParams;

  // If no parameters are provided, show a 404 or default page
  if (!title && !desc && !url) {
    notFound();
  }

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RedirectPage
        title={title}
        description={desc}
        image={image}
        targetUrl={url}
        keywords={keywords}
        siteName={site_name}
        type={type}
      />
    </Suspense>
  );
}