create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null references public.profiles(id) on delete cascade,
  review_id uuid not null references public.reviews(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists comments_review_id_idx on public.comments(review_id);
