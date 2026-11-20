-- Admin access for the /admin page. Admins are ordinary (non-anonymous) Supabase users whose id
-- is listed in public.admins. Nobody can read or change that list through the API; add people
-- with SQL in the dashboard:
--   insert into public.admins (user_id) select id from auth.users where email = 'you@example.com';
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;

-- True when the signed-in person is on the admin list. Anonymous sessions never count.
create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
    and exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Admins can do anything with entries, reactions, reports and newsletter sign-ups. These
-- policies sit beside the owner policies; everyone else is still limited to their own rows.
create policy "Admins can manage mistakes" on public.mistakes
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins can manage reactions" on public.reactions
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins can manage reports" on public.reports
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins can manage newsletter sign-ups" on public.newsletter_signups
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- Statement privileges the admin page needs. Row level security above still limits them to
-- admins; visitors gain nothing (the newsletter list stays unreadable to them).
grant update on public.reactions to authenticated;
grant update, delete on public.reports to authenticated;
grant select, insert, update, delete on public.newsletter_signups to authenticated;
