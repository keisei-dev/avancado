"use client";

import { useEffect, useState } from "react";
import { Toast } from "@/components/ui/toast";

export const PROFILE_SAVED_EVENT = "profile-saved";

export default function ProfileSavedToast() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const show = () => setCount((current) => current + 1);
    window.addEventListener(PROFILE_SAVED_EVENT, show);
    return () => window.removeEventListener(PROFILE_SAVED_EVENT, show);
  }, []);

  return count > 0 ? <Toast key={count} message="Your profile has been updated." /> : null;
}
