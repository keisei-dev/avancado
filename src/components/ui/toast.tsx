// UI library (P2): Toast, useToast
// TODO: implement. See docs/UI-LIBRARY.md for conventions.
/**
 * Short confirmation at the bottom with a tick icon; hides on its own.
 * Use role="status". Needs "use client".
 */

"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";

export function Toast({ message }: { message: string }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 3000); // Hide after 3 seconds

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      className="fixed bottom-7 left-1/2 z-[300] flex max-w-[calc(100vw-32px)] -translate-x-1/2 items-center gap-2.5 rounded-12 bg-brown px-[18px] py-3 pl-3.5 text-sm font-medium text-ivory shadow-[var(--shadow-overlay)] animate-toast-in"
    >
      <Check
        className="shrink-0 text-olive-soft"
        size={18}
        aria-hidden="true"
      />
      <span>{message}</span>
    </div>
  );
}

export function useToast() {
  const [message, setMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setMessage(msg);
  };

  return { message, showToast };
}
