// Pet sitting tab: rating, sits completed, cares for, certificate
// (Sitting experience isn't a column. It's shown by sits completed + rating.)
import { Award, CalendarCheck, PawPrint, Sprout, Star } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { StatTile } from "@/components/profile/stat-tile";

type SittingStatsProps = {
  rating: number | null;
  reviewCount: number;
  completedSits: number;
  careSpecies?: string[];
  certificateName?: string | null;
  certificateIssuedBy?: string | null;
  experience?: string | null;
};

export default function SittingStats({
  rating,
  reviewCount,
  completedSits,
  careSpecies = [],
  certificateName = null,
  certificateIssuedBy = null,
  experience = null,
}: SittingStatsProps) {
  return (
    <div className="flex flex-col gap-3">
      {experience ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
          {experience}
        </div>
      ) : (
        <EmptyState
          title="No sitting experience yet"
          text="Share the pets you have cared for so owners can get to know you."
          icon={<PawPrint size={24} aria-hidden="true" />}
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
          <StatTile
            tone="sage"
            icon={<Star size={18} aria-hidden="true" />}
            value={rating === null ? "—" : rating.toFixed(1)}
            label="Sitter rating"
            note={
              reviewCount === 0
                ? "no reviews yet"
                : `${reviewCount} review${reviewCount === 1 ? "" : "s"}`
            }
          />
          {/* Sits completed */}
          <StatTile
            tone="peach"
            icon={<CalendarCheck size={18} aria-hidden="true" />}
            value={completedSits}
            label="Sits completed"
            note={
              completedSits === 0
                ? "no sits yet"
                : `${completedSits} sit${completedSits === 1 ? "" : "s"}`
            }
          />
          {/* Cares for */}
          <StatTile
            tone="lavender"
            icon={<PawPrint size={18} aria-hidden="true" />}
            value={careSpecies.length > 0 ? careSpecies.join(" & ") : "—"}
            label="Cares for"
            note={
              careSpecies.length > 0
                ? `can care for ${careSpecies.join(" & ")}`
                : "no pets selected"
            }
          />
        </div>
      )}

      {/* Certificate (optional) */}
      {certificateName ? (
        <div className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-md">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-lavender text-lavender-ink">
            <Award size={20} aria-hidden="true" />
          </span>
          <div className="flex flex-col">
            <strong className="font-semibold text-brown">
              {certificateName}
            </strong>
            {certificateIssuedBy && (
              <small className="text-xs text-gray-600">
                {certificateIssuedBy}
              </small>
            )}
          </div>
        </div>
      ) : (
        <EmptyState
          title="No certificate yet"
          text="Add a certificate to show your sitting qualifications."
          icon={<Award size={24} aria-hidden="true" />}
          className="py-6"
        />
      )}
    </div>
  );
}
