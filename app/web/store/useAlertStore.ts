import { create } from 'zustand';

import type { Alert } from '@/types';

interface AlertState {
  alerts: Alert[];
  setAlerts: (alerts: Alert[]) => void;
  pushAlert: (alert: Alert) => void;
  removeAlert: (id: string) => void;
  clearAlerts: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  setAlerts: (alerts) => set({ alerts }),
  pushAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts].slice(0, 100),
    })),
  removeAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.filter((alert) => alert.id !== id),
    })),
  clearAlerts: () => set({ alerts: [] }),
}));
