'use client';

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';
import { useMemo } from 'react';

import { Header } from '@/components/dashboard/header';
import { AlertSummary } from '../../components/dashboard/alert-summary';
import { Analytics } from '../../components/dashboard/analytics';
import { EventLog } from '../../components/dashboard/event-log';
import { ProfilePanel } from '../../components/dashboard/profile-panel';
import { VideoFeed } from '@/components/dashboard/video-feed';
import type { EventLog as EventLogEntry } from '@/types/event';

const queryClient = new QueryClient();

/**
 * Hosts the minimal Trinetra monitoring dashboard layout.
 */
export default function DashboardPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardContent />
    </QueryClientProvider>
  );
}

/**
 * Coordinates the live feed shell and real-time event log updates.
 */
function DashboardContent() {
  const eventsQuery = useQuery({
    queryKey: ['events'],
    queryFn: async (): Promise<EventLogEntry[]> => {
      try {
        const response = await fetch('/api/events', {
          cache: 'no-store',
        });

        if (!response.ok) {
          return [];
        }

        return (await response.json()) as EventLogEntry[];
      } catch {
        return [];
      }
    },
    refetchInterval: 3000,
  });

  const events = useMemo(() => eventsQuery.data ?? [], [eventsQuery.data]);
  const latestEvent = useMemo(() => {
    return (
      [...events].sort(
        (a, b) => +new Date(b.timestamp) - +new Date(a.timestamp)
      )[0] ?? null
    );
  }, [events]);

  const systemStatus = eventsQuery.isError
    ? 'disconnected'
    : eventsQuery.isLoading
      ? 'connecting'
      : 'connected';

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header systemStatus={systemStatus} />

      <main className="grid flex-1 grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-5">
        <section className="order-1 md:col-span-2 lg:order-2 lg:col-span-3">
          <VideoFeed />
        </section>

        <section className="order-2 md:col-span-1 lg:order-1 lg:col-span-1">
          <AlertSummary
            events={events}
            isLoading={eventsQuery.isLoading}
            isDisconnected={eventsQuery.isError}
          />
        </section>

        <section className="order-3 md:col-span-1 lg:col-span-1">
          <div className="grid h-full grid-rows-[1fr_1fr] gap-6">
            <ProfilePanel eventItem={latestEvent} />
            <EventLog
              events={events}
              isLoading={eventsQuery.isLoading}
              isDisconnected={eventsQuery.isError}
            />
          </div>
        </section>

        <section className="order-4 md:col-span-2 lg:col-span-5">
          <Analytics events={events} />
        </section>
      </main>
    </div>
  );
}
