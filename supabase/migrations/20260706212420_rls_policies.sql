alter table public.profiles enable row level security;
alter table public.albums enable row level security;
alter table public.reviews enable row level security;
alter table public.diary_entries enable row level security;
alter table public.likes enable row level security;
alter table public.follows enable row level security;
alter table public.comments enable row level security;

-- profiles
create policy "Profiles are publicly readable" on public.profiles for select using (true);
create policy "Users can insert their own profile" on public.profiles for insert with check ((auth.jwt() ->> 'sub') = id);
create policy "Users can update their own profile" on public.profiles for update using ((auth.jwt() ->> 'sub') = id) with check ((auth.jwt() ->> 'sub') = id);
create policy "Users can delete their own profile" on public.profiles for delete using ((auth.jwt() ->> 'sub') = id);

-- albums (read-only from the client; writes happen only via the service-role cache-on-write path)
create policy "Albums are publicly readable" on public.albums for select using (true);

-- reviews
create policy "Reviews are publicly readable" on public.reviews for select using (true);
create policy "Users can insert their own reviews" on public.reviews for insert with check ((auth.jwt() ->> 'sub') = profile_id);
create policy "Users can update their own reviews" on public.reviews for update using ((auth.jwt() ->> 'sub') = profile_id) with check ((auth.jwt() ->> 'sub') = profile_id);
create policy "Users can delete their own reviews" on public.reviews for delete using ((auth.jwt() ->> 'sub') = profile_id);

-- diary_entries (public read so other users' profile pages can show it)
create policy "Diary entries are publicly readable" on public.diary_entries for select using (true);
create policy "Users can insert their own diary entries" on public.diary_entries for insert with check ((auth.jwt() ->> 'sub') = profile_id);
create policy "Users can update their own diary entries" on public.diary_entries for update using ((auth.jwt() ->> 'sub') = profile_id) with check ((auth.jwt() ->> 'sub') = profile_id);
create policy "Users can delete their own diary entries" on public.diary_entries for delete using ((auth.jwt() ->> 'sub') = profile_id);

-- likes
create policy "Likes are publicly readable" on public.likes for select using (true);
create policy "Users can insert their own likes" on public.likes for insert with check ((auth.jwt() ->> 'sub') = profile_id);
create policy "Users can delete their own likes" on public.likes for delete using ((auth.jwt() ->> 'sub') = profile_id);

-- follows
create policy "Follows are publicly readable" on public.follows for select using (true);
create policy "Users can insert their own follows" on public.follows for insert with check ((auth.jwt() ->> 'sub') = follower_id);
create policy "Users can delete their own follows" on public.follows for delete using ((auth.jwt() ->> 'sub') = follower_id);

-- comments
create policy "Comments are publicly readable" on public.comments for select using (true);
create policy "Users can insert their own comments" on public.comments for insert with check ((auth.jwt() ->> 'sub') = profile_id);
create policy "Users can update their own comments" on public.comments for update using ((auth.jwt() ->> 'sub') = profile_id) with check ((auth.jwt() ->> 'sub') = profile_id);
create policy "Users can delete their own comments" on public.comments for delete using ((auth.jwt() ->> 'sub') = profile_id);
