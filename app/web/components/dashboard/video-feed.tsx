'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';

/**
 * Displays the primary live feed area with minimal detection overlays.
 */
export function VideoFeed() {
  return (
    <Card className="gap-4 p-4">
      <div className="flex items-center justify-between">
        <p>LIVE MONITORING</p>
        <Badge variant="outline">CAMERA 01</Badge>
      </div>

      <AspectRatio ratio={16 / 9}>
        <div className="relative flex h-full w-full items-center justify-center border">
          <p>No live stream</p>

          <div
            className="absolute left-8 top-8 h-24 w-24 border"
            aria-hidden="true"
          />
          <Badge className="absolute left-8 top-3" variant="outline">
            ID: P-102
          </Badge>
          <Badge className="absolute left-8 top-32" variant="outline">
            ZONE: A1
          </Badge>
        </div>
      </AspectRatio>
    </Card>
  );
}
