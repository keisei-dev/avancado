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
  name: string;
  areaName?: string | null;
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
  sittingExperience?: string | null;

  communityPosts?: CommunityPostView[];
  member?: { id: string; name: string; image: string | null } | null;
  canEdit?: boolean;
};

const SPECIES_LABELS: Record<string, string> = { DOG: "Dogs", CAT: "Cats" };

export function ProfileTabs({
  name,
  areaName = null,
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
  sittingExperience = null,
  communityPosts = [],
  member = null,
  canEdit = false,
}: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState("community");

  return (
    <>
      <Tabs className="self-start !mb-2">
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
      <div className="flex flex-col gap-4">
        {activeTab === "community" ? (
          <>
            <div className="rounded-16 border border-line bg-white p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold">About me</h2>
                  <p className="mt-1 text-sm text-muted">
                    A short introduction for neighbours.
                  </p>
                </div>
                {canEdit && (
                  <LinkNext
                    href="/profile/me/edit?section=about"
                    className={`${buttonClass({ variant: "text" })} shrink-0`}
                  >
                    Edit
                  </LinkNext>
                )}
              </div>

              <div className="mt-5">
                <ProfileStats
                  posts={posts}
                  postLikes={postLikes}
                  createdAt={createdAt}
                  bio={bio}
                  name={name}
                  areaName={areaName}
                  canEdit={canEdit}
                />
              </div>
            </div>

            {/* community posts */}

            <div className="rounded-16 border border-line bg-white p-6">
              <h2 className="text-lg font-semibold">Community posts</h2>
              <p className="text-sm text-muted">
                {canEdit
                  ? "Everything you have shared with the community."
                  : `Moments ${name} has shared with the community.`}
              </p>
              <div className="mt-4">
                {communityPosts.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {communityPosts.map((post) => (
                      <PostCard key={post.id} post={post} member={member} />
                    ))}
                  </div>
                ) : canEdit ? (
                  <EmptyState
                    title="No community posts yet"
                    text="Share your moments with the community."
                    className="py-6"
                  />
                ) : (
                  <p className="text-sm text-muted">{`${name} hasn't posted yet.`}</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-16 border border-line bg-white p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold">Sitting experience</h2>
                  <p className="mt-1 text-sm text-muted">
                    {canEdit
                      ? "Share your experience caring for pets."
                      : `How ${name} cares for pets.`}
                  </p>
                </div>
                {canEdit && (
                  <LinkNext
                    href="/profile/me/edit?section=sitting"
                    className={`${buttonClass({ variant: "text" })} shrink-0`}
                  >
                    Edit
                  </LinkNext>
                )}
              </div>

              <div className="mt-5">
                <SittingStats
                  rating={rating}
                  reviewCount={reviewCount}
                  completedSits={completedSits}
                  careSpecies={careSpecies.map(
                    (sp) => SPECIES_LABELS[sp] ?? sp,
                  )}
                  certificateName={certificateName}
                  certificateIssuedBy={certificateIssuedBy}
                  sittingExperience={sittingExperience}
                  name={name}
                  canEdit={canEdit}
                />
              </div>
            </div>

            {(canEdit || reviews.length > 0) && (
            <div className="rounded-16 border border-line bg-white p-6">
              <h2 className="mb-2 text-lg font-semibold">Reviews</h2>

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
              ) : canEdit ? (
                <EmptyState
                  title="No reviews yet"
                  text="Reviews from pet owners will show here after a sit."
                  className="py-6"
                />
              ) : null}
            </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
