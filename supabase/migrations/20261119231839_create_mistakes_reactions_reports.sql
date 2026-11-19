-- Mistakes people log. Owners see all of theirs; everyone sees public ones.
create table public.mistakes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 300),
  what_happened text not null check (char_length(what_happened) between 1 and 10000),
  lesson text not null default '' check (char_length(lesson) <= 10000),
  category text not null default 'other'
    check (category in ('work','tech','money','food','home','health','travel','social','learning','other')),
  cringe smallint not null default 3 check (cringe between 1 and 5),
  visibility text not null default 'private' check (visibility in ('private','public')),
  author text not null default '' check (char_length(author) <= 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index mistakes_user_id_idx on public.mistakes (user_id);
create index mistakes_public_created_idx on public.mistakes (created_at desc) where visibility = 'public';

create function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger mistakes_set_updated_at before update on public.mistakes
  for each row execute function public.set_updated_at();

alter table public.mistakes enable row level security;

create policy "Public mistakes are readable by anyone" on public.mistakes
  for select to anon, authenticated using (visibility = 'public');
create policy "Owners can read their own mistakes" on public.mistakes
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Owners can add mistakes" on public.mistakes
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Owners can edit their mistakes" on public.mistakes
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Owners can delete their mistakes" on public.mistakes
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Reactions. mistake_id is text so the built-in example entries (ids like 'seed-wave') can be
-- reacted to as well as entries stored here.
create table public.reactions (
  mistake_id text not null check (char_length(mistake_id) <= 100),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  reaction text not null check (reaction in ('been-there','glorious','lesson-noted','solidarity','legendary')),
  created_at timestamptz not null default now(),
  primary key (mistake_id, user_id, reaction)
);

create index reactions_user_id_idx on public.reactions (user_id);

alter table public.reactions enable row level security;

create policy "People can read their own reactions" on public.reactions
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "People can add their own reactions" on public.reactions
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "People can remove their own reactions" on public.reactions
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Remove reactions and reports when a stored mistake is deleted.
create function public.clean_up_deleted_mistake() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  delete from public.reactions where mistake_id = old.id::text;
  delete from public.reports where mistake_id = old.id::text;
  return old;
end;
$$;

-- Reports flag an entry for moderation. Only the reporter can see their own report.
create table public.reports (
  id bigint generated always as identity primary key,
  mistake_id text not null check (char_length(mistake_id) <= 100),
  reporter_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (mistake_id, reporter_id)
);

create index reports_reporter_id_idx on public.reports (reporter_id);

alter table public.reports enable row level security;

create policy "People can read their own reports" on public.reports
  for select to authenticated using ((select auth.uid()) = reporter_id);
create policy "People can report entries" on public.reports
  for insert to authenticated with check ((select auth.uid()) = reporter_id);

create trigger mistakes_clean_up after delete on public.mistakes
  for each row execute function public.clean_up_deleted_mistake();
revoke execute on function public.clean_up_deleted_mistake() from public, anon, authenticated;

-- Totals per reaction, without exposing who reacted.
create function public.reaction_counts(mistake_ids text[])
returns table (mistake_id text, reaction text, total bigint)
language sql stable security definer set search_path = '' as $$
  select r.mistake_id, r.reaction, count(*)
  from public.reactions r
  where r.mistake_id = any (mistake_ids)
  group by r.mistake_id, r.reaction;
$$;

revoke execute on function public.reaction_counts(text[]) from public;
grant execute on function public.reaction_counts(text[]) to anon, authenticated;
