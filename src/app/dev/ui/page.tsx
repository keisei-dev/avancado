// UI library preview: every shared component and its states, in one page.
// Add a section here each time a component in components/ui or
// components/layout is built, so reviewers can check it in the browser.
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UI library",
  robots: { index: false },
};

const COLORS = [
  ["olive", "bg-olive", "Primary buttons, active states"],
  ["olive-hover", "bg-olive-hover", "Hover, green text"],
  ["olive-soft", "bg-olive-soft", "Decorative only"],
  ["sage", "bg-sage", "Selected borders"],
  ["sage-soft", "bg-sage-soft", "Subtle backgrounds"],
  ["sage-faint", "bg-sage-faint", "Lightest wash"],
  ["brown", "bg-brown", "Headings, body text"],
  ["brown-2", "bg-brown-2", "Secondary text"],
  ["muted", "bg-muted", "Hints, meta text"],
  ["ivory", "bg-ivory", "Page background"],
  ["cream", "bg-cream", "Tab tracks, chips"],
  ["line", "bg-line", "Borders"],
  ["amber", "bg-amber", "Unread, sponsored"],
  ["amber-soft", "bg-amber-soft", "Warning background"],
  ["peach", "bg-peach", "Likes, paws"],
  ["sky", "bg-sky", "Info"],
  ["lavender", "bg-lavender", "Category tags"],
  ["star", "bg-star", "Rating stars"],
  ["success", "bg-success", "Done, verified, found"],
  ["coral", "bg-coral", "Errors, delete, lost"],
] as const;

const COMPONENTS: { level: string; items: string[] }[] = [
  {
    level: "P1 — Foundations",
    items: ["Button", "Field / Input", "Modal", "Badge / Tag", "Avatar"],
  },
  {
    level: "P2 — Shell & navigation",
    items: [
      "BrandLogo",
      "SideNav",
      "TopBar",
      "MobileTabBar",
      "AccountMenu",
      "NotificationsMenu",
      "Tabs / SegmentedControl",
      "FilterChips",
      "SearchField",
      "Menu",
      "BackLink",
      "Toast",
      "EmptyState",
    ],
  },
  {
    level: "P3 — Shared building blocks",
    items: ["StarRating", "PhotoUpload", "Switch / ChoicePills", "Notice"],
  },
];

export default function UiLibraryPage() {
  return (
    <main className="font-admin mx-auto w-full max-w-5xl flex-1 bg-ivory px-4 py-10 text-brown sm:px-8">
      <h1 className="font-display text-3xl font-bold tracking-tight">
        UI library
      </h1>
      <p className="mt-2 text-muted">
        Shared components for Avancado. Conventions: docs/UI-LIBRARY.md
      </p>

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold">Colours</h2>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {COLORS.map(([name, swatch, use]) => (
            <li
              key={name}
              className="rounded-16 border border-line bg-white p-3 shadow-card"
            >
              <span className={`block h-12 rounded-10 ${swatch}`} />
              <p className="mt-2 text-sm font-semibold">{name}</p>
              <p className="text-xs text-muted">{use}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold">Components</h2>
        {COMPONENTS.map((group) => (
          <div key={group.level} className="mt-4">
            <h3 className="text-sm font-semibold text-muted">{group.level}</h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-line bg-white px-3 py-1 text-sm"
                >
                  {item} <span className="text-muted">· to do</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </main>
  );
}
