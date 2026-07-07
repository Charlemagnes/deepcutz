-- Notifications: recipient gets notified on new follows, likes on their reviews, and
-- comments on their reviews. Rows are written exclusively by SECURITY DEFINER triggers
-- below (no insert policy for authenticated/anon roles), so an actor's RLS-scoped
-- session can still create a notification row owned by the recipient.

-- likes.review_id: a proper FK-enforced companion to the existing polymorphic
-- target_id/target_type, so review-likes cascade-delete with their review and the
-- notify/count triggers below can join without casting target_id.
alter table public.likes add column review_id uuid references public.reviews(id) on delete cascade;

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('follow', 'like', 'comment')),
  review_id uuid references public.reviews(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint notifications_no_self check (actor_id <> recipient_id),
  constraint notifications_shape check (
    (type = 'follow' and review_id is null and comment_id is null) or
    (type = 'like' and review_id is not null and comment_id is null) or
    (type = 'comment' and review_id is not null and comment_id is not null)
  )
);

create index notifications_recipient_read_idx on public.notifications(recipient_id, read_at);
create index notifications_recipient_created_idx on public.notifications(recipient_id, created_at desc);

alter table public.notifications enable row level security;

create policy "Users can read their own notifications" on public.notifications
  for select using (auth.uid() = recipient_id);

create policy "Users can update their own notifications" on public.notifications
  for update using (auth.uid() = recipient_id) with check (auth.uid() = recipient_id);

-- =============================================================================
-- Notification-creation triggers
-- =============================================================================

create or replace function public.notify_on_follow()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Skip self-follows (shouldn't happen due to check constraint, but be safe)
  if new.follower_id = new.following_id then
    return new;
  end if;

  insert into public.notifications (recipient_id, actor_id, type)
  values (new.following_id, new.follower_id, 'follow');

  return new;
end;
$$;

create trigger notify_on_follow_trigger
after insert on public.follows
for each row
execute function public.notify_on_follow();

create or replace function public.notify_on_review_like()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  review_owner_id uuid;
begin
  -- Only fire for review likes
  if new.target_type <> 'review' then
    return new;
  end if;

  -- Look up the review owner
  select profile_id into review_owner_id
  from public.reviews
  where id = new.review_id;

  -- Skip if review not found or self-like
  if review_owner_id is null or review_owner_id = new.profile_id then
    return new;
  end if;

  insert into public.notifications (recipient_id, actor_id, type, review_id)
  values (review_owner_id, new.profile_id, 'like', new.review_id);

  return new;
end;
$$;

create trigger notify_on_review_like_trigger
after insert on public.likes
for each row
when (new.target_type = 'review')
execute function public.notify_on_review_like();

create or replace function public.notify_on_comment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  review_owner_id uuid;
begin
  -- Look up the review owner
  select profile_id into review_owner_id
  from public.reviews
  where id = new.review_id;

  -- Skip if review not found or self-comment
  if review_owner_id is null or review_owner_id = new.profile_id then
    return new;
  end if;

  insert into public.notifications (recipient_id, actor_id, type, review_id, comment_id)
  values (review_owner_id, new.profile_id, 'comment', new.review_id, new.id);

  return new;
end;
$$;

create trigger notify_on_comment_trigger
after insert on public.comments
for each row
execute function public.notify_on_comment();
