// UI library (P2): Menu (dropdown and ⋯ overflow menu)
// TODO: implement. See docs/UI-LIBRARY.md for conventions.
/**
 * Opens from a trigger button; items with icons; danger item style.
 * Closes on outside click and Escape. Needs "use client".
 */

"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

export type MenuItem = {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  href?: string;
  isDanger?: boolean;
};

export type MenuProps = {
  trigger: ReactNode;
  items: MenuItem[];
};

export function Menu({ trigger, items }: MenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={menuRef}
      className="relative inline-block"
      onClick={() => setOpen((current) => !current)}
    >
      {trigger}

      {open && (
        <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-12 border border-line bg-white p-2 shadow-lg">
          <ul className="py-1" onClick={(event) => event.stopPropagation()}>
            {items.map((item, index) => (
              <li key={index}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className={`flex w-full items-center px-4 py-2 text-sm rounded-10 ${
                      item.isDanger ? "text-coral" : "text-brown"
                    } hover:bg-ivory`}
                  >
                    {item.icon && (
                      <span className="mr-2 flex items-center [&_svg]:size-4">
                        {item.icon}
                      </span>
                    )}
                    {item.label}
                  </Link>
                ) : (
                  <button
                    onClick={item.onClick}
                    type="button"
                    className={`flex w-full items-center text-left px-4 py-2 text-sm rounded-10 ${
                      item.isDanger ? "text-coral" : "text-brown"
                    } hover:bg-ivory`}
                  >
                    {item.icon && (
                      <span className="mr-2 flex items-center [&_svg]:size-4">
                        {item.icon}
                      </span>
                    )}
                    {item.label}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
