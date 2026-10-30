import { createHash } from "node:crypto";

/**
 * Makes the same UUID every time for the same key, e.g. seedUuid("pet:sunny").
 * Because the id never changes, running the seed again updates the same rows
 * instead of creating duplicates.
 */
export function seedUuid(key: string): string {
  const hash = createHash("sha1").update(`avancado-seed:${key}`).digest("hex");
  // Set the UUID version (5) and variant bits so it is a valid UUID.
  const variant = ((parseInt(hash[16], 16) & 0x3) | 0x8).toString(16);
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    `5${hash.slice(13, 16)}`,
    `${variant}${hash.slice(17, 20)}`,
    hash.slice(20, 32),
  ].join("-");
}

/** A date only (for @db.Date columns). 0 = today, -1 = yesterday. */
export function dateOnly(offsetDays = 0): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + offsetDays),
  );
}

/** A date and time, e.g. dateTime(-1, "18:30") = yesterday at 6:30 PM. */
export function dateTime(offsetDays: number, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

/** "07:05" style text from numbers. */
export function hhmm(hours: number, minutes: number): string {
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}
