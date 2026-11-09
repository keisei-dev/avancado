# Database Guide

How our database works and how to use it. Read this before you write any code
that touches data. For general setup (Node, Git, branches), see
[SETUP.md](./SETUP.md).

If something here is wrong or unclear, ask the database owner.

---

## 1. Overview

| Item                | Value                                                              |
| ------------------- | ------------------------------------------------------------------ |
| Database            | PostgreSQL on Supabase (one shared database for the whole team)    |
| ORM                 | Prisma 7 (stable, **not** the Prisma 8 release candidate)          |
| Schema (source)     | `prisma/schema.prisma`: 16 enums and 24 tables                     |
| Migrations          | `prisma/migrations/` (committed to Git)                            |
| Prisma CLI config   | `prisma7.config.ts` (loads `.env.local`, uses `DIRECT_URL`)        |
| Generated client    | `src/generated/prisma` (**git-ignored**, created by `npm install`) |
| Client you import   | `src/lib/prisma/client.ts`                                         |
| Data model overview | Scope document, section 11 (ERD and table list)                    |
| Seed scripts        | `prisma/seed/` (`npm run db:seed`, `npm run db:seed:demo`)         |

Supabase Auth owns passwords and logins. Our `User` table only stores profile
data, and `User.id` is the same value as the Supabase Auth user id.

---

## 2. Environment variables

Put real values only in `.env.local` (never commit it, never paste it in chat,
issues, or PRs). The same variables must be set in Vercel's project settings.

| Variable                        | Used for                                                            |
| ------------------------------- | ------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL (Auth and Storage)                             |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public key (`sb_publishable_...`)                          |
| `DATABASE_URL`                  | Transaction pooler, port **6543**. The app uses it at runtime.      |
| `DIRECT_URL`                    | Session pooler, port **5432**. Prisma migrations use it (CLI only). |
| `SEED_MAYA_AUTH_ID`             | Only for running the demo seed: Supabase Auth user id of Maya       |
| `SEED_ADMIN_AUTH_ID`            | Only for running the demo seed: Supabase Auth user id of the admin  |

The database password must **not** contain `/ ? @ # :` or other special
characters. They break the connection string. Use letters and numbers only.

---

## 3. First-time setup (every teammate)

```bash
git checkout dev
git pull origin dev
npm install        # also runs `prisma generate` (postinstall)
```

`npm install` creates the Prisma client in `src/generated/prisma`. That folder is
not in Git, so run `npm install` again after every `git pull` that changes
`prisma/schema.prisma`.

---

## 4. Using the database in code

```ts
import { prisma } from "@/lib/prisma/client";

const pets = await prisma.pet.findMany({ where: { ownerId: user.id } });
```

Rules:

- **Server only.** Use Prisma in Server Components, Server Actions, and Route
  Handlers. `src/lib/prisma/client.ts` imports `server-only`, so importing it
  from a Client Component fails on purpose.
- **Wrap in `<Suspense>`.** Cache Components is on, so a Server Component that
  reads the database must be wrapped in `<Suspense>` (see SETUP.md).
- **Do not query tables with `supabase-js`.** Row Level Security is on for every
  table and there are no policies, so `supabase.from("Pet").select()` returns an
  empty result without any error. Use `supabase-js` only for Auth and Storage.
- Use the logged-in user's id from `supabase.auth.getClaims()` (see SETUP.md).
  Never trust a user id sent from the browser.

---

## 4.1 Things that are different from a normal table

