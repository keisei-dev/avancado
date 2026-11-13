export const ADMIN_TIME_RANGES = ["all", "7d", "30d", "custom"] as const;

export type AdminTimeRange = (typeof ADMIN_TIME_RANGES)[number];

export type AdminCustomRange = {
  from: string;
  to: string;
};

const YMD = /^(\d{4})-(\d{2})-(\d{2})$/;

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function utcYmd(year: number, month: number, day: number): string | null {
  const utc = Date.UTC(year, month - 1, day);
  const date = new Date(utc);
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

/** Returns a YYYY-MM-DD string, or null if the value is not a real calendar day. */
export function parseYmd(value: string | undefined): string | null {
  if (!value) return null;
  const match = YMD.exec(value);
  if (!match) return null;
  return utcYmd(Number(match[1]), Number(match[2]), Number(match[3]));
}

export function parseCustomRange(
  fromValue: string | undefined,
  toValue: string | undefined,
): AdminCustomRange | null {
  const from = parseYmd(fromValue);
  const to = parseYmd(toValue);
  if (!from || !to || from > to) return null;
  return { from, to };
}

export function parseAdminTimeRange(
  value: string | undefined,
): AdminTimeRange {
  if (value && ADMIN_TIME_RANGES.includes(value as AdminTimeRange)) {
    return value as AdminTimeRange;
  }
  return "all";
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function resolveAdminRange(query: {
  range?: string | string[];
  from?: string | string[];
  to?: string | string[];
}): { range: AdminTimeRange; from?: string; to?: string } {
  const range = parseAdminTimeRange(firstParam(query.range));
  if (range !== "custom") return { range };
  const custom = parseCustomRange(firstParam(query.from), firstParam(query.to));
  if (!custom) return { range: "all" };
  return { range: "custom", from: custom.from, to: custom.to };
}

function utcStart(ymd: string): Date {
  const [year, month, day] = ymd.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function nextUtcDay(ymd: string): Date {
  const [year, month, day] = ymd.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + 1));
}

export function customRangeWhere(custom: AdminCustomRange) {
  return {
    createdAt: {
      gte: utcStart(custom.from),
      lt: nextUtcDay(custom.to),
    },
  };
}

export function createdAtRangeWhere(
  range: AdminTimeRange,
  now: Date,
  custom?: AdminCustomRange,
) {
  if (range === "custom" && custom) return customRangeWhere(custom);
  if (range === "all" || range === "custom") return {};
  const days = range === "7d" ? 7 : 30;
  const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return { createdAt: { gte: from } };
}

export function formatCustomRangeLabel(from: string, to: string): string {
  return `${formatUtcDay(from)} – ${formatUtcDay(to)}`;
}

function formatUtcDay(ymd: string): string {
  const [year, month, day] = ymd.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function appendRangeParams(
  params: URLSearchParams,
  range: AdminTimeRange,
  from?: string,
  to?: string,
) {
  if (range === "custom" && from && to) {
    params.set("range", "custom");
    params.set("from", from);
    params.set("to", to);
    return;
  }
  if (range !== "all" && range !== "custom") {
    params.set("range", range);
  }
}

export const DASHBOARD_RANGES = ["week", "month", "custom"] as const;

export type DashboardRange = (typeof DASHBOARD_RANGES)[number];

export function parseDashboardRange(
  value: string | undefined,
): DashboardRange {
  if (value === "month" || value === "custom" || value === "week") {
    return value;
  }
  return "week";
}

export function resolveDashboardRange(query: {
  range?: string | string[];
  from?: string | string[];
  to?: string | string[];
}): { range: DashboardRange; from?: string; to?: string } {
  const range = parseDashboardRange(firstParam(query.range));
  if (range !== "custom") return { range };
  const custom = parseCustomRange(firstParam(query.from), firstParam(query.to));
  if (!custom) return { range: "week" };
  return { range: "custom", from: custom.from, to: custom.to };
}

export function dashboardCreatedAtWhere(
  range: DashboardRange,
  now: Date,
  custom?: AdminCustomRange,
) {
  if (range === "custom" && custom) return customRangeWhere(custom);
  const days = range === "week" ? 7 : 30;
  const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return { createdAt: { gte: from } };
}

export function dashboardPeriodLabel(
  range: DashboardRange,
  from?: string,
  to?: string,
) {
  if (range === "custom" && from && to) {
    return formatCustomRangeLabel(from, to);
  }
  if (range === "month") return "Last 30 days";
  return "Last 7 days";
}

export function dashboardHref(opts: {
  range: DashboardRange;
  from?: string;
  to?: string;
}) {
  const params = new URLSearchParams();
  if (opts.range === "custom" && opts.from && opts.to) {
    params.set("range", "custom");
    params.set("from", opts.from);
    params.set("to", opts.to);
  } else if (opts.range === "month") {
    params.set("range", "month");
  }
  const query = params.toString();
  return query ? `/admin?${query}` : "/admin";
}
