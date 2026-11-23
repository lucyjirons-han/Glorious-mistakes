-- Reports on public profiles. Anyone with a session (anonymous or logged in) can report a public
-- profile once, with a reason and an optional note. Reporters can only see their own reports;
-- admins see them all (through admin_profile_reports(), which adds the profile's username) and
-- can delete them. Reports go when the profile is deleted.

create table public.profile_reports (
  id bigint generated always as identity primary key,
  profile_id uuid not null references public.public_profiles (id) on delete cascade,
  reporter_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  reason text not null check (reason in ('picture', 'words', 'links', 'impersonation', 'other')),
  details text not null default '' check (char_length(details) <= 300),
  created_at timestamptz not null default now(),
  unique (profile_id, reporter_id)
);

create index profile_reports_reporter_id_idx on public.profile_reports (reporter_id);

alter table public.profile_reports enable row level security;

create policy "People can read their own profile reports" on public.profile_reports
  for select to authenticated using ((select auth.uid()) = reporter_id or (select public.is_admin()));
-- Only public profiles, and not your own.
create policy "People can report public profiles" on public.profile_reports
  for insert to authenticated
  with check (
    (select auth.uid()) = reporter_id
    and profile_id <> (select auth.uid())
    and exists (select 1 from public.public_profiles p where p.id = profile_id and p.is_public)
  );
create policy "Admins can delete profile reports" on public.profile_reports
  for delete to authenticated using ((select public.is_admin()));

revoke all on public.profile_reports from anon, authenticated;
grant select, insert, delete on public.profile_reports to authenticated;

-- Every profile report with the profile's username, newest first. No rows unless the caller is
-- an admin.
create function public.admin_profile_reports()
returns table (
  id bigint,
  profile_id uuid,
  username text,
  reason text,
  details text,
  created_at timestamptz,
  reporter_id uuid
)
language sql stable security definer set search_path = '' as $$
  select r.id, r.profile_id, p.username, r.reason, r.details, r.created_at, r.reporter_id
  from public.profile_reports r
  join public.public_profiles p on p.id = r.profile_id
  where (select public.is_admin())
  order by r.created_at desc;
$$;

revoke execute on function public.admin_profile_reports() from public, anon;
grant execute on function public.admin_profile_reports() to authenticated;
