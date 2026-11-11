"use client";

// Shows "Profile updated" after the Edit profile modal saves.
// The modal sends a "profile-saved" signal, then closes. This component lives in
// the profile layout (always on screen), so it's still here to show the toast.
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

  // A new key each time, so saving twice shows the toast twice
  return count > 0 ? <Toast key={count} message="Your profile has been updated." /> : null;
}
