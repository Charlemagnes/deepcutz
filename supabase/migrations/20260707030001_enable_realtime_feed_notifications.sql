-- Live Feed Updates (Phase 4.5, item 3): enable Realtime postgres_changes on the
-- two tables client components need to subscribe to. RLS still governs what each
-- subscriber actually receives (reviews: public read; notifications: recipient-only).
alter publication supabase_realtime add table public.reviews;
alter publication supabase_realtime add table public.notifications;
