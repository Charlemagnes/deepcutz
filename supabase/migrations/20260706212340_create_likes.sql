-- NOTE: the ERD in docs/implementation_plan.md types target_id as uuid, but it must
-- also reference albums.id (a Spotify text ID), so target_id is text here, not uuid.
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null references public.profiles(id) on delete cascade,
  target_id text not null,             -- review_id (uuid-as-text) or album_id; not FK-enforced, validated at app layer
  target_type text not null check (target_type in ('review', 'album')),
  created_at timestamptz not null default now(),
  constraint likes_unique unique (profile_id, target_id, target_type)
);

create index if not exists likes_target_idx on public.likes(target_id, target_type);
