# deepcutz

An album-logging and review platform — "Letterboxd for music." Rate and review albums, keep a listening diary, follow other listeners, and discover what people are spinning, all backed by real Spotify metadata and cover art.

## Tech stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router) + TypeScript, built on Turbopack
- **UI**: React 19, [Tailwind CSS v4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/) (`base-nova` style, neutral base, Lucide icons), [Base UI](https://base-ui.com/) primitives
- **Database & Auth**: [Supabase](https://supabase.com/) (Postgres + Row Level Security + Supabase Auth), accessed via `@supabase/ssr`
  - Email/password and Google OAuth sign-in
  - Postgres triggers for profile creation and denormalized rating/engagement stats
- **External API**: [Spotify Web API](https://developer.spotify.com/documentation/web-api) (Client Credentials flow) for album search, metadata, and cover art
- **Testing**: [Vitest](https://vitest.dev/) + [jsdom](https://github.com/jsdom/jsdom) + [React Testing Library](https://testing-library.com/react), with [MSW](https://mswjs.io/) for mocking network requests
- **Linting**: ESLint (flat config, `eslint-config-next`)
- **Package manager**: [pnpm](https://pnpm.io/)
- **Deployment**: Vercel, with GitHub Actions CI (lint → test → build) on every push/PR to `main`

## Architecture highlights

- **Cache-on-write albums**: Spotify data is only persisted to the `albums` table when a user actually logs or reviews an album (not on search), with a `cached_at` timestamp for staleness-based refresh — a deliberate choice to stay closer to Spotify's caching terms of service rather than mirroring their whole catalog.
- **Denormalized stats via triggers**: `avg_rating`/`rating_count` on `albums`, and review engagement counts, are maintained by Postgres triggers on write — never computed client-side.
- **Three-tier Supabase client**: a browser client, a cookie-bound server client, and a privileged service-role client (server-only, bypasses RLS) live under `src/lib/supabase/`.
- **Single auth gatekeeper**: `src/middleware.ts` handles all auth-based redirects (unauthenticated → `/login`, authenticated-without-username → `/onboarding`, etc.).
- **Row Level Security everywhere**: every table is RLS-enabled — public read, writes restricted to the owning row via `auth.uid()`.

For full architecture, database schema (ERD), and the phase-by-phase build roadmap, see [`docs/implementation_plan.md`](docs/implementation_plan.md).

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/installation) (`packageManager` is pinned to `pnpm@11.10.0`)
- A [Supabase](https://supabase.com/) project (free tier is fine)
- A [Spotify](https://developer.spotify.com/dashboard) developer app

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Copy the example env file and fill it in:

```bash
cp .env.example .env.local
```

You'll need five values:

| Variable | Source |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Project Settings → Data API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard → Project Settings → API Keys → anon/public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Project Settings → API Keys → service_role (**server-only**, never expose to the client) |
| `SPOTIFY_CLIENT_ID` | Spotify developer dashboard → your app → Settings |
| `SPOTIFY_CLIENT_SECRET` | Spotify developer dashboard → your app → Settings |

If you also want Google sign-in working locally, follow the OAuth setup steps in [`docs/account-setup.md`](docs/account-setup.md). Email/password auth works out of the box with no extra config.

### 3. Apply database migrations

Migrations live in `supabase/migrations/*.sql` and are timestamp-ordered — always go through migration files rather than editing the schema directly in the dashboard, so history stays linear.

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

Then regenerate the TypeScript types to match:

```bash
supabase gen types typescript --linked > src/lib/database.types.ts
```

### 4. Run the dev server

```bash
pnpm dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

## Commands

| Command | Description |
|---|---|
| `pnpm dev` | Start the dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run the full Vitest suite once |
| `pnpm exec vitest <path>` | Run a single test file |
| `pnpm exec vitest` | Run tests in watch mode |

## Project structure

```
src/
  app/                 # Next.js App Router routes
    album/[id]/        # Album detail page
    explore/           # Discovery/explore page
    login/, sign-up/   # Auth pages
    auth/callback/     # OAuth callback handler
    auth/confirm/      # Email confirmation handler
    onboarding/        # First-login username setup
    profile/[username]/ # User profile
    review/[id]/       # Single review page
    search/            # Album/people search
    notifications/     # Notifications feed
  components/          # React components (incl. shadcn/ui primitives under ui/)
  lib/
    supabase/          # client.ts / server.ts / service-role.ts Supabase clients
    spotify/           # Spotify API integration + server actions
    database.types.ts  # Generated Supabase schema types (do not hand-edit)
  middleware.ts         # Auth redirect gatekeeper
  test/                 # Vitest test files
supabase/
  migrations/           # Timestamp-ordered SQL migrations
docs/
  implementation_plan.md # Architecture, schema, and roadmap — read first for scope questions
  account-setup.md       # Third-party account setup walkthrough
  phase-*.md              # Design docs for individual post-MVP phases
```

## Known constraints

- **Spotify Development Mode**: the app currently runs Spotify integration under Client Credentials / Development Mode, which means test-account/Premium gating and reduced search pagination apply. This is accepted for the MVP; moving to Extended Quota Mode is a post-MVP step.
- **Desktop-first**: responsive/mobile layout is explicitly out of scope until a later phase — the sidebar navigation is desktop-first by design.

## Contributing / working in this repo

- Use `pnpm`, not `npm` or `yarn`.
- New database schema changes go through a new file in `supabase/migrations/`, then `supabase db push`, then regenerate `src/lib/database.types.ts` — never hand-edit generated types or push schema changes via the dashboard.
- Add new shadcn/ui primitives via the shadcn CLI (`components.json` is configured with the `base-nova` style) rather than hand-rolling equivalents.
- CI (`.github/workflows/ci.yml`) runs lint, test, and build on every push/PR to `main` — make sure all three pass locally before opening a PR.
