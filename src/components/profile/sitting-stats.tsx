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
  sittingExperience?: string | null;
  name?: string;
  canEdit?: boolean;
};

export default function SittingStats({
  rating,
  reviewCount,
  completedSits,
  careSpecies = [],
  certificateName = null,
  certificateIssuedBy = null,
  sittingExperience = null,
  name = "This member",
  canEdit = false,
}: SittingStatsProps) {
  return (
    <div className="flex flex-col gap-3">
      {sittingExperience ? (
        <div className="text-md text-brown-2">
          {sittingExperience}
        </div>
      ) : canEdit ? (
        <EmptyState
          title="No sitting experience yet"
          text="Share the pets you have cared for so owners can get to know you."
          icon={<PawPrint size={24} aria-hidden="true" />}
          className="py-6"
        />
      ) : null}

      {/* New sitter*/}
      {completedSits === 0 ? (
        <div className="flex items-center gap-3 rounded-lg bg-sage-faint p-4">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-sage-soft text-olive-dark">
            <Sprout size={20} aria-hidden="true" />
          </span>
          <div className="flex flex-col">
            <strong className="font-semibold text-brown">New sitter</strong>
            <small className="text-xs text-gray-600">
              {canEdit
                ? "No sits completed yet. Ratings will show after the first sit."
                : `${name} is new to pet sitting on Avancado.`}
            </small>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* Rating */}
          <StatTile
            tone="butter"
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
            tone="sage"
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
            tone="sky"
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
        <div className="flex items-center gap-3 rounded-lg bg-ivory p-4">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-brown-2">
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
      ) : canEdit ? (
        <EmptyState
          title="No certificate yet"
          text="Add a certificate to show your sitting qualifications."
          icon={<Award size={24} aria-hidden="true" />}
          className="py-6"
        />
      ) : null}
    </div>
  );
}
