import { redirect } from "next/navigation";
import { getCurrentMember, isAdminMember } from "@/lib/auth/member";
import { getConversations } from "@/lib/messages/queries";
import { MessagesPage } from "@/components/messages/messages-page";

export const instant = false;
export default async function Page() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");
  if (isAdminMember(member)) redirect("/admin");
  const conversations = await getConversations(member.id);
  return <MessagesPage conversations={conversations} memberId={member.id} />;
}
