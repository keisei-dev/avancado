# UI library

Shared components for Avancado. Everyone builds their feature screens from these pieces instead of styling buttons, inputs and modals again.

- **Preview:** run `npm run dev` and open <http://localhost:3000/dev/ui>
- **Owner:** the UI library owner (branch `feature/ui-library`). Ask before changing a file in `components/ui/` or `components/layout/`, and add them as a reviewer.

## Where a component goes

| Folder                      | What goes there                                                         | Examples                                                   |
| --------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------- |
| `src/components/ui/`        | Generic pieces. Props only, no Avancado data, no Supabase               | Button, Field, Modal, Badge, Avatar, Tabs                  |
| `src/components/layout/`    | The app frame                                                           | SideNav, TopBar, MobileTabBar, AccountMenu                 |
| `src/components/report/`    | Report dialog (used by several features)                                | ReportModal                                                |
| `src/components/<feature>/` | Uses one feature's data. Other pages import it from here, never copy it | `community/post-card.tsx`, `sitter-board/request-card.tsx` |

If a feature component starts being needed by a second feature and has no feature data, move it to `ui/`.

## Conventions

- **File names:** kebab-case, one main component per file: `ui/search-field.tsx`.
- **Exports:** named exports with a `<Name>Props` type: `export function Button(props: ButtonProps)`.
- **Imports:** import each file directly, `import { Button } from "@/components/ui/button"`. There's no `index.ts`, so client code stays out of server pages.
- **Styling:** use Tailwind classes built from the theme tokens in `src/app/globals.css` (`bg-olive`, `text-muted`, `rounded-16`, `shadow-card`). Don't hard-code hex colours in components.
- **Variants:** use a small object map, not an extra library:

  ```tsx
  const VARIANTS = {
    primary: "bg-olive text-white hover:bg-olive-hover",
    secondary: "border border-line bg-white text-brown hover:border-beige",
  } as const;
  ```

- **Joining classes:** `cn()` from `@/lib/cn` skips empty values: `cn(base, VARIANTS[variant], className)`.
- **Pass-through:** accept `className` and the element's normal props (`...props`) so features can adjust spacing.
- **Client components:** add `"use client"` only to interactive pieces (Modal, Tabs, Menu, Toast, PhotoUpload). Button, Badge, Avatar and Field stay server-safe.
- **Icons:** `lucide-react`, 16–20px, `aria-hidden="true"` when next to text.
- **Accessibility:** visible focus (`shadow-focus`), labels on every input, `aria-label` on icon-only buttons, text contrast that passes WCAG AA.

## Design tokens

Defined in `@theme` in `src/app/globals.css`.

- **Colours:** olive, sage, brown, muted, ivory, cream, line, amber (butter), peach, sky, lavender, star, success and coral, with `-soft` and `-ink` partners.
- **Radius:** `rounded-10`, `-12`, `-16`, `-20`, and `rounded-full` for pills.
- **Shadows:** `shadow-card`, `shadow-raised`, `shadow-overlay` and `shadow-focus`. They have their own names so Tailwind's `shadow-sm`, `shadow-md` and `shadow-lg`, already used in the codebase, keep working.
- **Fonts:** `font-display` (Plus Jakarta Sans) for headings and `font-admin` (Inter) for interface text. The `body` font in `globals.css` is still the starter Arial; switching it to Inter is a team decision.

## Build order

The full list is in the design hand-off (COMPONENTS.md). In short:

1. **P1:** Button, Field, Modal, Badge, Avatar
2. **P2:** layout (SideNav, TopBar, MobileTabBar, menus, BrandLogo), plus Tabs, FilterChips, SearchField, Menu, BackLink, Toast, EmptyState
3. **P3:** StarRating, PhotoUpload, Switch / ChoicePills, Notice

Each component is "done" when it has all its states (hover, focus, disabled, error, empty), works on phone and desktop, uses only tokens, and has a section on `/dev/ui`.
