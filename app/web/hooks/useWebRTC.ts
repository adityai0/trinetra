'use client';

import { useEffect, useState } from 'react';

import { createMockStream } from '@/services/webrtc';
import { useVideoStore } from '@/store/useVideoStore';
import type { Detection } from '@/types';

/**
 * Handles stream provisioning and produces synthetic detections for overlay rendering.
 */
export function useWebRTC(): {
  stream: MediaStream | null;
} {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const setStreaming = useVideoStore((state) => state.setStreaming);
  const setDetections = useVideoStore((state) => state.setDetections);

  useEffect(() => {
    let mounted = true;
    let intervalId: number | null = null;

    const initialize = async () => {
      const mediaStream = await createMockStream();

      if (!mounted) {
        return;
      }

      setStream(mediaStream);
      setStreaming(Boolean(mediaStream));

      intervalId = window.setInterval(() => {
        setDetections(generateDetections());
      }, 1000);
    };

    void initialize();

    return () => {
      mounted = false;

      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }

      setStreaming(false);
      setDetections([]);
    };
  }, [setDetections, setStreaming]);

  return { stream };
}

function generateDetections(): Detection[] {
  const entries = Math.floor(Math.random() * 3) + 2;

  return Array.from({ length: entries }).map((_, index) => {
    const x = 80 + Math.random() * 900;
    const y = 80 + Math.random() * 420;
    const width = 90 + Math.random() * 55;
    const height = 130 + Math.random() * 60;

    return {
      id: `det-${index}-${Math.floor(Math.random() * 9999)}`,
      personId: `P-${100 + index}`,
      riskScore: Number((0.2 + Math.random() * 0.8).toFixed(2)),
      box: { x, y, width, height },
      trajectory: Array.from({ length: 8 }).map((__, step) => ({
        x: x - step * 14,
        y: y + step * 6,
      })),
    };
  });
}
