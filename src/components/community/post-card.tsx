"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  CircleCheckBig,
  Edit3,
  Flag,
  MoreVertical,
  PawPrint,
  Send,
  Trash2,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { PostComposer } from "./post-composer";
import {
  deleteCommunityPost,
  markPetFound,
  messagePostAuthor,
  reactToPost,
  reportCommunityPost,
} from "@/app/community/actions";

export type CommunityPostView = {
  id: string;
  caption: string;
  imageUrl: string;
  location: string | null;
  type: string;
  status: string;
  likeCount: number;
  createdAt: Date;
  liked?: boolean;
  author: {
    id: string;
    name: string;
    image: string | null;
    isVerified: boolean;
  };
};
type Member = { id: string; name: string; image: string | null };
export function PostCard({
  post,
  detail = false,
  member = null,
  notify,
}: {
  post: CommunityPostView;
  detail?: boolean;
  member?: Member | null;
  notify?: (message: string) => void;
}) {
  const router = useRouter();
  const [dialog, setDialog] = useState<
    "edit" | "delete" | "report" | "found" | "reunited" | null
  >(null);
  const [menu, setMenu] = useState(false);
  const [pending, startTransition] = useTransition();
  const [editingBusy, setEditingBusy] = useState(false);
  const [error, setError] = useState("");
  const [reason, setReason] = useState("");
  const mine = member?.id === post.author.id;
  const firstName = post.author.name.split(" ")[0];
  const lost = post.type === "LOST_PET" && post.status === "ACTIVE";
  const found = post.type === "LOST_PET" && post.status === "FOUND";
  const requireAuth = () => {
    if (member) return true;
    router.push("/login");
    return false;
  };
  const open = (value: typeof dialog) => {
    setMenu(false);
    setError("");
    if (requireAuth()) setDialog(value);
  };
  const close = () => {
    if (!pending && !editingBusy) {
      setDialog(null);
      setError("");
    }
  };
  const run = (
    operation: () => Promise<{ error: string }>,
    success: () => void,
  ) => {
    setError("");
    startTransition(async () => {
      try {
        const result = await operation();
        if (result.error) setError(result.error);
        else {
          success();
          router.refresh();
        }
      } catch {
        setError("Something went wrong. Please try again.");
      }
    });
  };
  return (
    <article
      className={`relative overflow-hidden rounded-20 border bg-white shadow-card ${lost ? "border-coral-line" : found ? "border-success-line" : "border-line"}`}
    >
      {(lost || found) && (
        <div
          className={`flex min-h-12 items-center justify-between gap-2 px-4 py-2 text-xs font-bold ${found ? "bg-success-soft text-success" : "bg-coral-soft text-coral"}`}
        >
          <span className="flex items-center gap-2">
            {found ? <CircleCheckBig size={14} /> : <Flag size={14} />}
            {found
              ? "Pet found · Reunited"
              : mine
                ? "Lost pet alert"
                : "Lost and found alert"}
          </span>
          {lost && mine && (
            <button
              onClick={() => open("found")}
              className="inline-flex items-center gap-1 rounded-full border border-coral-line bg-white px-3 py-1.5"
            >
              <Check size={13} />
              Mark as found
            </button>
          )}
        </div>
      )}
      <div className="flex items-center gap-3 px-4 py-3.5">
        <Link href={`/profile/${post.author.id}`}>
          <Avatar
            name={post.author.name}
            src={post.author.image}
            verified={post.author.isVerified}
          />
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={`/profile/${post.author.id}`}
            className="text-[15px] font-semibold hover:text-olive-dark"
          >
            {firstName}
          </Link>
          <p className="truncate text-xs text-muted">
            {post.location || "Vancouver"} ·{" "}
            <time dateTime={post.createdAt.toISOString()}>
              {post.createdAt.toLocaleDateString("en-CA", {
                month: "short",
                day: "numeric",
                timeZone: "America/Vancouver",
              })}
            </time>
          </p>
        </div>
        <div className="relative">
          <button
            aria-label="Post actions"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setMenu(false);
            }}
            className="grid size-9 place-items-center rounded-12 text-muted hover:bg-ivory"
          >
            <MoreVertical size={17} />
          </button>
          {menu && (
            <>
              <button
                aria-label="Close post actions"
                onClick={() => setMenu(false)}
                className="fixed inset-0 z-10 cursor-default"
              />
              <div className="absolute top-10 right-0 z-20 w-40 rounded-12 border border-line bg-white p-1.5 shadow-raised">
                {mine ? (
                  <>
                    <button
                      onClick={() => open("edit")}
                      className="flex w-full items-center gap-2 rounded-10 p-2 text-sm hover:bg-ivory"
                    >
                      <Edit3 size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => open("delete")}
                      className="flex w-full items-center gap-2 rounded-10 p-2 text-sm text-coral hover:bg-ivory"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => open("report")}
                    className="flex w-full items-center gap-2 rounded-10 p-2 text-sm hover:bg-ivory"
                  >
                    <Flag size={14} />
                    Report
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <img
        loading="lazy"
        src={post.imageUrl}
        alt={post.caption.slice(0, 160)}
        className={`w-full bg-cream ${detail ? "max-h-[600px] object-contain" : "aspect-[5/4] object-cover"}`}
      />
      <div className="px-4 pt-3.5 pb-5">
        <div className="mb-3 flex items-center justify-between border-b border-line pb-3">
          <button
            disabled={pending}
            aria-label="React with a paw"
            aria-pressed={post.liked ?? false}
            onClick={() => {
              if (requireAuth())
                run(
                  () => reactToPost(post.id, !post.liked),
                  () => {},
                );
            }}
            className={`grid h-[38px] w-11 place-items-center rounded-full text-peach-ink disabled:opacity-50 ${post.liked ? "bg-peach ring-1 ring-peach-ink/30" : "bg-peach-soft hover:bg-peach"}`}
          >
            <PawPrint size={18} fill={post.liked ? "currentColor" : "none"} />
          </button>
          <span className="text-xs text-muted">
            <strong className="mr-1 text-[15px] font-semibold text-brown">
              {post.likeCount}
            </strong>
            Paws
          </span>
        </div>
        <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed text-brown-2">
          <strong className="mr-1 font-semibold text-brown">{firstName}</strong>
          {post.caption}
        </p>
        {lost && !mine && (
          <Button
            className="mt-4 w-full"
            loading={pending}
            onClick={() => {
              if (requireAuth())
                run(
                  () => messagePostAuthor(post.id),
                  () => {},
                );
            }}
          >
            <Send size={16} />
            send message
          </Button>
        )}
        {error && !dialog && (
          <p role="alert" className="mt-3 text-sm text-coral">
            {error}
          </p>
        )}
      </div>
      {dialog === "edit" && member && (
        <Modal
          open
          onClose={close}
          title="Update your post"
          eyebrow="Edit post"
          size="wide"
        >
          <PostComposer
            member={member}
            existing={post}
            onBusyChange={setEditingBusy}
            onClose={close}
            onSuccess={() => {
              setDialog(null);
              notify?.("Your post was updated.");
              router.refresh();
            }}
          />
        </Modal>
      )}
      {dialog === "delete" && (
        <Modal
          open
          onClose={close}
          title="Delete this post?"
          eyebrow="Delete post"
          lead="It will be removed from Community and your profile. This cannot be undone."
          footer={
            <>
              <Button variant="secondary" disabled={pending} onClick={close}>
                Keep post
              </Button>
              <Button
                variant="danger"
                loading={pending}
                onClick={() =>
                  run(
                    () => deleteCommunityPost(post.id),
                    () => {
                      setDialog(null);
                      notify?.("Your post was deleted.");
                      if (detail) router.push("/community");
                    },
                  )
                }
              >
                <Trash2 size={16} />
                Delete
              </Button>
            </>
          }
        >
          {error && (
            <p role="alert" className="text-sm text-coral">
              {error}
            </p>
          )}
        </Modal>
      )}
      {dialog === "report" && (
        <Modal
          open
          onClose={close}
          title="Report post"
          lead="Tell us what’s wrong. A moderator will review it."
          footer={
            <>
              <Button variant="secondary" disabled={pending} onClick={close}>
                Cancel
              </Button>
              <Button
                loading={pending}
                disabled={!reason}
                onClick={() =>
                  run(
                    () => reportCommunityPost(post.id, reason),
                    () => {
                      setDialog(null);
                      notify?.("Your report was submitted.");
                    },
                  )
                }
              >
                Submit report
              </Button>
            </>
          }
        >
          <fieldset className="space-y-2">
            <legend className="sr-only">Report reason</legend>
            {[
              "Spam or misleading content",
              "Harassment or inappropriate content",
              "Animal welfare concern",
              "Other",
            ].map((value) => (
              <label
                key={value}
                className="flex items-center gap-2 rounded-12 border border-line p-3 text-sm"
              >
                <input
                  type="radio"
                  name={`reason-${post.id}`}
                  checked={reason === value}
                  onChange={() => setReason(value)}
                  disabled={pending}
                />
                {value}
              </label>
            ))}
          </fieldset>
          {error && (
            <p role="alert" className="mt-3 text-sm text-coral">
              {error}
            </p>
          )}
        </Modal>
      )}
      {(dialog === "found" || dialog === "reunited") && (
        <Modal
          open
          onClose={close}
          centered
          title={
            dialog === "reunited" ? "Welcome home!" : "Is your pet home safe?"
          }
          lead={
            dialog === "reunited"
              ? "Thank you to every neighbour who kept an eye out. Your alert now shows Pet found."
              : undefined
          }
          footer={
            dialog === "reunited" ? (
              <Button onClick={close}>Done</Button>
            ) : (
              <>
                <Button variant="secondary" disabled={pending} onClick={close}>
                  Not yet
                </Button>
                <Button
                  loading={pending}
                  onClick={() =>
                    run(
                      () => markPetFound(post.id),
                      () => setDialog("reunited"),
                    )
                  }
                >
                  Yes, they’re home
                </Button>
              </>
            )
          }
        >
          <img
            src={post.imageUrl}
            alt="Your pet"
            className="mx-auto mb-4 size-24 rounded-full object-cover ring-4 ring-sage-soft"
          />
          {dialog === "found" && (
            <ul className="space-y-2 rounded-16 bg-ivory p-4 text-left text-sm">
              <li>
                The alert changes to <strong>Pet found</strong>
              </li>
              <li>It leaves the Lost and Found tab</li>
              <li>Chats about it move to Archive</li>
            </ul>
          )}
          {error && (
            <p role="alert" className="mt-3 text-sm text-coral">
              {error}
            </p>
          )}
        </Modal>
      )}
    </article>
  );
}
