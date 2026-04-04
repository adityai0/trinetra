'use client';

import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CameraOption } from '@/types';

interface HeaderProps {
  systemStatus: 'connecting' | 'connected' | 'disconnected';
  cameras: CameraOption[];
  selectedCameraId: string;
  onSelectCamera: (cameraId: string) => void;
}

/**
 * Renders the top dashboard bar with system health and active camera selector.
 */
export function Header({
  systemStatus,
  cameras,
  selectedCameraId,
  onSelectCamera,
}: HeaderProps) {
  const statusTone =
    systemStatus === 'connected'
      ? 'bg-emerald-400'
      : systemStatus === 'connecting'
        ? 'bg-amber-400'
        : 'bg-rose-400';

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-slate-950/70 px-5 backdrop-blur">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
          Trinetra
        </p>
        <h1 className="text-sm font-semibold text-slate-100">
          Surveillance Command Center
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <Badge
          variant="outline"
          className="h-auto gap-2 rounded-full border-white/10 bg-slate-900/60 px-3 py-1.5 text-xs font-medium capitalize text-slate-200"
        >
          <span className={`h-2.5 w-2.5 rounded-full ${statusTone}`} />
          {systemStatus}
        </Badge>

        <Label className="flex items-center gap-2 text-xs font-medium text-slate-400">
          Camera
          <Select value={selectedCameraId} onValueChange={onSelectCamera}>
            <SelectTrigger className="h-8 min-w-36 rounded-md border-white/10 bg-slate-900 px-3 text-sm text-slate-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-slate-900 text-slate-100">
              {cameras.map((camera) => (
                <SelectItem key={camera.id} value={camera.id}>
                  {camera.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Label>
      </div>
    </header>
  );
}
