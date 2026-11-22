-- Admins can see everyone who has logged in (with their email, role and how many entries they've
-- logged) and change people's roles from the admin page's People tab. Roles stay in
-- public.admins, which nobody can read or change directly through the API; these functions are
-- the only way in, and both check public.is_admin() first.

-- Everyone with a (non-anonymous) account, newest first. Returns no rows unless the caller is an
-- admin. People without a profile row yet show with empty names.
create function public.admin_people()
returns table (
  id uuid,
  first_name text,
  last_name text,
  email text,
  role text,
  entries bigint,
  created_at timestamptz,
  last_sign_in_at timestamptz
)
language sql stable security definer set search_path = '' as $$
  select
    u.id,
    coalesce(p.first_name, ''),
    coalesce(p.last_name, ''),
    u.email::text,
    case when a.user_id is null then 'member' else 'admin' end,
    (select count(*) from public.mistakes m where m.user_id = u.id),
    u.created_at,
    u.last_sign_in_at
  from auth.users u
  left join public.profiles p on p.id = u.id
  left join public.admins a on a.user_id = u.id
  where not u.is_anonymous and (select public.is_admin())
  order by u.created_at desc;
$$;

-- Makes someone an admin ('admin') or takes it away ('member'). Admins can't take their own
-- admin role away, so there's always at least one admin and nobody locks themselves out.
create function public.admin_set_role(target uuid, value text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then
    raise exception 'Only admins can change roles' using errcode = '42501';
  end if;
  if value not in ('member', 'admin') then
    raise exception 'Unknown role: %', value using errcode = '22023';
  end if;
  if target = auth.uid() and value <> 'admin' then
    raise exception 'You can''t remove your own admin role' using errcode = 'P0001';
  end if;
  if not exists (select 1 from auth.users u where u.id = target and not u.is_anonymous) then
    raise exception 'Only people who have logged in can have a role' using errcode = 'P0002';
  end if;

  if value = 'admin' then
    insert into public.admins (user_id) values (target) on conflict do nothing;
  else
    delete from public.admins where user_id = target;
  end if;
end;
$$;

revoke execute on function public.admin_people() from public, anon;
revoke execute on function public.admin_set_role(uuid, text) from public, anon;
grant execute on function public.admin_people() to authenticated;
grant execute on function public.admin_set_role(uuid, text) to authenticated;
