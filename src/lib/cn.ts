/**
 * Joins class names and skips empty values.
 * Example: cn("rounded-16", isActive && "bg-olive", className)
 */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
