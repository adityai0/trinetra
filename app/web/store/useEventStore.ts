import { create } from 'zustand';

import type { EventFilter, EventItem } from '@/types';

interface EventState {
  selectedEvent: EventItem | null;
  filter: EventFilter;
  setFilter: (next: Partial<EventFilter>) => void;
  setSelectedEvent: (event: EventItem | null) => void;
}

export const useEventStore = create<EventState>((set) => ({
  selectedEvent: null,
  filter: {
    minRisk: 0,
    maxRisk: 1,
  },
  setFilter: (next) =>
    set((state) => ({
      filter: {
        ...state.filter,
        ...next,
      },
    })),
  setSelectedEvent: (selectedEvent) => set({ selectedEvent }),
}));
