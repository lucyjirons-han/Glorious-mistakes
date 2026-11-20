-- New entries need a logged-in (Google) account; anonymous browser sessions can still read,
-- react, report, and edit or delete entries they logged before this rule.
drop policy "Owners can add mistakes" on public.mistakes;
create policy "Logged-in owners can add mistakes" on public.mistakes
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
  );
