import type { ZoneType } from '@/types';

/**
 * Resolves a semantic zone color based on zone type.
 */
export function zoneTypeColor(type: ZoneType): string {
  if (type === 'restricted') {
    return 'hsl(var(--destructive))';
  }

  if (type === 'warning') {
    return 'hsl(var(--accent-foreground))';
  }

  return 'hsl(var(--primary))';
}
