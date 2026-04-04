'use client';

import { useEffect, useRef, useState } from 'react';

import type { EventLog, RiskLevel } from '@/types/event';

type WebSocketStatus = 'connecting' | 'connected' | 'disconnected';

function normalizeRiskLevel(value: unknown): RiskLevel {
  if (value === 'low' || value === 'medium' || value === 'high') {
    return value;
  }
  return 'medium';
}

function toEventLog(candidate: unknown): EventLog | null {
  if (!candidate || typeof candidate !== 'object') {
    return null;
  }

  const record = candidate as Record<string, unknown>;
  const personId = Number(record.personId);
  if (!Number.isFinite(personId)) {
    return null;
  }

  const timestampValue =
    typeof record.timestamp === 'string'
      ? record.timestamp
      : new Date().toISOString();
  const messageValue =
    typeof record.message === 'string' ? record.message : 'Detection event';

  return {
    _id: `${personId}-${timestampValue}`,
    personId,
    riskLevel: normalizeRiskLevel(record.riskLevel),
    timestamp: timestampValue,
    message: messageValue,
  };
}

function parseSocketPayload(raw: unknown): EventLog[] {
  if (!raw || typeof raw !== 'object') {
    return [];
  }

  const payload = raw as Record<string, unknown>;
  if (payload.type === 'heartbeat') {
    return [];
  }

  const directEvent = toEventLog(payload);
  if (directEvent) {
    return [directEvent];
  }

  const persons = Array.isArray(payload.persons) ? payload.persons : [];
  const timestamp =
    typeof payload.timestamp === 'string'
      ? payload.timestamp
      : new Date().toISOString();
  const message =
    typeof payload.message === 'string' ? payload.message : 'Detection event';

  return persons
    .map((person, index) => {
      if (!person || typeof person !== 'object') {
        return null;
      }

      const personRecord = person as Record<string, unknown>;
      const personId = Number(personRecord.id);
      if (!Number.isFinite(personId)) {
        return null;
      }

      return {
        _id: `${personId}-${timestamp}-${index}`,
        personId,
        riskLevel: normalizeRiskLevel(personRecord.risk),
        timestamp,
        message,
      } satisfies EventLog;
    })
    .filter((eventItem): eventItem is EventLog => eventItem !== null);
}

/**
 * Maintains a resilient websocket connection and emits normalized event records.
 */
export function useWebSocket(
  endpoint: string,
  onEvent: (eventItem: EventLog) => void
): { status: WebSocketStatus } {
  const [status, setStatus] = useState<WebSocketStatus>('connecting');
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimer: number | null = null;
    let shouldReconnect = true;

    const connect = () => {
      if (!shouldReconnect) {
        return;
      }

      setStatus('connecting');
      socket = new WebSocket(endpoint);

      socket.onopen = () => {
        setStatus('connected');
      };

      socket.onmessage = (messageEvent) => {
        try {
          const parsed = JSON.parse(messageEvent.data) as unknown;
          const normalizedEvents = parseSocketPayload(parsed);
          normalizedEvents.forEach((eventItem) =>
            onEventRef.current(eventItem)
          );
        } catch {
          // Ignore malformed socket payloads and keep the connection alive.
        }
      };

      socket.onerror = () => {
        socket?.close();
      };

      socket.onclose = () => {
        setStatus('disconnected');
        if (!shouldReconnect) {
          return;
        }

        reconnectTimer = window.setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      shouldReconnect = false;

      if (reconnectTimer !== null) {
        window.clearTimeout(reconnectTimer);
      }

      socket?.close();
    };
  }, [endpoint]);

  return { status };
}
