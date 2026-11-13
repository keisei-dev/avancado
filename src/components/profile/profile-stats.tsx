import { Heart, Images, UserRound, UsersRound } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { StatTile } from "@/components/profile/stat-tile";

type ProfileStatsProps = {
  posts?: number;
  postLikes?: number;
  createdAt?: Date | string;
  bio?: string | null;
  name?: string;
  areaName?: string | null;
  canEdit?: boolean;
};

function getYearsSince(createdAt: Date | string) {
  const joined = new Date(createdAt);
  const now = new Date();
  let years = now.getFullYear() - joined.getFullYear();

  if (
    now.getMonth() < joined.getMonth() ||
    (now.getMonth() === joined.getMonth() && now.getDate() < joined.getDate())
  ) {
    years -= 1;
  }

  return Math.max(0, years);
}

export default function ProfileStats({
  posts = 0,
  postLikes = 0,
  createdAt,
  bio = null,
  name = "This member",
  areaName = null,
  canEdit = false,
}: ProfileStatsProps) {
  const years = createdAt ? getYearsSince(createdAt) : 0;
  const memberSince = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      })
    : "—";

  const tiles = [
    {
      tone: "sage" as const,
      icon: <Images size={18} aria-hidden="true" />,
      value: posts,
      label: "Community posts",
      note: posts ? "moments shared" : "nothing shared yet",
    },
    {
      tone: "peach" as const,
      icon: <Heart size={18} aria-hidden="true" />,
      value: postLikes,
      label: "Post reactions",
      note: posts ? `≈ ${Math.round(postLikes / posts)} per post` : "—",
    },
    {
      tone: "lavender" as const,
      icon: <UsersRound size={18} aria-hidden="true" />,
      value: memberSince,
      label: "Member since",
      note:
        years > 0
          ? `${years} year${years > 1 ? "s" : ""} in the community`
          : "joined this year",
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      {bio ? (
        <div className="text-md text-brown-2">
          {bio}
        </div>
      ) : !canEdit ? (
        // Visitors: build a short intro from info every member has
        <div className="text-md text-brown-2">
          {name} {areaName ? `lives in ${areaName} and ` : ""}joined Avancado in{" "}
          {createdAt
            ? new Date(createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
            : "recently"}
          .
        </div>
      ) : (
        <EmptyState
          title="No bio yet"
          text="Say hi to the community and tell them about you and your pets."
          icon={<UserRound size={24} />}
          className="py-6"
        />
      )}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {tiles.map((tile) => (
          <StatTile
            key={tile.label}
            tone={tile.tone}
            icon={tile.icon}
            value={tile.value}
            label={tile.label}
            note={tile.note}
          />
        ))}
      </div>
    </div>
  );
}
