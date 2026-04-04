'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DrawMode, ZoneType } from '@/types';

interface ZoneControlsProps {
  drawMode: DrawMode;
  editingEnabled: boolean;
  zoneType: ZoneType;
  onSetDrawMode: (mode: DrawMode) => void;
  onToggleEdit: () => void;
  onUndo: () => void;
  onCancel: () => void;
  onSetZoneType: (zoneType: ZoneType) => void;
}

/**
 * Provides mode toggles and draft controls for the zone drawing workflow.
 */
export function ZoneControls({
  drawMode,
  editingEnabled,
  zoneType,
  onSetDrawMode,
  onToggleEdit,
  onUndo,
  onCancel,
  onSetZoneType,
}: ZoneControlsProps) {
  return (
    <Card className="gap-0 rounded-2xl border border-white/10 bg-slate-950/70 py-0">
      <CardHeader className="px-3 py-3">
        <CardTitle className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          Zone Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-3 pb-3">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onSetDrawMode('rectangle')}
            className={`h-7 rounded-lg px-3 py-1.5 text-xs font-semibold ${
              drawMode === 'rectangle'
                ? 'bg-cyan-500 text-slate-950'
                : 'bg-slate-800 text-slate-200'
            }`}
          >
            Rectangle
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onSetDrawMode('polygon')}
            className={`h-7 rounded-lg px-3 py-1.5 text-xs font-semibold ${
              drawMode === 'polygon'
                ? 'bg-cyan-500 text-slate-950'
                : 'bg-slate-800 text-slate-200'
            }`}
          >
            Polygon
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onToggleEdit}
            className={`h-7 rounded-lg px-3 py-1.5 text-xs font-semibold ${
              editingEnabled
                ? 'bg-amber-400 text-slate-950'
                : 'bg-slate-800 text-slate-200'
            }`}
          >
            Edit
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Label className="text-xs font-medium text-slate-400">Type</Label>
          <Select
            value={zoneType}
            onValueChange={(value) => onSetZoneType(value as ZoneType)}
          >
            <SelectTrigger className="h-8 min-w-36 rounded-md border-white/10 bg-slate-900 px-3 text-xs text-slate-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-slate-900 text-slate-100">
              <SelectItem value="restricted">Restricted</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="safe">Safe</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onUndo}
            className="h-7 bg-slate-800 text-xs text-slate-100 hover:bg-slate-700"
          >
            Undo
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onCancel}
            className="h-7 bg-slate-800 text-xs text-slate-100 hover:bg-slate-700"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
