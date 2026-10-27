import {
  CalendarDays,
  Flag,
  MapPin,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import type { DashboardMetricKey } from "@/lib/admin/mock-data";

const METRIC_ICONS = {
  activeMembers: Users,
  newMembers: UserPlus,
  reportedPosts: Flag,
  reportedSitterEvents: CalendarDays,
  petFriendlyPlaces: MapPin,
  waitingVerification: ShieldCheck,
} as const;

type StatCardProps = {
  label: string;
  value: number;
  hint: string;
  metricKey: DashboardMetricKey;
};

export function StatCard({ label, value, hint, metricKey }: StatCardProps) {
  const Icon = METRIC_ICONS[metricKey];

  return (
    <article className="rounded-20 border border-line bg-white p-5 shadow-admin">
      <span className="mb-3.5 grid h-10 w-10 place-items-center rounded-12 bg-sage-soft text-olive-hover">
        <Icon aria-hidden="true" size={21} />
      </span>
      <p className="text-[13px] font-medium text-muted">{label}</p>
      <p className="font-display mt-0.5 text-[30px] font-bold tracking-tight text-brown">
        {value.toLocaleString()}
      </p>
      <p className="mt-1 text-[13px] text-muted">{hint}</p>
    </article>
  );
}
