import { redirect } from "next/navigation";
import SettingForm from "@/components/profile/setting-form";
import { getCurrentMember } from "@/lib/auth/member";

export default async function AccountSettingsPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");

  return (
    <main className="p-6 sm:p-8">
      <SettingForm mode="page" email={member.email} />
    </main>
  );
}
