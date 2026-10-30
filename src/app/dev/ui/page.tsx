// UI library preview: every shared component and its states, in one page.
// Add a section here each time a component in components/ui or
// components/layout is built, so reviewers can check it in the browser.
import type { Metadata } from "next";
import { Plus, Search, Trash2 } from "lucide-react";
import { Button, IconButton } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { SearchField } from "@/components/ui/search-field";
import { TopBar } from "@/components/layout/top-bar";
import {Field} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/text-area";
import { ModalDemo } from "./modal-demo";
import {Badge} from "@/components/ui/badge";
import {Tabs} from "@/components/ui/tabs";


import { ShieldCheck } from 'lucide-react'; // vaccinated icon


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

const DONE = new Set([
  "Button",
  "Avatar",
  "BrandLogo",
  "SideNav",
  "TopBar",
  "MobileTabBar",
  "AccountMenu",
  "SearchField",
  "Field / Input",
  "Modal",
  "Badge / Tag",
]);

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
        <h2 className="font-display text-xl font-bold">Button</h2>
        <div className="mt-4 space-y-4 rounded-16 border border-line bg-white p-6 shadow-card">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="text">Text button</Button>
            <Button variant="danger">
              <Trash2 className="size-4" aria-hidden="true" /> Delete
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="sm" variant="secondary">
              Small secondary
            </Button>
            <Button>
              <Plus className="size-4" aria-hidden="true" /> With icon
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button disabled>Disabled</Button>
            <Button loading>Saving…</Button>
            <Button variant="secondary" loading>
              Loading
            </Button>
            <IconButton aria-label="Search">
              <Search className="size-[18px]" aria-hidden="true" />
            </IconButton>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold">Top bar</h2>
        <p className="mt-1 text-sm text-muted">
          Guest and signed in. Open the avatar to see the account menu. The logo
          only shows on phones.
        </p>
        <div className="mt-4 grid gap-4">
          <div className="rounded-16 border border-line">
            <TopBar user={null} />
          </div>
          <div className="relative z-10 rounded-16 border border-line pb-64">
            <TopBar
              user={{
                name: "Maya Thompson",
                email: "maya@avancado.ca",
                verified: true,
              }}
              unreadMessages={3}
              unreadNotifications={12}
            />
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold">Search field</h2>
        <p className="mt-1 text-sm text-muted">
          Type to see the clear (×) button. Escape also clears.
        </p>
        <div className="mt-4 grid gap-4 rounded-16 border border-line bg-white p-6 shadow-card sm:grid-cols-2">
          <SearchField label="Search places" placeholder="Search places..." />
          <SearchField
            label="Search posts"
            placeholder="Search posts..."
            defaultValue="Golden retriever"
          />
          <SearchField
            label="Search members"
            placeholder="Small (sm)"
            size="sm"
          />
          <SearchField
            label="Search disabled"
            placeholder="Disabled"
            disabled
          />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold">Field / Input / Textarea</h2>
        <p className="mt-1 text-sm text-muted">
          Standard single-line input and multi-line textarea. Supports controlled and uncontrolled usage. States: default, focus, error, disabled.
        </p>
        <div className="mt-4 grid gap-4 rounded-16 border border-line bg-white p-6 shadow-card sm:grid-cols-2">
          <Field id="name" label="Name" required>
            <Input id="name" placeholder="Enter your name" />
          </Field>
          <Field id="email" label="Email" hint="We'll never share your email.">
            <Input id="email" type="email" placeholder="Enter your email" />
          </Field>
          <Field id="message" label="Message" required>
            <Textarea id="message" placeholder="Enter your message" rows={4} />
          </Field>
          <Field id="disabled" label="Disabled Field">
            <Input id="disabled" placeholder="Disabled input" disabled />
          </Field>
          <Field id="error" label="Error Field" error="Please enter a valid value.">
            <Input id="error" placeholder="Error input" error />
          </Field>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold">Avatar</h2>
        <div className="mt-4 flex items-center gap-4 rounded-16 border border-line bg-white p-6 shadow-card">
          <Avatar name="Maya Thompson" size="sm" />
          <Avatar name="Daniel Kim" />
          <Avatar name="Ava Brooks" size="lg" verified />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold">Modal</h2>
        <div className="mt-4 rounded-16 border border-line bg-white p-6 shadow-card">
          <ModalDemo />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold">Badges</h2>
        <div className="mt-4 flex items-center gap-4 rounded-16 border border-line bg-white p-6 shadow-card">
          <Badge tone="default" icon={<span><ShieldCheck /></span>}>
            Default
          </Badge>
          <Badge tone="green" icon={<span><ShieldCheck /></span>}>
            Green
          </Badge>
          <Badge tone="amber" icon={<span><ShieldCheck /></span>}>
            Amber
          </Badge>
          <Badge tone="slate" icon={<span><ShieldCheck /></span>}>
            Slate
          </Badge>
          <Badge tone="red" icon={<span><ShieldCheck /></span>}>
            Red
          </Badge>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold">Tabs --- in process</h2>
        <div className="mt-4 rounded-16 border border-line bg-white p-6 shadow-card">
          <Tabs
            tabs={[
              { label: "Tab 1", content: "Content for Tab 1" },
              { label: "Tab 2", content: "Content for Tab 2" },
              { label: "Tab 3", content: "Content for Tab 3" },
            ]}
          />
        </div>
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
                  {item}{" "}
                  <span
                    className={DONE.has(item) ? "text-success" : "text-muted"}
                  >
                    · {DONE.has(item) ? "done" : "to do"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </main>
  );
}
