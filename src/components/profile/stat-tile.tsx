import type { ReactNode } from "react";

const TONES = {
  sage: { tile: "bg-sage-faint", icon: "bg-sage-soft text-olive-dark" },
  peach: { tile: "bg-peach-soft", icon: "bg-peach text-peach-ink" },
  sky: { tile: "bg-sky-soft", icon: "bg-sky text-sky-ink" },
  butter: { tile: "bg-amber-soft", icon: "bg-amber text-amber-ink" },
  lavender: { tile: "bg-lavender/40", icon: "bg-lavender text-lavender-ink" },
};

type StatTileProps = {
  tone: keyof typeof TONES;
  icon: ReactNode;
  value: ReactNode;
  label: string;
  note?: ReactNode;
  small?: boolean;
};

export function StatTile({
  tone,
  icon,
  value,
  label,
  note,
  small = false,
}: StatTileProps) {
  const colors = TONES[tone];
  return (
    <div className={`flex flex-col gap-0.5 rounded-16 p-4 ${colors.tile}`}>
      <span
        className={`mb-2 grid size-9 place-items-center rounded-full ${colors.icon}`}
      >
        {icon}
      </span>
      <strong
        className={`font-display font-extrabold leading-tight text-brown ${
          small ? "text-xl" : "text-2xl"
        }`}
      >
        {value}
      </strong>
      <span className="text-sm font-semibold text-brown-2">{label}</span>
      {note && <small className="text-xs text-muted">{note}</small>}
    </div>
  );
}
