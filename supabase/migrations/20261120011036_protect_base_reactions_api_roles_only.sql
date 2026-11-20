-- Only website visitors (the anon and authenticated API roles) are limited; SQL run in the
-- dashboard or by migrations can set base_reactions directly.
create or replace function public.protect_base_reactions() returns trigger
language plpgsql set search_path = '' as $$
begin
  if current_user in ('anon', 'authenticated') and not public.is_admin() then
    if tg_op = 'INSERT' then
      new.base_reactions := '{}'::jsonb;
    else
      new.base_reactions := old.base_reactions;
    end if;
  end if;
  return new;
end;
$$;
