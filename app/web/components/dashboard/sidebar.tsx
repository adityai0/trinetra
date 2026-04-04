'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type DashboardSection = 'live' | 'alerts' | 'events' | 'zones';

interface SidebarProps {
  active: DashboardSection;
  onChange: (section: DashboardSection) => void;
}

const sections: { id: DashboardSection; label: string }[] = [
  { id: 'live', label: 'Live' },
  { id: 'alerts', label: 'Alerts' },
  { id: 'events', label: 'Events' },
  { id: 'zones', label: 'Zones' },
];

/**
 * Renders the section navigation rail for switching dashboard work areas.
 */
export function Sidebar({ active, onChange }: SidebarProps) {
  return (
    <aside className="flex w-24 shrink-0 flex-col gap-2 border-r border-white/10 bg-slate-950/80 p-3 backdrop-blur">
      {sections.map((section) => {
        const selected = section.id === active;

        return (
          <Button
            key={section.id}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(section.id)}
            className={cn(
              'h-auto justify-start rounded-xl px-3 py-2 text-left text-xs font-semibold tracking-wide transition',
              selected
                ? 'bg-cyan-500/20 text-cyan-200 hover:bg-cyan-500/30 hover:text-cyan-100'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            )}
          >
            {section.label}
          </Button>
        );
      })}
    </aside>
  );
}
