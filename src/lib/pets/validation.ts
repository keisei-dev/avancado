// Hand-written checks for the My Pets forms.
// Server Actions call these. Each function reads FormData and returns
// either clean values or one error message to show in the form.

import { FOOD_UNITS, type LogKind } from "./types";

export type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };

export type PetInput = {
  species: "DOG" | "CAT";
  name: string;
  breed: string;
  birthDate: Date;
  weight: number;
  gender: "MALE" | "FEMALE";
  isNeutered: boolean;
  isVaccinated: boolean;
  notes: string | null;
};

export type LogInput =
  | { kind: "weight"; data: { weight: number; measuredOn: Date } }
  | {
      kind: "vaccine";
      data: {
        vaccineName: string;
        administeredOn: Date;
        nextDueOn: Date | null;
        notes: string | null;
      };
    }
  | {
      kind: "vet";
      data: {
        visitedOn: Date;
        clinicName: string | null;
        reason: string;
        notes: string | null;
      };
    }
  | {
      kind: "food";
      data: {
        foodName: string;
        amount: number | null;
        unit: string | null;
        eatenAt: Date;
        notes: string | null;
      };
    }
  | {
      kind: "walk";
      data: {
        startedAt: Date;
        durationMinutes: number;
        distanceKm: number | null;
        notes: string | null;
      };
    }
  | {
      kind: "toilet";
      data: { type: "POOP" | "PEE"; loggedAt: Date; notes: string | null };
    }
  | {
      kind: "emergency";
      data: {
        clinicName: string;
        phone: string;
        address: string | null;
        notes: string | null;
      };
    };

// ---------- small helpers ----------

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
// Date and time WITH a time zone, e.g. 2026-11-12T19:30:00.000Z
const DATE_TIME =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/;
const PHONE = /^[0-9+()\-.\s]{7,20}$/;

function fail(error: string): { ok: false; error: string } {
  return { ok: false, error };
}

function text(form: FormData, key: string): string {
  return String(form.get(key) ?? "").trim();
}

