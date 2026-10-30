// UI library (P2): Tabs, SegmentedControl
// TODO: implement. See docs/UI-LIBRARY.md for conventions.
/**
 * SegmentedControl: pill track (e.g. Applied / Matched / Done).
 * Tabs: underline style (profile, settings).
 * Use role="tablist" / "tab" and arrow-key support. Needs "use client".
 */

"use client";

type TabsProps = {
  /** The currently selected tab. */
  value: string;
  /** Called when a tab is clicked. */
  onChange: (value: string) => void;
  /** The tabs to show. */
  tabs: { value: string; label: string }[];
};

export function Tabs({ value, onChange, tabs }: TabsProps) {
  return (
    <div role="tablist" className="flex gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          role="tab"
          aria-selected={value === tab.value}
          className={`px-3 py-1 rounded ${
            value === tab.value ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

