# Avancado – Team Setup Guide

Avancado is a community web app for pet owners in Vancouver. This guide gets you
from a fresh clone to a running app, and explains how we organize code and work
together in Git.

> The root `Readme.md` is the course's term-project guide. Do not edit it; put
> team documentation in `docs/`.

---

## 1. Tech stack

| Area           | Tool                                                  |
| -------------- | ----------------------------------------------------- |
| Framework      | Next.js 16 (App Router, `src/` directory), React 19   |
| Language       | TypeScript (strict mode)                              |
| Styling        | Tailwind CSS v4                                       |
| Auth & Storage | Supabase (`@supabase/supabase-js`, `@supabase/ssr`)   |
| Database       | PostgreSQL on Supabase (set up by the database owner) |
| Code quality   | ESLint (`eslint-config-next`) + Prettier              |
| Hosting        | Vercel                                                |

All services are used on their free tiers.

Other libraries (Prisma, Leaflet, Gemini, Resend, Recharts) are **not**
installed yet. Each owner adds their library in their own feature branch.

### Next.js 16 things to know

This version differs from most tutorials online:

- **`src/proxy.ts` replaces `middleware.ts`.** Next.js 16 renamed the file and
  its exported function. It works the same way. Ours refreshes the Supabase
  login session on every request.
- **Cache Components is on** (`cacheComponents: true` in `next.config.ts`).
  Any Server Component that reads request data (cookies, headers,
  `searchParams`, `params` in dynamic routes like `[postId]`, or the Supabase
  server client, which reads cookies) must be wrapped in `<Suspense>`, or the
  build fails with a "blocking route" error. The placeholder dynamic pages
  (e.g. `src/app/community/[postId]/page.tsx`) show the pattern. See
  `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md`.
- **Up-to-date Next.js docs ship inside the package** at
  `node_modules/next/dist/docs/`. `AGENTS.md` points AI coding assistants
  there; `next dev` regenerates that file, so leave it committed.

---

## 2. Local setup

### Prerequisites

