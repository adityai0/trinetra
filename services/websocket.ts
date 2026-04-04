import type { Alert } from '@/types';

interface AlertSocketOptions {
  onMessage: (alert: Alert) => void;
  onStatusChange?: (
    status: 'connecting' | 'connected' | 'disconnected'
  ) => void;
}

/**
 * Manages alert websocket lifecycle with automatic reconnect and mock fallback emissions.
 */
export class AlertWebSocketClient {
  private readonly endpoint: string;
  private readonly options: AlertSocketOptions;
  private socket: WebSocket | null = null;
  private reconnectTimer: number | null = null;
  private mockInterval: number | null = null;

  constructor(endpoint: string, options: AlertSocketOptions) {
    this.endpoint = endpoint;
    this.options = options;
  }

  connect(): void {
    this.options.onStatusChange?.('connecting');

    try {
      this.socket = new WebSocket(this.endpoint);

      this.socket.onopen = () => {
        this.options.onStatusChange?.('connected');
      };

      this.socket.onmessage = (event) => {
        const alert = JSON.parse(event.data) as Alert;
        this.options.onMessage(alert);
      };

      this.socket.onerror = () => {
        this.scheduleReconnect();
        this.startMockStream();
      };

      this.socket.onclose = () => {
        this.options.onStatusChange?.('disconnected');
        this.scheduleReconnect();
        this.startMockStream();
      };
    } catch {
      this.startMockStream();
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.mockInterval !== null) {
      window.clearInterval(this.mockInterval);
      this.mockInterval = null;
    }

    this.socket?.close();
    this.socket = null;
    this.options.onStatusChange?.('disconnected');
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer !== null) {
      return;
    }

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 3500);
  }

  private startMockStream(): void {
    if (this.mockInterval !== null) {
      return;
    }

    this.mockInterval = window.setInterval(() => {
      const id = Math.floor(Math.random() * 100000);
      this.options.onMessage({
        id: `live-${id}`,
        personId: `P-${1000 + (id % 75)}`,
        riskScore: Number((0.3 + Math.random() * 0.7).toFixed(2)),
        timestamp: new Date().toISOString(),
        explanation:
          'Risk model flagged synchronized movement near high-value inventory.',
      });
    }, 4200);

    this.options.onStatusChange?.('connected');
  }
}
