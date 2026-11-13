// Display helpers for My Pets. Safe on the server and in the browser.
// Date-times are shown in Vancouver time, so the server (UTC on Vercel)

import type { PetProfile, Species } from "./types";

const TIME_ZONE = "America/Vancouver";

// "YYYY-MM-DD" values are stored at 00:00 UTC
const dayFormat = new Intl.DateTimeFormat("en-CA", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

const dateTimeFormat = new Intl.DateTimeFormat("en-CA", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: TIME_ZONE,
});

// The "en-CA" locale prints dates as YYYY-MM-DD.
const isoDayFormat = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE });

/** "2026-03-14" -> "Mar 14, 2026" */
export function formatDay(day: string): string {
  return dayFormat.format(new Date(`${day}T00:00:00Z`));
}

/** ISO date-time -> "Nov 12, 7:30 p.m." (Vancouver time) */
export function formatDateTime(iso: string): string {
  return dateTimeFormat.format(new Date(iso));
}

/** The Vancouver calendar day of a moment, as "YYYY-MM-DD". */
export function dayOf(date: Date | string): string {
  return isoDayFormat.format(new Date(date));
}

/** Today's date in Vancouver, as "YYYY-MM-DD". */
export function today(): string {
  return dayOf(new Date());
}

/** "today", "yesterday" or "Nov 3, 2026". */
export function relativeDay(iso: string): string {
  const day = dayOf(iso);
  if (day === today()) return "today";
  const yesterday = dayOf(new Date(Date.now() - 24 * 60 * 60 * 1000));
  return day === yesterday ? "yesterday" : formatDay(day);
}

/** Age from the birthday, e.g. "3 years" or "7 months". */
export function petAge(birthDate: string | null): string | null {
  if (!birthDate) return null;
  const [birthYear, birthMonth, birthDay] = birthDate.split("-").map(Number);
  const [year, month, day] = today().split("-").map(Number);
  // Full months between the two dates.
  const months =
    (year - birthYear) * 12 + (month - birthMonth) - (day < birthDay ? 1 : 0);
  if (months < 0) return null;
  if (months < 1) return "Under 1 month";
  if (months < 12) return months === 1 ? "1 month" : `${months} months`;
  const years = Math.floor(months / 12);
  return years === 1 ? "1 year" : `${years} years`;
}

export function speciesLabel(species: Species): string {
  return species === "DOG" ? "Dog" : "Cat";
}

export function genderLabel(gender: PetProfile["gender"]): string {
  if (gender === "FEMALE") return "Female";
  if (gender === "MALE") return "Male";
  return "Unknown";
}

/** "Spayed" for females, "Neutered" for others. */
export function neuterLabel(gender: PetProfile["gender"]): string {
  return gender === "FEMALE" ? "Spayed" : "Neutered";
}

// ---------- <input type="datetime-local"> (browser only) ----------

/** Input value (browser time, no zone) -> ISO string with a zone. */
export function localInputToIso(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

/** ISO string -> input value in browser time, e.g. "2026-11-12T19:30". */
export function isoToLocalInput(iso: string): string {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
