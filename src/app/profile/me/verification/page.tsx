import { redirect } from "next/navigation";
import VerificationForm from "@/components/profile/verification-form";
import { getCurrentMember } from "@/lib/auth/member";
import { getVerificationStatus } from "@/lib/profile/get-verification-status";

export default async function ProfileVerificationPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");

  const { status } = await getVerificationStatus(member.id, member.isVerified);
  if (status === "pending" || status === "verified") redirect("/profile/me");

  return (
    <main className="p-6 sm:p-8">
      <VerificationForm mode="page" />
    </main>
  );
}
