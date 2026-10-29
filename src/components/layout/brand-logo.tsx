// UI library (P2): BrandLogo
// TODO: implement. See docs/UI-LIBRARY.md for conventions.
/**
 * Avocado mark + "Avancado". Light and dark.
 * Admin already has components/admin/brand-mark.tsx; agree with the admin
 * owner to move it here and import it from both places.
 */

import { BrandMark } from "@/components/admin/brand-mark";

const BrandLogo = () => {
  return (
    <div className="flex items-center gap-2">
      <BrandMark />
      <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
        Avancado
      </span>
    </div>
  );
};

export { BrandLogo };
