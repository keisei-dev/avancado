import { notFound, redirect } from "next/navigation";
import ProfileSummaryCard from "@/components/profile/profile-summary-card";
import { getCurrentMember } from "@/lib/auth/member";
import VerificationPanel from "@/components/profile/verification-panel";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import type { CommunityPostView } from "@/components/community/post-card";
import { getProfileData } from "@/lib/profile/get-profile-data";
import { getVerificationStatus } from "@/lib/profile/get-verification-status";

export default async function ProfilePage() {
  const member = await getCurrentMember();


  if (!member) {
    redirect("/login");
  }

  const data = await getProfileData(member.id, member.id);
  if (!data) notFound();

  const communityPosts: CommunityPostView[] = data.postRows.map(
    ({ likes, ...post }) => ({ ...post, liked: likes.length > 0 }),
  );

  const verification = await getVerificationStatus(member.id, member.isVerified);

  return (
    <main className="mx-auto grid w-full grid-cols-1 gap-8 p-7 sm:grid-cols-[320px_1fr] sm:p-8">
      <div>
        <ProfileSummaryCard
          // Only my own page shows my email
          user={{ ...data.user, email: member.email }}
          canEdit
          pets={data.pets}
        />
      </div>
      <div className="flex min-w-0 flex-col gap-4">
        <VerificationPanel
          status={verification.status}
          rejectionReason={verification.rejectionReason}
        />
        <ProfileTabs
          canEdit
          name={data.user.name}
          areaName={data.user.areaName}
          posts={communityPosts.length}
          postLikes={communityPosts.reduce(
            (sum, post) => sum + post.likeCount,
            0,
          )}
          createdAt={data.user.createdAt}
          rating={data.sitterRating._avg.rating}
          reviewCount={data.sitterRating._count._all}
          completedSits={data.completedSits}
          bio={data.user.bio}
          careSpecies={data.user.careSpecies}
          certificateName={data.user.certificateName}
          certificateIssuedBy={data.user.certificateIssuedBy}
          sittingExperience={data.user.sittingExperience}
          reviews={data.reviews}
          communityPosts={communityPosts}
          member={{ id: member.id, name: member.name, image: member.image }}
        />
      </div>
    </main>
  );
}
