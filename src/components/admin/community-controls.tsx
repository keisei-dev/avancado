"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Eye, Trash2, X } from "lucide-react";
import {
  deleteCommunityPost,
  hideCommunityPost,
  restoreCommunityPost,
} from "@/app/admin/(protected)/community/actions";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/cn";

type ViewPost = {
  id: string;
  caption: string;
  imageUrl: string;
  location: string | null;
  type: string;
  status: string;
  createdAt: Date | string;
  likeCount: number;
  author: { name: string };
};

const emptySubscribe = () => () => {};

const FOCUSABLE =
  'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

function formatAbsoluteDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatRelative(date: Date, nowMs: number) {
  const diff = nowMs - date.getTime();
  const minutes = Math.max(0, Math.round(diff / 60000));
  if (minutes < 1) return "Just now";
  if (minutes === 1) return "1 minute ago";
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.round(minutes / 60);
  if (hours === 1) return "1 hour ago";
  if (hours < 24) return `${hours} hours ago`;

  const today = new Date(nowMs);
  today.setHours(0, 0, 0, 0);
  const postedDay = new Date(date);
  postedDay.setHours(0, 0, 0, 0);
  const dayDiff = Math.round(
    (today.getTime() - postedDay.getTime()) / 86_400_000,
  );
  if (dayDiff <= 1) return "Yesterday";
  return `${dayDiff} days ago`;
}

function formatDayLabel(date: Date, nowMs: number) {
  const today = new Date(nowMs);
  today.setHours(0, 0, 0, 0);
  const postedDay = new Date(date);
  postedDay.setHours(0, 0, 0, 0);
  const dayDiff = Math.round(
    (today.getTime() - postedDay.getTime()) / 86_400_000,
  );
  if (dayDiff <= 0) return "Today";
  if (dayDiff === 1) return "Yesterday";
  if (dayDiff < 7) return `${dayDiff} days ago`;
  return formatAbsoluteDate(date);
}

export function RelativePostedAt({
  at,
  className,
  dayLabel = false,
}: {
  at: Date | string;
  className?: string;
  dayLabel?: boolean;
}) {
  const iso = typeof at === "string" ? at : at.toISOString();
  const date = new Date(iso);
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const label = isClient
    ? dayLabel
      ? formatDayLabel(date, new Date().getTime())
      : formatRelative(date, new Date().getTime())
    : "\u00a0";

  return (
    <time dateTime={iso} className={className}>
      {label}
    </time>
  );
}

function postTypeLabel(type: string) {
  return type === "LOST_PET" ? "Lost pet alert" : "Community post";
}

const ACTION_BTN =
  "inline-flex h-8 items-center gap-1.5 rounded-10 border border-line bg-white px-2.5 text-[12px] font-medium text-brown-2 outline-none hover:bg-ivory focus-visible:shadow-focus";

const CLOSE_BTN =
  "grid size-[38px] place-items-center rounded-12 border border-line bg-white text-brown-2 transition-colors hover:border-line-strong hover:bg-ivory focus-visible:shadow-focus focus-visible:outline-none";

function InfoCard({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-12 bg-ivory px-3.5 py-3">
      <p className="text-xs text-muted">{label}</p>
      <div className="text-sm font-semibold text-brown">{children}</div>
    </div>
  );
}

