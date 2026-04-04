import { useMemo } from 'react';

import type { EventLog as EventLogEntry } from '@/types/event';

type SentinelEventLogProps = {
  events: EventLogEntry[];
  isLoading: boolean;
};

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return '--:--:--';
  }
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function SentinelEventLog({ events, isLoading }: SentinelEventLogProps) {
  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp)),
    [events]
  );

  return (
    <aside className="flex h-full w-full flex-col border-l border-[#484848]/15 bg-[#131313]">
      <div className="border-b border-[#484848]/15 p-6">
        <h2 className="flex items-center justify-between text-[10px] font-black tracking-[0.3em] text-[#acabaa]">
          EVENT LOG
          <span className="text-xs">DB</span>
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto font-mono text-[11px] leading-relaxed">
        {isLoading ? (
          <div className="px-6 py-4 text-[#767575]">Loading live events...</div>
        ) : sortedEvents.length === 0 ? (
          <div className="px-6 py-4 text-[#767575]">No events captured for this session.</div>
        ) : (
          sortedEvents.map((event) => {
            const riskClass =
              event.riskLevel === 'high'
                ? 'text-[#ee7d77]'
                : event.riskLevel === 'medium'
                  ? 'text-[#ff725e]'
                  : 'text-[#02c953]';

            return (
              <div
                key={event._id}
                className="cursor-pointer border-b border-[#484848]/5 px-6 py-3 transition-colors hover:bg-[#1f2020]"
              >
                <span className="text-[#767575]">[{formatTimestamp(event.timestamp)}]</span>
                <span className="ml-2 text-[#e7e5e4] uppercase">{event.message}</span>
                <span className={`ml-2 font-bold uppercase ${riskClass}`}>P-{event.personId}</span>
              </div>
            );
          })
        )}

        <div className="flex flex-col items-center justify-center px-6 py-12 opacity-20">
          <p className="text-[9px] uppercase tracking-widest">End of session log</p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[#484848]/15 bg-[#000000] p-4 text-[10px] font-bold">
        <div className="flex gap-4">
          <span className="text-[#02c953]">Uptime: Live</span>
          <span className="text-[#767575]">CPU: 12%</span>
        </div>
        <div className="text-[#acabaa]">NODE: 01</div>
      </div>
    </aside>
  );
}
