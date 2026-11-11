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
    <div className="flex flex-col gap-3 rounded-16 border border-line bg-white p-4">
      <div className="flex items-center gap-3">
        <Avatar name={reviewerName} src={reviewerImage} size="md" />
        <div className="flex flex-col">
          <strong className="font-semibold text-brown">{reviewerName}</strong>
          <div className="flex items-center gap-2">
            <StarRating value={rating} size={12} />
            {date && <small className="text-xs text-muted">{date}</small>}
          </div>
        </div>

      </div>
      <p className="text-sm text-brown-2">"{comment}"</p>
    </div>
  );
}
