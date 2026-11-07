import { Heart, Images, UserRound, UsersRound } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

type ProfileStatsProps = {
  posts?: number;
  postLikes?: number;
  createdAt?: Date | string;
  bio?: string | null;
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
      iconClass: "text-olive",
      icon: <Images size={18} aria-hidden="true" />,
      value: posts,
      label: "Community posts",
      note: posts ? "moments shared" : "nothing shared yet",
    },
    {
      iconClass: "text-peach",
      icon: <Heart size={18} aria-hidden="true" />,
      value: postLikes,
      label: "Post reactions",
      note: posts ? `≈ ${Math.round(postLikes / posts)} per post` : "—",
    },
    {
      iconClass: "text-lavender",
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
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
          {bio}
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
          <div
            key={tile.label}
            className="flex flex-col items-center gap-1 rounded-lg bg-white p-4 text-center shadow-md"
          >
            <span className={tile.iconClass}>{tile.icon}</span>
            <strong className="text-lg font-semibold">{tile.value}</strong>
            <span className="text-sm font-medium text-brown">{tile.label}</span>
            <small className="text-xs text-gray-600">{tile.note}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
