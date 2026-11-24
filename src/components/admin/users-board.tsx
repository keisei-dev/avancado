import type { ButtonHTMLAttributes } from "react";
import Link from "next/link";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  EyeOff,
  FileText,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { AccountStatus } from "@/generated/prisma/client";
import {
  approveVerification,
  hideUser,
  rejectVerification,
  restoreUser,
} from "@/app/admin/(protected)/users/actions";
import {
  DeleteUserButton,
  ReviewDocumentButton,
  UsersPerPageSelect,
} from "@/components/admin/users-controls";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchField } from "@/components/ui/search-field";
import {
  documentTypeLabel,
  formatJoinedDate,
  formatSubmittedLabel,
  memberDisplayName,
  usersListHref,
  type AdminManagedUser,
  type AdminUserFilter,
  type AdminUserListResult,
  type AdminUserVerificationLabel,
} from "@/lib/admin/users";
import { cn } from "@/lib/cn";

const FILTERS: { id: AdminUserFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "verified", label: "Verified" },
  { id: "unverified", label: "Not verified" },
  { id: "hidden", label: "Hidden" },
];

type UsersBoardProps = {
  list: AdminUserListResult;
  currentAdminId: string;
  q: string;
  filter: AdminUserFilter;
};

const PILL_BADGE =
  "inline-flex min-h-6 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold leading-none";

function VerificationBadge({ label }: { label: AdminUserVerificationLabel }) {
  if (label === "Verified") {
    return (
      <span className={cn(PILL_BADGE, "bg-sage-soft text-olive-hover")}>
        <ShieldCheck size={13} strokeWidth={2.4} aria-hidden="true" />
        Verified
      </span>
    );
  }
  if (label === "Pending") {
    return (
      <span className={cn(PILL_BADGE, "bg-amber-soft text-amber-ink")}>
        <Clock size={13} strokeWidth={2.4} aria-hidden="true" />
        Pending
      </span>
    );
  }
  return (
    <span className={cn(PILL_BADGE, "bg-cream text-muted")}>
      <UserRound size={13} strokeWidth={2.4} aria-hidden="true" />
      Not verified
    </span>
  );
}

function StatusBadge({ status }: { status: AccountStatus }) {
  const hidden = status === AccountStatus.HIDDEN;
  return (
    <span
      className={cn(
        PILL_BADGE,
        hidden ? "bg-cream text-muted" : "bg-success-soft text-success",
      )}
    >
      {hidden ? (
        <EyeOff size={13} strokeWidth={2.4} aria-hidden="true" />
      ) : (
        <Check size={13} strokeWidth={2.6} aria-hidden="true" />
      )}
      {hidden ? "Hidden" : "Active"}
    </span>
  );
}

