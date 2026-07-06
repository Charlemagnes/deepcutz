create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id text not null references public.profiles(id) on delete cascade,
  following_id text not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint follows_unique unique (follower_id, following_id),
  constraint follows_no_self_follow check (follower_id <> following_id)
);

create index if not exists follows_follower_idx on public.follows(follower_id);
create index if not exists follows_following_idx on public.follows(following_id);
