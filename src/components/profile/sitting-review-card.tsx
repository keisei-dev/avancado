// One review from a pet owner: who wrote it, stars, and their comment
import { Avatar } from "@/components/ui/avatar";
import { StarRating } from "@/components/ui/star-rating";

type SittingReviewCardProps = {
  reviewerName: string;
  reviewerImage?: string | null;
  rating: number;
  comment: string;
  createdAt?: Date | string;
};

export default function SittingReview({
  reviewerName,
  reviewerImage = null,
  rating,
  comment,
  createdAt,
}: SittingReviewCardProps) {
  const date = createdAt
    ? new Date(createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <Avatar name={reviewerName} src={reviewerImage} size="md" />
        <div className="flex flex-col">
          <strong className="font-semibold text-brown">{reviewerName}</strong>
          {date && <small className="text-xs text-gray-600">{date}</small>}
        </div>
        <div className="ml-auto">
          <StarRating value={rating} size={16} />
        </div>
      </div>
      <p className="text-sm text-gray-700">{comment}</p>
    </div>
  );
}
