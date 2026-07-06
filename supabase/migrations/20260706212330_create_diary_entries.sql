create table if not exists public.diary_entries (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null references public.profiles(id) on delete cascade,
  album_id text not null references public.albums(id) on delete cascade,
  listened_date date not null default current_date,
  rating numeric(2,1) check (rating is null or (rating >= 0.5 and rating <= 5.0)),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists diary_entries_profile_id_idx on public.diary_entries(profile_id);
create index if not exists diary_entries_album_id_idx on public.diary_entries(album_id);
