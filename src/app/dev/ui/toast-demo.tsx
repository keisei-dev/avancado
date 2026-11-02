"use client";

import { Button } from "@/components/ui/button";
import { Toast, useToast } from "@/components/ui/toast";

export function ToastDemo() {
  const { message, showToast } = useToast();

  return (
    <>
      <Button onClick={() => showToast("This is a toast notification!")}>
        Show toast
      </Button>
      {message && <Toast message={message} />}
    </>
  );
}
