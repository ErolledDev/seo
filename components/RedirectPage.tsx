'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Clock, ArrowRight } from 'lucide-react';
import Image from 'next/image';

interface RedirectPageProps {
  title?: string;
  description?: string;
  image?: string;
  targetUrl?: string;
  keywords?: string;
  siteName?: string;
  type?: string;
}

export default function RedirectPage({
  title,
  description,
  image,
  targetUrl,
  keywords,
  siteName,
  type,
}: RedirectPageProps) {
  const [countdown, setCountdown] = useState(5);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!targetUrl) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsRedirecting(true);
          window.location.href = targetUrl;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetUrl]);

  const handleRedirectNow = () => {
    if (targetUrl) {
      setIsRedirecting(true);
      window.location.href = targetUrl;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          {siteName && (
            <Badge variant="secondary\" className="w-fit mx-auto mb-2">
              {siteName}
            </Badge>
          )}
          <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
            {title || 'Redirecting...'}
          </CardTitle>
          {description && (
            <CardDescription className="text-lg text-gray-600 mt-2">
              {description}
            </CardDescription>
          )}
          {type && (
            <Badge variant="outline" className="w-fit mx-auto mt-2 capitalize">
              {type}
            </Badge>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {image && (
            <div className="relative w-full h-64 rounded-lg overflow-hidden">
              <Image
                src={image}
                alt={title || 'Redirect preview'}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          )}

          {keywords && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">Related Topics:</h3>
              <div className="flex flex-wrap gap-2">
                {keywords.split(',').map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {keyword.trim()}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {targetUrl && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  {isRedirecting ? 'Redirecting now...' : `Redirecting in ${countdown} seconds`}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={handleRedirectNow}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                  disabled={isRedirecting}
                >
                  {isRedirecting ? (
                    'Redirecting...'
                  ) : (
                    <>
                      Continue Now
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => window.open(targetUrl, '_blank')}
                  className="px-6 py-2"
                >
                  Open in New Tab
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500 break-all">
                  Destination: {targetUrl}
                </p>
              </div>
            </div>
          )}

          {!targetUrl && (
            <div className="text-center text-gray-500">
              <p>This is a preview of your redirect page.</p>
              <p className="text-sm mt-1">Add a target URL to enable redirection.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
