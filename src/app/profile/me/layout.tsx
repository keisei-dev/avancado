import type { ReactNode } from "react";
import ProfileSavedToast from "@/components/profile/profile-saved-toast";

export default function MyProfileLayout({
  children,
  modal,
}: {
  children: ReactNode;
  modal: ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
      <ProfileSavedToast />
    </>
  );
}