'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import type { EventLog, RiskLevel } from '@/types/event';

import { useWebSocket } from './useWebSocket';

type BackendEventRecord = {
  id?: string;
  _id?: string;
  personId: number | string;
  riskLevel?: RiskLevel;
  timestamp: string;
  message: string;
};

function normalizeRiskLevel(value: unknown): RiskLevel {
  if (value === 'low' || value === 'medium' || value === 'high') {
    return value;
  }
  return 'medium';
}

function toEventLog(record: BackendEventRecord): EventLog {
  const personId = Number(record.personId);
  const timestamp = record.timestamp || new Date().toISOString();

  return {
    _id: record._id ?? record.id ?? `${personId}-${timestamp}`,
    personId: Number.isFinite(personId) ? personId : 0,
    riskLevel: normalizeRiskLevel(record.riskLevel),
    timestamp,
    message:
      typeof record.message === 'string' ? record.message : 'Detection event',
  };
}

function mergeEvent(prev: EventLog[], nextEvent: EventLog): EventLog[] {
  const dedupeKey = `${nextEvent.personId}-${nextEvent.timestamp}-${nextEvent.message}`;
  const hasDuplicate = prev.some(
    (item) => `${item.personId}-${item.timestamp}-${item.message}` === dedupeKey
  );

  if (hasDuplicate) {
    return prev;
  }

  return [nextEvent, ...prev].slice(0, 300);
}

function buildSocketEndpoint(apiBaseUrl: string): string {
  if (apiBaseUrl.startsWith('https://')) {
    return `${apiBaseUrl.replace('https://', 'wss://')}/ws/events`;
  }

  if (apiBaseUrl.startsWith('http://')) {
    return `${apiBaseUrl.replace('http://', 'ws://')}/ws/events`;
  }

  if (apiBaseUrl.startsWith('wss://') || apiBaseUrl.startsWith('ws://')) {
    return `${apiBaseUrl}/ws/events`;
  }

  return `ws://${apiBaseUrl}/ws/events`;
}

/**
 * Loads persisted events from the backend and merges live websocket updates.
 */
export function useEvents(): {
  events: EventLog[];
  latestEvent: EventLog | null;
  isLoading: boolean;
  isDisconnected: boolean;
  error: string | null;
} {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
  const wsEndpoint = useMemo(
    () => buildSocketEndpoint(apiBaseUrl),
    [apiBaseUrl]
  );

  const [events, setEvents] = useState<EventLog[]>([]);
  const [latestEvent, setLatestEvent] = useState<EventLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadInitialEvents = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiBaseUrl}/api/events`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch events (${response.status})`);
        }

        const payload = (await response.json()) as BackendEventRecord[];
        if (!isMounted) {
          return;
        }

        const normalized = payload.map(toEventLog);
        setEvents(normalized);
      } catch {
        if (!isMounted) {
          return;
        }

        setError('Unable to load events from backend API.');
        setEvents([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadInitialEvents();

    return () => {
      isMounted = false;
    };
  }, [apiBaseUrl]);

  const handleLiveEvent = useCallback((eventItem: EventLog) => {
    setLatestEvent(eventItem);
    setEvents((prev) => mergeEvent(prev, eventItem));
  }, []);

  const { status } = useWebSocket(wsEndpoint, handleLiveEvent);

  return {
    events,
    latestEvent,
    isLoading,
    isDisconnected: status === 'disconnected',
    error,
  };
}
