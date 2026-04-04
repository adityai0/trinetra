'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Image from 'next/image';
import { useMemo, useState } from 'react';

import { filterEventsByText } from '@/features/events';
import type { EventFilter, EventItem } from '@/types';
import { formatTimestamp } from '@/utils/format';

interface EventTimelineProps {
  events: EventItem[];
  filter: EventFilter;
  onFilterChange: (filter: Partial<EventFilter>) => void;
  onSelectEvent: (event: EventItem) => void;
}

const ITEM_HEIGHT = 106;
const VIEWPORT_HEIGHT = 480;

/**
 * Renders a virtualized event timeline with risk/time filters and quick selection.
 */
export function EventTimeline({
  events,
  filter,
  onFilterChange,
  onSelectEvent,
}: EventTimelineProps) {
  const [search, setSearch] = useState('');
  const [scrollTop, setScrollTop] = useState(0);
  const riskBucket = useMemo(() => {
    if (filter.minRisk >= 0.75) {
      return 'high';
    }

    if (filter.minRisk >= 0.45) {
      return 'medium';
    }

    return 'all';
  }, [filter.minRisk]);

  const filteredEvents = useMemo(
    () => filterEventsByText(events, search),
    [events, search]
  );
  const total = filteredEvents.length;
  const startIndex = Math.floor(scrollTop / ITEM_HEIGHT);
  const visibleCount = Math.ceil(VIEWPORT_HEIGHT / ITEM_HEIGHT) + 3;
  const endIndex = Math.min(total, startIndex + visibleCount);
  const visibleItems = filteredEvents.slice(startIndex, endIndex);

  const handleRiskFilterChange = (value: string) => {
    if (value === 'high') {
      onFilterChange({ minRisk: 0.75, maxRisk: 1 });
      return;
    }

    if (value === 'medium') {
      onFilterChange({ minRisk: 0.45, maxRisk: 1 });
      return;
    }

    onFilterChange({ minRisk: 0, maxRisk: 1 });
  };

  return (
    <Card className="h-full gap-0 rounded-2xl py-0">
      <CardHeader className="space-y-3 px-4 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="mr-auto text-sm font-semibold">
            Event Timeline
          </CardTitle>
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search person or behavior"
            className="h-8 w-60 rounded-md text-xs"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Label className="space-y-1 text-xs font-medium text-muted-foreground">
            <span>Risk Filter</span>
            <Select value={riskBucket} onValueChange={handleRiskFilterChange}>
              <SelectTrigger className="h-8 w-full rounded-md text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risks</SelectItem>
                <SelectItem value="medium">Medium and High</SelectItem>
                <SelectItem value="high">High Only</SelectItem>
              </SelectContent>
            </Select>
          </Label>

          <Label className="space-y-1 text-xs font-medium text-muted-foreground">
            <span>Window</span>
            <Select
              value={filter.from ? 'custom' : 'all'}
              onValueChange={(value) =>
                onFilterChange(
                  value === 'custom'
                    ? {
                        from: new Date(
                          Date.now() - 30 * 60 * 1000
                        ).toISOString(),
                      }
                    : { from: undefined, to: undefined }
                )
              }
            >
              <SelectTrigger className="h-8 w-full rounded-md text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="custom">Last 30 Minutes</SelectItem>
              </SelectContent>
            </Select>
          </Label>
        </div>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 px-4 pb-4">
        <ScrollArea
          className="relative rounded-lg border"
          style={{ height: VIEWPORT_HEIGHT }}
          onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
        >
          <div style={{ height: total * ITEM_HEIGHT, position: 'relative' }}>
            {visibleItems.map((eventItem, index) => {
              const absoluteIndex = startIndex + index;

              return (
                <Button
                  type="button"
                  key={eventItem.id}
                  variant="ghost"
                  onClick={() => onSelectEvent(eventItem)}
                  className="absolute left-0 h-auto w-full justify-start rounded-none border-b p-2 text-left"
                  style={{
                    top: absoluteIndex * ITEM_HEIGHT,
                    height: ITEM_HEIGHT,
                  }}
                >
                  <div className="grid h-full w-full grid-cols-[96px_1fr] gap-2">
                    <Image
                      src={eventItem.thumbnailUrl}
                      alt={eventItem.id}
                      width={96}
                      height={90}
                      unoptimized
                      className="h-full w-full rounded-md object-cover"
                    />
                    <div>
                      <p className="text-xs font-semibold">
                        {eventItem.personId}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimestamp(eventItem.timestamp)}
                      </p>
                      <p className="mt-1 text-xs">
                        Risk {(eventItem.riskScore * 100).toFixed(0)}%
                      </p>
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {eventItem.description}
                      </p>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
