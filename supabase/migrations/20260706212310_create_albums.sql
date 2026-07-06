create table if not exists public.albums (
  id text primary key,                 -- Spotify album id
  title text not null,
  artist text not null,
  cover_url text,
  release_date date,
  avg_rating numeric(3,2) not null default 0,
  rating_count integer not null default 0,
  cached_at timestamptz not null default now()
);

comment on table public.albums is 'Cache-on-write copy of Spotify album metadata. avg_rating/rating_count are denormalized from reviews via trigger.';
