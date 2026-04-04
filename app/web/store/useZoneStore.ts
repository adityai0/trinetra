import { create } from 'zustand';

import type { DrawMode, Zone } from '@/types';

interface ZoneState {
  zones: Zone[];
  drawMode: DrawMode;
  editingEnabled: boolean;
  selectedZoneId: string | null;
  draftPoints: [number, number][];
  setZones: (zones: Zone[]) => void;
  upsertZone: (zone: Zone) => void;
  removeZone: (zoneId: string) => void;
  setDrawMode: (drawMode: DrawMode) => void;
  setEditingEnabled: (editingEnabled: boolean) => void;
  setSelectedZoneId: (selectedZoneId: string | null) => void;
  setDraftPoints: (points: [number, number][]) => void;
  resetDraft: () => void;
}

export const useZoneStore = create<ZoneState>((set) => ({
  zones: [],
  drawMode: 'none',
  editingEnabled: false,
  selectedZoneId: null,
  draftPoints: [],
  setZones: (zones) => set({ zones }),
  upsertZone: (zone) =>
    set((state) => {
      const existing = state.zones.some((item) => item.id === zone.id);

      if (existing) {
        return {
          zones: state.zones.map((item) => (item.id === zone.id ? zone : item)),
        };
      }

      return { zones: [...state.zones, zone] };
    }),
  removeZone: (zoneId) =>
    set((state) => ({
      zones: state.zones.filter((zone) => zone.id !== zoneId),
      selectedZoneId:
        state.selectedZoneId === zoneId ? null : state.selectedZoneId,
    })),
  setDrawMode: (drawMode) => set({ drawMode }),
  setEditingEnabled: (editingEnabled) => set({ editingEnabled }),
  setSelectedZoneId: (selectedZoneId) => set({ selectedZoneId }),
  setDraftPoints: (draftPoints) => set({ draftPoints }),
  resetDraft: () => set({ draftPoints: [] }),
}));
