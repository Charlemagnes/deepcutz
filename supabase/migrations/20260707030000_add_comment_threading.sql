-- Threaded replies: a comment may reply to the review directly (null parent)
-- or to another comment (nested reply). review_id stays required on every row
-- so the existing update_review_comment_count trigger keeps counting the
-- whole thread with no changes.
alter table public.comments
  add column parent_comment_id uuid references public.comments(id) on delete cascade;

create index comments_parent_comment_id_idx on public.comments(parent_comment_id);