| Topic                     | What to know                                                                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `Pet.birthDate`           | Optional date. Age is **calculated** from it, never stored.                                                                    |
| `Pet.species`             | Enum: `DOG` or `CAT`.                                                                                                          |
| `SittingReport.summary`   | `String[]`. An **empty array means "not generated yet"** (Prisma lists cannot be NULL).                                        |
| `CommunityPost.likeCount` | A copy of the number of `PostLike` rows. Change it **in the same `prisma.$transaction`** as every `PostLike` insert or delete. |
| `Place.location`          | PostGIS point. Prisma cannot write it, so `prisma.place.create()` does not work. Use raw SQL (example below).                  |
| `updatedAt` columns       | Set by Prisma, not by the database. Raw SQL inserts must set `"updatedAt"` themselves (use `now()`).                           |
| Soft delete               | Prefer `HIDDEN` / `CANCELLED` statuses over deleting rows.                                                                     |
| `AdminActionLog`          | Every admin moderation or verification decision must write one row.                                                            |
| IDs                       | Rows get a UUID from the database (`gen_random_uuid()`). Only `User.id` has no default: pass the Supabase Auth user id.        |
| `User.careSpecies`        | `Species[]`. An **empty array means "not set"**. Search with `has: "CAT"`.                                                     |
| Sitting experience        | **Not stored.** Count `SitterApply` rows that are `ACCEPTED` on `DONE` requests, and average the reviews received as a sitter. |

Example: creating a `Place` with raw SQL (an example, test it when you build it):

```ts
await prisma.$executeRaw`
  INSERT INTO "Place" ("categoryId", "name", "address", "latitude", "longitude", "location", "updatedAt")
  VALUES (${categoryId}::uuid, ${name}, ${address}, ${lat}, ${lng},
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, now())
`;
```

---

## 5. Rules enforced by the database

Prisma cannot express these, so they are written as SQL in the first migration.
If you break one, the database rejects the write.

| Table          | Rule                                                                         |
| -------------- | ---------------------------------------------------------------------------- |
| `SitterApply`  | One application per sitter per request; at most one `ACCEPTED` per request   |
| `Review`       | `rating` is 1 to 5; one review per reviewer per request                      |
| `Report`       | Exactly one target column (post, request, review, place, user) is filled     |
| `Conversation` | Exactly one of `sitterRequestId` / `postId` is filled; one thread per person |
| `PostLike`     | One like per user per post (composite primary key)                           |
| `Place`        | GiST index on `location` for nearby search                                   |

