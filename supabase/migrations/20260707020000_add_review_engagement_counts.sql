-- Denormalized like/comment counts on reviews, same pattern as albums.avg_rating/
-- rating_count, so every listing page gets counts for free off the existing reviews
-- select with no N+1 queries.
alter table public.reviews
  add column like_count integer not null default 0,
  add column comment_count integer not null default 0;

create or replace function public.update_review_like_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_review_id uuid;
begin
  -- Only act on review likes
  if coalesce(new.target_type, old.target_type) <> 'review' then
    return coalesce(new, old);
  end if;

  target_review_id := coalesce(new.review_id, old.review_id);

  if target_review_id is null then
    return coalesce(new, old);
  end if;

  update public.reviews
  set like_count = (
    select count(*)
    from public.likes
    where review_id = target_review_id
      and target_type = 'review'
  )
  where id = target_review_id;

  return coalesce(new, old);
end;
$$;

create trigger update_review_like_count_trigger
after insert or delete on public.likes
for each row
execute function public.update_review_like_count();

create or replace function public.update_review_comment_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_review_id uuid;
begin
  target_review_id := coalesce(new.review_id, old.review_id);

  if target_review_id is null then
    return coalesce(new, old);
  end if;

  update public.reviews
  set comment_count = (
    select count(*)
    from public.comments
    where review_id = target_review_id
  )
  where id = target_review_id;

  return coalesce(new, old);
end;
$$;

create trigger update_review_comment_count_trigger
after insert or delete on public.comments
for each row
execute function public.update_review_comment_count();
