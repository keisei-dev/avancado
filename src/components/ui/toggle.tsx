"use client";

// UI library (P3): Switch, ChoicePills
/**
 * Switch: on/off row for settings, e.g. "New messages".
 * ChoicePills: pick one option, e.g. Dog / Cat.
 */

import { useState } from "react";

// ----------------------------------------
// Switch
// ----------------------------------------

export type SwitchProps = {
  label: string;
  hint?: string;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
};

export function Switch({
  label,
  hint,
  defaultChecked = false,
  onChange,
}: SwitchProps) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-3.5">
      <span>
        <span className="block text-sm font-semibold text-brown">{label}</span>
        {hint && <span className="block text-[13px] text-muted">{hint}</span>}
      </span>

      {/* The real checkbox is hidden. The track and knob below show its state. */}
      <input
        type="checkbox"
        defaultChecked={defaultChecked}
        onChange={(event) => onChange?.(event.target.checked)}
        className="peer sr-only"
      />
      <span className="relative h-[26px] w-11 shrink-0 rounded-full bg-line-strong transition-colors peer-checked:bg-olive peer-focus-visible:shadow-focus after:absolute after:top-[3px] after:left-[3px] after:size-5 after:rounded-full after:bg-white after:shadow-admin after:transition-transform peer-checked:after:translate-x-[18px]" />
    </label>
  );
}

// ----------------------------------------
// ChoicePills
// ----------------------------------------

export type ChoicePillsProps = {
  label: string; // read by screen readers, e.g. "Species"
  options: string[];
  defaultValue?: string;
  onChange?: (value: string) => void;
};

export function ChoicePills({
  label,
  options,
  defaultValue,
  onChange,
}: ChoicePillsProps) {
  const [selected, setSelected] = useState(defaultValue ?? options[0]);

  function choose(option: string) {
    setSelected(option);
    onChange?.(option);
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex gap-1 rounded-full bg-cream p-1"
    >
      {options.map((option) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={selected === option}
          onClick={() => choose(option)}
          className={
            selected === option
              ? "min-h-[34px] rounded-full bg-white px-[18px] text-sm font-semibold text-brown shadow-admin"
              : "min-h-[34px] rounded-full px-[18px] text-sm font-semibold text-brown-2 hover:text-brown"
          }
        >
          {option}
        </button>
      ))}
    </div>
  );
}
