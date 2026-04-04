import type { Alert, ApiResponse, EventFilter, EventItem, Zone } from '@/types';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

const mockEvents: EventItem[] = Array.from({ length: 120 }).map((_, index) => {
  const riskScore = Math.min(0.2 + (index % 10) * 0.08, 0.98);

  return {
    id: `event-${index + 1}`,
    timestamp: new Date(Date.now() - index * 45_000).toISOString(),
    riskScore,
    thumbnailUrl: `https://picsum.photos/seed/trinetra-${index}/320/180`,
    personId: `P-${1000 + index}`,
    description: 'Suspicious loitering behavior near restricted inventory bay.',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
  };
});

const mockZones: Zone[] = [
  {
    id: 'zone-1',
    name: 'Vault Access',
    type: 'restricted',
    points: [
      [60, 60],
      [300, 60],
      [300, 220],
      [60, 220],
    ],
    color: '#f43f5e',
  },
  {
    id: 'zone-2',
    name: 'Loading Corridor',
    type: 'warning',
    points: [
      [360, 80],
      [520, 110],
      [560, 260],
      [400, 300],
      [320, 190],
    ],
    color: '#f59e0b',
  },
];

let zonesCache = [...mockZones];

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

/**
 * Fetches timeline events with graceful mock fallback when backend is unavailable.
 */
export async function fetchEvents(
  filter: EventFilter
): Promise<ApiResponse<EventItem[]>> {
  try {
    const data = await request<EventItem[]>('/events');
    return { data: filterEvents(data, filter), source: 'api' };
  } catch {
    return { data: filterEvents(mockEvents, filter), source: 'mock' };
  }
}

/**
 * Fetches zones from the API with in-memory fallback to keep editing functional offline.
 */
export async function fetchZones(): Promise<ApiResponse<Zone[]>> {
  try {
    const data = await request<Zone[]>('/zones');
    return { data, source: 'api' };
  } catch {
    return { data: zonesCache, source: 'mock' };
  }
}

/**
 * Persists a newly created zone.
 */
export async function createZone(zone: Zone): Promise<ApiResponse<Zone>> {
  try {
    const data = await request<Zone>('/zones', {
      method: 'POST',
      body: JSON.stringify(zone),
    });
    return { data, source: 'api' };
  } catch {
    zonesCache = [...zonesCache, zone];
    return { data: zone, source: 'mock' };
  }
}

/**
 * Updates an existing zone model.
 */
export async function updateZone(zone: Zone): Promise<ApiResponse<Zone>> {
  try {
    const data = await request<Zone>(`/zones/${zone.id}`, {
      method: 'PUT',
      body: JSON.stringify(zone),
    });
    return { data, source: 'api' };
  } catch {
    zonesCache = zonesCache.map((item) => (item.id === zone.id ? zone : item));
    return { data: zone, source: 'mock' };
  }
}

/**
 * Deletes a zone by id.
 */
export async function deleteZone(
  zoneId: string
): Promise<ApiResponse<{ id: string }>> {
  try {
    await request(`/zones/${zoneId}`, {
      method: 'DELETE',
    });
    return { data: { id: zoneId }, source: 'api' };
  } catch {
    zonesCache = zonesCache.filter((item) => item.id !== zoneId);
    return { data: { id: zoneId }, source: 'mock' };
  }
}

/**
 * Returns historical alerts for initial panel hydration.
 */
export async function fetchAlertsHistory(): Promise<ApiResponse<Alert[]>> {
  try {
    const data = await request<Alert[]>('/alerts');
    return { data, source: 'api' };
  } catch {
    const data: Alert[] = Array.from({ length: 12 }).map((_, index) => ({
      id: `alert-${index + 1}`,
      personId: `P-${900 + index}`,
      riskScore: Math.min(0.35 + index * 0.05, 0.99),
      timestamp: new Date(Date.now() - index * 65_000).toISOString(),
      explanation:
        'Group movement pattern indicates coordinated shelf sweep behavior.',
    }));

    return { data, source: 'mock' };
  }
}

function filterEvents(events: EventItem[], filter: EventFilter): EventItem[] {
  return events
    .filter(
      (event) =>
        event.riskScore >= filter.minRisk && event.riskScore <= filter.maxRisk
    )
    .filter((event) => {
      if (!filter.from && !filter.to) {
        return true;
      }

      const timestamp = new Date(event.timestamp).getTime();
      const from = filter.from
        ? new Date(filter.from).getTime()
        : Number.MIN_SAFE_INTEGER;
      const to = filter.to
        ? new Date(filter.to).getTime()
        : Number.MAX_SAFE_INTEGER;

      return timestamp >= from && timestamp <= to;
    })
    .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
}
