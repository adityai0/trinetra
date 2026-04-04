'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchZones } from '@/services/api';
import { useZoneStore } from '@/store/useZoneStore';
import type { Zone } from '@/types';

/**
 * Retrieves zones and mirrors them into the zone store for canvas editing workflows.
 */
export function useZones(): {
  zones: Zone[];
  isLoading: boolean;
  source: 'api' | 'mock';
} {
  const zones = useZoneStore((state) => state.zones);
  const setZones = useZoneStore((state) => state.setZones);

  const query = useQuery({
    queryKey: ['zones'],
    queryFn: fetchZones,
  });

  if (query.data?.data && zones.length !== query.data.data.length) {
    setZones(query.data.data);
  }

  return {
    zones,
    isLoading: query.isLoading,
    source: query.data?.source ?? 'mock',
  };
}
