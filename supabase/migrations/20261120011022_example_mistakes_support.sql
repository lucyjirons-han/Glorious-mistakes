-- Example entries written by the site (ids like 'seed-wave') live in this table too.
-- * ids become text, so the examples keep their existing ids, links and reactions.
--   Entries people log still get UUIDs.
-- * Examples have no owner (user_id is null), so only admins can change them.
-- * base_reactions holds the examples' made-up starting counts, e.g. {"been-there": 248}.
--   Only admins can set it; for everyone else it is kept as it was.
alter table public.mistakes alter column id drop default;
alter table public.mistakes alter column id type text using id::text;
alter table public.mistakes alter column id set default gen_random_uuid()::text;
alter table public.mistakes add constraint mistakes_id_length check (char_length(id) between 1 and 100);

alter table public.mistakes alter column user_id drop not null;

alter table public.mistakes
  add column base_reactions jsonb not null default '{}'::jsonb
  check (jsonb_typeof(base_reactions) = 'object');

create function public.protect_base_reactions() returns trigger
language plpgsql set search_path = '' as $$
begin
  if not public.is_admin() then
    if tg_op = 'INSERT' then
      new.base_reactions := '{}'::jsonb;
    else
      new.base_reactions := old.base_reactions;
    end if;
  end if;
  return new;
end;
$$;

create trigger mistakes_protect_base_reactions before insert or update on public.mistakes
  for each row execute function public.protect_base_reactions();

create index mistakes_examples_idx on public.mistakes (created_at desc) where user_id is null;
