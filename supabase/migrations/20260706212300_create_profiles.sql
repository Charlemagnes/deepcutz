create table if not exists public.profiles (
  id text primary key,                 -- Clerk user id, e.g. user_xxx
  username text not null unique,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'App user profile, keyed by Clerk user ID. Synced via Clerk webhook.';
