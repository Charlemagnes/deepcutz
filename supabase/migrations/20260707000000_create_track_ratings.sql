-- Track-level ratings/notes, attached to a user's canonical review of an album.
create table public.track_ratings (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews(id) on delete cascade,
  track_number integer not null,
  rating numeric(2,1) check (rating is null or (rating >= 0.5 and rating <= 5.0)),
  notes text,
  created_at timestamptz not null default now(),
  constraint track_ratings_review_track_unique unique (review_id, track_number)
);

create index track_ratings_review_id_idx on public.track_ratings(review_id);

alter table public.track_ratings enable row level security;

create policy "Track ratings are publicly readable" on public.track_ratings for select using (true);

create policy "Users can insert track ratings on their own reviews" on public.track_ratings
  for insert with check (
    exists (
      select 1 from public.reviews r
      where r.id = review_id and r.profile_id = auth.uid()
    )
  );

create policy "Users can update track ratings on their own reviews" on public.track_ratings
  for update using (
    exists (
      select 1 from public.reviews r
      where r.id = review_id and r.profile_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.reviews r
      where r.id = review_id and r.profile_id = auth.uid()
    )
  );

create policy "Users can delete track ratings on their own reviews" on public.track_ratings
  for delete using (
    exists (
      select 1 from public.reviews r
      where r.id = review_id and r.profile_id = auth.uid()
    )
  );
