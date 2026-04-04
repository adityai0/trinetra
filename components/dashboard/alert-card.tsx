'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Alert } from '@/types';
import { formatTimestamp, riskToneClass } from '@/utils/format';

interface AlertCardProps {
  alert: Alert;
}

/**
 * Displays a single incident alert with confidence and model reasoning.
 */
export function AlertCard({ alert }: AlertCardProps) {
  return (
    <Card className={`rounded-xl border p-3 ${riskToneClass(alert.riskScore)}`}>
      <CardContent className="space-y-2 px-0 py-0">
        <div className="flex items-center justify-between text-xs">
          <p className="font-semibold">{alert.personId}</p>
          <p className="text-muted-foreground">
            {formatTimestamp(alert.timestamp)}
          </p>
        </div>
        <Badge
          variant="outline"
          className="h-auto border-current bg-transparent px-2 py-0.5 text-sm font-semibold"
        >
          Risk {(alert.riskScore * 100).toFixed(0)}%
        </Badge>
        <p className="text-xs leading-relaxed text-foreground">
          {alert.explanation}
        </p>
      </CardContent>
    </Card>
  );
}
