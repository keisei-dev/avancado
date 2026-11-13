import "server-only";

import { connection } from "next/server";
import {
  AccountStatus,
  PlaceStatus,
  PostStatus,
  ReportStatus,
  RequestStatus,
  UserRole,
  VerificationStatus,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma/client";
import { hasDatabaseEnv } from "@/lib/auth/admin";
import {
  dashboardCreatedAtWhere,
  dashboardPeriodLabel,
  resolveDashboardRange,
  type DashboardRange,
} from "@/lib/admin/date-range";
import type {
  AdminNavCounts,
  DashboardStats,
  PostingTimeBucket,
  ReviewQueueItem,
} from "@/lib/admin/mock-data";

export type DashboardQuery = {
  range?: string | string[];
  from?: string | string[];
  to?: string | string[];
};

const CHART_BUCKETS = [
  { label: "6 AM", hours: [5, 6, 7] },
  { label: "9 AM", hours: [8, 9, 10] },
  { label: "12 PM", hours: [11, 12, 13] },
  { label: "3 PM", hours: [14, 15, 16] },
  { label: "6 PM", hours: [17, 18, 19] },
  { label: "9 PM", hours: [20, 21, 22] },
  { label: "12 AM", hours: [23, 0, 1, 2, 3, 4] },
] as const;

function emptyStats(periodLabel: string): DashboardStats {
  return {
    activeMembers: 0,
    newMembers: 0,
    reportedPosts: 0,
    reportedSitterEvents: 0,
    petFriendlyPlaces: 0,
    waitingVerification: 0,
    livePosts: 0,
    sitterRequests: 0,
    placeReports: 0,
    metrics: [
      {
        key: "activeMembers",
        label: "Active members",
        value: 0,
        hint: "Current total · not filtered",
      },
      {
        key: "newMembers",
        label: "New members",
        value: 0,
        hint: periodLabel,
      },
      {
        key: "reportedPosts",
        label: "Reported posts",
        value: 0,
        hint: `0 posts live · ${periodLabel}`,
      },
      {
        key: "reportedSitterEvents",
        label: "Reported sitter events",
        value: 0,
        hint: `0 requests · ${periodLabel}`,
      },
      {
        key: "petFriendlyPlaces",
        label: "Pet-friendly places",
        value: 0,
        hint: `Current total · 0 reports · ${periodLabel}`,
      },
      {
        key: "waitingVerification",
        label: "Waiting verification",
        value: 0,
        hint: "Identity reviews · all time",
      },
    ],
  };
}

function vancouverHour(date: Date): number {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Vancouver",
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(date);
  return Number(parts.find((part) => part.type === "hour")?.value ?? 0);
}

function vancouverDayKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Vancouver",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatReviewDate(date: Date, now: Date): string {
  const today = vancouverDayKey(now);
  const that = vancouverDayKey(date);
  if (that === today) return "Today";
  const yesterday = vancouverDayKey(
    new Date(now.getTime() - 24 * 60 * 60 * 1000),
  );
  if (that === yesterday) return "Yesterday";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "America/Vancouver",
  });
}

function toPostingTimes(dates: Date[]): PostingTimeBucket[] {
  const counts = CHART_BUCKETS.map((bucket) => ({
    label: bucket.label,
    count: 0,
  }));
  for (const date of dates) {
    const hour = vancouverHour(date);
    const index = CHART_BUCKETS.findIndex((bucket) =>
      (bucket.hours as readonly number[]).includes(hour),
    );
    if (index >= 0) counts[index].count += 1;
  }
  const max = Math.max(0, ...counts.map((bucket) => bucket.count));
  return counts.map((bucket) => ({
    label: bucket.label,
    count: bucket.count,
    percent: max === 0 ? 0 : Math.round((bucket.count / max) * 100),
  }));
}

