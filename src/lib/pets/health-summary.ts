// Numbers for the health cards. Pure functions: no database, no React.
// Days are Vancouver calendar days ("YYYY-MM-DD"), like the rest of My Pets.

import { dayOf, today } from "./format";
import type { PetLogs } from "./types";

const sum = (values: number[]) =>
  values.reduce((total, value) => total + value, 0);
const round1 = (value: number) => Math.round(value * 10) / 10;

/** The last `count` days, oldest first, ending today. */
export function lastDays(count = 7): string[] {
  const end = new Date(`${today()}T00:00:00Z`);
  return Array.from({ length: count }, (_, index) => {
    const day = new Date(end);
    day.setUTCDate(end.getUTCDate() - (count - 1 - index));
    return day.toISOString().slice(0, 10);
  });
}

const weekdayFormat = new Intl.DateTimeFormat("en-CA", {
  weekday: "short",
  timeZone: "UTC",
});

/** "Today" or a weekday */
export function weekdayLabel(day: string): string {
  return day === today()
    ? "Today"
    : weekdayFormat.format(new Date(`${day}T00:00:00Z`));
}

/** 75 -> "1h 15m", 40 -> "40m" */
export function minutesLabel(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const rest = minutes % 60;
  return rest ? `${Math.floor(minutes / 60)}h ${rest}m` : `${minutes / 60}h`;
}

/** Poop and pee count for each day. */
export function toiletByDay(logs: PetLogs["toilet"], days: string[]) {
  return days.map((day) => {
    const ofDay = logs.filter((log) => dayOf(log.loggedAt) === day);
    return {
      day,
      poop: ofDay.filter((log) => log.type === "POOP").length,
      pee: ofDay.filter((log) => log.type === "PEE").length,
    };
  });
}

/** Walk minutes and kilometres for each day. */
export function walksByDay(logs: PetLogs["walk"], days: string[]) {
  return days.map((day) => {
    const ofDay = logs.filter((log) => dayOf(log.startedAt) === day);
    return {
      day,
      minutes: sum(ofDay.map((log) => log.durationMinutes)),
      km: round1(sum(ofDay.map((log) => log.distanceKm ?? 0))),
    };
  });
}

/** Latest weigh-in, the change from the one before, and the last 6 (oldest first). */
export function weightTrend(logs: PetLogs["weight"]) {
  // The logs come newest first (see queries.ts).
  const [latest = null, previous = null] = logs;
  return {
    latest,
    previous,
    change: latest && previous ? round1(latest.weight - previous.weight) : null,
    recent: logs.slice(0, 6).reverse(),
  };
}

/** Upcoming vaccines first (soonest first), then completed ones (newest first). */
export function vaccineOrder(logs: PetLogs["vaccine"]) {
  const now = today();
  const isUpcoming = (log: PetLogs["vaccine"][number]) =>
    log.nextDueOn !== null && log.nextDueOn >= now;

  const upcoming = logs
    .filter(isUpcoming)
    .sort((a, b) => (a.nextDueOn ?? "").localeCompare(b.nextDueOn ?? ""));
  const completed = logs.filter((log) => !isUpcoming(log));

  return [
    ...upcoming.map((log) => ({ log, upcoming: true })),
    ...completed.map((log) => ({ log, upcoming: false })),
  ];
}
