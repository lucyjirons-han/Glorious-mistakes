-- Accounts: visitors can log in with Google (the anonymous user is upgraded with
-- auth.linkIdentity, so their entries stay theirs), keep a profile, and manage their own
-- newsletter subscription. The admin login is switched back on.

-- 1. The real admin check again (undoes 20261120012502_temporarily_open_admin). Admins are
--    signed-in, non-anonymous users listed in public.admins. Add one with SQL:
--      insert into public.admins (user_id) select id from auth.users where email = 'you@example.com';
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
    and exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

-- 2. Profiles: a first and last name per logged-in person. People can only see and change
--    their own; admins can manage them all.
create table public.profiles (
  id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  first_name text not null default '' check (char_length(first_name) <= 60),
  last_name text not null default '' check (char_length(last_name) <= 60),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "People can read their own profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "People can add their own profile" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);
create policy "People can edit their own profile" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "Admins can manage profiles" on public.profiles
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

revoke all on public.profiles from anon;
grant select, insert, update, delete on public.profiles to authenticated;

-- 3. Moving entries from an anonymous user to an account they already had (logging in on a
--    second device). While still anonymous, the browser asks for a one-off code; after logging
--    in it hands the code back and the anonymous user's entries, reactions and reports move
--    over. Codes last an hour and work once. Nobody can read the table through the API.
create table public.account_transfers (
  token uuid primary key default gen_random_uuid(),
  from_user uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index account_transfers_from_user_idx on public.account_transfers (from_user);

alter table public.account_transfers enable row level security;
revoke all on public.account_transfers from anon, authenticated;

create function public.start_account_transfer() returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  new_token uuid;
begin
  if auth.uid() is null or coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false then
    raise exception 'Only anonymous visitors can start a transfer';
  end if;
  delete from public.account_transfers
    where from_user = auth.uid() or created_at < now() - interval '1 hour';
  insert into public.account_transfers (from_user) values (auth.uid()) returning token into new_token;
  return new_token;
end;
$$;

-- Returns how many entries moved (0 when there was nothing to move).
create function public.finish_account_transfer(transfer_token uuid) returns integer
language plpgsql security definer set search_path = '' as $$
declare
  source uuid;
  moved integer := 0;
begin
  if auth.uid() is null or coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) then
    raise exception 'Log in before finishing a transfer';
  end if;

  delete from public.account_transfers
    where token = transfer_token and created_at > now() - interval '1 hour'
    returning from_user into source;

  -- Only ever move from an anonymous user, and never to themselves.
  if source is null or source = auth.uid()
     or not exists (select 1 from auth.users u where u.id = source and u.is_anonymous) then
    return 0;
  end if;

  update public.mistakes set user_id = auth.uid() where user_id = source;
  get diagnostics moved = row_count;

  insert into public.reactions (mistake_id, user_id, reaction, created_at)
    select mistake_id, auth.uid(), reaction, created_at from public.reactions where user_id = source
    on conflict do nothing;
  delete from public.reactions where user_id = source;

  insert into public.reports (mistake_id, reporter_id, created_at)
    select mistake_id, auth.uid(), created_at from public.reports where reporter_id = source
    on conflict do nothing;
  delete from public.reports where reporter_id = source;

  return moved;
end;
$$;

revoke execute on function public.start_account_transfer() from public, anon;
revoke execute on function public.finish_account_transfer(uuid) from public, anon;
grant execute on function public.start_account_transfer() to authenticated;
grant execute on function public.finish_account_transfer(uuid) to authenticated;

-- 4. Newsletter settings for logged-in people. These only ever look at the address on the
--    person's own account, so the list itself stays unreadable.
create function public.my_newsletter_subscription() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
    and exists (
      select 1 from public.newsletter_signups s
      where lower(s.email) = lower(auth.jwt() ->> 'email')
    );
$$;

create function public.set_my_newsletter_subscription(subscribed boolean, first_name text)
returns void
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
declare
  account_email text := auth.jwt() ->> 'email';
begin
  if auth.uid() is null or coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false)
     or coalesce(account_email, '') = '' then
    raise exception 'Log in to change newsletter settings';
  end if;

  if set_my_newsletter_subscription.subscribed then
    insert into public.newsletter_signups (first_name, email)
    values (btrim(set_my_newsletter_subscription.first_name), account_email)
    on conflict (lower(email)) do update set first_name = excluded.first_name;
  else
    delete from public.newsletter_signups where lower(email) = lower(account_email);
  end if;
end;
$$;

revoke execute on function public.my_newsletter_subscription() from public, anon;
revoke execute on function public.set_my_newsletter_subscription(boolean, text) from public, anon;
grant execute on function public.my_newsletter_subscription() to authenticated;
grant execute on function public.set_my_newsletter_subscription(boolean, text) to authenticated;