function parseNumber(value: string): number | null {
  if (value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

// Two decimal places, like the Decimal(5, 2) columns.
function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** "YYYY-MM-DD" (from <input type="date">) -> Date at 00:00 UTC. */
function parseDay(value: string): Date | null {
  if (!DATE_ONLY.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  // Rejects dates that do not exist, such as 2026-02-31.
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10) === value ? date : null;
}

/** ISO date-time with a time zone -> Date. */
function parseInstant(value: string): Date | null {
  if (!DATE_TIME.test(value)) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

// "Today" in UTC is the same day as Vancouver or one day later,
// so a Vancouver user's "today" is always accepted.
function isFutureDay(date: Date): boolean {
  const todayUtc = new Date(
    `${new Date().toISOString().slice(0, 10)}T00:00:00Z`,
  );
  return date.getTime() > todayUtc.getTime();
}

// 5 minutes of tolerance for a slow phone clock.
function isFutureInstant(date: Date): boolean {
  return date.getTime() > Date.now() + 5 * 60 * 1000;
}

// ---------- pet profile ----------

export function parsePetForm(form: FormData): Parsed<PetInput> {
  const species = text(form, "species");
  const name = text(form, "name");
  const breed = text(form, "breed");
  const birthDate = parseDay(text(form, "birthDate"));
  const weight = parseNumber(text(form, "weight"));
  const gender = text(form, "gender");
  const notes = text(form, "notes") || null;

  if (species !== "DOG" && species !== "CAT") return fail("Choose dog or cat.");
  if (!name || name.length > 50)
    return fail("Enter a name of up to 50 characters.");
  if (breed.length > 50) return fail("Keep the breed under 50 characters.");
  if (!birthDate || isFutureDay(birthDate))
    return fail("Enter a birthday that is not in the future.");
  if (weight === null || weight <= 0 || weight > 200)
    return fail("Enter a weight between 0 and 200 kg.");
  if (gender !== "MALE" && gender !== "FEMALE")
    return fail("Choose female or male.");
  if (notes && notes.length > 1000)
    return fail("Keep the care notes under 1,000 characters.");

  return {
    ok: true,
    value: {
      species,
      name,
      breed,
      birthDate,
      weight: round2(weight),
      gender,
      // A checkbox sends "on" only when it is checked.
      isNeutered: form.get("isNeutered") === "on",
      // Radio buttons "Vaccinated" / "Not yet" send "true" / "false".
      isVaccinated: form.get("isVaccinated") === "true",
      notes,
    },
  };
}

// ---------- health logs ----------

export function parseLogForm(kind: LogKind, form: FormData): Parsed<LogInput> {
  const notes = text(form, "notes") || null;
  if (notes && notes.length > 500)
    return fail("Keep the notes under 500 characters.");

  switch (kind) {
    case "weight": {
      const weight = parseNumber(text(form, "weight"));
      const measuredOn = parseDay(text(form, "measuredOn"));
      if (weight === null || weight <= 0 || weight > 200)
        return fail("Enter a weight between 0 and 200 kg.");
      if (!measuredOn || isFutureDay(measuredOn))
        return fail("Enter a date that is not in the future.");
      return {
        ok: true,
        value: { kind, data: { weight: round2(weight), measuredOn } },
      };
    }

    case "vaccine": {
      const vaccineName = text(form, "vaccineName");
      const administeredOn = parseDay(text(form, "administeredOn"));
      const nextDueText = text(form, "nextDueOn");
      const nextDueOn = nextDueText ? parseDay(nextDueText) : null;
      if (!vaccineName || vaccineName.length > 100)
        return fail("Enter the vaccine name (up to 100 characters).");
      if (!administeredOn || isFutureDay(administeredOn))
        return fail("Enter the date it was given (not in the future).");
      if (nextDueText && !nextDueOn)
        return fail("Enter a valid next due date.");
      if (nextDueOn && nextDueOn < administeredOn)
        return fail("The next due date must be after the date it was given.");
      return {
        ok: true,
        value: {
          kind,
          data: { vaccineName, administeredOn, nextDueOn, notes },
        },
      };
    }

    case "vet": {
      const visitedOn = parseDay(text(form, "visitedOn"));
      const clinicName = text(form, "clinicName") || null;
      const reason = text(form, "reason");
      if (!visitedOn || isFutureDay(visitedOn))
        return fail("Enter a visit date that is not in the future.");
      if (clinicName && clinicName.length > 100)
        return fail("Keep the clinic name under 100 characters.");
      if (!reason || reason.length > 200)
        return fail("Enter the reason or symptoms (up to 200 characters).");
      return {
        ok: true,
        value: { kind, data: { visitedOn, clinicName, reason, notes } },
      };
    }

    case "food": {
      const foodName = text(form, "foodName");
      const amountText = text(form, "amount");
      const amount = amountText ? parseNumber(amountText) : null;
      const unit = text(form, "unit") || null;
      const eatenAt = parseInstant(text(form, "eatenAt"));
      if (!foodName || foodName.length > 100)
        return fail("Enter the food (up to 100 characters).");
      if (amountText && (amount === null || amount <= 0 || amount > 9999))
        return fail("Enter an amount above 0.");
      if (unit && !(FOOD_UNITS as readonly string[]).includes(unit))
        return fail("Choose a unit from the list.");
      if (!eatenAt || isFutureInstant(eatenAt))
        return fail("Enter a date and time that is not in the future.");
      return {
        ok: true,
        value: {
          kind,
          data: {
            foodName,
            amount: amount === null ? null : round2(amount),
            unit,
            eatenAt,
            notes,
          },
        },
      };
    }

    case "walk": {
      const startedAt = parseInstant(text(form, "startedAt"));
      const durationMinutes = parseNumber(text(form, "durationMinutes"));
      const distanceText = text(form, "distanceKm");
      const distanceKm = distanceText ? parseNumber(distanceText) : null;
      if (!startedAt || isFutureInstant(startedAt))
        return fail("Enter a start time that is not in the future.");
      if (
        durationMinutes === null ||
        !Number.isInteger(durationMinutes) ||
        durationMinutes < 1 ||
        durationMinutes > 1440
      )
        return fail("Enter the duration in whole minutes (1 to 1,440).");
      if (
        distanceText &&
        (distanceKm === null || distanceKm <= 0 || distanceKm > 100)
      )
        return fail("Enter a distance between 0 and 100 km.");
      return {
        ok: true,
        value: {
          kind,
          data: {
            startedAt,
            durationMinutes,
            distanceKm: distanceKm === null ? null : round2(distanceKm),
            notes,
          },
        },
      };
    }

    case "toilet": {
      const type = text(form, "type");
      const loggedAt = parseInstant(text(form, "loggedAt"));
      if (type !== "POOP" && type !== "PEE") return fail("Choose poop or pee.");
      if (!loggedAt || isFutureInstant(loggedAt))
        return fail("Enter a date and time that is not in the future.");
      return { ok: true, value: { kind, data: { type, loggedAt, notes } } };
    }

    case "emergency": {
      const clinicName = text(form, "clinicName");
      const phone = text(form, "phone");
      const address = text(form, "address") || null;
      if (!clinicName || clinicName.length > 100)
        return fail("Enter the clinic name (up to 100 characters).");
      if (!PHONE.test(phone)) return fail("Enter a valid phone number.");
      if (address && address.length > 200)
        return fail("Keep the address under 200 characters.");
      return {
        ok: true,
        value: { kind, data: { clinicName, phone, address, notes } },
      };
    }
  }
}
