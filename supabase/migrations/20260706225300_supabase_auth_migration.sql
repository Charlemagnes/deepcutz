-- =============================================================================
-- Migration: Clerk → Supabase Auth
-- This migration drops ALL existing tables and recreates them with:
--   - profiles.id as uuid referencing auth.users(id)
--   - All profile_id FKs changed from text to uuid
--   - RLS policies using auth.uid() instead of auth.jwt() ->> 'sub'
--   - Auto-profile-creation trigger on auth.users
-- =============================================================================

-- Drop existing triggers
drop trigger if exists reviews_rating_stats_trigger on public.reviews;

-- Drop existing RLS policies
do $$
declare
  _tbl text;
begin
  for _tbl in select tablename from pg_tables where schemaname = 'public' loop
    execute format('drop policy if exists %I on public.%I', 'Profiles are publicly readable', _tbl);
    execute format('drop policy if exists %I on public.%I', 'Users can insert their own profile', _tbl);
    execute format('drop policy if exists %I on public.%I', 'Users can update their own profile', _tbl);
    execute format('drop policy if exists %I on public.%I', 'Users can delete their own profile', _tbl);
    execute format('drop policy if exists %I on public.%I', 'Albums are publicly readable', _tbl);
    execute format('drop policy if exists %I on public.%I', 'Reviews are publicly readable', _tbl);
    execute format('drop policy if exists %I on public.%I', 'Users can insert their own reviews', _tbl);
    execute format('drop policy if exists %I on public.%I', 'Users can update their own reviews', _tbl);
    execute format('drop policy if exists %I on public.%I', 'Users can delete their own reviews', _tbl);
    execute format('drop policy if exists %I on public.%I', 'Diary entries are publicly readable', _tbl);
    execute format('drop policy if exists %I on public.%I', 'Users can insert their own diary entries', _tbl);
    execute format('drop policy if exists %I on public.%I', 'Users can update their own diary entries', _tbl);
    execute format('drop policy if exists %I on public.%I', 'Users can delete their own diary entries', _tbl);
    execute format('drop policy if exists %I on public.%I', 'Likes are publicly readable', _tbl);
    execute format('drop policy if exists %I on public.%I', 'Users can insert their own likes', _tbl);
    execute format('drop policy if exists %I on public.%I', 'Users can delete their own likes', _tbl);
    execute format('drop policy if exists %I on public.%I', 'Follows are publicly readable', _tbl);
    execute format('drop policy if exists %I on public.%I', 'Users can insert their own follows', _tbl);
    execute format('drop policy if exists %I on public.%I', 'Users can delete their own follows', _tbl);
    execute format('drop policy if exists %I on public.%I', 'Comments are publicly readable', _tbl);
    execute format('drop policy if exists %I on public.%I', 'Users can insert their own comments', _tbl);
    execute format('drop policy if exists %I on public.%I', 'Users can update their own comments', _tbl);
    execute format('drop policy if exists %I on public.%I', 'Users can delete their own comments', _tbl);
  end loop;
end;
$$;

-- Drop existing tables (order matters due to FK dependencies)
drop table if exists public.comments cascade;
drop table if exists public.likes cascade;
drop table if exists public.follows cascade;
drop table if exists public.diary_entries cascade;
drop table if exists public.reviews cascade;
drop table if exists public.albums cascade;
drop table if exists public.profiles cascade;

-- Drop existing functions
drop function if exists public.update_album_rating_stats() cascade;
drop function if exists public.handle_new_user() cascade;

-- =============================================================================
-- Recreate tables with UUID-based profiles
-- =============================================================================

-- profiles: now keyed by Supabase Auth user UUID
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,                  -- nullable until onboarding completes
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'App user profile, keyed by Supabase Auth user UUID. Auto-created via trigger on auth.users.';

-- albums: unchanged (Spotify IDs remain text)
create table public.albums (
  id text primary key,                   -- Spotify album id
  title text not null,
  artist text not null,
  cover_url text,
  release_date date,
  avg_rating numeric(3,2) not null default 0,
  rating_count integer not null default 0,
  cached_at timestamptz not null default now()
);

comment on table public.albums is 'Cache-on-write copy of Spotify album metadata. avg_rating/rating_count are denormalized from reviews via trigger.';

-- reviews
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  album_id text not null references public.albums(id) on delete cascade,
  rating numeric(2,1) not null check (rating >= 0.5 and rating <= 5.0),
  content text,
  is_spoiler boolean not null default false,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint reviews_profile_album_unique unique (profile_id, album_id)
);

