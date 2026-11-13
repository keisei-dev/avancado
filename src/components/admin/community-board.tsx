import type { ButtonHTMLAttributes } from "react";
import Link from "next/link";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Flag,
  PawPrint,
} from "lucide-react";
import { PostStatus, PostType } from "@/generated/prisma/client";
import {
  hideCommunityPost,
  restoreCommunityPost,
} from "@/app/admin/(protected)/community/actions";
import {
  DeleteCommunityPostButton,
  ViewCommunityPostButton,
} from "@/components/admin/community-controls";
import { UsersPerPageSelect } from "@/components/admin/users-controls";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchField } from "@/components/ui/search-field";
import {
  communityListHref,
  formatPostedDate,
  postStatusLabel,
  postTypeLabel,
  type AdminCommunityFilter,
  type AdminCommunityListResult,
  type AdminCommunityPost,
  type AdminCommunityRange,
} from "@/lib/admin/community";
import { cn } from "@/lib/cn";

const FILTERS: { id: AdminCommunityFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "reported", label: "Reported" },
  { id: "lost", label: "Lost pets" },
  { id: "hidden", label: "Hidden" },
];

const RANGES: { id: AdminCommunityRange; label: string }[] = [
  { id: "all", label: "All time" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
];

type CommunityBoardProps = {
  list: AdminCommunityListResult;
  q: string;
  filter: AdminCommunityFilter;
  range: AdminCommunityRange;
};

const PILL_BADGE =
  "inline-flex min-h-6 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold leading-none";

function TypeBadge({ type }: { type: PostType }) {
  const lost = type === PostType.LOST_PET;
  return (
    <span
      className={cn(
        PILL_BADGE,
        lost ? "bg-coral-soft text-coral" : "bg-cream text-muted",
      )}
    >
      {lost ? (
        <Flag size={13} strokeWidth={2.4} aria-hidden="true" />
      ) : (
        <PawPrint size={13} strokeWidth={2.4} aria-hidden="true" />
      )}
      {postTypeLabel(type)}
    </span>
  );
}

function StatusBadge({ status }: { status: PostStatus }) {
  const hidden = status === PostStatus.HIDDEN;
  const found = status === PostStatus.FOUND;
  return (
    <span
      className={cn(
        PILL_BADGE,
        hidden
          ? "bg-cream text-muted"
          : found
            ? "bg-sage-soft text-olive-hover"
            : "bg-success-soft text-success",
      )}
    >
      {hidden ? (
        <EyeOff size={13} strokeWidth={2.4} aria-hidden="true" />
      ) : (
        <Check size={13} strokeWidth={2.6} aria-hidden="true" />
      )}
      {postStatusLabel(status)}
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

function PostThumb({ post }: { post: AdminCommunityPost }) {
  if (!post.imageUrl) {
    return (
      <span className="grid size-14 place-items-center rounded-12 bg-cream text-muted">
        <PawPrint size={18} aria-hidden="true" />
      </span>
    );
  }
  return (
    // Photos come from Supabase Storage; a plain img avoids next/image host config.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={post.imageUrl}
      alt=""
      className="size-14 rounded-12 object-cover"
    />
  );
}

export function CommunityBoard({
  list,
  q,
  filter,
  range,
}: CommunityBoardProps) {
  const from = list.total === 0 ? 0 : (list.page - 1) * list.perPage + 1;
  const to = Math.min(list.page * list.perPage, list.total);

  return (
    <div>
      <h1 className="font-display text-[30px] font-bold tracking-tight text-brown">
        Community Moderation
      </h1>
      <p className="mt-2 max-w-[640px] text-sm leading-6 text-muted">
        Review photos and lost-pet alerts shared by the community.
      </p>
      {/* TODO: comments are not in the Prisma schema; this screen reviews posts and post reports only. */}
      {/* TODO: Custom date range from the prototype is not wired yet. */}

      <div className="mt-6 flex flex-wrap gap-1.5">
        {RANGES.map((item) => {
          const selected = range === item.id;
          return (
            <Link
              key={item.id}
              href={communityListHref({
                q,
                filter,
                range: item.id,
                perPage: list.perPage,
              })}
              aria-current={selected ? "page" : undefined}
              className={cn(
                "inline-flex h-8 shrink-0 items-center rounded-full px-3 text-[12px] font-semibold",
                selected
                  ? "bg-olive-hover text-white"
                  : "border border-line bg-white text-brown hover:bg-ivory",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-2.5">
        <form
          action="/admin/community"
          method="get"
          className="min-w-[200px] max-w-[320px] flex-[1_1_260px]"
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
            label="Search by author, caption or place"
            placeholder="Search by author, caption or place"
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
                href={communityListHref({
                  q,
                  filter: item.id,
                  range,
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
        {list.posts.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="No posts match this view"
              text="Try another filter, or search by a different author, caption or place."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] text-left">
              <thead>
                <tr className="border-b border-line bg-ivory text-[11px] font-semibold tracking-[0.08em] text-muted uppercase">
                  <th className="min-w-[88px] px-4 py-3 font-semibold">
                    Thumbnail
                  </th>
                  <th className="min-w-[180px] px-4 py-3 font-semibold">
                    Author
                  </th>
                  <th className="min-w-[240px] px-4 py-3 font-semibold">
                    Caption
                  </th>
                  <th className="min-w-[110px] px-4 py-3 font-semibold">
                    Type
                  </th>
                  <th className="min-w-[140px] px-4 py-3 font-semibold">
                    Reports
                  </th>
                  <th className="min-w-[110px] px-4 py-3 font-semibold">
                    Status
                  </th>
                  <th className="min-w-[110px] px-4 py-3 font-semibold">
                    Posted
                  </th>
                  <th className="min-w-[220px] px-4 py-3 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {list.posts.map((post) => {
                  const hidden = post.status === PostStatus.HIDDEN;
                  const author = post.author.name.trim() || "Member";
                  const report = post.openReports[0];
                  return (
                    <tr
                      key={post.id}
                      className="border-b border-line last:border-0 hover:bg-row-hover"
                    >
                      <td className="px-4 py-3.5">
                        <PostThumb post={post} />
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="truncate text-sm font-semibold text-brown">
                          {author}
                        </p>
                        <p className="truncate text-[13px] text-muted">
                          {post.location || "Vancouver"}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="line-clamp-2 max-w-[320px] text-sm text-brown">
                          {post.caption}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <TypeBadge type={post.type} />
                      </td>
                      <td className="px-4 py-3.5">
                        {report ? (
                          <span
                            className={cn(PILL_BADGE, "bg-coral-soft text-coral")}
                          >
                            <Flag size={13} strokeWidth={2.4} aria-hidden="true" />
                            {post.openReports.length}
                            <span className="max-w-[90px] truncate font-medium">
                              {report.reason}
                            </span>
                          </span>
                        ) : (
                          <span className="text-sm text-muted">None</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={post.status} />
                      </td>
                      <td className="px-4 py-3.5 text-sm whitespace-nowrap text-brown">
                        {formatPostedDate(post.createdAt)}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <ViewCommunityPostButton post={post} />
                          {hidden ? (
                            <form action={restoreCommunityPost}>
                              <input
                                type="hidden"
                                name="postId"
                                value={post.id}
                              />
                              <ActionButton
                                className="border-line bg-white text-brown-2"
                                aria-label={`Unhide post by ${author}`}
                              >
                                <Eye size={14} aria-hidden="true" />
                                Unhide
                              </ActionButton>
                            </form>
                          ) : (
                            <form action={hideCommunityPost}>
                              <input
                                type="hidden"
                                name="postId"
                                value={post.id}
                              />
                              <ActionButton
                                className="border-line bg-white text-brown-2"
                                aria-label={`Hide post by ${author}`}
                              >
                                <EyeOff size={14} aria-hidden="true" />
                                Hide
                              </ActionButton>
                            </form>
                          )}
                          <DeleteCommunityPostButton
                            postId={post.id}
                            authorName={author}
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
              ? "Showing 0 of 0 posts"
              : `Showing ${from}–${to} of ${list.total} posts`}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <UsersPerPageSelect
              value={list.perPage}
              hrefs={{
                5: communityListHref({ q, filter, range, perPage: 5 }),
                10: communityListHref({ q, filter, range, perPage: 10 }),
                25: communityListHref({ q, filter, range, perPage: 25 }),
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
                  href={communityListHref({
                    q,
                    filter,
                    range,
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
                    href={communityListHref({
                      q,
                      filter,
                      range,
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
                  href={communityListHref({
                    q,
                    filter,
                    range,
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
