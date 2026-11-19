-- Newsletter sign-ups, kept until a mailing-list provider is connected (then import and
-- empty this table). Nobody can read or change it through the API: row level security is on
-- with no policies and no table grants. The only way in is subscribe_newsletter() below.
create table public.newsletter_signups (
  id bigint generated always as identity primary key,
  first_name text not null check (char_length(first_name) between 1 and 60),
  email text not null check (char_length(email) between 3 and 254 and email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  consented_at timestamptz not null default now()
);

create unique index newsletter_signups_email_key on public.newsletter_signups (lower(email));

alter table public.newsletter_signups enable row level security;
revoke all on public.newsletter_signups from anon, authenticated;

-- Adds a sign-up. Signing up again with the same address changes nothing and returns the same
-- result, so the form can't be used to find out who is on the list.
create function public.subscribe_newsletter(first_name text, email text)
returns void
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.newsletter_signups (first_name, email)
  values (btrim(subscribe_newsletter.first_name), btrim(subscribe_newsletter.email))
  on conflict (lower(email)) do nothing;
end;
$$;

revoke execute on function public.subscribe_newsletter(text, text) from public, authenticated;
grant execute on function public.subscribe_newsletter(text, text) to anon;
