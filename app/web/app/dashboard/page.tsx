'use client';

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';

import { AlertPanel } from '@/components/dashboard/alert-panel';
import { EventModal } from '@/components/dashboard/event-modal';
import { EventTimeline } from '@/components/dashboard/event-timeline';
import { Header } from '@/components/dashboard/header';
import { Sidebar, type DashboardSection } from '@/components/dashboard/sidebar';
import { VideoFeed } from '@/components/dashboard/video-feed';
import { ZoneControls } from '@/components/dashboard/zone-controls';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useZones } from '@/hooks/useZones';
import {
  createZone,
  deleteZone,
  fetchAlertsHistory,
  fetchEvents,
  updateZone,
} from '@/services/api';
import { useAlertStore } from '@/store/useAlertStore';
import { useEventStore } from '@/store/useEventStore';
import { useVideoStore } from '@/store/useVideoStore';
import { useZoneStore } from '@/store/useZoneStore';
import type { Zone, ZoneType } from '@/types';

const ZoneCanvas = dynamic(
  () =>
    import('@/components/dashboard/zone-canvas').then((mod) => mod.ZoneCanvas),
  {
    ssr: false,
  }
);

const queryClient = new QueryClient();

/**
 * Hosts the complete Trinetra dashboard experience and binds all realtime modules.
 */
export default function DashboardPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardContent />
    </QueryClientProvider>
  );
}

/**
 * Coordinates dashboard sections, shared state stores, and data hooks.
 */
function DashboardContent() {
  const [activeSection, setActiveSection] = useState<DashboardSection>('live');
  const [zoneType, setZoneType] = useState<ZoneType>('restricted');

  const cameras = useVideoStore((state) => state.cameras);
  const selectedCameraId = useVideoStore((state) => state.selectedCameraId);
  const setSelectedCamera = useVideoStore((state) => state.setSelectedCamera);
  const detections = useVideoStore((state) => state.detections);

  const alerts = useAlertStore((state) => state.alerts);
  const setAlerts = useAlertStore((state) => state.setAlerts);

  const filter = useEventStore((state) => state.filter);
  const setFilter = useEventStore((state) => state.setFilter);
  const selectedEvent = useEventStore((state) => state.selectedEvent);
  const setSelectedEvent = useEventStore((state) => state.setSelectedEvent);

  const drawMode = useZoneStore((state) => state.drawMode);
  const setDrawMode = useZoneStore((state) => state.setDrawMode);
  const editingEnabled = useZoneStore((state) => state.editingEnabled);
  const setEditingEnabled = useZoneStore((state) => state.setEditingEnabled);
  const selectedZoneId = useZoneStore((state) => state.selectedZoneId);
  const setSelectedZoneId = useZoneStore((state) => state.setSelectedZoneId);
  const draftPoints = useZoneStore((state) => state.draftPoints);
  const setDraftPoints = useZoneStore((state) => state.setDraftPoints);
  const resetDraft = useZoneStore((state) => state.resetDraft);
  const zones = useZoneStore((state) => state.zones);
  const upsertZone = useZoneStore((state) => state.upsertZone);
  const removeZone = useZoneStore((state) => state.removeZone);

  const { status: socketStatus } = useWebSocket('ws://localhost:8000/alerts');
  const { stream } = useWebRTC();
  useZones();

  const eventsQuery = useQuery({
    queryKey: ['events', filter],
    queryFn: () => fetchEvents(filter),
  });

  const alertsHistoryQuery = useQuery({
    queryKey: ['alerts-history'],
    queryFn: fetchAlertsHistory,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!alertsHistoryQuery.data?.data || alerts.length > 0) {
      return;
    }

    setAlerts(alertsHistoryQuery.data.data);
  }, [alerts.length, alertsHistoryQuery.data?.data, setAlerts]);

  const events = useMemo(
    () => eventsQuery.data?.data ?? [],
    [eventsQuery.data?.data]
  );

  const handleCreateZone = async (zone: Zone) => {
    const response = await createZone(zone);
    upsertZone(response.data);
  };

  const handleUpdateZone = async (zone: Zone) => {
    const response = await updateZone(zone);
    upsertZone(response.data);
  };

  const handleDeleteZone = async (zoneId: string) => {
    await deleteZone(zoneId);
    removeZone(zoneId);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <Header
        systemStatus={socketStatus}
        cameras={cameras}
        selectedCameraId={selectedCameraId}
        onSelectCamera={setSelectedCamera}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar active={activeSection} onChange={setActiveSection} />

        <main className="grid flex-1 gap-4 overflow-hidden bg-[radial-gradient(circle_at_10%_10%,rgba(14,116,144,0.25),transparent_32%),radial-gradient(circle_at_88%_12%,rgba(15,23,42,0.9),transparent_38%),#020617] p-4 lg:grid-cols-[2fr_1fr]">
          <section className="min-h-0 space-y-4 overflow-hidden">
            <VideoFeed stream={stream} detections={detections} />

            {activeSection === 'zones' ? (
              <>
                <ZoneControls
                  drawMode={drawMode}
                  editingEnabled={editingEnabled}
                  zoneType={zoneType}
                  onSetDrawMode={setDrawMode}
                  onToggleEdit={() => setEditingEnabled(!editingEnabled)}
                  onUndo={() => setDraftPoints(draftPoints.slice(0, -1))}
                  onCancel={() => {
                    resetDraft();
                    setDrawMode('none');
                  }}
                  onSetZoneType={setZoneType}
                />
                <ZoneCanvas
                  zones={zones}
                  drawMode={drawMode}
                  zoneType={zoneType}
                  editingEnabled={editingEnabled}
                  selectedZoneId={selectedZoneId}
                  draftPoints={draftPoints}
                  onSelectZone={setSelectedZoneId}
                  onDraftPointsChange={setDraftPoints}
                  onCreateZone={handleCreateZone}
                  onUpdateZone={handleUpdateZone}
                  onDeleteZone={handleDeleteZone}
                />
              </>
            ) : null}
          </section>

          <section className="min-h-0">
            {activeSection === 'events' ? (
              <EventTimeline
                events={events}
                filter={filter}
                onFilterChange={setFilter}
                onSelectEvent={setSelectedEvent}
              />
            ) : (
              <AlertPanel alerts={alerts} />
            )}
          </section>
        </main>
      </div>

      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
