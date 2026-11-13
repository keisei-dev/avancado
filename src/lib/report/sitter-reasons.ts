export const SITTER_REPORT_REASONS = [
  {
    key: "Inappropriate content",
    description: "Offensive, hateful, or explicit content",
  },
  {
    key: "Spam",
    description: "Repeated, irrelevant, or misleading posts",
  },
  {
    key: "Scam or fraud",
    description: "Asks for payment or personal details",
  },
  {
    key: "Pet welfare concern",
    description: "The request suggests a pet may be at risk",
  },
  {
    key: "Other",
    description: "Something else that violates our community guidelines",
  },
] as const;

export type SitterReportReason = (typeof SITTER_REPORT_REASONS)[number]["key"];

export const DEFAULT_SITTER_REPORT_REASON: SitterReportReason =
  SITTER_REPORT_REASONS[0].key;

export function isSitterReportReason(
  value: string,
): value is SitterReportReason {
  return SITTER_REPORT_REASONS.some((reason) => reason.key === value);
}
