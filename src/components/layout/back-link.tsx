// UI library (P2): BackLink
// TODO: implement. See docs/UI-LIBRARY.md for conventions.
/**
 * "← Back to …" link at the top of detail pages.
 */

import { ArrowLeft } from "lucide-react";

export function BackLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="inline-flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
    >
      <ArrowLeft className="h-4 w-4" />
      {children}
    </a>
  );
}
