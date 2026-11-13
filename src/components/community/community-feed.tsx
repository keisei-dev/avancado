"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Camera, Flag, PawPrint, Plus, Star, ChevronRight } from "lucide-react";
import { PostCard, type CommunityPostView } from "./post-card";
import { PostComposer } from "./post-composer";
import { Modal } from "@/components/ui/modal";
import { Toast } from "@/components/ui/toast";
import { Avatar } from "@/components/ui/avatar";
import { buttonClass } from "@/components/ui/button";

type Member = {
  id: string;
  name: string;
  image: string | null;
  isAdmin?: boolean;
};
export function CommunityFeed({
  posts,
  sitters,
  member,
  unavailable,
  posted,
}: {
  posts: CommunityPostView[];
  sitters: {
    id: string;
    name: string;
    image: string | null;
    rating: number;
    sits: number;
  }[];
  member: Member | null;
  unavailable: boolean;
  posted: boolean;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(posted ? "Your post is now live." : "");
  const [noticeId, setNoticeId] = useState(0);
  const notify = (text: string) => {
    setNotice(text);
    setNoticeId((n) => n + 1);
  };
  const lost = posts.filter(
    (post) => post.type === "LOST_PET" && post.status === "ACTIVE",
  );
  const shown = filter === "lost" ? lost : posts;
  return (
    <main className="mx-auto grid w-full max-w-[1080px] items-start gap-8 p-4 sm:p-8 xl:grid-cols-[minmax(0,600px)_280px]">
      <div className="mx-auto w-full max-w-[600px] min-w-0">
        <header>
          <h1 className="font-display text-[26px] font-bold">Community</h1>
          <p className="mt-1 text-sm text-muted">
            Everyday moments, local tips, and lost pet alerts from your
            neighbours.
          </p>
        </header>
        {member?.isAdmin ? null : (
          <button
            onClick={() => (member ? setOpen(true) : router.push("/login"))}
            className="my-4 flex w-full items-center gap-3 rounded-20 border border-line bg-white p-2.5 text-left shadow-card hover:border-line-strong"
          >
            {member ? (
              <Avatar name={member.name} src={member.image} />
            ) : (
              <span className="rounded-full bg-sage-soft p-3 text-olive-dark">
                <Camera size={18} />
              </span>
            )}
            <span className="flex-1 text-sm text-muted">
              Share a moment or a lost pet alert…
            </span>
            <span className={buttonClass({ size: "sm" })}>
              <Plus size={16} />
              <span className="hidden sm:inline">Create post</span>
            </span>
          </button>
        )}
        <nav
          aria-label="Post filters"
          className="mb-5 inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-cream p-1"
        >
          {[
            { value: "all", label: "Latest", count: posts.length },
            { value: "lost", label: "Lost and Found", count: lost.length },
          ].map((tab) => (
            <button
              key={tab.value}
              aria-pressed={filter === tab.value}
              onClick={() => setFilter(tab.value)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${filter === tab.value ? (tab.value === "lost" ? "bg-white text-coral shadow-card" : "bg-white text-brown shadow-card") : "text-muted hover:bg-cream"}`}
            >
              {tab.value === "lost" && <Flag size={15} />}
              {tab.label}
              <span className="rounded-full bg-white/70 px-2 text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
        {unavailable ? (
          <p
            role="alert"
            className="rounded-16 bg-coral-soft p-6 text-sm text-coral"
          >
            Community posts could not be loaded. Please try again later.
          </p>
        ) : shown.length ? (
          <div className="space-y-5">
            {shown.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                member={member}
                notify={notify}
              />
            ))}
          </div>
        ) : (
          <div className="grid justify-items-center gap-3 rounded-20 border border-line bg-white p-10 text-center">
            <PawPrint size={24} className="text-olive" />
            <h2 className="font-bold">
              {filter === "lost" ? "No lost pets right now" : "No posts yet"}
            </h2>
            <p className="text-sm text-muted">
              {filter === "lost"
                ? "Every pet in the neighbourhood is accounted for. Fingers crossed it stays that way!"
                : "Be the first to share a moment with your neighbours."}
            </p>
          </div>
        )}
        {posts.length === 60 && (
          <p className="mt-4 text-xs text-muted">
            Showing the 60 most recent posts.
          </p>
        )}
      </div>
      <aside className="hidden space-y-5 xl:block">
        {lost.length > 0 && (
          <section className="rounded-20 border border-line bg-white p-4">
            <header className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold">Lost pets nearby</h2>
              <button
                onClick={() => setFilter("lost")}
                className="text-xs font-semibold text-olive-dark"
              >
                See all
              </button>
            </header>
            {lost.slice(0, 4).map((post) => (
              <Link
                key={post.id}
                href={`/community/${post.id}`}
                className="flex items-center gap-3 border-t border-line py-3"
              >
                <img
                  src={post.imageUrl}
                  alt=""
                  className="size-11 rounded-12 object-cover"
                />
                <span className="min-w-0 flex-1">
                  <strong className="block text-xs">A neighbour’s pet</strong>
                  <span className="block truncate text-xs text-muted">
                    Last seen near {post.location || "Vancouver"}
                  </span>
                </span>
                <span className="rounded-full bg-coral-soft px-2 py-1 text-[10px] text-coral">
                  Lost
                </span>
              </Link>
            ))}
          </section>
        )}
        <section className="rounded-20 border border-line bg-white p-4">
          <header className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold">Trusted sitters</h2>
            <Link
              href="/sitter-board"
              className="text-xs font-semibold text-olive-dark"
            >
              Board
            </Link>
          </header>
          {sitters.length ? (
            sitters.map((sitter) => (
              <Link
                key={sitter.id}
                href={`/profile/${sitter.id}`}
                className="flex items-center gap-3 border-t border-line py-3"
              >
                <Avatar name={sitter.name} src={sitter.image} verified />
                <span className="min-w-0 flex-1">
                  <strong className="block text-xs">
                    {sitter.name.split(" ")[0]}
                  </strong>
                  <span className="flex items-center gap-1 text-xs text-muted">
                    <Star size={11} />
                    {sitter.rating.toFixed(1)} · {sitter.sits} sits
                  </span>
                </span>
                <ChevronRight size={16} />
              </Link>
            ))
          ) : (
            <p className="text-xs text-muted">
              Meet local helpers on the Sitter board.
            </p>
          )}
        </section>
        <p className="text-xs leading-relaxed text-muted">
          Avancado · Made for Vancouver’s pets and their people.
        </p>
      </aside>
      {open && member && !member.isAdmin && (
        <Modal
          open
          onClose={() => {
            if (!busy) setOpen(false);
          }}
          title="Share with your neighbours"
          eyebrow="New community post"
          size="wide"
        >
          <PostComposer
            member={member}
            onClose={() => setOpen(false)}
            onBusyChange={setBusy}
            onSuccess={() => {
              setOpen(false);
              setFilter("all");
              notify("Your post is now live.");
              router.refresh();
            }}
          />
        </Modal>
      )}
      {notice && <Toast key={noticeId} message={notice} />}
    </main>
  );
}
