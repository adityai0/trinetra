'use client';

import { useMemo } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { EventLog } from '@/types/event';

interface AnalyticsProps {
  events: EventLog[];
}

/**
 * Displays lightweight monitoring analytics without chart dependencies.
 */
export function Analytics({ events }: AnalyticsProps) {
  const metrics = useMemo(() => {
    const total = events.length;
    const highRisk = events.filter(
      (eventItem) => eventItem.riskLevel === 'high'
    ).length;
    const zoneViolationsPercent =
      total > 0 ? Math.round((highRisk / total) * 100) : 0;
    const uniquePeople = new Set(events.map((eventItem) => eventItem.personId))
      .size;

    return {
      total,
      highRisk,
      zoneViolationsPercent,
      uniquePeople,
    };
  }, [events]);

  return (
    <Card className="p-4">
      <CardHeader className="p-0">
        <CardTitle>Analytics</CardTitle>
      </CardHeader>

      <CardContent className="grid grid-cols-1 gap-3 p-0 pt-4 md:grid-cols-2 lg:grid-cols-4">
        <p>Zone violations: {metrics.zoneViolationsPercent}%</p>
        <p>Total incidents: {metrics.total}</p>
        <p>High-risk count: {metrics.highRisk}</p>
        <p>Unique profiles: {metrics.uniquePeople}</p>
      </CardContent>
    </Card>
  );
}