Rules enforced in code (not by the database) are listed in the scope document,
section 11 (for example: request status flow, "an owner cannot apply to their own
request", reviews only after `DONE`).

---

## 6. Row Level Security (RLS)

- RLS is **enabled on all tables**, with **no policies**.
- Supabase exposes tables in the `public` schema through a REST API that works
  with the public key. With RLS on and no policies, that API cannot read or write
  our tables. This protects data such as phone numbers and ID verification info.
- Prisma connects as the `postgres` role, which is not blocked by RLS.
- **Every new table must enable RLS in the same migration:**

```sql
ALTER TABLE "NewTable" ENABLE ROW LEVEL SECURITY;
```

- If we ever need live updates (for example Supabase Realtime for Messages), we
  will add a specific policy for that table. Ask the database owner first.

---

## 7. Changing the schema (migrations)

There is only **one shared database**, so a migration changes it for everyone.
**Tell the database owner before you change the schema.**

1. Create a branch from `dev` (for example `feature/add-species-index`).
2. Edit `prisma/schema.prisma`.
3. Run `npx prisma format` and `npx prisma validate`.
4. Create the migration **without applying it**:

   ```bash
   npx prisma migrate dev --create-only --name short_description
   ```

5. Open the new `prisma/migrations/<date>_short_description/migration.sql` and
   check it. Add anything Prisma cannot express (constraints, extra indexes) and
   `ENABLE ROW LEVEL SECURITY` for every new table.
6. Apply it: `npx prisma migrate dev`.
7. Run `npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script`.
   It must say `This is an empty migration`.
8. Commit `prisma/schema.prisma` **and** `prisma/migrations/`, then open a PR into
   `dev`.

After the PR is merged, teammates run `git pull origin dev` and `npm install`.

**Never:**

- run `npx prisma migrate reset` (it deletes all data in the shared database),
- run `npx prisma db push` (it changes tables without a migration file),
- edit or delete a migration that was already applied (add a new migration
  instead),
- type a migration name if `migrate dev` asks for one when you did not change the
  schema. Press `Ctrl + C` and run the `migrate diff` command above to see why.

---

## 8. Seed data

| Command                               | What it does                                                                  |
| ------------------------------------- | ----------------------------------------------------------------------------- |
| `npm run db:seed`                     | Essential data only (the 7 place categories). Safe for any environment.       |
| `npm run db:seed:demo`                | Sample data for development (includes `db:seed`).                             |
| `npm run db:seed:demo:clear -- --yes` | Removes all demo data. Without `--yes` it only explains what it would delete. |

The demo data is **already in the shared database**. Teammates do not need to
run these commands. Only the database owner runs them. Ask before you do.

All seed commands are safe to run again: rows have stable ids (made by
`seedUuid()`), so a second run updates the same rows instead of creating
duplicates. Dates in the demo data are relative to the day you run the seed
("today +/- N days").

### What is in the demo data

12 users, 10 approved ID verifications, 7 pets (health logs for Sunny and Luna),
22 sitter requests (8 current + 14 completed sittings in the past) with 31
applications and 18 reviews, 5 community posts with 20 likes, 8 map places,
4 chats with 9 messages, 3 reports and 3 notifications.

### Demo accounts

All demo emails end with `@seed.avancado.test`.

| User                      | Email                       | Can log in?                              |
| ------------------------- | --------------------------- | ---------------------------------------- |
| Maya                      | `maya@seed.avancado.test`   | Yes (Supabase Auth). Member with 2 pets. |
| Admin                     | `admin@seed.avancado.test`  | Yes (Supabase Auth). Role `ADMIN`.       |
| Others (Daniel, Ava, ...) | `<name>@seed.avancado.test` | No. They only exist in the database.     |

Passwords are **not** in the repository. Ask the database owner.

### What is not seeded

Some data from the UI prototype does not fit our schema yet, so it is left out:
reviews of map places, user bio and location, `Pet.isVaccinated`, the
"Sponsored" flag on places, and the pet name and location of community posts.
The Services place category has no demo place. If you need one of these,
tell the database owner and we will decide on a schema change.

### Adding more demo data

1. Add or edit a file in `prisma/seed/demo/` and call it from `index.ts`.
   Keep the order: a row can only point to rows that already exist.
2. Use `seedUuid("kind:name")` for ids and `dateOnly()` / `dateTime()` for dates.
3. New tables that belong to a user must be removed in `clear.ts` as well.
4. Write to Prisma Client only. For `Place` use raw SQL (see section 4.1).

### Before launch

1. Run `npm run db:seed:demo:clear -- --yes`.
2. Delete the two demo users in Supabase > Authentication > Users.
3. Keep `npm run db:seed` data (place categories).

## 9. Troubleshooting

| Problem                                                      | Likely cause and fix                                                                                          |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `Cannot find module '@/generated/prisma/client'`             | The client was not generated. Run `npm install` (or `npx prisma generate`).                                   |
| `DATABASE_URL is not set`                                    | `.env.local` is missing or incomplete. Ask the database owner for the values.                                 |
| `P1001: Can't reach database server` and a strange host name | The password contains special characters. Use a letters-and-numbers password.                                 |
| `migrate dev` fails with a `DIRECT_URL` / placeholder host   | `DIRECT_URL` is missing from `.env.local`.                                                                    |
| A query returns an empty list but the table has rows         | You are using `supabase-js` on a table (blocked by RLS). Use Prisma on the server.                            |
| `P3006` / a migration fails on the "shadow database"         | The migration SQL refers to something that does not exist yet in a fresh database. Fix the SQL order.         |
| `SEED_MAYA_AUTH_ID is missing or is not a UUID`              | Add the "User UID" of the demo user from Supabase > Authentication > Users to `.env.local`.                   |
| `function st_setsrid(...) does not exist` while seeding      | PostGIS functions live in the `extensions` schema. Use `extensions.ST_SetSRID(extensions.ST_MakePoint(...))`. |
