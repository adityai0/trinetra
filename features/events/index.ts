import type { EventItem } from '@/types';

/**
 * Returns events that satisfy a free text search across person and description.
 */
export function filterEventsByText(
  events: EventItem[],
  query: string
): EventItem[] {
  const token = query.trim().toLowerCase();

  if (!token) {
    return events;
  }

  return events.filter((event) => {
    return (
      event.personId.toLowerCase().includes(token) ||
      event.description.toLowerCase().includes(token)
    );
  });
}
