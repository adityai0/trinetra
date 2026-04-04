export const videoQueryKeys = {
  stream: ['stream'] as const,
};

/**
 * Calculates an overlay pixel position from normalized coordinates.
 */
export function toVideoPixels(value: number, max: number): number {
  return Math.max(0, Math.min(max, value));
}
