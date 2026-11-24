"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArrowLeft,
  MessagesSquare,
  Send,
  ShieldCheck,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button, buttonClass } from "@/components/ui/button";
import { sendMessage, setConversationArchived } from "@/app/messages/actions";

type Conversation = {
  id: string;
  type: string;
  archived: boolean;
  preview: string;
  updatedAt: string;
  unread: number;
  other: {
    id: string;
    name: string;
    image: string | null;
    isVerified: boolean;
  };
};
export type Thread = {
  id: string;
  archived: boolean;
  other: Conversation["other"];
  messages: {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
  }[];
  context: {
    title: string;
    image: string | null;
    caption: string;
    href: string;
    status: string;
  };
};
const filters = {
  all: "All",
  sitting: "Sitting",
  lost: "Lost and Found",
  archived: "Archive",
};
export function MessagesPage({
  conversations,
  thread,
  memberId,
}: {
  conversations: Conversation[];
  thread?: Thread;
  memberId: string;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<keyof typeof filters>(
    thread?.archived ? "archived" : "all",
  );
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const bottom = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "nearest" });
  }, [thread?.id, thread?.messages.length]);
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const timer = setInterval(refresh, 10000);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [router]);
  const run = (
    action: () => Promise<{ error: string }>,
    success?: () => void,
  ) => {
    setError("");
    startTransition(async () => {
      try {
        const result = await action();
        if (result.error) setError(result.error);
        else {
          success?.();
          router.refresh();
        }
      } catch {
        setError("Something went wrong. Please try again.");
      }
    });
  };
  const submit = () => {
    if (thread && draft.trim() && !pending)
      run(
        () => sendMessage(thread.id, draft),
        () => setDraft(""),
      );
  };
  const visible = conversations
    .filter(
      (c) =>
        (filter === "archived"
          ? c.archived
          : !c.archived &&
            (filter === "all" ||
              c.type === (filter === "lost" ? "LOST_FOUND" : "SITTING"))) &&
        `${c.other.name} ${c.preview}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    )
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return (
    <main className="mx-auto w-full max-w-[1440px] p-4 sm:p-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-olive-dark">
            Private conversations
          </p>
          <h1 className="font-display text-[26px] font-bold">Messages</h1>
          <p className="mt-1 text-sm text-muted">
            Coordinate care and lost-pet tips without sharing personal contact
            details.
          </p>
        </div>
        <p className="flex items-center gap-2 text-xs text-muted">
          <ShieldCheck size={18} /> Keep early conversations on Avancado.
        </p>
      </header>
      <div className="grid overflow-hidden rounded-20 border border-line bg-white shadow-card md:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_260px]">
        <aside
          className={`${thread ? "hidden md:block" : ""} border-r border-line`}
        >
          <nav
            aria-label="Conversation filters"
            className="flex flex-wrap gap-1 p-3"
          >
            {Object.entries(filters).map(([key, label]) => (
              <button
                key={key}
                aria-pressed={filter === key}
                onClick={() => setFilter(key as keyof typeof filters)}
                className={`rounded-full px-3 py-2 text-xs font-semibold ${filter === key ? "bg-sage-soft text-olive-dark" : "text-muted hover:bg-ivory"}`}
              >
                {label}
              </button>
            ))}
          </nav>
          <div className="px-3 pb-3">
            <input
              aria-label="Search conversations"
              placeholder="Search messages"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-12 border border-line p-2 text-sm"
            />
          </div>
          <div className="max-h-[65vh] overflow-y-auto">
            {visible.map((c) => (
              <Link
                key={c.id}
                href={`/messages/${c.id}`}
                className={`flex gap-3 border-t border-line p-4 hover:bg-ivory ${thread?.id === c.id ? "bg-ivory" : ""}`}
              >
                <Avatar
                  name={c.other.name}
                  src={c.other.image}
                  verified={c.other.isVerified}
                />
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-sm">
                    {c.other.name}
                  </strong>
                  <span className="block truncate text-xs text-muted">
                    {c.preview}
                  </span>
                  <span
                    className={`mt-2 inline-block rounded-full px-2 py-1 text-[10px] ${c.type === "LOST_FOUND" ? "bg-coral-soft text-coral" : "bg-sage-soft text-olive-dark"}`}
                  >
                    {c.type === "LOST_FOUND" ? "Lost and Found" : "Sitting"}
                  </span>
                </span>
                {c.unread > 0 && (
                  <span
                    aria-label={`${c.unread} unread messages`}
                    className="h-fit rounded-full bg-olive px-2 text-xs text-white"
                  >
                    {c.unread}
                  </span>
                )}
              </Link>
            ))}
            {!visible.length && (
              <p className="p-6 text-center text-sm text-muted">
                No conversations here.
              </p>
            )}
          </div>
        </aside>
        {thread ? (
          <>
            <section
              aria-label={`Conversation with ${thread.other.name}`}
              className="flex h-[70vh] min-h-[440px] min-w-0 flex-col"
            >
              <header className="flex items-center gap-3 border-b border-line p-4">
                <Link
                  href="/messages"
                  aria-label="Back to conversations"
                  className="md:hidden"
                >
                  <ArrowLeft size={18} />
                </Link>
                <Avatar
                  name={thread.other.name}
                  src={thread.other.image}
                  verified={thread.other.isVerified}
                />
                <Link
                  href={`/profile/${thread.other.id}`}
                  className="min-w-0 flex-1 truncate text-sm font-semibold"
                >
                  {thread.other.name}
                </Link>
                <Button
                  variant="secondary"
                  size="sm"
                  loading={pending}
                  onClick={() =>
                    run(() =>
                      setConversationArchived(thread.id, !thread.archived),
                    )
                  }
                >
                  <Archive size={14} />
                  {thread.archived ? "Unarchive" : "Archive"}
                </Button>
              </header>
              <Link
                href={thread.context.href}
                className="border-b border-line bg-ivory px-4 py-2 text-xs text-olive-dark xl:hidden"
              >
                {thread.context.title} · View details
              </Link>
              <div
                className="flex-1 space-y-4 overflow-y-auto bg-ivory/60 p-4"
                aria-label="Message history"
              >
                {!thread.messages.length && (
                  <div className="grid justify-items-center gap-3 p-8 text-center text-sm text-muted">
                    <MessagesSquare />
                    <p>
                      Say hello to {thread.other.name.split(" ")[0]}. Your
                      contact details stay private until you choose to share
                      them.
                    </p>
                  </div>
                )}
                {thread.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.senderId === memberId ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-16 p-3 text-sm ${m.senderId === memberId ? "bg-sage-soft text-brown" : "border border-line bg-white"}`}
                    >
                      <p className="whitespace-pre-wrap break-words">
                        {m.content}
                      </p>
                      <time
                        dateTime={m.createdAt}
                        className="mt-1 block text-right text-[10px] text-muted"
                      >
                        {new Date(m.createdAt).toLocaleString("en-CA", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          timeZone: "America/Vancouver",
                        })}
                      </time>
                    </div>
                  </div>
                ))}
                <div ref={bottom} />
              </div>
              {error && (
                <p role="alert" className="px-4 py-2 text-sm text-coral">
                  {error}
                </p>
              )}
              {thread.archived ? (
                <p className="border-t border-line p-4 text-sm text-muted">
                  This conversation is archived. Unarchive it to keep chatting.
                </p>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    submit();
                  }}
                  className="flex items-end gap-3 border-t border-line p-4"
                >
                  <textarea
                    aria-label="Write your message"
                    placeholder="Write your message"
                    rows={2}
                    maxLength={2000}
                    value={draft}
                    disabled={pending}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        !e.shiftKey &&
                        !e.nativeEvent.isComposing
                      ) {
                        e.preventDefault();
                        submit();
                      }
                    }}
                    className="min-w-0 flex-1 resize-none rounded-12 border border-line p-3 text-sm"
                  />
                  <Button
                    type="submit"
                    loading={pending}
                    disabled={!draft.trim()}
                  >
                    <Send size={16} />
                    Send
                  </Button>
                </form>
              )}
            </section>
            <aside className="hidden space-y-4 border-l border-line p-4 xl:block">
              <span className="text-xs font-semibold text-coral">
                {thread.context.status.replaceAll("_", " ")}
              </span>
              {thread.context.image && (
                <img
                  src={thread.context.image}
                  alt="Pet from the original post"
                  className="aspect-square w-full rounded-16 object-cover"
                />
              )}
              <h2 className="text-sm font-bold">{thread.context.title}</h2>
              <p className="whitespace-pre-wrap break-words text-sm text-muted">
                {thread.context.caption}
              </p>
              <Link
                href={thread.context.href}
                className={buttonClass({ variant: "secondary", size: "sm" })}
              >
                View details
              </Link>
            </aside>
          </>
        ) : (
          <div className="grid min-h-[440px] place-content-center justify-items-center gap-3 p-6 text-center text-muted xl:col-span-2">
            <MessagesSquare />
            <p>Choose a conversation to start chatting.</p>
          </div>
        )}
      </div>
    </main>
  );
}
