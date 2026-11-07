import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";
import { getCurrentMember } from "@/lib/auth/member";
import { PostCard } from "@/components/community/post-card";

export const instant = false;
export default async function PostDetailPage({
  params,
}: PageProps<"/community/[postId]">) {
  await connection();
  const { postId } = await params;
  const member = await getCurrentMember();
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      postId,
    )
  )
    notFound();
  const { prisma } = await import("@/lib/prisma/client");
  const post = await prisma.communityPost.findFirst({
    where: {
      id: postId,
      status: { not: "HIDDEN" },
      author: { accountStatus: "ACTIVE" },
    },
    include: {
      likes: {
        where: { userId: member?.id ?? "00000000-0000-0000-0000-000000000000" },
        select: { userId: true },
      },
      author: {
        select: { id: true, name: true, image: true, isVerified: true },
      },
    },
  });
  if (!post) notFound();
  return (
    <main className="mx-auto w-full max-w-2xl p-4 sm:p-8">
      <Link
        href="/community"
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-olive-dark"
      >
        <ArrowLeft size={16} />
        Back to community
      </Link>
      <h1 className="sr-only">Community post by {post.author.name}</h1>
      <PostCard
        post={{ ...post, liked: post.likes.length > 0 }}
        member={member}
        detail
      />
    </main>
  );
}
