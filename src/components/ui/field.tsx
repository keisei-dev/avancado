// UI library (P1): Field, Input, Textarea, Select
// TODO: implement. See docs/UI-LIBRARY.md for conventions.

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type FieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
  name?: string; // Added name prop to FieldProps
};

export function Field({
  id,
  label,
  hint,
  error,
  required,
  className,
  children,
  name, // Destructure name prop
}: FieldProps) {
  const description = error || hint;
  const descriptionId = `${id}-description`;

  return (
    <div className={cn("w-full", className)}>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-brown"
      >
        {label}
        {required && (
          <span className="ml-1 text-coral" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {children}

      {description && (
        <p
          id={descriptionId}
          role={error ? "alert" : undefined}
          className={cn("mt-1.5 text-xs", error ? "text-coral" : "text-muted")}
        >
          {description}
        </p>
      )}
    </div>
  );
}
