'use client';

import { EventLog } from '@/components/dashboard/event-log';
import { SentinelHeader } from '@/components/dashboard/sentinel-header';
import { VideoFeed } from '@/components/dashboard/video-feed';
import { useEvents } from '@/hooks/useEvents';

/**
 * Hosts the minimal Trinetra monitoring dashboard layout.
 */
export default function DashboardPage() {
  return <DashboardContent />;
}

/**
 * Coordinates the live feed shell and real-time event log updates.
 */
function DashboardContent() {
  const { events, isLoading, isDisconnected, error } = useEvents();

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-[#0e0e0e] text-[#c6c6c7]">
      <SentinelHeader />

      <main className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
        <section className="h-full w-[70%]">
          <VideoFeed />
        </section>

        <section className="h-full w-[30%]">
          <EventLog
            events={events}
            isLoading={isLoading}
            isDisconnected={isDisconnected}
            error={error}
          />
        </section>
      </main>
    </div>
  );
}
