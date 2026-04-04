import type { ZoneType } from '@/types';

/**
 * Resolves a semantic zone color based on zone type.
 */
export function zoneTypeColor(type: ZoneType): string {
  if (type === 'restricted') {
    return '#f43f5e';
  }

  if (type === 'warning') {
    return '#f59e0b';
  }

  return '#22c55e';
}
