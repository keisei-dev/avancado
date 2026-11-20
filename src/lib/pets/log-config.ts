// One definition per health log: form fields, list summary and icon.
// Safe on the server and in the browser (no server-only code), so the
// log page (server) and the log form (client) both import it.

import {
  Activity,
  Footprints,
  HeartPulse,
  Phone,
  Syringe,
  Utensils,
  Weight,
  type LucideIcon,
} from "lucide-react";
import { formatDateTime, formatDay } from "./format";
import { FOOD_UNITS, type LogKind } from "./types";

export type AnyLog = Record<string, string | number | null>;

export type LogField = {
  key: string;
  label: string;
  type:
    "text" | "number" | "date" | "datetime" | "textarea" | "select" | "choice";
  required?: boolean;
  options?: { label: string; value: string }[];
  step?: string;
  min?: string;
  maxLength?: number;
  placeholder?: string;
  hint?: string;
  allowFuture?: boolean;
  startEmpty?: boolean;
  full?: boolean;
};

export type LogSummary = { title: string; meta: string; note?: string | null };

export type LogConfig = {
  title: string;
  singular: string;
  icon: LucideIcon;
  dogsOnly?: boolean;
  fields: LogField[];
  summary: (log: AnyLog) => LogSummary;
};

const NOTES: LogField = {
  key: "notes",
  label: "Notes",
  type: "textarea",
  maxLength: 500,
  full: true,
};

const text = (value: string | number | null) =>
  value === null ? "" : String(value);

export const LOG_CONFIG: Record<LogKind, LogConfig> = {
  weight: {
    title: "Weight",
    singular: "weigh-in",
    icon: Weight,
    fields: [
      {
        key: "weight",
        label: "Weight (kg)",
        type: "number",
        required: true,
        step: "0.1",
        min: "0.1",
      },
      { key: "measuredOn", label: "Measured on", type: "date", required: true },
    ],
    summary: (log) => ({
      title: `${text(log.weight)} kg`,
      meta: formatDay(text(log.measuredOn)),
    }),
  },

  vaccine: {
    title: "Vaccines",
    singular: "vaccine",
    icon: Syringe,
    fields: [
      {
        key: "vaccineName",
        label: "Vaccine",
        type: "text",
        required: true,
        maxLength: 100,
        placeholder: "e.g. Rabies, DHPP, FVRCP",
        full: true,
      },
      {
        key: "administeredOn",
        label: "Given on",
        type: "date",
        required: true,
      },
      {
        key: "nextDueOn",
        label: "Next due",
        type: "date",
        allowFuture: true,
        startEmpty: true,
      },
      { ...NOTES, placeholder: "Clinic, batch number, reactions…" },
    ],
    summary: (log) => ({
      title: text(log.vaccineName),
      meta: [
        `Given ${formatDay(text(log.administeredOn))}`,
        log.nextDueOn ? `Next due ${formatDay(text(log.nextDueOn))}` : "",
      ]
        .filter(Boolean)
        .join(" · "),
      note: text(log.notes),
    }),
  },

  vet: {
    title: "Vet visits",
    singular: "vet visit",
    icon: HeartPulse,
    fields: [
      { key: "visitedOn", label: "Visit date", type: "date", required: true },
      {
        key: "clinicName",
        label: "Clinic",
        type: "text",
        maxLength: 100,
        placeholder: "e.g. Harbour Pet Clinic",
      },
      {
        key: "reason",
        label: "Reason or symptoms",
        type: "text",
        required: true,
        maxLength: 200,
        full: true,
      },
      { ...NOTES, label: "Outcome / notes" },
    ],
    summary: (log) => ({
      title: text(log.reason),
      meta: [formatDay(text(log.visitedOn)), text(log.clinicName)]
        .filter(Boolean)
        .join(" · "),
      note: text(log.notes),
    }),
  },

  food: {
    title: "Food log",
    singular: "meal",
    icon: Utensils,
    fields: [
      {
        key: "foodName",
        label: "Food",
        type: "text",
        required: true,
        maxLength: 100,
        placeholder: "e.g. Salmon kibble",
        full: true,
      },
      {
        key: "amount",
        label: "Amount",
        type: "number",
        step: "0.1",
        min: "0.1",
      },
      {
        key: "unit",
        label: "Unit",
        type: "select",
        options: FOOD_UNITS.map((unit) => ({ label: unit, value: unit })),
      },
      {
        key: "eatenAt",
        label: "Date and time",
        type: "datetime",
        required: true,
        full: true,
      },
      { ...NOTES, placeholder: "Did they finish it?" },
    ],
    summary: (log) => ({
      title: text(log.foodName),
      meta: [
        [text(log.amount), text(log.unit)].filter(Boolean).join(" "),
        formatDateTime(text(log.eatenAt)),
      ]
        .filter(Boolean)
        .join(" · "),
      note: text(log.notes),
    }),
  },

  walk: {
    title: "Walking",
    singular: "walk",
    icon: Footprints,
    dogsOnly: true,
    fields: [
      {
        key: "startedAt",
        label: "Started at",
        type: "datetime",
        required: true,
        full: true,
      },
      {
        key: "durationMinutes",
        label: "Duration (minutes)",
        type: "number",
        required: true,
        step: "1",
        min: "1",
      },
      {
        key: "distanceKm",
        label: "Distance (km)",
        type: "number",
        step: "0.1",
        min: "0.1",
      },
      NOTES,
    ],
    summary: (log) => ({
      title: [
        `${text(log.durationMinutes)} min`,
        log.distanceKm ? `${text(log.distanceKm)} km` : "",
      ]
        .filter(Boolean)
        .join(" · "),
      meta: formatDateTime(text(log.startedAt)),
      note: text(log.notes),
    }),
  },

  toilet: {
    title: "Poop & pee",
    singular: "bathroom entry",
    icon: Activity,
    fields: [
      {
        key: "type",
        label: "Type",
        type: "choice",
        options: [
          { label: "Poop", value: "POOP" },
          { label: "Pee", value: "PEE" },
        ],
      },
      {
        key: "loggedAt",
        label: "Date and time",
        type: "datetime",
        required: true,
      },
      {
        ...NOTES,
        placeholder: "Anything unusual? Colour, consistency, accidents…",
      },
    ],
    summary: (log) => ({
      title: log.type === "POOP" ? "Poop" : "Pee",
      meta: formatDateTime(text(log.loggedAt)),
      note: text(log.notes),
    }),
  },

  emergency: {
    title: "Emergency contacts",
    singular: "contact",
    icon: Phone,
    fields: [
      {
        key: "clinicName",
        label: "Clinic",
        type: "text",
        required: true,
        maxLength: 100,
        full: true,
      },
      {
        key: "phone",
        label: "Phone",
        type: "text",
        required: true,
        maxLength: 20,
        placeholder: "+1 604 555 0188",
      },
      { key: "address", label: "Address", type: "text", maxLength: 200 },
      NOTES,
    ],
    summary: (log) => ({
      title: text(log.clinicName),
      meta: [text(log.phone), text(log.address)].filter(Boolean).join(" · "),
      note: text(log.notes),
    }),
  },
};
