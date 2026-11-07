export const SITTER_REPORT_REASONS = [
  "Spam",
  "Inappropriate content",
  "Misleading or fake request",
  "Harassment",
] as const;

export type SitterReportReason = (typeof SITTER_REPORT_REASONS)[number];

export function isSitterReportReason(
  value: string,
): value is SitterReportReason {
  return (SITTER_REPORT_REASONS as readonly string[]).includes(value);
}
