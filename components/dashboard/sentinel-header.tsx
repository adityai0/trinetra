'use client';

import { useEffect, useState } from 'react';

function getUtcTimeString() {
  const now = new Date();
  const hh = String(now.getUTCHours()).padStart(2, '0');
  const mm = String(now.getUTCMinutes()).padStart(2, '0');
  const ss = String(now.getUTCSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss} UTC`;
}

export function SentinelHeader() {
  const [clock, setClock] = useState('');

  useEffect(() => {
    setClock(getUtcTimeString());

    const timer = setInterval(() => {
      setClock(getUtcTimeString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="flex h-14 w-full items-center justify-between border-b border-[#484848]/15 bg-[#0e0e0e] px-6 tracking-tight text-[#c6c6c7]">
      <div className="text-xl font-black tracking-[0.25em]">TRINETRA</div>
      <div
        className="text-sm font-medium tabular-nums"
        suppressHydrationWarning
      >
        {clock || '00:00:00 UTC'}
      </div>
    </header>
  );
}
