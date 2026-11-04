// UI library (P3): StarRating
/**
 * Two ways to use it:
 * - Show a rating: <StarRating value={4} />
 * - Let people rate: <StarRating value={rating} onChange={setRating} />
 * Star colour: text-star. Server-safe (no "use client").
 */

import { Star } from "lucide-react";

export type StarRatingProps = {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
};

export function StarRating({ value, onChange, size = 22 }: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];

  // Show only (no onChange): plain stars, not buttons
  if (!onChange) {
    return (
      <div
        className="flex items-center gap-0.5"
        role="img"
        aria-label={`${value} out of 5 stars`}
      >
        {stars.map((star) => (
          <Star
            key={star}
            size={size}
            aria-hidden="true"
            className={star <= value ? "text-star" : "text-line-strong"}
            fill={star <= value ? "currentColor" : "none"}
          />
        ))}
      </div>
    );
  }

  // Rate: each star is a button
  return (
    <div className="flex items-center gap-0.5">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          aria-pressed={star <= value}
          className={
            star <= value
              ? "grid size-9 place-items-center rounded-10 text-star hover:bg-ivory"
              : "grid size-9 place-items-center rounded-10 text-line-strong hover:bg-ivory hover:text-star"
          }
        >
          <Star
            size={size}
            aria-hidden="true"
            fill={star <= value ? "currentColor" : "none"}
          />
        </button>
      ))}
    </div>
  );
}
