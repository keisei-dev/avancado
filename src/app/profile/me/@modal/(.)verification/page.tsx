import { redirect } from "next/navigation";
import VerificationForm from "@/components/profile/verification-form";
import { getCurrentMember } from "@/lib/auth/member";
import { getVerificationStatus } from "@/lib/profile/get-verification-status";

export default async function VerificationModal() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");

  // Same check as the full page
  const { status } = await getVerificationStatus(member.id, member.isVerified);
  if (status === "pending" || status === "verified") redirect("/profile/me");

  return <VerificationForm mode="modal" />;
}
