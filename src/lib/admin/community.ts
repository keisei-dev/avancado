import "server-only";

import { connection } from "next/server";
import { PostStatus, PostType, ReportStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma/client";
import { hasDatabaseEnv } from "@/lib/auth/admin";
import {
  appendRangeParams,
  createdAtRangeWhere,
  parseAdminTimeRange,
  resolveAdminRange,
  type AdminTimeRange,
} from "@/lib/admin/date-range";

export const ADMIN_COMMUNITY_FILTERS = [
  "all",
  "reported",
  "lost",
  "hidden",
] as const;

export type AdminCommunityFilter = (typeof ADMIN_COMMUNITY_FILTERS)[number];

export const ADMIN_COMMUNITY_RANGES = [
  "all",
  "7d",
  "30d",
  "custom",
] as const;

export type AdminCommunityRange = AdminTimeRange;

export type AdminCommunityReport = {
  id: string;
  reason: string;
  createdAt: Date;
  reporterName: string;
};

export type AdminCommunityPost = {
  id: string;
  caption: string;
  imageUrl: string;
  type: PostType;
  status: PostStatus;
  createdAt: Date;
  likeCount: number;
  author: {
    id: string;
    name: string;
    image: string | null;
    isVerified: boolean;
  };
  openReports: AdminCommunityReport[];
};

export type AdminCommunityListResult = {
  posts: AdminCommunityPost[];
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
  counts: Record<AdminCommunityFilter, number>;
};

export type AdminCommunityListQuery = {
  q?: string | string[];
  filter?: string | string[];
  range?: string | string[];
  from?: string | string[];
  to?: string | string[];
  page?: string | string[];
  perPage?: string | string[];
};

const PER_PAGE_OPTIONS = [5, 10, 25] as const;

export function parseAdminCommunityFilter(
  value: string | undefined,
): AdminCommunityFilter {
  if (value && ADMIN_COMMUNITY_FILTERS.includes(value as AdminCommunityFilter)) {
    return value as AdminCommunityFilter;
  }
  return "all";
}

export function parseAdminCommunityRange(
  value: string | undefined,
): AdminCommunityRange {
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

export function communityListHref(opts: {
  q?: string;
  filter?: AdminCommunityFilter;
  range?: AdminCommunityRange;
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
  return query ? `/admin/community?${query}` : "/admin/community";
}

function searchWhere(q: string) {
  if (!q) return {};
  return {
    OR: [
      { caption: { contains: q, mode: "insensitive" as const } },
      { location: { contains: q, mode: "insensitive" as const } },
      { author: { name: { contains: q, mode: "insensitive" as const } } },
    ],
  };
}

function filterWhere(filter: AdminCommunityFilter) {
  switch (filter) {
    case "reported":
      return { reports: { some: { status: ReportStatus.OPEN } } };
    case "lost":
      return { type: PostType.LOST_PET };
    case "hidden":
      return { status: PostStatus.HIDDEN };
    default:
      return {};
  }
}

function rangeWhere(
  range: AdminCommunityRange,
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

const postSelect = {
  id: true,
  caption: true,
  imageUrl: true,
  type: true,
  status: true,
  createdAt: true,
  likeCount: true,
  author: {
    select: {
      id: true,
      name: true,
      image: true,
      isVerified: true,
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

function toAdminPost(row: {
  id: string;
  caption: string;
  imageUrl: string;
  type: PostType;
  status: PostStatus;
  createdAt: Date;
  likeCount: number;
  author: {
    id: string;
    name: string;
    image: string | null;
    isVerified: boolean;
  };
  reports: {
    id: string;
    reason: string;
    createdAt: Date;
    reporter: { name: string };
  }[];
}): AdminCommunityPost {
  return {
    id: row.id,
    caption: row.caption,
    imageUrl: row.imageUrl,
    type: row.type,
    status: row.status,
    createdAt: row.createdAt,
    likeCount: row.likeCount,
    author: row.author,
    openReports: row.reports.map((report) => ({
      id: report.id,
      reason: report.reason,
      createdAt: report.createdAt,
      reporterName: report.reporter.name,
    })),
  };
}

export async function getAdminCommunityList(
  query: AdminCommunityListQuery,
): Promise<AdminCommunityListResult> {
  await connection();

  const q = (firstParam(query.q) ?? "").trim();
  const filter = parseAdminCommunityFilter(firstParam(query.filter));
  const resolved = resolveAdminRange(query);
  const range = resolved.range;
  const perPage = parsePerPage(firstParam(query.perPage));
  const requestedPage = Math.max(1, Number(firstParam(query.page)) || 1);
  const now = new Date();

  const emptyCounts = { all: 0, reported: 0, lost: 0, hidden: 0 };

  if (!hasDatabaseEnv()) {
    return {
      posts: [],
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

  const [total, allCount, reportedCount, lostCount, hiddenCount] =
    await Promise.all([
      prisma.communityPost.count({ where }),
      prisma.communityPost.count({ where: scoped }),
      prisma.communityPost.count({
        where: { ...scoped, ...filterWhere("reported") },
      }),
      prisma.communityPost.count({
        where: { ...scoped, ...filterWhere("lost") },
      }),
      prisma.communityPost.count({
        where: { ...scoped, ...filterWhere("hidden") },
      }),
    ]);

  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(requestedPage, pageCount);

  const rows = await prisma.communityPost.findMany({
    ...(Object.keys(where).length > 0 ? { where } : {}),
    select: postSelect,
    orderBy: { createdAt: "desc" },
    ...(page > 1 ? { skip: (page - 1) * perPage } : {}),
    take: perPage,
  });

  return {
    posts: rows.map(toAdminPost),
    total,
    page,
    perPage,
    pageCount,
    counts: {
      all: allCount,
      reported: reportedCount,
      lost: lostCount,
      hidden: hiddenCount,
    },
  };
}

export function formatPostedDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function postTypeLabel(type: PostType): string {
  return type === PostType.LOST_PET ? "Lost pet" : "Post";
}

export function postStatusLabel(status: PostStatus): string {
  switch (status) {
    case PostStatus.HIDDEN:
      return "Hidden";
    case PostStatus.FOUND:
      return "Found";
    default:
      return "Active";
  }
}
