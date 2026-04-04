'use client';

import { useMemo, useState } from 'react';
import { Circle, Layer, Line, Rect, Stage, Text } from 'react-konva';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { zoneTypeColor } from '@/features/zones';
import type { DrawMode, Zone, ZoneType } from '@/types';

interface ZoneCanvasProps {
  width?: number;
  height?: number;
  zones: Zone[];
  drawMode: DrawMode;
  zoneType: ZoneType;
  editingEnabled: boolean;
  selectedZoneId: string | null;
  draftPoints: [number, number][];
  onSelectZone: (zoneId: string | null) => void;
  onDraftPointsChange: (points: [number, number][]) => void;
  onCreateZone: (zone: Zone) => void;
  onUpdateZone: (zone: Zone) => void;
  onDeleteZone: (zoneId: string) => void;
}

interface RectDraft {
  startX: number;
  startY: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PointerStage {
  getPointerPosition: () => { x: number; y: number } | null;
}

interface PointerEventShape {
  target: {
    getStage: () => PointerStage | null;
  };
}

/**
 * Renders editable Konva-based zones with rectangle and polygon drawing support.
 */
export function ZoneCanvas({
  width = 900,
  height = 500,
  zones,
  drawMode,
  zoneType,
  editingEnabled,
  selectedZoneId,
  draftPoints,
  onSelectZone,
  onDraftPointsChange,
  onCreateZone,
  onUpdateZone,
  onDeleteZone,
}: ZoneCanvasProps) {
  const [rectDraft, setRectDraft] = useState<RectDraft | null>(null);

  const flatDraftPoints = useMemo(
    () => draftPoints.flatMap((point) => point),
    [draftPoints]
  );

  const selectedZone = zones.find((zone) => zone.id === selectedZoneId) ?? null;

  const handlePointerDown = (event: PointerEventShape) => {
    const stage = event.target.getStage();
    const pointer = stage?.getPointerPosition();

    if (!pointer) {
      return;
    }

    if (drawMode === 'rectangle') {
      setRectDraft({
        startX: pointer.x,
        startY: pointer.y,
        x: pointer.x,
        y: pointer.y,
        width: 0,
        height: 0,
      });
      return;
    }

    if (drawMode === 'polygon') {
      if (draftPoints.length >= 3) {
        const first = draftPoints[0];
        const distance = Math.hypot(pointer.x - first[0], pointer.y - first[1]);

        if (distance <= 14) {
          commitPolygon(draftPoints, zoneType, onCreateZone);
          onDraftPointsChange([]);
          return;
        }
      }

      onDraftPointsChange([...draftPoints, [pointer.x, pointer.y]]);
    }
  };

  const handlePointerMove = (event: PointerEventShape) => {
    if (!rectDraft || drawMode !== 'rectangle') {
      return;
    }

    const stage = event.target.getStage();
    const pointer = stage?.getPointerPosition();

    if (!pointer) {
      return;
    }

    const x = Math.min(rectDraft.startX, pointer.x);
    const y = Math.min(rectDraft.startY, pointer.y);
    const widthValue = Math.abs(pointer.x - rectDraft.startX);
    const heightValue = Math.abs(pointer.y - rectDraft.startY);

    setRectDraft({
      ...rectDraft,
      x,
      y,
      width: widthValue,
      height: heightValue,
    });
  };

  const handlePointerUp = () => {
    if (!rectDraft || drawMode !== 'rectangle') {
      return;
    }

    if (rectDraft.width > 6 && rectDraft.height > 6) {
      const zone: Zone = {
        id: `zone-${crypto.randomUUID()}`,
        name: `Zone ${zones.length + 1}`,
        type: zoneType,
        points: [
          [rectDraft.x, rectDraft.y],
          [rectDraft.x + rectDraft.width, rectDraft.y],
          [rectDraft.x + rectDraft.width, rectDraft.y + rectDraft.height],
          [rectDraft.x, rectDraft.y + rectDraft.height],
        ],
        color: zoneTypeColor(zoneType),
      };
      onCreateZone(zone);
      onSelectZone(zone.id);
    }

    setRectDraft(null);
  };

  const handleZoneDragEnd = (zone: Zone, x: number, y: number) => {
    const minX = Math.min(...zone.points.map((point) => point[0]));
    const minY = Math.min(...zone.points.map((point) => point[1]));
    const deltaX = x - minX;
    const deltaY = y - minY;

    onUpdateZone({
      ...zone,
      points: zone.points.map((point) => [
        point[0] + deltaX,
        point[1] + deltaY,
      ]),
    });
  };

  const handleVertexDrag = (
    zone: Zone,
    pointIndex: number,
    x: number,
    y: number
  ) => {
    const nextPoints = zone.points.map((point, index) => {
      if (index === pointIndex) {
        return [x, y] as [number, number];
      }

      return point;
    });

    onUpdateZone({
      ...zone,
      points: nextPoints,
    });
  };

  return (
    <Card className="gap-0 rounded-2xl py-0">
      <CardHeader className="flex flex-row items-center justify-between px-3 py-3">
        <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Zone Canvas
        </CardTitle>
        {selectedZone ? (
          <Button
            type="button"
            variant="destructive"
            size="xs"
            onClick={() => onDeleteZone(selectedZone.id)}
            className="h-6 rounded-md px-2 py-1 text-xs font-medium"
          >
            Delete Selected
          </Button>
        ) : null}
      </CardHeader>

      <CardContent className="px-3 pb-3">
        <Stage
          width={width}
          height={height}
          className="overflow-hidden rounded-xl border bg-muted/20"
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
        >
          <Layer>
            {zones.map((zone) => {
              const isSelected = zone.id === selectedZoneId;
              const flatPoints = zone.points.flatMap((point) => point);
              const minX = Math.min(...zone.points.map((point) => point[0]));
              const minY = Math.min(...zone.points.map((point) => point[1]));

              return (
                <>
                  <Line
                    key={`${zone.id}-shape`}
                    points={flatPoints}
                    closed
                    fill={`${zone.color}33`}
                    stroke={zone.color}
                    strokeWidth={isSelected ? 3 : 2}
                    onClick={(event) => {
                      event.cancelBubble = true;
                      onSelectZone(zone.id);
                    }}
                    draggable={editingEnabled}
                    x={0}
                    y={0}
                    onDragEnd={(event) =>
                      handleZoneDragEnd(
                        zone,
                        event.target.x() + minX,
                        event.target.y() + minY
                      )
                    }
                  />

                  <Text
                    key={`${zone.id}-label`}
                    x={minX}
                    y={Math.max(0, minY - 20)}
                    text={zone.name}
                    fill="hsl(var(--foreground))"
                    fontSize={11}
                  />

                  {editingEnabled && isSelected
                    ? zone.points.map((point, index) => (
                        <Circle
                          key={`${zone.id}-vertex-${index}`}
                          x={point[0]}
                          y={point[1]}
                          radius={5}
                          fill="hsl(var(--primary))"
                          stroke="hsl(var(--border))"
                          strokeWidth={1}
                          draggable
                          onDragEnd={(event) =>
                            handleVertexDrag(
                              zone,
                              index,
                              event.target.x(),
                              event.target.y()
                            )
                          }
                        />
                      ))
                    : null}
                </>
              );
            })}

            {drawMode === 'polygon' && flatDraftPoints.length > 0 ? (
              <>
                <Line
                  points={flatDraftPoints}
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  lineCap="round"
                  lineJoin="round"
                />
                {draftPoints.map((point, index) => (
                  <Circle
                    key={`draft-${index}`}
                    x={point[0]}
                    y={point[1]}
                    radius={index === 0 ? 7 : 5}
                    fill={
                      index === 0
                        ? 'hsl(var(--foreground))'
                        : 'hsl(var(--primary))'
                    }
                  />
                ))}
              </>
            ) : null}

            {rectDraft ? (
              <Rect
                x={rectDraft.x}
                y={rectDraft.y}
                width={rectDraft.width}
                height={rectDraft.height}
                stroke="hsl(var(--primary))"
                dash={[8, 5]}
              />
            ) : null}
          </Layer>
        </Stage>
      </CardContent>
    </Card>
  );
}

function commitPolygon(
  points: [number, number][],
  zoneType: ZoneType,
  onCreateZone: (zone: Zone) => void
): void {
  if (points.length < 3) {
    return;
  }

  onCreateZone({
    id: `zone-${crypto.randomUUID()}`,
    name: `Zone ${Math.floor(Math.random() * 1000)}`,
    type: zoneType,
    points,
    color: zoneTypeColor(zoneType),
  });
}
