# Account Setup Guide

Manual steps to provision the two third-party services this app depends on: Supabase (database + auth) and Spotify. Once you have all the values below, copy `.env.example` to `.env.local` and fill them in.

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

## 2. Google OAuth (for "Sign in with Google")

Email/password sign-in works out of the box with Supabase Auth — no extra setup needed. Google sign-in requires an OAuth client from Google Cloud, wired into Supabase's dashboard:

1. Go to the [Google Cloud Console credentials page](https://console.cloud.google.com/apis/credentials) and create a project (or pick an existing one).
2. Click **Create credentials → OAuth client ID**.
   - Application type: **Web application**.
   - Name: anything (e.g. `deepcutz`).
   - **Authorized redirect URIs**: add `https://<your-project-ref>.supabase.co/auth/v1/callback` (find `<your-project-ref>` in Supabase **Settings → General**, from Step 1.3 below).
3. Copy the **Client ID** and **Client secret** it generates.
4. In your Supabase project dashboard, go to **Authentication → Sign In / Providers → Google**, enable it, and paste in the Client ID and Client secret from Step 2.3. Save.

No values from this step go into `.env.local` — Supabase handles the OAuth exchange server-side once the provider is configured in its dashboard.

*(Also worth checking, while you're in Supabase's Authentication settings: **URL Configuration → Site URL / Redirect URLs** should include your production domain once deployed to Vercel, so OAuth and email-confirmation redirects land in the right place. Locally, `http://localhost:3000` is covered by default.)*

---

## 3. Spotify (album metadata + cover art)

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
- Confirmation that `.env.local` is filled in with all 5 values (you don't need to paste secrets into chat — just let me know it's done, or paste them if you'd rather I double-check)
- Confirmation that the Google provider is enabled in Supabase (Step 2)

From there I'll link the Supabase project, push the database migrations, generate TypeScript types, and we can do an end-to-end sign-in test.
