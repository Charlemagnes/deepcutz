# Account Setup Guide

Manual steps to provision the three third-party services this app depends on: Supabase, Clerk, and Spotify. Once you have all the values below, copy `.env.example` to `.env.local` and fill them in.

```powershell
Copy-Item .env.example .env.local
```

---

## 1. Supabase (database)

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and sign in / create an account.
2. Click **New project**.
   - Name: `deepcutz`
   - Set a strong **database password** and **save it somewhere** — you'll need it once, to link the CLI (Step 5 below). You won't need to type it again after that.
   - Pick a region close to you.
   - Click **Create new project** and wait ~2 minutes for provisioning.
3. Once ready, go to **Settings → General** and copy the **Reference ID** (looks like `abcdefghijklmno`). Send this to me — it's the `<project-ref>` I'll use to run `supabase link`.
4. Go to **Settings → API** and copy three values into `.env.local`:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (server-only secret — never expose this to client code)

Don't apply any migrations yourself — once you've linked the project and given me the ref, I'll run `supabase db push` to apply the schema.

---

## 2. Clerk (authentication)

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com) and sign in / create an account.
2. Click **Create application**.
   - Name: `deepcutz`
   - Enable whichever sign-in methods you want (email + Google is a reasonable default for an MVP).
3. Go to **Configure → API Keys** and copy two values into `.env.local`:
   - **Publishable key** → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - **Secret key** → `CLERK_SECRET_KEY`
4. Go to **Configure → Integrations → Supabase** and **enable** it. This is Clerk's native Supabase integration (not the older, deprecated JWT template approach) — it exposes the values Supabase needs to trust Clerk as an auth provider.
   - Note the **Clerk domain / issuer URL** shown here — you'll need to paste it into Supabase's dashboard next (see Step 3 below). Send it to me, or paste it directly into Supabase yourself if you're comfortable — either works.

*(Skip webhook setup for now — that requires a public URL, which only exists after the app is deployed to Vercel. We'll come back to it then.)*

---

## 3. Supabase ← Clerk (connect the two)

Back in your Supabase project:

1. Go to **Authentication → Third-Party Auth** (Supabase's dashboard may label this slightly differently depending on version — look for "Third-Party Auth" or "External Providers").
2. Click **Add provider → Clerk**.
3. Paste the Clerk domain/issuer URL from Step 2.4 above.
4. Save.

This is what lets Postgres Row Level Security policies trust `auth.jwt() ->> 'sub'` as the logged-in Clerk user's ID, without needing a custom JWT template.

---

## 4. Spotify (album metadata + cover art)

1. Go to [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard) and sign in / create an account.
2. Click **Create app**.
   - Name/description: anything (e.g. `deepcutz`).
   - **Redirect URI**: the form requires one, but it's unused by the Client Credentials flow we're using for metadata search. Enter a placeholder like `http://localhost:3000/callback`.
   - Check the required checkbox(es) and click **Save**.
3. Go to the app's **Settings** and copy two values into `.env.local`:
   - **Client ID** → `SPOTIFY_CLIENT_ID`
   - **View client secret** → `SPOTIFY_CLIENT_SECRET`

---

## What to send back

Once you've been through all of the above, send me:
- The Supabase **project ref** (from Step 1.3)
- Confirmation that `.env.local` is filled in with all 7 values (you don't need to paste secrets into chat — just let me know it's done, or paste them if you'd rather I double-check)

From there I'll link the Supabase project, push the database migrations, generate TypeScript types, and we can do an end-to-end sign-in test.
