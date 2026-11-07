// Pet sitting tab: experience text, rating, sits completed, cares for, certificate
import { Award, CalendarCheck, PawPrint, Sprout, Star } from "lucide-react";
import { StarRating } from "@/components/ui/star-rating";
import { EmptyState } from "@/components/ui/empty-state";

type Certificate = {
  name: string;
  issuer?: string | null;
};

type SittingStatsProps = {
  experience?: string | null;
  rating: number | null;
  reviewCount: number;
  completedSits: number;
  caresFor?: string[];
  certificate?: Certificate | null;
};

export default function SittingStats({
  experience = null,
  rating,
  reviewCount,
  completedSits,
  caresFor = [],
  certificate = null,
}: SittingStatsProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Experience text */}
      {experience ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
          {experience}
        </div>
      ) : (
        <EmptyState
          title="No sitting experience yet"
          text="Share the pets you've cared for so owners can get to know you."
          icon={<PawPrint size={24} />}
          className="py-6"
        />
      )}

      {/* New sitter: no sits yet, so show a friendly message instead of zeros */}
      {completedSits === 0 ? (
        <div className="flex items-center gap-3 rounded-lg bg-sage-faint p-4 shadow-md">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-sage-soft text-olive-dark">
            <Sprout size={20} aria-hidden="true" />
          </span>
          <div className="flex flex-col">
            <strong className="font-semibold text-brown">New sitter</strong>
            <small className="text-xs text-gray-600">
              No sits completed yet. Ratings will show after the first sit.
            </small>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* Rating */}
          <div className="flex flex-col items-center gap-1 rounded-lg bg-white p-4 text-center shadow-md">
            <span className="text-star">
              <Star size={18} aria-hidden="true" />
            </span>
            <strong className="text-lg font-semibold">
              {rating === null ? "—" : rating.toFixed(1)}
            </strong>
            {rating !== null && <StarRating value={Math.round(rating)} size={14} />}
            <span className="text-sm font-medium text-brown">Sitter rating</span>
            <small className="text-xs text-gray-600">
              {reviewCount === 0
                ? "no reviews yet"
                : `${reviewCount} review${reviewCount === 1 ? "" : "s"}`}
            </small>
          </div>

          {/* Sits completed */}
          <div className="flex flex-col items-center gap-1 rounded-lg bg-white p-4 text-center shadow-md">
            <span className="text-olive">
              <CalendarCheck size={18} aria-hidden="true" />
            </span>
            <strong className="text-lg font-semibold">{completedSits}</strong>
            <span className="text-sm font-medium text-brown">Sits completed</span>
            <small className="text-xs text-gray-600">through Avancado</small>
          </div>

          {/* Cares for */}
          <div className="flex flex-col items-center gap-1 rounded-lg bg-white p-4 text-center shadow-md">
            <span className="text-peach-ink">
              <PawPrint size={18} aria-hidden="true" />
            </span>
            <strong className="text-lg font-semibold">
              {caresFor.length > 0 ? caresFor.join(" & ") : "—"}
            </strong>
            <span className="text-sm font-medium text-brown">Cares for</span>
            <small className="text-xs text-gray-600">pet types</small>
          </div>
        </div>
      )}

      {/* Certificate (optional) */}
      {certificate && (
        <div className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-md">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-lavender text-lavender-ink">
            <Award size={20} aria-hidden="true" />
          </span>
          <div className="flex flex-col">
            <strong className="font-semibold text-brown">{certificate.name}</strong>
            {certificate.issuer && (
              <small className="text-xs text-gray-600">{certificate.issuer}</small>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
