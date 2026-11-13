import { notFound, redirect } from "next/navigation";
import ProfileSummaryCard from "@/components/profile/profile-summary-card";
import { getCurrentMember } from "@/lib/auth/member";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import type { CommunityPostView } from "@/components/community/post-card";
import { getProfileData } from "@/lib/profile/get-profile-data";



export default async function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const member = await getCurrentMember();
  if (!member) redirect("/login");

  // Looking at yourself? Go to your own editable profile instead.
  if (userId === member.id) redirect("/profile/me");

  const data = await getProfileData(userId, member.id);
  if (!data) notFound(); // missing or suspended user → 404 page

  // The helper never loads email, so nothing private reaches this page
  const publicUser = data.user;

  const communityPosts: CommunityPostView[] = data.postRows.map(
    ({ likes, ...post }) => ({ ...post, liked: likes.length > 0 }),
  );

  return (
    <main className="mx-auto grid w-full grid-cols-1 gap-8 p-7 sm:grid-cols-[320px_1fr] sm:p-8">
      <div>
        <ProfileSummaryCard
          user={publicUser}
          pets={data.pets}
        />
      </div>
      <div className="flex min-w-0 flex-col gap-4">
        <ProfileTabs
          posts={communityPosts.length}
          postLikes={communityPosts.reduce((sum, post) => sum + post.likeCount, 0)}
          name={publicUser.name}
          areaName={publicUser.areaName}
          createdAt={publicUser.createdAt}
          rating={data.sitterRating._avg.rating}
          reviewCount={data.sitterRating._count._all}
          completedSits={data.completedSits}
          bio={publicUser.bio}
          careSpecies={publicUser.careSpecies}
          certificateName={publicUser.certificateName}
          certificateIssuedBy={publicUser.certificateIssuedBy}
          sittingExperience={publicUser.sittingExperience}
          reviews={data.reviews}
          communityPosts={communityPosts}
          member={{ id: member.id, name: member.name, image: member.image }}
        />
      </div>
    </main>
  );
}