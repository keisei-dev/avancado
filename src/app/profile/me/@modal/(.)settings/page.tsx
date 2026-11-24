import { redirect } from "next/navigation";
import SettingForm from "@/components/profile/setting-form";
import { getCurrentMember } from "@/lib/auth/member";

// Opened from the profile: show settings as a modal
export default async function AccountSettingsModal() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");

  return <SettingForm mode="modal" email={member.email} />;
}
