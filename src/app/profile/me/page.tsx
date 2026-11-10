import { redirect } from "next/navigation";
import ProfileSummaryCard from "@/components/profile/profile-summary-card";
import { getCurrentMember } from "@/lib/auth/member";
import VerificationPanel from "@/components/profile/verification-panel";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import type { CommunityPostView } from "@/components/community/post-card";
import { prisma } from "@/lib/prisma/client";

export default async function ProfilePage() {
  const member = await getCurrentMember();

  if (!member) {
    redirect("/login");
  }

  // Profile fields the team added to User
  const profile = await prisma.user.findUnique({
    where: { id: member.id },
    select: {
      bio: true,
      careSpecies: true,
      certificateName: true,
      certificateIssuedBy: true,
    },
  });

  const pets = await prisma.pet.findMany({
    where: { ownerId: member.id },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      species: true,
      breed: true,
      birthDate: true,
      weight: true,
      gender: true,
      isNeutered: true,
      notes: true,
      imageUrl: true,
    },
  });

  const postRows = await prisma.communityPost.findMany({
    where: { authorId: member.id, status: { not: "HIDDEN" } },
    include: {
      author: {
        select: { id: true, name: true, image: true, isVerified: true },
      },
      likes: { where: { userId: member.id }, select: { userId: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const communityPosts: CommunityPostView[] = postRows.map(
    ({ likes, ...post }) => ({
      ...post,
      liked: likes.length > 0,
    }),
  );

  const sitterRating = await prisma.review.aggregate({
    where: {
      revieweeId: member.id,
      status: "ACTIVE",
      request: { authorId: { not: member.id } }, // only reviews as a sitter
    },
    _avg: { rating: true },
    _count: { _all: true },
  });

  // Sits this member finished: their application was accepted and the request is done
  const completedSits = await prisma.sitterApply.count({
    where: {
      applicantId: member.id,
      status: "ACCEPTED",
      request: { status: "DONE" },
    },
  });

  return (
    <main className="grid grid-cols-1 gap-4 p-8 md:grid-cols-12">
      <div className="md:col-span-4">
        <ProfileSummaryCard
          user={member}
          pets={pets.map((pet) => ({
            ...pet,
            birthDate: pet.birthDate?.toISOString() ?? null,
            weight: pet.weight === null ? null : Number(pet.weight),
          }))}
        />
      </div>
      <div className="md:col-span-8">
        <VerificationPanel />

        <div className="my-4 h-px bg-gray-200 dark:bg-gray-700" />
        <ProfileTabs
          posts={communityPosts.length}
          postLikes={communityPosts.reduce(
            (sum, post) => sum + post.likeCount,
            0,
          )}
          createdAt={member.createdAt}
          rating={sitterRating._avg.rating}
          reviewCount={sitterRating._count._all}
          completedSits={completedSits}
          bio={profile?.bio}
          careSpecies={profile?.careSpecies}
          certificateName={profile?.certificateName}
          certificateIssuedBy={profile?.certificateIssuedBy}
          communityPosts={communityPosts}
          member={{ id: member.id, name: member.name, image: member.image }}
        />
      </div>
    </main>
  );
}
