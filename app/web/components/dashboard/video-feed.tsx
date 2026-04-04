'use client';

import { useEffect, useRef } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { Detection } from '@/types';

import { Overlay } from './overlay';

interface VideoFeedProps {
  stream: MediaStream | null;
  detections: Detection[];
}

/**
 * Hosts the live video element and detection overlay composition.
 */
export function VideoFeed({ stream, detections }: VideoFeedProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const element = videoRef.current;

    if (!element) {
      return;
    }

    element.srcObject = stream;
  }, [stream]);

  return (
    <Card className="relative gap-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-950 py-0 shadow-[0_24px_60px_-28px_rgba(14,116,144,0.7)]">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="aspect-video w-full object-cover"
      />
      <Overlay detections={detections} />
      <Badge
        variant="outline"
        className="pointer-events-none absolute left-4 top-4 rounded-full border-cyan-300/40 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-100"
      >
        Live Stream
      </Badge>
    </Card>
  );
}
