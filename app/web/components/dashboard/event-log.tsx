'use client';

import { useMemo } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { EventLog as EventLogEntry } from '@/types/event';
import { formatTimestamp } from '@/utils/format';

interface EventLogProps {
  events: EventLogEntry[];
  isLoading: boolean;
  isDisconnected: boolean;
}

/**
 * Displays a scrollable real-time event log with loading and empty states.
 */
export function EventLog({ events, isLoading, isDisconnected }: EventLogProps) {
  const orderedEvents = useMemo(
    () =>
      [...events].sort(
        (a, b) => +new Date(b.timestamp) - +new Date(a.timestamp)
      ),
    [events]
  );

  return (
    <Card className="h-full p-4">
      <CardHeader className="p-0">
        <CardTitle>REAL-TIME EVENT LOG</CardTitle>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 p-0">
        <ScrollArea className="h-full">
          <div className="flex flex-col gap-4 pt-4">
            {isLoading ? <p>Loading events...</p> : null}
            {isDisconnected ? <p>Connection lost</p> : null}
            {!isLoading && !isDisconnected && orderedEvents.length === 0 ? (
              <p>No events yet</p>
            ) : null}

            {orderedEvents.map((eventItem) => (
              <div key={eventItem._id} className="flex flex-col gap-1">
                <p>[{formatTimestamp(eventItem.timestamp)}]</p>
                <p>
                  {eventItem.riskLevel.toUpperCase()}: {eventItem.message}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
