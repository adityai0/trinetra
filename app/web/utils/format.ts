/**
 * Formats an ISO timestamp into a local short datetime string.
 */
export function formatTimestamp(value: string): string {
  const date = new Date(value);
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: 'short',
  }).format(date);
}

/**
 * Converts a numeric risk score into a semantic text label.
 */
export function riskLabel(score: number): 'low' | 'medium' | 'high' {
  if (score >= 0.75) {
    return 'high';
  }

  if (score >= 0.45) {
    return 'medium';
  }

  return 'low';
}

/**
 * Returns Tailwind classes for risk-dependent accent color.
 */
export function riskToneClass(score: number): string {
  const label = riskLabel(score);

  if (label === 'high') {
    return 'text-rose-300 border-rose-500/60 bg-rose-500/10';
  }

  if (label === 'medium') {
    return 'text-amber-200 border-amber-500/60 bg-amber-500/10';
  }

  return 'text-emerald-200 border-emerald-500/60 bg-emerald-500/10';
}
