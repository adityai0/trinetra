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
    return 'border-destructive/50 bg-destructive/10 text-destructive';
  }

  if (label === 'medium') {
    return 'border-accent bg-accent text-accent-foreground';
  }

  return 'border-primary/40 bg-primary/10 text-primary';
}
