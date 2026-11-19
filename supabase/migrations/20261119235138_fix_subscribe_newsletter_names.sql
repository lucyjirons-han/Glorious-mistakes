-- Unqualified names in the statement mean the table's columns; the arguments are always
-- written as subscribe_newsletter.<name>.
create or replace function public.subscribe_newsletter(first_name text, email text)
returns void
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
begin
  insert into public.newsletter_signups (first_name, email)
  values (btrim(subscribe_newsletter.first_name), btrim(subscribe_newsletter.email))
  on conflict (lower(email)) do nothing;
end;
$$;
