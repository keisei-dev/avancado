import { redirect } from "next/navigation";
import ProfileSummaryCard from "@/components/profile/profile-summary-card";
import { getCurrentMember } from "@/lib/auth/member";
import VerificationPanel from "@/components/profile/verification-panel";
import { ProfileTabs } from "@/components/profile/profile-tabs";
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
    <main className="grid grid-cols-1 gap-4 p-8 md:grid-cols-3">
      <div className="md:col-span-1">
        <ProfileSummaryCard user={member} />
      </div>
      <div className="md:col-span-2">
        <VerificationPanel />
        <div className="my-4 h-px bg-gray-200 dark:bg-gray-700" />
        <ProfileTabs
          posts={0}
          postLikes={0}
          createdAt={member.createdAt}
          rating={sitterRating._avg.rating}
          reviewCount={sitterRating._count._all}
          completedSits={completedSits}
          bio={profile?.bio}
          careSpecies={profile?.careSpecies}
          certificateName={profile?.certificateName}
          certificateIssuedBy={profile?.certificateIssuedBy}
        />
      </div>
    </main>
  );
}
