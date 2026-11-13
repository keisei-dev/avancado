"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "lucide-react";
import {
  formatCustomRangeLabel,
  parseCustomRange,
} from "@/lib/admin/date-range";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const CHIP =
  "inline-flex shrink-0 items-center rounded-full outline-none focus-visible:shadow-focus";

export type AdminRangeOption = {
  id: string;
  label: string;
};

type AdminRangePillsProps = {
  range: string;
  from?: string;
  to?: string;
  options: AdminRangeOption[];
  hrefs: Record<string, string>;
  clearHref: string;
  size?: "sm" | "md";
};

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function localYmd(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function defaultDraft(from?: string, to?: string) {
  if (from && to) return { from, to };
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 14);
  return { from: localYmd(start), to: localYmd(end) };
}

export function AdminRangePills({
  range,
  from,
  to,
  options,
  hrefs,
  clearHref,
  size = "sm",
}: AdminRangePillsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState(from ?? "");
  const [draftTo, setDraftTo] = useState(to ?? "");
  const [error, setError] = useState<string | null>(null);

  const customActive = range === "custom" && Boolean(from && to);
  const today = localYmd(new Date());
  const chipSize =
    size === "md"
      ? "h-[34px] gap-1.5 px-3.5 text-[13px] font-medium"
      : "h-8 gap-1.5 px-3 text-[12px] font-semibold";

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function openPopover() {
    const draft = defaultDraft(from, to);
    setDraftFrom(draft.from);
    setDraftTo(draft.to);
    setError(null);
    setOpen(true);
  }

  function apply() {
    const custom = parseCustomRange(draftFrom, draftTo);
    if (!draftFrom || !draftTo) {
      setError("Enter a From and To date.");
      return;
    }
    if (!custom) {
      setError("From must be on or before To.");
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", "custom");
    params.set("from", custom.from);
    params.set("to", custom.to);
    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
    setOpen(false);
  }

  function clear() {
    setOpen(false);
    setError(null);
    router.push(clearHref);
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((item) => {
        const selected = range === item.id;
        return (
          <Link
            key={item.id}
            href={hrefs[item.id] ?? "#"}
            aria-current={selected ? "page" : undefined}
            className={cn(
              CHIP,
              chipSize,
              selected
                ? "border border-olive-hover bg-olive-hover text-white"
                : "border border-line bg-white text-brown hover:bg-ivory",
            )}
          >
            {item.label}
          </Link>
        );
      })}
      <div ref={wrapRef} className="relative">
        <button
          type="button"
          onClick={() => (open ? setOpen(false) : openPopover())}
          aria-expanded={open}
          aria-haspopup="dialog"
          className={cn(
            CHIP,
            chipSize,
            customActive
              ? "border border-olive-hover bg-olive-hover text-white"
              : "border border-line bg-white text-brown hover:bg-ivory",
          )}
        >
          <Calendar size={14} aria-hidden="true" />
          {customActive && from && to
            ? formatCustomRangeLabel(from, to)
            : "Custom"}
        </button>
        {open ? (
          <div
            role="dialog"
            aria-label="Custom date range"
            className="absolute right-0 z-30 mt-2 grid w-[300px] gap-3 rounded-16 bg-white p-4 shadow-raised"
          >
            <p className="text-sm font-semibold text-brown">Custom range</p>
            <div className="grid grid-cols-2 gap-2.5">
              <label className="grid gap-1 text-[12px] text-muted">
                From
                <input
                  type="date"
                  value={draftFrom}
                  max={today}
                  onChange={(event) => {
                    setDraftFrom(event.target.value);
                    setError(null);
                  }}
                  className="h-[38px] rounded-12 border border-line-strong bg-white px-2.5 text-sm font-semibold text-brown outline-none focus:border-olive focus:shadow-focus"
                />
              </label>
              <label className="grid gap-1 text-[12px] text-muted">
                To
                <input
                  type="date"
                  value={draftTo}
                  min={draftFrom || undefined}
                  max={today}
                  onChange={(event) => {
                    setDraftTo(event.target.value);
                    setError(null);
                  }}
                  className="h-[38px] rounded-12 border border-line-strong bg-white px-2.5 text-sm font-semibold text-brown outline-none focus:border-olive focus:shadow-focus"
                />
              </label>
            </div>
            {error ? (
              <p role="alert" className="text-[12px] font-medium text-coral">
                {error}
              </p>
            ) : null}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={clear}>
                Clear
              </Button>
              <Button type="button" size="sm" onClick={apply}>
                Apply
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
