# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`deepcutz` is an album-logging/review platform ("Letterboxd for music"), built with Next.js (App Router) + TypeScript, Supabase (Postgres + Auth), and the Spotify API for album metadata/cover art. Full architecture, database schema, and phase-by-phase roadmap live in `docs/implementation_plan.md` — read that first for any schema or feature-scoping question. `docs/account-setup.md` documents the manual third-party account setup (Supabase, Google OAuth, Spotify) for whoever runs this locally.

Package manager is **pnpm** (see `pnpm-lock.yaml` / `pnpm-workspace.yaml`) — use `pnpm`, not `npm`/`yarn`, even though `package.json` scripts are invocable via any of them.

## Commands

- `pnpm dev` — start dev server (Turbopack)
- `pnpm build` / `pnpm start` — production build / serve
- `pnpm lint` — ESLint (flat config, `eslint-config-next`)
- `pnpm test` — run the Vitest suite once (`vitest run`); use `pnpm exec vitest <path>` to target a single test file, or `pnpm exec vitest` for watch mode
- Supabase CLI (`supabase/` dir): `supabase db push` applies migrations to the linked project. Do not apply migrations directly against the dashboard — go through `supabase/migrations/*.sql` files so history stays linear. Local project ref/link state lives in `supabase/.temp/` (gitignored).

CI (`.github/workflows/ci.yml`) runs `pnpm lint`, `pnpm test`, then `pnpm build` on push/PR to `main`, using GitHub secrets for the Supabase/Spotify env vars during build.

## Environment

Copy `.env.example` → `.env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`. See `docs/account-setup.md` for where each value comes from. The service role key is server-only — never reference it from client components or code that ships to the browser.

## Architecture

**Auth & session flow**: Supabase Auth (email/password + Google OAuth) via `@supabase/ssr`, in three separate client constructors under `src/lib/supabase/`:
- `client.ts` — browser client for Client Components
- `server.ts` — cookie-bound server client for Server Components/Route Handlers (uses `next/headers` cookies)
- `service-role.ts` — privileged client bypassing RLS, for trusted server-side writes only (e.g. the Spotify cache-on-write path)

`src/middleware.ts` is the single gatekeeper for auth redirects: it calls `supabase.auth.getUser()` (never `getSession()` — session data isn't re-validated against the auth server) and enforces three rules in order — unauthenticated users get bounced to `/login` on any non-public route; authenticated users on `/login` get bounced home; authenticated users without a `profiles.username` get bounced to `/onboarding`. `PUBLIC_ROUTES` and the route matcher in that file are the place to update when adding new unauthenticated-accessible routes.

**Profile lifecycle**: a Postgres trigger (`handle_new_user` in the latest migration) auto-inserts a `profiles` row on `auth.users` insert; `username` starts `null` and is set by the user during `/onboarding`. Don't create profile rows from application code — the trigger is the only writer for row creation.

**Database schema & migrations**: schema is defined incrementally in `supabase/migrations/*.sql`, timestamp-ordered. The important one to read for current state is the latest, `20260706225300_supabase_auth_migration.sql` — it drops and recreates every table, since the project migrated from a Clerk-based `profiles.id text` scheme to Supabase Auth's `profiles.id uuid references auth.users(id)`. Earlier migrations (`create_profiles.sql` etc.) reflect the pre-migration Clerk-based shape and are superseded; don't use them as a reference for the current schema. Key constraints to preserve when touching this area: `reviews` is unique per `(profile_id, album_id)` (one canonical review per user/album — relisting goes through `diary_entries`, which has no such uniqueness constraint); `follows` is unique per `(follower_id, following_id)` with a check preventing self-follow; `likes.target_id`/`target_type` is a polymorphic reference (not FK-enforced) validated at the application layer. RLS is enabled on every table: public read (`using (true)`) plus write/update/delete restricted via `auth.uid()` to the owning row. After editing `database.types.ts`-adjacent schema, regenerate `src/lib/database.types.ts` from the linked Supabase project rather than hand-editing it.

**Albums are cache-on-write, not permanent storage**: `albums` rows are only created/refreshed when a user logs/reviews an album (not on search), storing a `cached_at` timestamp; reads should re-fetch from Spotify if the cached row is stale. This is a deliberate ToS-compliance choice (see `docs/implementation_plan.md` Architecture section) — don't change it to "cache everything from search results" without checking that context. `avg_rating`/`rating_count` on `albums` are denormalized via the `update_album_rating_stats` trigger on `reviews` insert/update/delete — don't compute these with app-side aggregation queries.

**UI components**: shadcn/ui (`style: base-nova`, neutral base color, Lucide icons) — config in `components.json`. Path aliases: `@/components`, `@/components/ui`, `@/lib`, `@/hooks` all resolve under `src/`. Add new shadcn primitives via the shadcn CLI rather than hand-rolling equivalents; existing primitives are in `src/components/ui/`.

**Testing**: Vitest + jsdom + React Testing Library (`vitest.config.ts`, `vitest.setup.ts` imports `@testing-library/jest-dom/vitest`). Test files live under `src/test/`.

## Known constraints

- Spotify integration runs under **Development Mode** (Client Credentials flow) for the MVP — this means test-account/Premium gating and reduced search pagination apply. This is a known, accepted limitation, not a bug; Extended Quota Mode is a post-MVP application (see `docs/implementation_plan.md` Phase 5).
- Responsive/mobile layout is explicitly out of scope until Phase 5 — the sidebar nav is desktop-first by design.
