import type { ButtonHTMLAttributes } from "react";
import Link from "next/link";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Flag,
} from "lucide-react";
import { RequestStatus } from "@/generated/prisma/client";
import {
  hideSitterRequest,
  restoreSitterRequest,
} from "@/app/admin/(protected)/sitter-requests/actions";
import { RelativePostedAt } from "@/components/admin/community-controls";
import {
  DeleteSitterRequestButton,
  ViewSitterRequestButton,
} from "@/components/admin/sitter-requests-controls";
import { UsersPerPageSelect } from "@/components/admin/users-controls";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchField } from "@/components/ui/search-field";
import {
  formatSittingDate,
  requestStatusLabel,
  shortRequestId,
  sitterListHref,
  type AdminSitterFilter,
  type AdminSitterListResult,
  type AdminSitterRange,
} from "@/lib/admin/sitter-requests";
import { cn } from "@/lib/cn";

const FILTERS: { id: AdminSitterFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "reported", label: "Reported" },
  { id: "open", label: "Open" },
  { id: "matched", label: "Matched" },
  { id: "done", label: "Done" },
  { id: "hidden", label: "Hidden" },
];

const RANGES: { id: AdminSitterRange; label: string }[] = [
  { id: "all", label: "All time" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
];

type SitterRequestsBoardProps = {
  list: AdminSitterListResult;
  q: string;
  filter: AdminSitterFilter;
  range: AdminSitterRange;
};

const PILL_BADGE =
  "inline-flex min-h-6 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold leading-none";

const CHIP =
  "inline-flex h-8 shrink-0 items-center rounded-full px-3 text-[12px] font-semibold outline-none focus-visible:shadow-focus";

function ActionButton({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="submit"
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-10 border border-line bg-white px-2.5 text-[12px] font-medium text-brown-2 outline-none hover:bg-ivory focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-45",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function StatusBadge({ status }: { status: RequestStatus }) {
  const label = requestStatusLabel(status);
  return (
    <span
      className={cn(
        PILL_BADGE,
        status === RequestStatus.OPEN
          ? "bg-success-soft text-success"
          : status === RequestStatus.MATCHED
            ? "bg-sage-soft text-olive-hover"
            : status === RequestStatus.DONE
              ? "bg-sky-soft text-sky-ink"
              : "bg-cream text-muted",
      )}
    >
      {label}
    </span>
  );
}

export function SitterRequestsBoard({
  list,
  q,
  filter,
  range,
}: SitterRequestsBoardProps) {
  const from = list.total === 0 ? 0 : (list.page - 1) * list.perPage + 1;
  const to = Math.min(list.page * list.perPage, list.total);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <h1 className="font-display text-[30px] font-bold tracking-tight text-brown">
            Sitter Requests Moderation
          </h1>
          <p className="mt-1 max-w-[640px] text-sm leading-6 text-muted">
            Review and manage sitter request posts.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {RANGES.map((item) => {
            const selected = range === item.id;
            return (
              <Link
                key={item.id}
                href={sitterListHref({
                  q,
                  filter,
                  range: item.id,
                  perPage: list.perPage,
                })}
                aria-current={selected ? "page" : undefined}
                className={cn(
                  CHIP,
                  selected
                    ? "border border-olive-hover bg-olive-hover text-white"
                    : "border border-line bg-white text-brown hover:bg-ivory",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          {/* TODO: Custom date range from the prototype is not wired yet. */}
          <button
            type="button"
            disabled
            title="Custom date range is not available yet"
            className={cn(
              CHIP,
              "cursor-not-allowed gap-1.5 border border-line bg-white text-muted opacity-45",
            )}
          >
            <Calendar size={14} aria-hidden="true" />
            Custom
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-2.5">
        <form
          action="/admin/sitter-requests"
          method="get"
          className="min-w-[240px] max-w-[360px] flex-[1_1_280px]"
        >
          {filter !== "all" ? (
            <input type="hidden" name="filter" value={filter} />
          ) : null}
          {range !== "all" ? (
            <input type="hidden" name="range" value={range} />
          ) : null}
          {list.perPage !== 5 ? (
            <input type="hidden" name="perPage" value={list.perPage} />
          ) : null}
          <SearchField
            name="q"
            label="Search by title, owner, area or ID"
            placeholder="Search by title, owner, area or ID"
            defaultValue={q}
            size="sm"
          />
        </form>
        <div className="flex min-w-0 flex-[2_1_420px] flex-wrap gap-1.5">
          {FILTERS.map((item) => {
            const selected = filter === item.id;
            const reported = item.id === "reported";
            return (
              <Link
                key={item.id}
                href={sitterListHref({
                  q,
                  filter: item.id,
                  range,
                  perPage: list.perPage,
                })}
                aria-current={selected ? "page" : undefined}
                className={cn(
                  "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-semibold outline-none focus-visible:shadow-focus",
                  selected
                    ? "bg-olive-hover text-white"
                    : reported
                      ? "border border-line-strong bg-white text-coral hover:bg-coral-soft"
                      : "border border-line bg-white text-brown hover:bg-ivory",
                )}
              >
                {item.label}
                <span
                  className={cn(
                    "inline-grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[11px] font-semibold",
                    selected
                      ? "bg-white/20 text-white"
                      : reported
                        ? "bg-coral-soft text-coral"
                        : "bg-cream text-muted",
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
        {list.requests.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="No requests match this view"
              text="Try another filter, or search by a different title, owner or area."
            />
          </div>
        ) : (
          <div>
            <table className="w-full table-fixed text-left">
              <colgroup>
                <col className="w-[12%]" />
                <col className="w-[18%]" />
                <col className="w-[28%]" />
                <col className="w-[12%]" />
                <col className="w-[12%]" />
                <col className="w-[10%]" />
                <col className="w-[18%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-line bg-ivory text-[11px] font-semibold tracking-[0.08em] text-muted uppercase">
                  <th className="px-4 py-3 font-semibold">Post ID</th>
                  <th className="px-4 py-3 font-semibold">Author / Pet Owner</th>
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Posted</th>
                  <th className="px-4 py-3 font-semibold">Sitting date</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.requests.map((request) => {
                  const hidden = request.status === RequestStatus.HIDDEN;
                  const reported = request.openReports.length > 0;
                  const owner = request.author.name.trim() || "Member";
                  const reportCount = request.openReports.length;
                  const reportReason = request.openReports[0]?.reason;
                  return (
                    <tr
                      key={request.id}
                      className="border-b border-line last:border-0 hover:bg-row-hover"
                    >
                      <td className="px-4 py-3.5 align-middle">
                        <span
                          className="text-sm font-bold text-brown"
                          title={request.id}
                        >
                          {shortRequestId(request.id)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 align-middle">
                        <div className="flex items-center gap-2">
                          <span
                            aria-hidden="true"
                            className="grid size-8 shrink-0 place-items-center rounded-full bg-sage text-sm font-semibold text-olive"
                          >
                            {(owner.split(/\s+/)[0]?.[0] ?? "?").toUpperCase()}
                          </span>
                          <p className="text-sm font-semibold leading-5 text-brown">
                            {owner}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 align-middle">
                        <p className="line-clamp-2 text-sm leading-6 text-brown-2">
                          {request.title}
                        </p>
                        {reported ? (
                          <span
                            className={cn(
                              PILL_BADGE,
                              "mt-1.5 max-w-full bg-coral-soft text-coral",
                            )}
                          >
                            <Flag
                              size={12}
                              strokeWidth={2.4}
                              aria-hidden="true"
                            />
                            <span className="min-w-0 truncate">
                              {reportCount === 1
                                ? "1 report"
                                : `${reportCount} reports`}
                              {reportReason ? ` · ${reportReason}` : ""}
                            </span>
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3.5 align-middle text-sm whitespace-nowrap">
                        <RelativePostedAt
                          at={request.createdAt}
                          className="text-muted"
                        />
                      </td>
                      <td className="px-4 py-3.5 align-middle text-sm whitespace-nowrap text-brown">
                        {formatSittingDate(request.startAt)}
                      </td>
                      <td className="px-4 py-3.5 align-middle">
                        <StatusBadge status={request.status} />
                      </td>
                      <td className="px-4 py-3.5 align-middle">
                        <div className="flex w-[176px] flex-wrap gap-1.5">
                          <ViewSitterRequestButton request={request} />
                          {hidden ? (
                            <form action={restoreSitterRequest}>
                              <input
                                type="hidden"
                                name="requestId"
                                value={request.id}
                              />
                              <ActionButton
                                aria-label={`Unhide request ${request.title}`}
                              >
                                <Eye size={15} aria-hidden="true" />
                                Unhide
                              </ActionButton>
                            </form>
                          ) : (
                            <form action={hideSitterRequest}>
                              <input
                                type="hidden"
                                name="requestId"
                                value={request.id}
                              />
                              <ActionButton
                                aria-label={`Hide request ${request.title}`}
                              >
                                <EyeOff size={15} aria-hidden="true" />
                                Hide
                              </ActionButton>
                            </form>
                          )}
                          <DeleteSitterRequestButton requestId={request.id} />
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
              ? "Showing 0 of 0 requests"
              : `Showing ${from}–${to} of ${list.total} requests`}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <UsersPerPageSelect
              value={list.perPage}
              hrefs={{
                5: sitterListHref({ q, filter, range, perPage: 5 }),
                10: sitterListHref({ q, filter, range, perPage: 10 }),
                25: sitterListHref({ q, filter, range, perPage: 25 }),
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
                  href={sitterListHref({
                    q,
                    filter,
                    range,
                    perPage: list.perPage,
                    page: list.page - 1,
                  })}
                  className="grid h-8 w-8 place-items-center rounded-10 border border-line bg-white text-brown outline-none hover:bg-ivory focus-visible:shadow-focus"
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
                    href={sitterListHref({
                      q,
                      filter,
                      range,
                      perPage: list.perPage,
                      page,
                    })}
                    aria-current={current ? "page" : undefined}
                    className={cn(
                      "grid h-8 min-w-8 place-items-center rounded-10 px-2 text-[13px] font-semibold outline-none focus-visible:shadow-focus",
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
                  href={sitterListHref({
                    q,
                    filter,
                    range,
                    perPage: list.perPage,
                    page: list.page + 1,
                  })}
                  className="grid h-8 w-8 place-items-center rounded-10 border border-line bg-white text-brown outline-none hover:bg-ivory focus-visible:shadow-focus"
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
