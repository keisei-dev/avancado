export const PLACE_REPORT_REASONS = [
  { label: "No longer pet-friendly", description: "Pets are not welcome here anymore" },
  { label: "Permanently closed", description: "This place has closed or moved" },
  { label: "Wrong details", description: "The address, hours, or category is incorrect" },
  { label: "Inappropriate photo", description: "The photo is offensive or misleading" },
  { label: "Other", description: "Something else is wrong with this listing" },
] as const;

export type PlaceReportReason = (typeof PLACE_REPORT_REASONS)[number]["label"];

export function isPlaceReportReason(value: string): value is PlaceReportReason {
  return PLACE_REPORT_REASONS.some((reason) => reason.label === value);
}
