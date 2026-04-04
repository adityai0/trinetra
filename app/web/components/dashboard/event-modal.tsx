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
          className="grid max-w-5xl gap-4 border-white/10 bg-slate-900 p-4 sm:max-w-5xl md:grid-cols-[2fr_1fr]"
        >
          <DialogTitle className="sr-only">Incident Detail</DialogTitle>
          <DialogDescription className="sr-only">
            Detailed playback and metadata for the selected incident.
          </DialogDescription>

          <Card className="gap-0 overflow-hidden rounded-xl border border-white/10 bg-black py-0">
            <video
              controls
              autoPlay
              muted
              className="aspect-video h-full w-full object-cover"
              src={event.videoUrl}
            />
          </Card>

          <Card className="rounded-xl border border-white/10 bg-slate-950/70">
            <CardHeader className="px-4 pt-4 pb-2">
              <CardTitle className="text-sm font-semibold text-slate-100">
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
              <p className="text-xs text-slate-300">ID: {event.id}</p>
              <p className="text-xs text-slate-300">Person: {event.personId}</p>
              <p className="text-xs text-slate-400">
                {formatTimestamp(event.timestamp)}
              </p>
              <p className="text-xs leading-relaxed text-slate-300">
                {event.description}
              </p>
              <Button
                type="button"
                onClick={onClose}
                className="mt-4 w-full bg-cyan-500 text-slate-950 hover:bg-cyan-400"
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
