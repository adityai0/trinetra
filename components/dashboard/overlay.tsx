'use client';

import type { Detection } from '@/types';
import { riskToneClass } from '@/utils/format';

interface OverlayProps {
  detections: Detection[];
}

/**
 * Paints detection overlays on top of the live feed with identity and risk metadata.
 */
export function Overlay({ detections }: OverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-0">
      {detections.map((detection) => {
        const labelClass = riskToneClass(detection.riskScore);

        return (
          <div key={detection.id}>
            <div
              className="absolute border-2"
              style={{
                left: detection.box.x,
                top: detection.box.y,
                width: detection.box.width,
                height: detection.box.height,
                borderColor:
                  detection.riskScore >= 0.75
                    ? 'hsl(var(--destructive))'
                    : detection.riskScore >= 0.45
                      ? 'hsl(var(--accent-foreground))'
                      : 'hsl(var(--primary))',
              }}
            >
              <div
                className={`absolute -top-7 left-0 rounded border px-2 py-0.5 text-[10px] font-semibold ${labelClass}`}
              >
                {detection.personId} · {(detection.riskScore * 100).toFixed(0)}%
              </div>
            </div>

            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 1280 720"
              preserveAspectRatio="none"
            >
              <polyline
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                points={detection.trajectory
                  .map((point) => `${point.x},${point.y}`)
                  .join(' ')}
              />
            </svg>
          </div>
        );
      })}
    </div>
  );
}
