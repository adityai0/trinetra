'use client';

import { useEffect, useState } from 'react';

import { useVideoStore } from '@/store/useVideoStore';

/**
 * Handles camera stream provisioning for the live feed.
 */
export function useWebRTC(): {
  stream: MediaStream | null;
} {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const setStreaming = useVideoStore((state) => state.setStreaming);
  const setDetections = useVideoStore((state) => state.setDetections);

  useEffect(() => {
    let mounted = true;
    let activeStream: MediaStream | null = null;

    const initialize = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        if (!mounted) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }

        activeStream = mediaStream;
        setStream(mediaStream);
        setStreaming(true);
      } catch {
        if (!mounted) {
          return;
        }

        setStream(null);
        setStreaming(false);
      }
    };

    void initialize();

    return () => {
      mounted = false;

      activeStream?.getTracks().forEach((track) => track.stop());

      setStreaming(false);
      setDetections([]);
    };
  }, [setDetections, setStreaming]);

  return { stream };
}
