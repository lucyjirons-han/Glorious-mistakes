-- Table privileges for the API roles. Row level security still decides which rows each person
-- can see or change; these only allow the kinds of statement the app uses.
grant select on public.mistakes to anon, authenticated;
grant insert, update, delete on public.mistakes to authenticated;
grant select, insert, delete on public.reactions to authenticated;
grant select, insert on public.reports to authenticated;
