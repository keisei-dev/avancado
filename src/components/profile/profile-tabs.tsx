"use client";

import { useState } from "react";
import { Award, UsersRound } from "lucide-react";
import { Tab, Tabs } from "@/components/ui/tabs";
import ProfileStats from "@/components/profile/profile-stats";
import SittingStats from "@/components/profile/sitting-stats";
import { buttonClass } from "@/components/ui/button";
import LinkNext from "next/link";
import {EmptyState} from "@/components/ui/empty-state";
import SittingReview from "@/components/profile/sitting-review-card";

type ProfileTabsProps = {
  posts: number;
  postLikes: number;
  createdAt: Date | string;
  bio?: string | null;
  rating?: number | null;
  reviewCount?: number;
  completedSits?: number;
};

// Sample data until the team adds these User columns:
// sittingExperience, caresFor, certificateName, certificateIssuer
const SAMPLE_SITTING = {
  experience: null,
  caresFor: ["Dogs", "Cats"],
  certificate: null,
};

export function ProfileTabs({
  posts,
  postLikes,
  createdAt,
  bio = null,
  rating = null,
  reviewCount = 0,
  completedSits = 0,
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
      <div className="bg-white px-[24px] py-[26px] border border-line rounded-[12px]">
        {activeTab === "community" ? (
          <>
            <div className="flex items-center justify-between gap-4">
              <h1 className="mb-2 text-lg font-semibold">About Me</h1>
              <LinkNext
                href="/profile/me/edit"
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

            {/* community posts */}
            <div className="mt-6">
              <h2 className="mb-2 text-lg font-semibold">Community Posts</h2>
              {posts > 0 ? (
                <p className="text-sm text-gray-600">
                  You have shared {posts} moment{posts > 1 ? "s" : ""} with the
                  community.
                </p>
              ) : (
                <EmptyState
                  title="No community posts yet"
                  text="Share your moments with the community."
                  className="py-6"
                />
              )}
            </div>
          </>
        ) : (
          <>
                        <div className="flex items-center justify-between gap-4">
              <h1 className="mb-2 text-lg font-semibold">Sitting Experience</h1>
              <LinkNext
                href="/profile/me/edit"
                className={buttonClass({ variant: "text" })}
              >
                Edit
              </LinkNext>
            </div>
            <SittingStats
              experience={SAMPLE_SITTING.experience}
              rating={rating}
              reviewCount={reviewCount}
              completedSits={completedSits}
              caresFor={SAMPLE_SITTING.caresFor}
              certificate={SAMPLE_SITTING.certificate}
            />

            {/* User reviews card */}
            <div className="mt-6">
              <h2 className="mb-2 text-lg font-semibold">User Reviews</h2>
              {/* Sample review until we load real reviews from the database */}
              <SittingReview
                reviewerName="Jane Doe"
                rating={5}
                comment="An amazing sitter! Took great care of my dog and sent me daily updates. I would highly recommend them."
                createdAt="2026-10-12"
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}
