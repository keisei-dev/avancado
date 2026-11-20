// The body of each health card on the pet dashboard. Server-safe.

import { Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { formatDateTime, formatDay } from "@/lib/pets/format";
import {
  lastDays,
  minutesLabel,
  toiletByDay,
  vaccineOrder,
  walksByDay,
  weekdayLabel,
  weightTrend,
} from "@/lib/pets/health-summary";
import type { PetLogs } from "@/lib/pets/types";

// One light row in a list (meals, vaccines, vet visits).
const ROW = "grid gap-px rounded-12 bg-ivory px-3.5 py-3";
const ROW_META = "text-xs font-medium text-muted";
const ROW_TITLE = "text-sm font-semibold text-brown";
const ROW_NOTE = "text-[13px] text-olive-dark";

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-muted">{text}</p>;
}

/** "+1 604 555 0188" -> "tel:+16045550188" */
function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

// ---------- Poop & pee ----------

export function ToiletChart({ logs }: { logs: PetLogs["toilet"] }) {
  if (logs.length === 0) return <Empty text="No bathroom entries yet." />;
  const days = toiletByDay(logs, lastDays());
  const max = Math.max(1, ...days.flatMap((day) => [day.poop, day.pee]));

  return (
    <>
      <div
        role="img"
        aria-label="Poop and pee per day, last 7 days"
        className="grid h-28 grid-cols-7 items-end gap-2"
      >
        {days.map(({ day, poop, pee }) => (
          <div key={day} className="flex h-full flex-col justify-end gap-1">
            <div className="flex flex-1 items-end justify-center gap-1">
              <CountBar value={poop} max={max} className="bg-olive" />
              <CountBar value={pee} max={max} className="bg-sky" />
            </div>
            <small className="text-center text-[11px] text-muted">
              {weekdayLabel(day)}
            </small>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-4 text-[13px] text-muted">
        <Legend className="bg-olive" label="Poop" />
        <Legend className="bg-sky" label="Pee" />
      </div>
    </>
  );
}

function CountBar({
  value,
  max,
  className,
}: {
  value: number;
  max: number;
  className: string;
}) {
  return (
    <span className="flex w-full max-w-[18px] flex-col items-center gap-1">
      <b className="text-[11px] font-semibold text-muted">{value}</b>
      <i
        className={cn(
          "block w-full rounded-t-[6px] rounded-b-[3px]",
          className,
        )}
        style={{ height: `${(value / max) * 64}px` }}
      />
    </span>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <i className={cn("size-2.5 rounded-[3px]", className)} />
      {label}
    </span>
  );
}

// ---------- Food ----------

export function FoodList({ logs }: { logs: PetLogs["food"] }) {
  if (logs.length === 0) return <Empty text="No meals logged yet." />;
  return (
    <div className="grid gap-2">
      {logs.slice(0, 3).map((log) => (
        <div key={log.id} className={ROW}>
          <span className={ROW_META}>{formatDateTime(log.eatenAt)}</span>
          <strong className={ROW_TITLE}>{log.foodName}</strong>
          <em className={cn(ROW_NOTE, "not-italic")}>
            {[[log.amount, log.unit].filter(Boolean).join(" "), log.notes]
              .filter(Boolean)
              .join(" · ")}
          </em>
        </div>
      ))}
    </div>
  );
}

// ---------- Weight ----------

export function WeightSummary({ logs }: { logs: PetLogs["weight"] }) {
  const { latest, previous, change, recent } = weightTrend(logs);
  if (!latest) return <Empty text="No weigh-ins yet." />;

  const min = Math.min(...recent.map((log) => log.weight));
  const max = Math.max(...recent.map((log) => log.weight));

  return (
    <>
      <div className="flex items-center justify-between">
        <strong className="font-display text-[34px] font-bold tracking-tight text-brown">
          {latest.weight.toFixed(1)}{" "}
          <small className="text-[15px] font-medium text-muted">kg</small>
        </strong>
        {change !== null && (
          <Badge tone={change === 0 ? "slate" : "default"}>
            {change > 0 ? "+" : change < 0 ? "−" : "±"}
            {Math.abs(change).toFixed(1)} kg
          </Badge>
        )}
      </div>
      <div
        role="img"
        aria-label="Last weigh-ins"
        className="my-3 flex h-14 items-end justify-between border-b border-dashed border-line-strong px-1"
      >
        {recent.map((log) => (
          <i
            key={log.id}
            title={`${log.weight} kg · ${formatDay(log.measuredOn)}`}
            className="block size-2.5 rounded-full bg-olive shadow-[0_0_0_4px_var(--color-sage-soft)]"
            style={{
              marginBottom: `${max === min ? 20 : 6 + ((log.weight - min) / (max - min)) * 34}px`,
            }}
          />
        ))}
      </div>
      <p className="text-[13px] text-muted">
        Last weighed {formatDay(latest.measuredOn)}
        {previous && ` · previous ${previous.weight.toFixed(1)} kg`}
      </p>
    </>
  );
}

// ---------- Vaccines ----------

export function VaccineList({ logs }: { logs: PetLogs["vaccine"] }) {
  if (logs.length === 0) return <Empty text="No vaccines recorded yet." />;
  return (
    <div className="grid gap-2">
      {vaccineOrder(logs)
        .slice(0, 2)
        .map(({ log, upcoming }) => (
          <div key={log.id} className={ROW}>
            <span className={ROW_META}>
              {upcoming && log.nextDueOn
                ? `Due ${formatDay(log.nextDueOn)}`
                : `Given ${formatDay(log.administeredOn)}`}
            </span>
            <strong className={ROW_TITLE}>{log.vaccineName}</strong>
            <em
              className={cn(
                "text-[13px] not-italic",
                upcoming ? "text-amber-ink" : "text-success",
              )}
            >
              {upcoming ? "Upcoming" : "Completed"}
              {log.notes && ` · ${log.notes}`}
            </em>
          </div>
        ))}
    </div>
  );
}

// ---------- Vet visits ----------

export function VetList({ logs }: { logs: PetLogs["vet"] }) {
  if (logs.length === 0) return <Empty text="No vet visits yet." />;
  return (
    <div className="grid gap-2">
      {logs.slice(0, 2).map((log) => (
        <div key={log.id} className={ROW}>
          <span className={ROW_META}>
            {formatDay(log.visitedOn)}
            {log.clinicName && ` · ${log.clinicName}`}
          </span>
          <strong className={ROW_TITLE}>{log.reason}</strong>
          {log.notes && (
            <em className={cn(ROW_NOTE, "not-italic")}>{log.notes}</em>
          )}
        </div>
      ))}
    </div>
  );
}

// ---------- Emergency contacts ----------

export function EmergencyList({ logs }: { logs: PetLogs["emergency"] }) {
  if (logs.length === 0) return <Empty text="No emergency contact yet." />;
  return (
    <div className="grid gap-3.5">
      {logs.map((contact, index) => (
        <div
          key={contact.id}
          className={cn(
            "grid gap-1",
            index > 0 && "border-t border-line pt-3.5",
          )}
        >
          <strong className="font-semibold text-brown">
            {contact.clinicName}
          </strong>
          <a
            href={telHref(contact.phone)}
            className="text-[15px] font-semibold text-olive-dark hover:text-olive"
          >
            {contact.phone}
          </a>
          {(contact.address || contact.notes) && (
            <span className="text-sm text-muted">
              {[contact.address, contact.notes].filter(Boolean).join(" · ")}
            </span>
          )}
          {index === 0 && (
            <a
              href={telHref(contact.phone)}
              className={buttonClass({
                variant: "secondary",
                size: "sm",
                className: "mt-2 justify-self-start",
              })}
            >
              <Phone size={15} aria-hidden="true" />
              Call {contact.clinicName.split(" (")[0]}
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

// ---------- Walking (dogs only) ----------

export function WalkChart({ logs }: { logs: PetLogs["walk"] }) {
  if (logs.length === 0) return <Empty text="No walks logged yet." />;
  const days = walksByDay(logs, lastDays());
  const max = Math.max(1, ...days.map((day) => day.minutes));
  const totalMinutes = days.reduce((total, day) => total + day.minutes, 0);
  const totalKm = days.reduce((total, day) => total + day.km, 0);
  const daysWithout = days.filter((day) => day.minutes === 0).length;

  return (
    <>
      <div
        role="img"
        aria-label="Walk minutes per day, last 7 days"
        className="flex h-[90px] items-end justify-between gap-2"
      >
        {days.map(({ day, minutes }) => {
          const label = weekdayLabel(day);
          return (
            <div
              key={day}
              title={`${label}: ${minutes} min`}
              className="group grid flex-1 justify-items-center gap-1.5"
            >
              <i
                className={cn(
                  "block w-full max-w-[26px] rounded-[6px] transition-colors",
                  minutes === 0
                    ? "bg-coral-soft"
                    : "bg-sage group-hover:bg-olive",
                )}
                style={{
                  height: `${minutes === 0 ? 4 : 8 + (minutes / max) * 56}px`,
                }}
              />
              <small className="text-xs text-muted">
                {label === "Today" ? label : label.slice(0, 1)}
              </small>
            </div>
          );
        })}
      </div>
      <div className="mt-3.5 flex flex-wrap gap-5 border-t border-line pt-3.5 text-[13px] text-muted">
        <span>
          <strong className="text-[15px] font-semibold text-brown">
            {minutesLabel(totalMinutes)}
          </strong>{" "}
          total
        </span>
        <span>
          <strong className="text-[15px] font-semibold text-brown">
            {totalKm.toFixed(1)} km
          </strong>{" "}
          distance
        </span>
        {daysWithout > 0 && (
          <span className="ml-auto text-coral">
            {daysWithout} {daysWithout === 1 ? "day" : "days"} without a walk
          </span>
        )}
      </div>
    </>
  );
}