create index reviews_album_id_idx on public.reviews(album_id);
create index reviews_profile_id_idx on public.reviews(profile_id);

-- diary_entries
create table public.diary_entries (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  album_id text not null references public.albums(id) on delete cascade,
  listened_date date not null default current_date,
  rating numeric(2,1) check (rating is null or (rating >= 0.5 and rating <= 5.0)),
  notes text,
  created_at timestamptz not null default now()
);

create index diary_entries_profile_id_idx on public.diary_entries(profile_id);
create index diary_entries_album_id_idx on public.diary_entries(album_id);

-- likes
create table public.likes (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  target_id text not null,               -- review_id (uuid-as-text) or album_id; not FK-enforced, validated at app layer
  target_type text not null check (target_type in ('review', 'album')),
  created_at timestamptz not null default now(),
  constraint likes_unique unique (profile_id, target_id, target_type)
);

create index likes_target_idx on public.likes(target_id, target_type);

-- follows
create table public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint follows_unique unique (follower_id, following_id),
  constraint follows_no_self_follow check (follower_id <> following_id)
);

create index follows_follower_idx on public.follows(follower_id);
create index follows_following_idx on public.follows(following_id);

-- comments
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  review_id uuid not null references public.reviews(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index comments_review_id_idx on public.comments(review_id);

-- =============================================================================
-- Album rating stats trigger (unchanged logic)
-- =============================================================================
create or replace function public.update_album_rating_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_album_id text;
begin
  target_album_id := coalesce(new.album_id, old.album_id);

  update public.albums
  set
    avg_rating = coalesce(
      (select round(avg(rating)::numeric, 2) from public.reviews where album_id = target_album_id),
      0
    ),
    rating_count = (select count(*) from public.reviews where album_id = target_album_id)
  where id = target_album_id;

  return coalesce(new, old);
end;
$$;

create trigger reviews_rating_stats_trigger
after insert or update of rating or delete on public.reviews
for each row
execute function public.update_album_rating_stats();

-- =============================================================================
-- Auto-profile-creation trigger on auth.users
-- =============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- =============================================================================
-- Row Level Security policies (using auth.uid())
-- =============================================================================

alter table public.profiles enable row level security;
alter table public.albums enable row level security;
alter table public.reviews enable row level security;
alter table public.diary_entries enable row level security;
alter table public.likes enable row level security;
alter table public.follows enable row level security;
alter table public.comments enable row level security;

-- profiles
create policy "Profiles are publicly readable" on public.profiles for select using (true);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users can delete their own profile" on public.profiles for delete using (auth.uid() = id);

-- albums (read-only from the client; writes happen only via the service-role cache-on-write path)
create policy "Albums are publicly readable" on public.albums for select using (true);

-- reviews
create policy "Reviews are publicly readable" on public.reviews for select using (true);
create policy "Users can insert their own reviews" on public.reviews for insert with check (auth.uid() = profile_id);
create policy "Users can update their own reviews" on public.reviews for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy "Users can delete their own reviews" on public.reviews for delete using (auth.uid() = profile_id);

-- diary_entries
create policy "Diary entries are publicly readable" on public.diary_entries for select using (true);
create policy "Users can insert their own diary entries" on public.diary_entries for insert with check (auth.uid() = profile_id);
create policy "Users can update their own diary entries" on public.diary_entries for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy "Users can delete their own diary entries" on public.diary_entries for delete using (auth.uid() = profile_id);

-- likes
create policy "Likes are publicly readable" on public.likes for select using (true);
create policy "Users can insert their own likes" on public.likes for insert with check (auth.uid() = profile_id);
create policy "Users can delete their own likes" on public.likes for delete using (auth.uid() = profile_id);

-- follows
create policy "Follows are publicly readable" on public.follows for select using (true);
create policy "Users can insert their own follows" on public.follows for insert with check (auth.uid() = follower_id);
create policy "Users can delete their own follows" on public.follows for delete using (auth.uid() = follower_id);

-- comments
create policy "Comments are publicly readable" on public.comments for select using (true);
create policy "Users can insert their own comments" on public.comments for insert with check (auth.uid() = profile_id);
create policy "Users can update their own comments" on public.comments for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy "Users can delete their own comments" on public.comments for delete using (auth.uid() = profile_id);
