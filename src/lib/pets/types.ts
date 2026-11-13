// Shapes that the My Pets pages receive. They hold only plain values
// (string, number, boolean, null), so Server Components can pass them to
// Client Components. Dates: "YYYY-MM-DD" for date-only columns, ISO strings
// for date-time columns.

export const LOG_KINDS = [
  "weight",
  "vaccine",
  "vet",
  "food",
  "walk",
  "toilet",
  "emergency",
] as const;

export type LogKind = (typeof LOG_KINDS)[number];

export function isLogKind(value: unknown): value is LogKind {
  return (
    typeof value === "string" &&
    (LOG_KINDS as readonly string[]).includes(value)
  );
}

export const FOOD_UNITS = [
  "cups",
  "g",
  "cans",
  "pouches",
  "treats",
  "pieces",
] as const;

export type Species = "DOG" | "CAT";

export type PetSummary = {
  id: string;
  name: string;
  species: Species;
  breed: string;
  imageUrl: string | null;
};

export type PetProfile = PetSummary & {
  birthDate: string | null;
  weight: number | null;
  gender: "MALE" | "FEMALE" | "UNKNOWN";
  isNeutered: boolean;
  isVaccinated: boolean;
  notes: string | null;
  updatedAt: string;
};

export type WeightLogView = { id: string; weight: number; measuredOn: string };

export type VaccineView = {
  id: string;
  vaccineName: string;
  administeredOn: string;
  nextDueOn: string | null;
  notes: string | null;
};

export type VetVisitView = {
  id: string;
  visitedOn: string;
  clinicName: string | null;
  reason: string;
  notes: string | null;
};

export type FoodLogView = {
  id: string;
  foodName: string;
  amount: number | null;
  unit: string | null;
  eatenAt: string;
  notes: string | null;
};

export type WalkLogView = {
  id: string;
  startedAt: string;
  durationMinutes: number;
  distanceKm: number | null;
  notes: string | null;
};

export type ToiletLogView = {
  id: string;
  type: "POOP" | "PEE";
  loggedAt: string;
  notes: string | null;
};

export type EmergencyContactView = {
  id: string;
  clinicName: string;
  phone: string;
  address: string | null;
  notes: string | null;
};

// The keys are the same as LogKind, so the UI can write logs[kind].
export type PetLogs = {
  weight: WeightLogView[];
  vaccine: VaccineView[];
  vet: VetVisitView[];
  food: FoodLogView[];
  walk: WalkLogView[];
  toilet: ToiletLogView[];
  emergency: EmergencyContactView[];
};

export type PetDetail = { pet: PetProfile; logs: PetLogs };
