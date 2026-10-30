import Link from "next/link";
import {
  BellRing,
  CheckCircle2,
  Flag,
  MapPin,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";
import type { ReviewQueueItem } from "@/lib/admin/mock-data";

function iconForReviewItem(item: ReviewQueueItem): LucideIcon {
  const reason = item.reason.toLowerCase();

  if (item.target === "verification") {
    return BellRing;
  }
  if (item.target === "place") {
    return MapPin;
  }
  if (reason.includes("inappropriate")) {
    return MessageCircle;
  }
  return Flag;
}

type ReviewQueueProps = {
  items: ReviewQueueItem[];
  openCount: number;
};

export function ReviewQueue({ items, openCount }: ReviewQueueProps) {
  return (
    <section className="rounded-20 border border-line bg-white p-[22px] shadow-admin">
      <div className="mb-[18px] flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-[17px] font-bold text-brown">
            Needs review
          </h2>
          <p className="mt-0.5 text-[13px] text-muted">
            Priority moderation queue
          </p>
        </div>
        <span className="inline-flex rounded-full bg-amber-soft px-2.5 py-1 text-xs font-semibold text-amber-ink">
          {openCount} open
        </span>
      </div>
      <div className="grid gap-2">
        {items.length === 0 ? (
          <div className="flex items-center gap-2 rounded-12 bg-[#ddf2e5] px-3.5 py-3.5 text-sm text-success">
            <CheckCircle2 aria-hidden="true" size={18} />
            The moderation queue is clear.
          </div>
        ) : (
          items.map((item) => {
            const Icon = iconForReviewItem(item);
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-12 bg-ivory p-3"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center text-coral">
                  <Icon aria-hidden="true" size={17} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-brown">
                    {item.subject}
                  </p>
                  <p className="truncate text-[13px] text-muted">
                    {item.date ? `${item.reason} · ${item.date}` : item.reason}
                  </p>
                </div>
                <Link
                  href={item.href}
                  className="rounded-12 border border-[#dcd3c0] bg-white px-3 py-1.5 text-[13px] font-semibold text-brown hover:bg-cream"
                >
                  Review
                </Link>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
