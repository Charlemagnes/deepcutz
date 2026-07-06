create or replace function public.update_album_rating_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_album_id text;
begin
  target_album_id := coalesce(new.album_id, old.album_id);

  update public.albums
  set
    avg_rating = coalesce(
      (select round(avg(rating)::numeric, 2) from public.reviews where album_id = target_album_id),
      0
    ),
    rating_count = (select count(*) from public.reviews where album_id = target_album_id)
  where id = target_album_id;

  return coalesce(new, old);
end;
$$;

drop trigger if exists reviews_rating_stats_trigger on public.reviews;

create trigger reviews_rating_stats_trigger
after insert or update of rating or delete on public.reviews
for each row
execute function public.update_album_rating_stats();
