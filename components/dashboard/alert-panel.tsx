'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { sortAlerts } from '@/features/alerts';
import type { Alert } from '@/types';

import { AlertCard } from './alert-card';

interface AlertPanelProps {
  alerts: Alert[];
}

/**
 * Renders animated realtime alerts and a transient toast stack for fresh incidents.
 */
export function AlertPanel({ alerts }: AlertPanelProps) {
  const ordered = useMemo(() => sortAlerts(alerts), [alerts]);
  const toasts = ordered.slice(0, 3);

  return (
    <Card className="relative h-full gap-0 rounded-2xl py-0">
      <CardHeader className="flex flex-row items-center justify-between px-4 py-4">
        <CardTitle className="text-sm font-semibold">Live Alerts</CardTitle>
        <Badge variant="outline" className="text-xs text-muted-foreground">
          {ordered.length} tracked
        </Badge>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 px-4 pb-4">
        <ScrollArea className="h-full pr-1">
          <div className="space-y-3">
            {ordered.length === 0 ? (
              <p className="rounded-lg border border-dashed p-4 text-xs text-muted-foreground">
                No active alerts.
              </p>
            ) : (
              ordered.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(index * 0.03, 0.2) }}
                >
                  <AlertCard alert={alert} />
                </motion.div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <div className="pointer-events-none absolute right-4 top-4 z-20 w-72 space-y-2">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            className="rounded-2xl border bg-card p-3 text-card-foreground"
          >
            <p className="text-xs font-semibold">
              New incident · {toast.personId}
            </p>
            <p className="text-xs text-muted-foreground">{toast.explanation}</p>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
