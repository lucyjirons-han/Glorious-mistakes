-- TEMPORARY: the admin login is switched off so a tutor can view /admin. Every signed-in session,
-- including anonymous visitors, counts as an admin and can read and change all rows (newsletter
-- sign-ups included). To switch the login back on, restore the real check:
--   create or replace function public.is_admin() returns boolean
--   language sql stable security definer set search_path = '' as $$
--     select coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
--       and exists (select 1 from public.admins a where a.user_id = auth.uid());
--   $$;
-- and set ADMIN_LOGIN_REQUIRED to true in src/lib/admin.ts.
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null;
$$;