- **Node.js 22 or newer** (`node -v` to check). The Supabase packages require
  it. If you use [nvm](https://github.com/nvm-sh/nvm), run `nvm install` then
  `nvm use` in the project folder; it reads the version from `.nvmrc`.
- **Git**
- Recommended editor extensions: **ESLint** and **Prettier** (enable
  "format on save").

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/Cornerstone-CICCC/m1-0126-wd301-wd-401-term-project-group-1.git
cd m1-0126-wd301-wd-401-term-project-group-1

# 2. Switch to the integration branch
git checkout dev

# 3. Install dependencies
npm install

# 4. Create your local env file from the template
cp .env.example .env.local
#    Then fill in the values (see "Environment variables" below)

# 5. Start the dev server
npm run dev
```

Open <http://localhost:3000>. You should see the "Avancado" home page, and
<http://localhost:3000/admin> should show the Admin placeholder.

The app runs even before `.env.local` is filled in: the session refresh in
`src/proxy.ts` is skipped until the Supabase values are set. Anything that
actually calls Supabase needs the real values.

### Environment variables

| Variable                        | Used for                                           | Who provides it     |
| ------------------------------- | -------------------------------------------------- | ------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL                               | Project setup owner |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Supabase key (anon or `sb_publishable_...`) | Project setup owner |
| `DATABASE_URL`                  | Pooled Postgres connection string (app runtime)    | Database owner      |
| `DIRECT_URL`                    | Direct Postgres connection string (migrations)     | Database owner      |

Rules:

- Real values go **only** in `.env.local` (git-ignored) and in Vercel's project
  settings. Never commit them, and never paste them into issues, PRs, or
  public channels.
- Anything prefixed `NEXT_PUBLIC_` is sent to the browser. **Never** put the
  Supabase `service_role` / secret key in a `NEXT_PUBLIC_` variable.
- If you add a new variable, add it to `.env.example` with an empty value and
  a comment, and tell the team.

### npm scripts

| Command                | What it does                                            |
| ---------------------- | ------------------------------------------------------- |
| `npm run dev`          | Start the dev server at `localhost:3000`                |
| `npm run build`        | Production build (same as Vercel runs)                  |
| `npm run start`        | Serve the production build locally                      |
| `npm run lint`         | Run ESLint on the whole project                         |
| `npm run typecheck`    | Generate route types, then run TypeScript type checking |
| `npm run format`       | Format every file with Prettier                         |
| `npm run format:check` | Check formatting without changing files                 |

---

## 3. Folder structure

```text
.
├── docs/                   Team documentation (this file)
├── public/                 Static files served as-is (images, icons)
├── src/
│   ├── app/                Routes (App Router). Each folder = a URL segment
│   │   ├── layout.tsx      Root layout (html/body, fonts, metadata)
│   │   ├── page.tsx        Home page  →  /
│   │   ├── globals.css     Tailwind import + global styles
│   │   ├── (auth)/         login/, signup/  →  /login, /signup
│   │   ├── community/      Community feed, posts
│   │   ├── sitter-board/   Sitter requests and applications
│   │   ├── profile/        Public profile and my profile (me/)
│   │   ├── my-pets/        Pets and health logs
│   │   ├── map/            Map and places
│   │   ├── messages/       Conversations
│   │   ├── notifications/  Notifications
│   │   └── admin/          Admin dashboard and moderation pages
│   ├── components/
│   │   ├── ui/             Small reusable UI pieces (Button, Input, Card, Modal)
│   │   ├── layout/         App-wide layout pieces (Header, Footer, Nav, Sidebar)
│   │   └── <feature>/      Components for one feature: auth/, community/,
│   │                       sitter-board/, profile/, my-pets/, messages/,
│   │                       notifications/, map/, admin/, report/
│   ├── hooks/              Custom React hooks (useSomething), client-side only
│   ├── lib/                Non-UI code: service clients, helpers, data functions
│   │   └── supabase/
│   │       ├── client.ts   Supabase client for Client Components (browser)
│   │       ├── server.ts   Supabase client for Server Components, Route Handlers, Server Actions
│   │       └── proxy.ts    Session refresh logic used by src/proxy.ts
│   ├── types/              Shared TypeScript types
│   └── proxy.ts            Runs before each request; refreshes the Supabase session
├── .env.example            Env var template (copy to .env.local)
└── .github/
    └── pull_request_template.md
```

Import from `src/` with the `@/` alias, e.g. `import { createClient } from "@/lib/supabase/server";`.

### Where should my code go?

| You are building…                                     | Put it in                                                   |
| ----------------------------------------------------- | ----------------------------------------------------------- |
| A new page / URL                                      | `src/app/<route>/page.tsx`                                  |
| Pages that share a layout but not a URL prefix        | A route group, e.g. `src/app/(auth)/login/page.tsx`         |
| Components for one feature                            | `src/components/<feature>/`, e.g. `src/components/my-pets/` |
| Components reused across features                     | `src/components/ui/` (generic) or `src/components/layout/`  |
| Server Actions (form submits, mutations)              | `src/app/<route>/actions.ts`                                |
| API endpoints (webhooks, external callers)            | `src/app/api/<name>/route.ts`                               |
| A wrapper for a third-party service (maps, AI, email) | `src/lib/<service>/`                                        |
| Shared helper functions                               | `src/lib/`                                                  |
| Custom hooks                                          | `src/hooks/useSomething.ts`                                 |
| Shared types                                          | `src/types/`                                                |
| Images and icons                                      | `public/`                                                   |
| Database schema, migrations, DB client                | Owned by the database owner, who will document the location |

Folders in parentheses (like `(auth)`) group routes without adding to the URL,
so `src/app/(auth)/login/page.tsx` is served at `/login`. Folders in square
brackets (like `[postId]`) are dynamic segments.

### Using Supabase

```tsx
// Server Component, Route Handler, or Server Action
import { createClient } from "@/lib/supabase/server";

const supabase = await createClient();
const { data } = await supabase.auth.getClaims();
```

```tsx
// Client Component
"use client";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
```

- To check who is signed in on the server, use `supabase.auth.getClaims()`.
  Do **not** trust `getSession()` on the server: it reads the cookie without
  verifying it.
- Create a new server client in each function. Never store one in a
  module-level variable.
- Remember the Cache Components rule above: wrap Server Components that use
  the server client in `<Suspense>`.

---

## 4. Folder ownership

Who works on which route and component folder follows the assignments on our
Notion task board.

- Build your features inside the folders you own.
- Each placeholder `page.tsx` starts with a `// Notion flow:` comment naming
  the Notion task it belongs to. Remove the `// TODO: implement` line once the
  page is built.
- Before changing a folder someone else owns, ask them first and add them as a
  reviewer on your PR.

---

## 5. Git workflow

### Branches

| Branch           | Purpose                                                          |
| ---------------- | ---------------------------------------------------------------- |
| `main`           | Stable, production-ready code. Deployed to production on Vercel. |
| `dev`            | Integration branch. All feature work is merged here first.       |
| `feature/<name>` | New features, branched from `dev` (e.g. `feature/pet-profile`)   |
| `fix/<name>`     | Bug fixes, branched from `dev` (e.g. `fix/login-redirect`)       |

Use short, lowercase, hyphenated names.

### Day-to-day flow

```bash
# 1. Start from the latest dev
git checkout dev
git pull origin dev

# 2. Create your branch
git checkout -b feature/pet-profile

# 3. Work, then commit in small steps
git add .
git commit -m "feat: add pet profile form"

# 4. Keep your branch up to date with dev (do this often)
git pull origin dev

# 5. Before pushing, make sure these pass
npm run lint
npm run typecheck
npm run format:check
npm run build

# 6. Push and open a Pull Request into dev
git push -u origin feature/pet-profile
```

### Rules

- **Never push directly to `main` or `dev`.** Every change goes through a Pull
  Request.
- Open PRs **into `dev`** and fill in the PR template.
- Every PR needs **at least 1 approving review** from another team member
  before merging.
- **Merge feature branches into `dev` often**, every 1–3 days. Small PRs are
  easier to review and cause fewer conflicts than one big PR at the end.
- **`dev` is merged into `main` once a week** after checking that `dev`
  builds and works.
- Delete your branch after it is merged.

### Commit messages

Start every commit message with a type, a colon, and a short description in
the present tense:

| Prefix   | Use for                              | Example                                    |
| -------- | ------------------------------------ | ------------------------------------------ |
| `feat:`  | A new feature                        | `feat: add pet photo upload`               |
| `fix:`   | A bug fix                            | `fix: redirect to login when session ends` |
| `chore:` | Setup, config, dependencies, tooling | `chore: add prettier config`               |
| `docs:`  | Documentation only                   | `docs: update setup guide`                 |

Keep the first line under about 72 characters. Add more detail in the commit
body if needed.
