"use client";

import { useState } from "react";
import { StarRating } from "@/components/ui/star-rating";

export function StarRatingDemo() {
  const [rating, setRating] = useState(3);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-1 text-sm text-muted">Click to rate: {rating} / 5</p>
        <StarRating value={rating} onChange={setRating} />
      </div>
      <div>
        <p className="mb-1 text-sm text-muted">Show only (a review)</p>
        <StarRating value={4} size={16} />
      </div>
    </div>
  );
}
