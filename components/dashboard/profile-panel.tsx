'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { EventLog } from '@/types/event';

interface ProfilePanelProps {
  eventItem: EventLog | null;
}

/**
 * Displays compact person profile and incident context for the latest event.
 */
export function ProfilePanel({ eventItem }: ProfilePanelProps) {
  const riskLabel = eventItem?.riskLevel ?? 'N/A';

  return (
    <Card className="h-full p-4">
      <CardHeader className="p-0">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Profile</CardTitle>
          <Badge variant="outline">DETAILS</Badge>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 p-0 pt-4">
        <p>Person ID: {eventItem?.personId ?? 'N/A'}</p>
        <p>Risk level: {riskLabel}</p>
        <p>Time in zone: {eventItem ? '03:12' : 'N/A'}</p>
        <p>Behavior summary: {eventItem?.message ?? 'No activity yet'}</p>
      </CardContent>
    </Card>
  );
}
