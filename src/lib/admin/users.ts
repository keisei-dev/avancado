import "server-only";

import { connection } from "next/server";
import {
  AccountStatus,
  DocumentType,
  VerificationStatus,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma/client";
import { hasDatabaseEnv } from "@/lib/auth/admin";

export const ADMIN_USER_FILTERS = [
  "all",
  "pending",
  "verified",
  "unverified",
  "hidden",
] as const;

export type AdminUserFilter = (typeof ADMIN_USER_FILTERS)[number];

export type AdminUserVerificationLabel =
  "Pending" | "Verified" | "Not verified";

export type AdminManagedUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  accountStatus: AccountStatus;
  isVerified: boolean;
  createdAt: Date;
  verificationLabel: AdminUserVerificationLabel;
  pendingVerification: {
    id: string;
    documentType: DocumentType;
    documentPath: string | null;
    submittedAt: Date;
  } | null;
};

export type AdminUserListResult = {
  users: AdminManagedUser[];
  pendingQueue: AdminManagedUser[];
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
  counts: Record<AdminUserFilter, number>;
  now: Date;
};

export type AdminUserListQuery = {
  q?: string | string[];
  filter?: string | string[];
  page?: string | string[];
  perPage?: string | string[];
};

const PER_PAGE_OPTIONS = [5, 10, 25] as const;

export function parseAdminUserFilter(
  value: string | undefined,
): AdminUserFilter {
  if (value && ADMIN_USER_FILTERS.includes(value as AdminUserFilter)) {
    return value as AdminUserFilter;
  }
  return "all";
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

export function usersListHref(opts: {
  q?: string;
  filter?: AdminUserFilter;
  page?: number;
  perPage?: number;
}): string {
  const params = new URLSearchParams();
  const q = (opts.q ?? "").trim();
  const filter = opts.filter ?? "all";
  const page = opts.page ?? 1;
  const perPage = opts.perPage ?? 5;
  if (q) params.set("q", q);
  if (filter !== "all") params.set("filter", filter);
  if (page > 1) params.set("page", String(page));
  if (perPage !== 5) params.set("perPage", String(perPage));
  const query = params.toString();
  return query ? `/admin/users?${query}` : "/admin/users";
}

function pendingWhere() {
  return {
    idVerifications: {
      some: { status: VerificationStatus.PENDING },
    },
  };
}

function filterWhere(filter: AdminUserFilter) {
  switch (filter) {
    case "pending":
      return pendingWhere();
    case "verified":
      return { isVerified: true };
    case "unverified":
      return { isVerified: false, NOT: pendingWhere() };
    case "hidden":
      return { accountStatus: AccountStatus.HIDDEN };
    default:
      return {};
  }
}

function searchWhere(q: string) {
  if (!q) return {};
  return {
    OR: [
      { name: { contains: q, mode: "insensitive" as const } },
      { email: { contains: q, mode: "insensitive" as const } },
    ],
  };
}

function toManagedUser(row: {
  id: string;
  name: string;
  email: string;
  image: string | null;
  accountStatus: AccountStatus;
  isVerified: boolean;
  createdAt: Date;
  idVerifications: {
    id: string;
    documentType: DocumentType;
    documentPath: string | null;
    submittedAt: Date;
  }[];
}): AdminManagedUser {
  const pending = row.idVerifications[0] ?? null;
  let verificationLabel: AdminUserVerificationLabel = "Not verified";
  if (pending) {
    verificationLabel = "Pending";
  } else if (row.isVerified) {
    verificationLabel = "Verified";
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    image: row.image,
    accountStatus: row.accountStatus,
    isVerified: row.isVerified,
    createdAt: row.createdAt,
    verificationLabel,
    pendingVerification: pending,
  };
}

const userSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
  accountStatus: true,
  isVerified: true,
  createdAt: true,
  idVerifications: {
    where: { status: VerificationStatus.PENDING },
    orderBy: { submittedAt: "desc" as const },
    take: 1,
    select: {
      id: true,
      documentType: true,
      documentPath: true,
      submittedAt: true,
    },
  },
};

export async function getAdminUserList(
  query: AdminUserListQuery,
): Promise<AdminUserListResult> {
  await connection();

  const q = (firstParam(query.q) ?? "").trim();
  const filter = parseAdminUserFilter(firstParam(query.filter));
  const perPage = parsePerPage(firstParam(query.perPage));
  const requestedPage = Math.max(1, Number(firstParam(query.page)) || 1);
  const now = new Date();

  if (!hasDatabaseEnv()) {
    return {
      users: [],
      pendingQueue: [],
      total: 0,
      page: 1,
      perPage,
      pageCount: 1,
      counts: { all: 0, pending: 0, verified: 0, unverified: 0, hidden: 0 },
      now,
    };
  }

  const where = { ...searchWhere(q), ...filterWhere(filter) };

  const [
    total,
    pendingQueueRows,
    allCount,
    pendingCount,
    verifiedCount,
    unverifiedCount,
    hiddenCount,
  ] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where: pendingWhere(),
      select: userSelect,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where: searchWhere(q) }),
    prisma.user.count({ where: { ...searchWhere(q), ...pendingWhere() } }),
    prisma.user.count({
      where: { ...searchWhere(q), isVerified: true },
    }),
    prisma.user.count({
      where: { ...searchWhere(q), isVerified: false, NOT: pendingWhere() },
    }),
    prisma.user.count({
      where: { ...searchWhere(q), accountStatus: AccountStatus.HIDDEN },
    }),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(requestedPage, pageCount);

  const rows = await prisma.user.findMany({
    where,
    select: userSelect,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * perPage,
    take: perPage,
  });

  return {
    users: rows.map(toManagedUser),
    pendingQueue: pendingQueueRows.map(toManagedUser),
    total,
    page,
    perPage,
    pageCount,
    counts: {
      all: allCount,
      pending: pendingCount,
      verified: verifiedCount,
      unverified: unverifiedCount,
      hidden: hiddenCount,
    },
    now,
  };
}

export function documentTypeLabel(type: DocumentType): string {
  switch (type) {
    case DocumentType.BCID:
      return "BC ID";
    case DocumentType.PASSPORT:
      return "Passport";
    default:
      return "Other ID";
  }
}

export function formatJoinedDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatSubmittedLabel(submittedAt: Date, now: Date): string {
  const sameDay =
    submittedAt.getFullYear() === now.getFullYear() &&
    submittedAt.getMonth() === now.getMonth() &&
    submittedAt.getDate() === now.getDate();

  if (sameDay) {
    return "Submitted today";
  }

  return `Submitted ${formatJoinedDate(submittedAt)}`;
}
