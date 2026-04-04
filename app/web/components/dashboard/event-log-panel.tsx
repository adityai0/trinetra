'use client';

import { useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { filterEventsByText } from '@/features/events';
import type { EventItem } from '@/types';
import { formatTimestamp, riskToneClass } from '@/utils/format';

interface EventLogPanelProps {
  events: EventItem[];
  isLoading: boolean;
  hasError: boolean;
}

/**
 * Displays real-time event logs.
 */
export function EventLogPanel({
  events,
  isLoading,
  hasError,
}: EventLogPanelProps) {
  const [search, setSearch] = useState('');

  const filteredEvents = useMemo(
    () =>
      filterEventsByText(events, search).sort(
        (a, b) => +new Date(b.timestamp) - +new Date(a.timestamp)
      ),
    [events, search]
  );

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Event Log</CardTitle>
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search events"
        />
      </CardHeader>

      <CardContent className="min-h-0 flex-1">
        <ScrollArea className="h-full">
          <div className="grid gap-2">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading events...</p>
            ) : null}
            {hasError ? (
              <p className="text-sm text-destructive">Unable to load events.</p>
            ) : null}

            {!isLoading && !hasError && filteredEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No events yet.</p>
            ) : null}

            {filteredEvents.map((eventItem) => (
              <Button
                key={eventItem.id}
                type="button"
                variant="outline"
                className="h-auto justify-start rounded-xl"
              >
                <div className="grid w-full gap-1 py-1 text-left">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{eventItem.personId}</p>
                    <Badge
                      variant="outline"
                      className={`text-xs ${riskToneClass(eventItem.riskScore)}`}
                    >
                      {(eventItem.riskScore * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatTimestamp(eventItem.timestamp)}
                  </p>
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {eventItem.description}
                  </p>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
