'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
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

  const filteredEvents = useMemo(
    () => filterEventsByText(events, search),
    [events, search]
  );
  const total = filteredEvents.length;
  const startIndex = Math.floor(scrollTop / ITEM_HEIGHT);
  const visibleCount = Math.ceil(VIEWPORT_HEIGHT / ITEM_HEIGHT) + 3;
  const endIndex = Math.min(total, startIndex + visibleCount);
  const visibleItems = filteredEvents.slice(startIndex, endIndex);

  return (
    <Card className="h-full gap-0 rounded-2xl border border-white/10 bg-slate-950/70 py-0">
      <CardHeader className="space-y-3 px-4 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="mr-auto text-sm font-semibold text-slate-100">
            Event Timeline
          </CardTitle>
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search person or behavior"
            className="h-8 w-60 rounded-md border-white/10 bg-slate-900 text-xs text-slate-100"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Label className="block space-y-1 text-xs font-medium text-slate-400">
            <span>Min Risk</span>
            <Slider
              min={0}
              max={1}
              step={0.05}
              value={[filter.minRisk]}
              onValueChange={(values) =>
                onFilterChange({ minRisk: values[0] ?? 0 })
              }
              className="w-full"
            />
          </Label>

          <Label className="block space-y-1 text-xs font-medium text-slate-400">
            <span>Max Risk</span>
            <Slider
              min={0}
              max={1}
              step={0.05}
              value={[filter.maxRisk]}
              onValueChange={(values) =>
                onFilterChange({ maxRisk: values[0] ?? 1 })
              }
              className="w-full"
            />
          </Label>
        </div>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 px-4 pb-4">
        <ScrollArea
          className="relative rounded-lg border border-white/10"
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
                  className="absolute left-0 h-auto w-full justify-start rounded-none border-b border-white/10 p-2 text-left transition hover:bg-white/5"
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
                      <p className="text-xs font-semibold text-slate-100">
                        {eventItem.personId}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatTimestamp(eventItem.timestamp)}
                      </p>
                      <p className="mt-1 text-xs text-slate-300">
                        Risk {(eventItem.riskScore * 100).toFixed(0)}%
                      </p>
                      <p className="line-clamp-2 text-xs text-slate-400">
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
