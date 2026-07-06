create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null references public.profiles(id) on delete cascade,
  album_id text not null references public.albums(id) on delete cascade,
  rating numeric(2,1) not null check (rating >= 0.5 and rating <= 5.0),
  content text,
  is_spoiler boolean not null default false,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint reviews_profile_album_unique unique (profile_id, album_id)
);

create index if not exists reviews_album_id_idx on public.reviews(album_id);
create index if not exists reviews_profile_id_idx on public.reviews(profile_id);
