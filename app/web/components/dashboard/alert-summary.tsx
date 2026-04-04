'use client';

import { useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { EventLog } from '@/types/event';

interface AlertSummaryProps {
  events: EventLog[];
  isLoading: boolean;
  isDisconnected: boolean;
}

/**
 * Displays a compact alert summary with priority context and key stats.
 */
export function AlertSummary({
  events,
  isLoading,
  isDisconnected,
}: AlertSummaryProps) {
  const orderedEvents = useMemo(
    () =>
      [...events].sort(
        (a, b) => +new Date(b.timestamp) - +new Date(a.timestamp)
      ),
    [events]
  );

  const latestEvent = orderedEvents[0] ?? null;
  const intrusionsToday = orderedEvents.filter((eventItem) => {
    const eventDate = new Date(eventItem.timestamp);
    const now = new Date();

    return (
      eventDate.getFullYear() === now.getFullYear() &&
      eventDate.getMonth() === now.getMonth() &&
      eventDate.getDate() === now.getDate()
    );
  }).length;

  const highRiskCount = orderedEvents.filter(
    (eventItem) => eventItem.riskLevel === 'high'
  ).length;

  const averageScore =
    orderedEvents.length > 0
      ? orderedEvents.reduce((sum, eventItem) => {
          if (eventItem.riskLevel === 'high') {
            return sum + 0.9;
          }

          if (eventItem.riskLevel === 'medium') {
            return sum + 0.6;
          }

          return sum + 0.3;
        }, 0) / orderedEvents.length
      : 0;

  return (
    <Card className="h-full p-4">
      <CardHeader className="p-0">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>ALERT</CardTitle>
          <Badge variant="outline">SUMMARY</Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0 pt-4">
        {isLoading ? <p>Loading alert summary...</p> : null}
        {isDisconnected ? <p>Connection lost</p> : null}

        {!isLoading && !isDisconnected ? (
          <div className="flex flex-col gap-4">
            <p>Suspicious individual detected</p>

            <div className="flex flex-col gap-2">
              <p>Person ID: {latestEvent?.personId ?? 'N/A'}</p>
              <p>Risk level: {latestEvent?.riskLevel ?? 'N/A'}</p>
            </div>

            <ul className="flex flex-col gap-1">
              <li>{latestEvent?.message ?? 'No event details yet'}</li>
              <li>Latest feed synchronized</li>
              <li>Monitoring active</li>
            </ul>

            <Separator />

            <div className="grid grid-cols-1 gap-2">
              <p>Intrusions today: {intrusionsToday}</p>
              <p>High-risk alerts: {highRiskCount}</p>
              <p>Avg score: {Math.round(averageScore * 100)}%</p>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
