import { redirect } from "next/navigation";
import { getCurrentMember, isAdminMember } from "@/lib/auth/member";
import { PostComposer } from "@/components/community/post-composer";

export const instant = false;
export default async function NewPostPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");
  if (isAdminMember(member)) redirect("/community");
  return (
    <main className="mx-auto w-full max-w-2xl p-4 sm:p-8">
      <PostComposer member={member} />
    </main>
  );
}
