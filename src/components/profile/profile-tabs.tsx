"use client";

import { useState } from "react";
import { Award, UsersRound } from "lucide-react";
import { Tab, Tabs } from "@/components/ui/tabs";
import ProfileStats from "@/components/profile/profile-stats";
import SittingStats from "@/components/profile/sitting-stats";
import { buttonClass } from "@/components/ui/button";
import LinkNext from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import SittingReview from "@/components/profile/sitting-review-card";
import { PostCard } from "@/components/community/post-card";
import type { CommunityPostView } from "@/components/community/post-card";

type ProfileTabsProps = {
  posts: number;
  postLikes: number;
  createdAt: Date | string;
  bio?: string | null;
  rating?: number | null;
  reviewCount?: number;
  completedSits?: number;
  careSpecies?: string[];
  certificateName?: string | null;
  certificateIssuedBy?: string | null;
  reviews?: {
    id: string;
    reviewer: { name: string; image: string | null };
    rating: number;
    comment: string;
    createdAt: Date | string;
  }[];
  experience?: string | null;

  communityPosts?: CommunityPostView[];
  member?: { id: string; name: string; image: string | null } | null;
};

// The database saves "DOG" / "CAT". Show them as "Dogs" / "Cats".
const SPECIES_LABELS: Record<string, string> = { DOG: "Dogs", CAT: "Cats" };

export function ProfileTabs({
  posts,
  postLikes,
  createdAt,
  bio = null,
  rating = null,
  reviewCount = 0,
  completedSits = 0,
  careSpecies = [],
  certificateName = null,
  certificateIssuedBy = null,
  reviews = [],
  experience = null,
  communityPosts = [],
  member = null,
}: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState("community");

  return (
    <>
      <Tabs>
        <Tab
          label="Community"
          icon={<UsersRound size={16} aria-hidden="true" />}
          selected={activeTab === "community"}
          onClick={() => setActiveTab("community")}
        />
        <Tab
          label="Sitting Experience"
          icon={<Award size={16} aria-hidden="true" />}
          selected={activeTab === "experience"}
          onClick={() => setActiveTab("experience")}
        />
      </Tabs>
      <div className="mt-4">
        {activeTab === "community" ? (
          <>
            <div className="bg-white px-[24px] py-[26px] border border-line rounded-[12px]">
            <div className="flex items-center justify-between gap-4">
              <h1 className="mb-2 text-lg font-semibold">About Me</h1>
              <LinkNext
                href="/profile/me/edit?section=about"
                className={buttonClass({ variant: "text" })}
              >
                Edit
              </LinkNext>
            </div>


            <ProfileStats
              posts={posts}
              postLikes={postLikes}
              createdAt={createdAt}
              bio={bio}
            />
            </div>
            

            {/* community posts */}

            <div className="bg-white px-[24px] py-[26px] border border-line rounded-[12px]">
              <h2 className="mb-2 text-lg font-semibold">Community Posts</h2>
              <p className="text-sm text-muted-foreground">
                Everything you have shared with the community.
              </p>
              <div className="mt-4 flex items-center justify-end">
              {communityPosts.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {communityPosts.map((post) => (
                    <PostCard key={post.id} post={post} member={member} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No community posts yet"
                  text="Share your moments with the community."
                  className="py-6"
                />
              )}
            </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between gap-4">
              <h1 className="mb-2 text-lg font-semibold">Sitting Experience</h1>

              <LinkNext
                href="/profile/me/edit?section=sitting"
                className={buttonClass({ variant: "text" })}
              >
                Edit
              </LinkNext>
            </div>

            <SittingStats
              rating={rating}
              reviewCount={reviewCount}
              completedSits={completedSits}
              careSpecies={careSpecies.map((sp) => SPECIES_LABELS[sp] ?? sp)}
              certificateName={certificateName}
              certificateIssuedBy={certificateIssuedBy}
              experience={experience}
            />

            {/* User reviews card */}
            <div className="mt-6">
              <h2 className="mb-2 text-lg font-semibold">User Reviews</h2>

              {/* Sample review until we load real reviews from the database */}
              {reviews.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {reviews.map((review) => (
                    <SittingReview
                      key={review.id}
                      reviewerName={review.reviewer.name}
                      reviewerImage={review.reviewer.image}
                      rating={review.rating}
                      comment={review.comment}
                      createdAt={review.createdAt}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No reviews yet"
                  text="Reviews from pet owners will show here after a sit."
                  className="py-6"
                />
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