function CommunityPostViewDialog({
  open,
  onClose,
  post,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  post: ViewPost;
  onDelete: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const onCloseRef = useRef(onClose);
  const imageUrl = post.imageUrl.trim();
  const author = post.author.name.trim() || "Member";
  const hidden = post.status === "HIDDEN";
  const location = post.location?.trim() || "—";

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const first = dialog.querySelector<HTMLElement>(
      `[data-modal-content] :is(${FOCUSABLE})`,
    );
    (first ?? dialog).focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE),
      );
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === firstEl || active === dialog)) {
        event.preventDefault();
        lastEl.focus();
      } else if (!event.shiftKey && active === lastEl) {
        event.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgb(36_28_20/0.42)] p-5 backdrop-blur-[4px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative w-full max-w-[540px] shrink-0 max-h-[calc(100vh-40px)] overflow-y-auto rounded-20 bg-white p-8 text-brown shadow-overlay outline-none"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className={cn(CLOSE_BTN, "absolute top-[18px] right-[18px]")}
        >
          <X size={19} aria-hidden="true" />
        </button>
        {imageUrl ? (
          /* Photos come from Supabase Storage; a plain img avoids next/image host config. */
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imageUrl}
            alt=""
            className="mb-5 h-[280px] w-full rounded-16 object-cover"
          />
        ) : null}

        <div data-modal-content>
          <p className="mb-2 text-xs font-semibold tracking-[0.06em] text-olive-dark uppercase">
            {postTypeLabel(post.type)}
          </p>
          <h2
            id={titleId}
            className="font-display mt-1 mr-10 mb-2 text-[24px] leading-[1.3] font-bold tracking-[-0.02em] text-brown"
          >
            {author}
          </h2>
          <p className="mb-[22px] text-[15px] leading-[1.6] font-normal whitespace-pre-wrap text-muted">
            {post.caption}
          </p>
          <div className="mb-4 grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2.5">
            <InfoCard label="Location">
              <span className="break-words">{location}</span>
            </InfoCard>
            <InfoCard label="Paws">{post.likeCount}</InfoCard>
            <InfoCard label="Posted">
              <RelativePostedAt at={post.createdAt} />
            </InfoCard>
          </div>
          <div className="mt-[26px] flex justify-end gap-2.5 border-t border-line pt-5">
            <form
              action={hidden ? restoreCommunityPost : hideCommunityPost}
              onSubmit={onClose}
            >
              <input type="hidden" name="postId" value={post.id} />
              <button
                type="submit"
                className="inline-flex min-h-11 items-center rounded-full border border-line-strong bg-white px-5 text-sm font-semibold text-brown outline-none hover:bg-ivory focus-visible:shadow-focus"
              >
                {hidden ? "Unhide post" : "Hide post"}
              </button>
            </form>
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-coral px-5 text-sm font-semibold text-white outline-none hover:bg-coral-hover focus-visible:shadow-focus"
            >
              <Trash2 size={16} aria-hidden="true" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function ViewCommunityPostButton({ post }: { post: ViewPost }) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={ACTION_BTN}>
        <Eye size={15} aria-hidden="true" />
        View
      </button>
      <CommunityPostViewDialog
        open={open}
        onClose={() => setOpen(false)}
        post={post}
        onDelete={() => {
          setOpen(false);
          setConfirmDelete(true);
        }}
      />
      <DeleteCommunityPostConfirm
        open={confirmDelete}
        postId={post.id}
        onClose={() => setConfirmDelete(false)}
        onCancel={() => {
          setConfirmDelete(false);
          setOpen(true);
        }}
      />
    </>
  );
}

function DeleteCommunityPostConfirm({
  open,
  postId,
  onClose,
  onCancel,
}: {
  open: boolean;
  postId: string;
  onClose: () => void;
  onCancel?: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const close = () => {
    if (pending) return;
    setError(null);
    onClose();
  };

  const cancel = () => {
    if (pending) return;
    setError(null);
    (onCancel ?? onClose)();
  };

  async function submit(formData: FormData) {
    setError(null);
    setPending(true);
    try {
      const result = await deleteCommunityPost(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setError(null);
      onClose();
    } catch {
      setError("This post could not be deleted. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      eyebrow={<span className="text-coral">Permanent action</span>}
      title="Delete this post?"
      lead="This permanently removes it from Avancado and cannot be undone. Use Hide if you might want to restore it later."
      footer={
        <>
          <Button variant="secondary" onClick={cancel} disabled={pending}>
            Cancel
          </Button>
          <form action={submit}>
            <input type="hidden" name="postId" value={postId} />
            <Button type="submit" variant="danger" loading={pending}>
              <Trash2 size={16} aria-hidden="true" />
              Delete permanently
            </Button>
          </form>
        </>
      }
    >
      {error ? (
        <p
          role="alert"
          className="rounded-12 border border-coral/20 bg-coral-soft px-3 py-2 text-sm text-coral"
        >
          {error}
        </p>
      ) : null}
    </Modal>
  );
}

export function DeleteCommunityPostButton({
  postId,
}: {
  postId: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-8 items-center gap-1.5 rounded-10 border border-line bg-white px-2.5 text-[12px] font-medium text-coral outline-none hover:bg-ivory focus-visible:shadow-focus"
      >
        <Trash2 size={15} aria-hidden="true" />
        Delete
      </button>
      <DeleteCommunityPostConfirm
        open={open}
        postId={postId}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
