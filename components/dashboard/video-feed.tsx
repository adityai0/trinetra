'use client';

import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

/**
 * Displays the backend MJPEG stream for the primary camera.
 */
export function VideoFeed() {
  const [hasStreamError, setHasStreamError] = useState(false);
  const streamUrl = useMemo(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
    return `${apiBase}/video_feed`;
  }, []);

  return (
    <Card className="flex h-full flex-col gap-4 p-4 bg-[#0e0e0e] text-[#c6c6c7]">
      <div className="flex items-center justify-between">
        <p>LIVE MONITORING</p>
        <Badge variant="secondary">CAMERA 01</Badge>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden border">
        <img
          src={streamUrl}
          alt="Live surveillance stream"
          className="h-full w-full object-cover"
          onLoad={() => setHasStreamError(false)}
          onError={() => setHasStreamError(true)}
        />

        {hasStreamError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <p>Unable to load live stream.</p>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
