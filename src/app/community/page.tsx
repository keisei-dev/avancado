import { connection } from "next/server";
import { hasDatabaseEnv } from "@/lib/auth/admin";
import { getCurrentMember, isAdminMember } from "@/lib/auth/member";
import { CommunityFeed } from "@/components/community/community-feed";
import type { CommunityPostView } from "@/components/community/post-card";

export const instant = false;
export default async function CommunityPage({
  searchParams,
}: PageProps<"/community">) {
  await connection();
  const query = await searchParams;
  const member = await getCurrentMember();
  let posts: CommunityPostView[] = [];
  let sitters: {
    id: string;
    name: string;
    image: string | null;
    rating: number;
    sits: number;
  }[] = [];
  let unavailable = !hasDatabaseEnv();
  if (!unavailable) {
    try {
      const { prisma } = await import("@/lib/prisma/client");
      const rows = await prisma.communityPost.findMany({
        where: {
          status: { not: "HIDDEN" },
          author: { accountStatus: "ACTIVE" },
        },
        include: {
          author: {
            select: { id: true, name: true, image: true, isVerified: true },
          },
          likes: {
            where: {
              userId: member?.id ?? "00000000-0000-0000-0000-000000000000",
            },
            select: { userId: true },
          },
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 60,
      });
      posts = rows.map(({ likes, ...post }) => ({
        ...post,
        liked: likes.length > 0,
      }));
      const candidates = await prisma.user.findMany({
        where: { isVerified: true, accountStatus: "ACTIVE" },
        select: {
          id: true,
          name: true,
          image: true,
          reviewsReceived: {
            where: { status: "ACTIVE" },
            select: { rating: true },
          },
          _count: {
            select: {
              sitterApplications: {
                where: { status: "ACCEPTED", request: { status: "DONE" } },
              },
            },
          },
        },
        take: 30,
      });
      sitters = candidates
        .filter((user) => user._count.sitterApplications >= 5)
        .map((user) => ({
          id: user.id,
          name: user.name,
          image: user.image,
          sits: user._count.sitterApplications,
          rating: user.reviewsReceived.length
            ? user.reviewsReceived.reduce(
                (sum, review) => sum + review.rating,
                0,
              ) / user.reviewsReceived.length
            : 0,
        }))
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3);
    } catch {
      unavailable = true;
    }
  }
  return (
    <CommunityFeed
      posts={posts}
      sitters={sitters}
      member={
        member
          ? {
              id: member.id,
              name: member.name,
              image: member.image,
              isAdmin: isAdminMember(member),
            }
          : null
      }
      unavailable={unavailable}
      posted={query.posted === "1"}
    />
  );
}
