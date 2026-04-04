'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import type { EventItem } from '@/types';
import { formatTimestamp, riskToneClass } from '@/utils/format';

interface EventModalProps {
  event: EventItem | null;
  onClose: () => void;
}

/**
 * Shows detailed incident context, metadata, and replay media for a selected event.
 */
export function EventModal({ event, onClose }: EventModalProps) {
  const open = Boolean(event);

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      {event ? (
        <DialogContent
          showCloseButton
          className="grid max-w-5xl gap-4 p-4 sm:max-w-5xl md:grid-cols-[2fr_1fr]"
        >
          <DialogTitle className="sr-only">Incident Detail</DialogTitle>
          <DialogDescription className="sr-only">
            Detailed playback and metadata for the selected incident.
          </DialogDescription>

          <Card className="gap-0 overflow-hidden rounded-xl py-0">
            <video
              controls
              autoPlay
              muted
              className="aspect-video h-full w-full object-cover"
              src={event.videoUrl}
            />
          </Card>

          <Card className="rounded-xl">
            <CardHeader className="px-4 pt-4 pb-2">
              <CardTitle className="text-sm font-semibold">
                Incident Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-4 pb-4">
              <Badge
                variant="outline"
                className={`h-auto rounded-lg p-2 text-xs ${riskToneClass(event.riskScore)}`}
              >
                Risk {(event.riskScore * 100).toFixed(0)}%
              </Badge>
              <p className="text-xs">ID: {event.id}</p>
              <p className="text-xs">Person: {event.personId}</p>
              <p className="text-xs text-muted-foreground">
                {formatTimestamp(event.timestamp)}
              </p>
              <p className="text-xs leading-relaxed text-foreground">
                {event.description}
              </p>
              <Button
                type="button"
                variant="default"
                onClick={onClose}
                className="mt-4 w-full"
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
