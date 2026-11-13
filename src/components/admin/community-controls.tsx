"use client";

import { useState } from "react";
import { Flag, Trash2 } from "lucide-react";
import { deleteCommunityPost } from "@/app/admin/(protected)/community/actions";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

type ViewPost = {
  caption: string;
  location: string | null;
  imageUrl: string;
  type: string;
  author: { name: string };
  openReports: {
    id: string;
    reason: string;
    createdAt: Date;
    reporterName: string;
  }[];
};

function postedOn(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ViewCommunityPostButton({ post }: { post: ViewPost }) {
  const [open, setOpen] = useState(false);
  const author = post.author.name.trim() || "Member";
  const lost = post.type === "LOST_PET";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-8 items-center rounded-10 border border-line bg-white px-2.5 text-[12px] font-medium text-brown-2"
      >
        View
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        eyebrow={lost ? "Lost pet" : "Post"}
        title={author}
        lead={post.location || "Vancouver"}
        size="wide"
      >
        <div className="grid gap-4">
          {post.imageUrl ? (
            // Photos come from Supabase Storage; a plain img avoids next/image host config.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.imageUrl}
              alt=""
              className="max-h-[360px] w-full rounded-16 bg-cream object-contain"
            />
          ) : null}
          <p className="whitespace-pre-wrap text-sm leading-6 text-brown">
            {lost ? <span className="font-semibold">LOST PET: </span> : null}
            {post.caption}
          </p>
          {post.openReports.length > 0 ? (
            <div className="rounded-12 bg-coral-soft p-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-coral">
                <Flag size={13} aria-hidden="true" />
                {post.openReports.length === 1
                  ? "1 open report"
                  : `${post.openReports.length} open reports`}
              </p>
              <ul className="grid gap-1.5">
                {post.openReports.map((report) => (
                  <li key={report.id} className="text-[13px] text-brown">
                    <span className="font-semibold">{report.reason}</span>
                    <span className="text-muted">
                      {" "}
                      · {report.reporterName} · {postedOn(report.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </Modal>
    </>
  );
}

export function DeleteCommunityPostButton({
  postId,
  authorName,
}: {
  postId: string;
  authorName: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-8 items-center gap-1.5 rounded-10 border border-line bg-white px-2.5 text-[12px] font-medium text-coral"
      >
        <Trash2 size={14} aria-hidden="true" />
        Delete
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        eyebrow="Permanent action"
        title={`Delete ${authorName}’s post?`}
        lead="This hides it from Community. Use Hide if you might want to restore it later."
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <form action={deleteCommunityPost} onSubmit={() => setOpen(false)}>
              <input type="hidden" name="postId" value={postId} />
              <Button type="submit" variant="danger">
                Delete post
              </Button>
            </form>
          </>
        }
      />
    </>
  );
}
