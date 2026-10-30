"use client";

import { useSyncExternalStore } from "react";

type AdminGreetingProps = {
  displayName: string;
};

const emptySubscribe = () => () => {};

function formatDashboardDate(now: Date): string {
  return now.toLocaleDateString("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function greetingForHour(hour: number): string {
  if (hour < 12) {
    return "Good morning";
  }
  if (hour < 18) {
    return "Good afternoon";
  }
  return "Good evening";
}

export function AdminGreeting({ displayName }: AdminGreetingProps) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const now = isClient ? new Date() : null;

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.06em] text-olive-hover">
        {now ? formatDashboardDate(now) : "\u00a0"}
      </p>
      <h1 className="font-display mt-1 text-[30px] font-bold tracking-tight text-brown">
        {now
          ? `${greetingForHour(now.getHours())}, ${displayName}`
          : `Welcome, ${displayName}`}
      </h1>
    </div>
  );
}
