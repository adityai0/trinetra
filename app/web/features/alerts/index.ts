import type { Alert } from '@/types';

/**
 * Ensures incoming alerts are sorted by timestamp descending.
 */
export function sortAlerts(alerts: Alert[]): Alert[] {
  return [...alerts].sort(
    (a, b) => +new Date(b.timestamp) - +new Date(a.timestamp)
  );
}
