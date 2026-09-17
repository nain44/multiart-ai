import { Category } from './api';

// Show the reminder starting this many days before the event, through the day itself.
const LEAD_DAYS = 7;

function parseEventDate(eventDate: string, today: Date): Date | null {
  const mmdd = eventDate.match(/^(\d{2})-(\d{2})$/);
  if (mmdd) {
    const [, month, day] = mmdd;
    return new Date(today.getFullYear(), Number(month) - 1, Number(day));
  }
  const full = eventDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (full) {
    const [, year, month, day] = full;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }
  return null;
}

function daysUntil(target: Date, today: Date): number {
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const ms = target.getTime() - startOfToday.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

/**
 * Picks the nearest category whose eventDate falls within the reminder window
 * (LEAD_DAYS before it, through the day itself). Returns null if none qualify.
 */
export function getUpcomingEventCategory(categories: Category[], today: Date = new Date()): Category | null {
  let best: { category: Category; daysAway: number } | null = null;

  for (const cat of categories) {
    if (!cat.eventDate) continue;
    const eventDay = parseEventDate(cat.eventDate, today);
    if (!eventDay) continue;

    const daysAway = daysUntil(eventDay, today);
    if (daysAway < 0 || daysAway > LEAD_DAYS) continue;

    if (!best || daysAway < best.daysAway) {
      best = { category: cat, daysAway };
    }
  }

  return best?.category ?? null;
}