function ActionButton({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="submit"
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-10 border px-2.5 text-[12px] font-medium disabled:cursor-not-allowed disabled:opacity-45",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function PendingUserRow({
  user,
  now,
  currentAdminId,
}: {
  user: AdminManagedUser;
  now: Date;
  currentAdminId: string;
}) {
  const pending = user.pendingVerification;
  if (!pending) return null;
  const label = documentTypeLabel(pending.documentType);
  const isSelf = user.id === currentAdminId;
  const name = memberDisplayName(user);

  return (
    <div className="flex flex-col gap-4 rounded-16 bg-ivory p-3.5 lg:flex-row lg:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar name={name} size="md" verified={user.isVerified} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-brown">{name}</p>
          <p className="truncate text-[13px] text-muted">
            {user.email} · {formatSubmittedLabel(pending.submittedAt, now)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 lg:w-[180px]">
        <span className="grid h-9 w-9 place-items-center rounded-10 bg-white text-olive-hover">
          <FileText size={16} aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold text-brown">{label}</p>
          <p className="text-[13px] text-muted">Identity document</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 lg:justify-end">
        <ReviewDocumentButton
          name={name}
          email={user.email}
          documentLabel={label}
          documentPath={pending.documentPath}
        />
        <form action={rejectVerification}>
          <input type="hidden" name="verificationId" value={pending.id} />
          <ActionButton
            disabled={isSelf}
            className="border-line bg-white text-brown-2"
          >
            Reject
          </ActionButton>
        </form>
        <form action={approveVerification}>
          <input type="hidden" name="verificationId" value={pending.id} />
          <ActionButton
            disabled={isSelf}
            className="border-olive bg-olive text-white hover:bg-olive-hover"
          >
            Approve
          </ActionButton>
        </form>
      </div>
    </div>
  );
}

export function UsersBoard({
  list,
  currentAdminId,
  q,
  filter,
}: UsersBoardProps) {
  const pendingCount = list.pendingQueue.length;
  const from = list.total === 0 ? 0 : (list.page - 1) * list.perPage + 1;
  const to = Math.min(list.page * list.perPage, list.total);

  return (
    <div>
      <h1 className="font-display text-[30px] font-bold tracking-tight text-brown">
        User Management
      </h1>
      <p className="mt-2 max-w-[640px] text-sm leading-6 text-muted">
        Review identity requests, manage visibility, or permanently delete
        accounts.
      </p>

      {pendingCount > 0 ? (
        <section className="mt-6 rounded-20 border border-line bg-white p-[22px] shadow-admin">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-[17px] font-bold text-brown">
                Waiting for verification
              </h2>
              <p className="mt-0.5 text-[13px] text-muted">
                {pendingCount === 1
                  ? "1 identity request need admin review"
                  : `${pendingCount} identity requests need admin review`}
              </p>
            </div>
            <span className="inline-flex rounded-full bg-amber-soft px-2.5 py-1 text-xs font-semibold text-amber-ink">
              {pendingCount} pending
            </span>
          </div>
          <div className="grid gap-2">
            {list.pendingQueue.map((user) => (
              <PendingUserRow
                key={user.id}
                user={user}
                now={list.now}
                currentAdminId={currentAdminId}
              />
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-2.5">
        <form
          action="/admin/users"
          method="get"
          className="min-w-[200px] max-w-[280px] flex-[1_1_240px]"
        >
          {filter !== "all" ? (
            <input type="hidden" name="filter" value={filter} />
          ) : null}
          {list.perPage !== 5 ? (
            <input type="hidden" name="perPage" value={list.perPage} />
          ) : null}
          <SearchField
            name="q"
            label="Search by name or email"
            placeholder="Search by name or email"
            defaultValue={q}
            size="sm"
          />
        </form>
        <div className="flex min-w-0 flex-[2_1_420px] flex-wrap gap-1.5">
          {FILTERS.map((item) => {
            const selected = filter === item.id;
            return (
              <Link
                key={item.id}
                href={usersListHref({
                  q,
                  filter: item.id,
                  perPage: list.perPage,
                })}
                aria-current={selected ? "page" : undefined}
                className={cn(
                  "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-semibold",
                  selected
                    ? "bg-olive-hover text-white"
                    : "border border-line bg-white text-brown hover:bg-ivory",
                )}
              >
                {item.label}
                <span
                  className={cn(
                    "inline-grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[11px] font-semibold",
                    selected ? "bg-white/20 text-white" : "bg-cream text-muted",
                  )}
                >
                  {list.counts[item.id]}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <section className="mt-4 overflow-hidden rounded-20 border border-line bg-white shadow-admin">
        {list.users.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="No members match this view"
              text="Try another filter, or search by a different name or email."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left">
              <thead>
                <tr className="border-b border-line bg-ivory text-[11px] font-semibold tracking-[0.08em] text-muted uppercase">
                  <th className="min-w-[220px] px-4 py-3 font-semibold">
                    User
                  </th>
                  <th className="min-w-[220px] px-4 py-3 font-semibold">
                    Email
                  </th>
                  <th className="min-w-[140px] px-4 py-3 font-semibold">
                    Verification
                  </th>
                  <th className="min-w-[110px] px-4 py-3 font-semibold">
                    Status
                  </th>
                  <th className="min-w-[110px] px-4 py-3 font-semibold">
                    Joined
                  </th>
                  <th className="min-w-[180px] px-4 py-3 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.users.map((user) => {
                  const isSelf = user.id === currentAdminId;
                  const hidden = user.accountStatus === AccountStatus.HIDDEN;
                  const name = memberDisplayName(user);
                  return (
                    <tr
                      key={user.id}
                      className="border-b border-line last:border-0 hover:bg-row-hover"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={name}
                            size="md"
                            verified={user.isVerified}
                          />
                          <span className="truncate text-sm font-semibold text-brown">
                            {name}
                          </span>
                        </div>
                      </td>
                      <td className="truncate px-4 py-3.5 text-sm text-brown">
                        {user.email}
                      </td>
                      <td className="px-4 py-3.5">
                        <VerificationBadge label={user.verificationLabel} />
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={user.accountStatus} />
                      </td>
                      <td className="px-4 py-3.5 text-sm whitespace-nowrap text-brown">
                        {formatJoinedDate(user.createdAt)}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {hidden ? (
                            <form action={restoreUser}>
                              <input
                                type="hidden"
                                name="userId"
                                value={user.id}
                              />
                              <ActionButton
                                className="border-line bg-white text-brown-2"
                                aria-label={`Unhide ${name}`}
                              >
                                <Eye size={14} aria-hidden="true" />
                                Unhide
                              </ActionButton>
                            </form>
                          ) : (
                            <form action={hideUser}>
                              <input
                                type="hidden"
                                name="userId"
                                value={user.id}
                              />
                              <ActionButton
                                disabled={isSelf}
                                className="border-line bg-white text-brown-2"
                                aria-label={`Hide ${name}`}
                              >
                                <EyeOff size={14} aria-hidden="true" />
                                Hide
                              </ActionButton>
                            </form>
                          )}
                          <DeleteUserButton
                            userId={user.id}
                            userName={name}
                            disabled={isSelf || user.role === "ADMIN"}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-line bg-ivory/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-muted">
            {list.total === 0
              ? "Showing 0 of 0 members"
              : `Showing ${from}–${to} of ${list.total} members`}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <UsersPerPageSelect
              value={list.perPage}
              hrefs={{
                5: usersListHref({ q, filter, perPage: 5 }),
                10: usersListHref({ q, filter, perPage: 10 }),
                25: usersListHref({ q, filter, perPage: 25 }),
              }}
            />
            <nav aria-label="Pages" className="flex items-center gap-1">
              {list.page <= 1 ? (
                <span className="grid h-8 w-8 place-items-center rounded-10 border border-line text-muted opacity-45">
                  <ChevronLeft size={16} aria-hidden="true" />
                  <span className="sr-only">Previous page</span>
                </span>
              ) : (
                <Link
                  href={usersListHref({
                    q,
                    filter,
                    perPage: list.perPage,
                    page: list.page - 1,
                  })}
                  className="grid h-8 w-8 place-items-center rounded-10 border border-line bg-white text-brown hover:bg-ivory"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} aria-hidden="true" />
                </Link>
              )}
              {Array.from({ length: list.pageCount }, (_, index) => {
                const page = index + 1;
                const current = page === list.page;
                return (
                  <Link
                    key={page}
                    href={usersListHref({
                      q,
                      filter,
                      perPage: list.perPage,
                      page,
                    })}
                    aria-current={current ? "page" : undefined}
                    className={cn(
                      "grid h-8 min-w-8 place-items-center rounded-10 px-2 text-[13px] font-semibold",
                      current
                        ? "bg-olive-hover text-white"
                        : "border border-line bg-white text-brown hover:bg-ivory",
                    )}
                  >
                    {page}
                  </Link>
                );
              })}
              {list.page >= list.pageCount ? (
                <span className="grid h-8 w-8 place-items-center rounded-10 border border-line text-muted opacity-45">
                  <ChevronRight size={16} aria-hidden="true" />
                  <span className="sr-only">Next page</span>
                </span>
              ) : (
                <Link
                  href={usersListHref({
                    q,
                    filter,
                    perPage: list.perPage,
                    page: list.page + 1,
                  })}
                  className="grid h-8 w-8 place-items-center rounded-10 border border-line bg-white text-brown hover:bg-ivory"
                  aria-label="Next page"
                >
                  <ChevronRight size={16} aria-hidden="true" />
                </Link>
              )}
            </nav>
          </div>
        </div>
      </section>
    </div>
  );
}