export async function getDashboardData(query: DashboardQuery): Promise<{
  stats: DashboardStats;
  postingTimes: PostingTimeBucket[];
  reviewQueue: ReviewQueueItem[];
  periodLabel: string;
  range: DashboardRange;
  from?: string;
  to?: string;
}> {
  await connection();
  const resolved = resolveDashboardRange(query);
  const now = new Date();
  const custom =
    resolved.range === "custom" && resolved.from && resolved.to
      ? { from: resolved.from, to: resolved.to }
      : undefined;
  const createdAtWhere = dashboardCreatedAtWhere(
    resolved.range,
    now,
    custom,
  );
  const periodLabel = dashboardPeriodLabel(
    resolved.range,
    resolved.from,
    resolved.to,
  );

  if (!hasDatabaseEnv()) {
    return {
      stats: emptyStats(periodLabel),
      postingTimes: toPostingTimes([]),
      reviewQueue: [],
      periodLabel,
      range: resolved.range,
      from: resolved.from,
      to: resolved.to,
    };
  }

  const [
    activeMembers,
    newMembers,
    reportedPosts,
    reportedSitterEvents,
    petFriendlyPlaces,
    placeReports,
    waitingVerification,
    livePosts,
    sitterRequests,
    postTimes,
    requestTimes,
    openReports,
  ] = await Promise.all([
    prisma.user.count({
      where: { role: UserRole.USER, accountStatus: AccountStatus.ACTIVE },
    }),
    prisma.user.count({
      where: { role: UserRole.USER, ...createdAtWhere },
    }),
    prisma.report.count({
      where: {
        postId: { not: null },
        status: ReportStatus.OPEN,
        ...createdAtWhere,
      },
    }),
    prisma.report.count({
      where: {
        requestId: { not: null },
        status: ReportStatus.OPEN,
        ...createdAtWhere,
      },
    }),
    prisma.place.count({
      where: { status: PlaceStatus.ACTIVE },
    }),
    prisma.report.count({
      where: {
        placeId: { not: null },
        status: ReportStatus.OPEN,
        ...createdAtWhere,
      },
    }),
    prisma.idVerification.count({
      where: { status: VerificationStatus.PENDING },
    }),
    prisma.communityPost.count({
      where: { status: PostStatus.ACTIVE },
    }),
    prisma.sitterRequest.count({
      where: { status: { not: RequestStatus.HIDDEN } },
    }),
    prisma.communityPost.findMany({
      where: { status: { not: PostStatus.HIDDEN }, ...createdAtWhere },
      select: { createdAt: true },
    }),
    prisma.sitterRequest.findMany({
      where: {
        status: { in: [RequestStatus.OPEN, RequestStatus.MATCHED] },
        ...createdAtWhere,
      },
      select: { createdAt: true },
    }),
    prisma.report.findMany({
      where: {
        status: ReportStatus.OPEN,
        OR: [
          { postId: { not: null } },
          { requestId: { not: null } },
          { placeId: { not: null } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: {
        id: true,
        reason: true,
        createdAt: true,
        postId: true,
        requestId: true,
        placeId: true,
        post: { select: { author: { select: { name: true } } } },
        request: { select: { title: true } },
        place: { select: { name: true } },
      },
    }),
  ]);

  // TODO: "+12% this month" needs historical member-count snapshots.
  // User has no lastActive/loginAt field, so growth cannot be computed.

  const stats: DashboardStats = {
    activeMembers,
    newMembers,
    reportedPosts,
    reportedSitterEvents,
    petFriendlyPlaces,
    waitingVerification,
    livePosts,
    sitterRequests,
    placeReports,
    metrics: [
      {
        key: "activeMembers",
        label: "Active members",
        value: activeMembers,
        hint: "Current total · not filtered",
      },
      {
        key: "newMembers",
        label: "New members",
        value: newMembers,
        hint: periodLabel,
      },
      {
        key: "reportedPosts",
        label: "Reported posts",
        value: reportedPosts,
        hint: `${livePosts} posts live · ${periodLabel}`,
      },
      {
        key: "reportedSitterEvents",
        label: "Reported sitter events",
        value: reportedSitterEvents,
        hint: `${sitterRequests} requests · ${periodLabel}`,
      },
      {
        key: "petFriendlyPlaces",
        label: "Pet-friendly places",
        value: petFriendlyPlaces,
        hint: `Current total · ${placeReports} reports · ${periodLabel}`,
      },
      {
        key: "waitingVerification",
        label: "Waiting verification",
        value: waitingVerification,
        hint: "Identity reviews · all time",
      },
    ],
  };

  const reportItems: ReviewQueueItem[] = openReports.map((report) => {
    if (report.requestId && report.request) {
      return {
        id: report.id,
        target: "request",
        subject: report.request.title,
        reason: report.reason,
        date: formatReviewDate(report.createdAt, now),
        href: "/admin/sitter-requests?filter=reported",
      };
    }
    if (report.placeId && report.place) {
      return {
        id: report.id,
        target: "place",
        subject: report.place.name,
        reason: report.reason,
        date: formatReviewDate(report.createdAt, now),
        href: "/admin/spots",
      };
    }
    const author = report.post?.author.name.trim() || "Member";
    return {
      id: report.id,
      target: "post",
      subject: `${author}’s post`,
      reason: report.reason,
      date: formatReviewDate(report.createdAt, now),
      href: "/admin/community?filter=reported",
    };
  });

  const reviewQueue: ReviewQueueItem[] = [...reportItems];
  if (waitingVerification > 0) {
    reviewQueue.splice(3);
    reviewQueue.push({
      id: "verification-queue",
      target: "verification",
      subject: "Identity verification waiting",
      reason: "User management",
      date: "",
      href: "/admin/users?filter=pending",
    });
  }

  return {
    stats,
    postingTimes: toPostingTimes([
      ...postTimes.map((row) => row.createdAt),
      ...requestTimes.map((row) => row.createdAt),
    ]),
    reviewQueue,
    periodLabel,
    range: resolved.range,
    from: resolved.from,
    to: resolved.to,
  };
}

export async function getAdminNavCounts(): Promise<AdminNavCounts> {
  if (!hasDatabaseEnv()) {
    return { community: 0, requests: 0, spots: 0, users: 0 };
  }
  const [community, requests, spots, users] = await Promise.all([
    prisma.report.count({
      where: { postId: { not: null }, status: ReportStatus.OPEN },
    }),
    prisma.report.count({
      where: { requestId: { not: null }, status: ReportStatus.OPEN },
    }),
    prisma.report.count({
      where: { placeId: { not: null }, status: ReportStatus.OPEN },
    }),
    prisma.idVerification.count({
      where: { status: VerificationStatus.PENDING },
    }),
  ]);
  return { community, requests, spots, users };
}
