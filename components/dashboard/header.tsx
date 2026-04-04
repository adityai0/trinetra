'use client';

import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  systemStatus: 'connecting' | 'connected' | 'disconnected';
}

/**
 * Renders the top status bar with branding, system health, and current time.
 */
export function Header({ systemStatus }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(
        new Intl.DateTimeFormat('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }).format(new Date())
      );
    };

    updateTime();
    const intervalId = window.setInterval(updateTime, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const statusLabel =
    systemStatus === 'connected'
      ? 'SYSTEM STATUS: SECURE'
      : systemStatus === 'connecting'
        ? 'SYSTEM STATUS: CONNECTING'
        : 'SYSTEM STATUS: DISCONNECTED';

  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b px-6">
      <p className="text-sm">TRINETRA</p>

      <Badge variant="outline">{statusLabel}</Badge>

      <p className="text-sm">{currentTime}</p>
    </header>
  );
}
