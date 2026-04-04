'use client';

import { useEffect, useState } from 'react';

import { AlertWebSocketClient } from '@/services/websocket';
import { useAlertStore } from '@/store/useAlertStore';

/**
 * Subscribes to live alert events and synchronizes them into the alert store.
 */
export function useWebSocket(endpoint: string): {
  status: 'connecting' | 'connected' | 'disconnected';
} {
  const pushAlert = useAlertStore((state) => state.pushAlert);
  const [status, setStatus] = useState<
    'connecting' | 'connected' | 'disconnected'
  >('connecting');

  useEffect(() => {
    const client = new AlertWebSocketClient(endpoint, {
      onMessage: pushAlert,
      onStatusChange: setStatus,
    });

    client.connect();

    return () => {
      client.disconnect();
    };
  }, [endpoint, pushAlert]);

  return { status };
}
