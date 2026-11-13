import "server-only";

import { connection } from "next/server";
import {
  ApplyStatus,
  ReportStatus,
  RequestStatus,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma/client";
import { hasDatabaseEnv } from "@/lib/auth/admin";
import {
  appendRangeParams,
  createdAtRangeWhere,
  parseAdminTimeRange,
  resolveAdminRange,
  type AdminTimeRange,
} from "@/lib/admin/date-range";

export const ADMIN_SITTER_FILTERS = [
  "all",
  "reported",
  "open",
  "matched",
  "done",
  "hidden",
] as const;

export type AdminSitterFilter = (typeof ADMIN_SITTER_FILTERS)[number];

export const ADMIN_SITTER_RANGES = ["all", "7d", "30d", "custom"] as const;

export type AdminSitterRange = AdminTimeRange;

export type AdminSitterReport = {
  id: string;
  reason: string;
  createdAt: Date;
  reporterName: string;
};

export type AdminSitterRequest = {
  id: string;
  title: string;
  description: string;
  areaName: string;
  startAt: Date;
  endAt: Date;
  durationMinutes: number;
  status: RequestStatus;
  createdAt: Date;
  applicantCount: number;
  selectedSitterName: string | null;
  author: {
    id: string;
    name: string;
    image: string | null;
  };
  pet: {
    id: string;
    name: string;
    breed: string;
    species: string;
    imageUrl: string | null;
  };
  openReports: AdminSitterReport[];
};

export type AdminSitterListResult = {
  requests: AdminSitterRequest[];
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
  counts: Record<AdminSitterFilter, number>;
};

export type AdminSitterListQuery = {
  q?: string | string[];
  filter?: string | string[];
  range?: string | string[];
  from?: string | string[];
  to?: string | string[];
  page?: string | string[];
  perPage?: string | string[];
};

const PER_PAGE_OPTIONS = [5, 10, 25] as const;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseAdminSitterFilter(
  value: string | undefined,
): AdminSitterFilter {
  if (value && ADMIN_SITTER_FILTERS.includes(value as AdminSitterFilter)) {
    return value as AdminSitterFilter;
  }
  return "all";
}

export function parseAdminSitterRange(
  value: string | undefined,
): AdminSitterRange {
  return parseAdminTimeRange(value);
}

export function parsePerPage(value: string | undefined): number {
  const n = Number(value);
  return PER_PAGE_OPTIONS.includes(n as (typeof PER_PAGE_OPTIONS)[number])
    ? n
    : 5;
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function sitterListHref(opts: {
  q?: string;
  filter?: AdminSitterFilter;
  range?: AdminSitterRange;
  from?: string;
  to?: string;
  page?: number;
  perPage?: number;
}): string {
  const params = new URLSearchParams();
  const q = (opts.q ?? "").trim();
  const filter = opts.filter ?? "all";
  const range = opts.range ?? "all";
  const page = opts.page ?? 1;
  const perPage = opts.perPage ?? 5;
  if (q) params.set("q", q);
  if (filter !== "all") params.set("filter", filter);
  appendRangeParams(params, range, opts.from, opts.to);
  if (page > 1) params.set("page", String(page));
  if (perPage !== 5) params.set("perPage", String(perPage));
  const query = params.toString();
  return query ? `/admin/sitter-requests?${query}` : "/admin/sitter-requests";
}

const DISPLAY_ID_PATTERN = /^SR-([0-9a-f]{6})$/i;

function searchWhere(q: string) {
  if (!q) return {};
  const clauses: object[] = [
    { title: { contains: q, mode: "insensitive" as const } },
    { areaName: { contains: q, mode: "insensitive" as const } },
    { author: { name: { contains: q, mode: "insensitive" as const } } },
    { pet: { name: { contains: q, mode: "insensitive" as const } } },
  ];
  if (UUID_PATTERN.test(q)) {
    clauses.push({ id: q });
  }
  const displayId = DISPLAY_ID_PATTERN.exec(q);
  if (displayId) {
    clauses.push({
      id: { startsWith: displayId[1].toLowerCase() },
    });
  }
  return { OR: clauses };
}

function filterWhere(filter: AdminSitterFilter) {
  switch (filter) {
    case "reported":
      return { reports: { some: { status: ReportStatus.OPEN } } };
    case "open":
      return { status: RequestStatus.OPEN };
    case "matched":
      return { status: RequestStatus.MATCHED };
    case "done":
      return { status: RequestStatus.DONE };
    case "hidden":
      return { status: RequestStatus.HIDDEN };
    default:
      return {};
  }
}

function rangeWhere(
  range: AdminSitterRange,
  now: Date,
  from?: string,
  to?: string,
) {
  return createdAtRangeWhere(
    range,
    now,
    range === "custom" && from && to ? { from, to } : undefined,
  );
}

const requestSelect = {
  id: true,
  title: true,
  description: true,
  areaName: true,
  startAt: true,
  endAt: true,
  durationMinutes: true,
  status: true,
  createdAt: true,
  author: {
    select: { id: true, name: true, image: true },
  },
  pet: {
    select: {
      id: true,
      name: true,
      breed: true,
      species: true,
      imageUrl: true,
    },
  },
  applications: {
    select: {
      status: true,
      applicant: { select: { name: true } },
    },
  },
  reports: {
    where: { status: ReportStatus.OPEN },
    orderBy: { createdAt: "desc" as const },
    select: {
      id: true,
      reason: true,
      createdAt: true,
      reporter: { select: { name: true } },
    },
  },
};

function toAdminRequest(row: {
  id: string;
  title: string;
  description: string;
  areaName: string;
  startAt: Date;
  endAt: Date;
  durationMinutes: number;
  status: RequestStatus;
  createdAt: Date;
  author: { id: string; name: string; image: string | null };
  pet: {
    id: string;
    name: string;
    breed: string;
    species: string;
    imageUrl: string | null;
  };
  applications: { status: ApplyStatus; applicant: { name: string } }[];
  reports: {
    id: string;
    reason: string;
    createdAt: Date;
    reporter: { name: string };
  }[];
}): AdminSitterRequest {
  const accepted = row.applications.find(
    (application) => application.status === ApplyStatus.ACCEPTED,
  );
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    areaName: row.areaName,
    startAt: row.startAt,
    endAt: row.endAt,
    durationMinutes: row.durationMinutes,
    status: row.status,
    createdAt: row.createdAt,
    applicantCount: row.applications.length,
    selectedSitterName: accepted?.applicant.name ?? null,
    author: row.author,
    pet: row.pet,
    openReports: row.reports.map((report) => ({
      id: report.id,
      reason: report.reason,
      createdAt: report.createdAt,
      reporterName: report.reporter.name,
    })),
  };
}

export async function getAdminSitterRequestList(
  query: AdminSitterListQuery,
): Promise<AdminSitterListResult> {
  await connection();

  const q = (firstParam(query.q) ?? "").trim();
  const filter = parseAdminSitterFilter(firstParam(query.filter));
  const resolved = resolveAdminRange(query);
  const range = resolved.range;
  const perPage = parsePerPage(firstParam(query.perPage));
  const requestedPage = Math.max(1, Number(firstParam(query.page)) || 1);
  const now = new Date();

  const emptyCounts = {
    all: 0,
    reported: 0,
    open: 0,
    matched: 0,
    done: 0,
    hidden: 0,
  };

  if (!hasDatabaseEnv()) {
    return {
      requests: [],
      total: 0,
      page: 1,
      perPage,
      pageCount: 1,
      counts: emptyCounts,
    };
  }

  const scoped = {
    ...searchWhere(q),
    ...rangeWhere(range, now, resolved.from, resolved.to),
  };
  const where = { ...scoped, ...filterWhere(filter) };

  const [total, allCount, reportedCount, openCount, matchedCount, doneCount, hiddenCount] =
    await Promise.all([
      prisma.sitterRequest.count({ where }),
      prisma.sitterRequest.count({ where: scoped }),
      prisma.sitterRequest.count({
        where: { ...scoped, ...filterWhere("reported") },
      }),
      prisma.sitterRequest.count({
        where: { ...scoped, ...filterWhere("open") },
      }),
      prisma.sitterRequest.count({
        where: { ...scoped, ...filterWhere("matched") },
      }),
      prisma.sitterRequest.count({
        where: { ...scoped, ...filterWhere("done") },
      }),
      prisma.sitterRequest.count({
        where: { ...scoped, ...filterWhere("hidden") },
      }),
    ]);

  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(requestedPage, pageCount);

  const rows = await prisma.sitterRequest.findMany({
    ...(Object.keys(where).length > 0 ? { where } : {}),
    select: requestSelect,
    orderBy: { createdAt: "desc" },
    ...(page > 1 ? { skip: (page - 1) * perPage } : {}),
    take: perPage,
  });

  return {
    requests: rows.map(toAdminRequest),
    total,
    page,
    perPage,
    pageCount,
    counts: {
      all: allCount,
      reported: reportedCount,
      open: openCount,
      matched: matchedCount,
      done: doneCount,
      hidden: hiddenCount,
    },
  };
}

export function shortRequestId(id: string) {
  return `SR-${id.slice(0, 6).toUpperCase()}`;
}

export function formatSittingDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function requestStatusLabel(status: RequestStatus) {
  switch (status) {
    case RequestStatus.MATCHED:
      return "Matched";
    case RequestStatus.DONE:
      return "Done";
    case RequestStatus.CANCELLED:
      return "Cancelled";
    case RequestStatus.HIDDEN:
      return "Hidden";
    default:
      return "Open";
  }
}
