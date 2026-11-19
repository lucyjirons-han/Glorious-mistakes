drop policy "Public mistakes are readable by anyone" on public.mistakes;
drop policy "Owners can read their own mistakes" on public.mistakes;

create policy "Visitors can read public mistakes" on public.mistakes
  for select to anon using (visibility = 'public');
create policy "Signed-in people can read public mistakes and their own" on public.mistakes
  for select to authenticated using (visibility = 'public' or (select auth.uid()) = user_id);
