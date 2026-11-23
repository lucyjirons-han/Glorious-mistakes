-- Results of the "What's your mistake style?" quiz at /quiz. Guests keep their latest result on
-- their own device; logged-in people save each result here so they can retake the quiz later and
-- see whether their style has shifted.
--
-- * Only logged-in (non-anonymous) people can save results, and only their own.
-- * People can read and delete their own results; admins can read and delete them all.
-- * Results can't be edited. taken_at can be in the past (a result taken as a guest and saved
--   after logging in) but never in the future.

create table public.quiz_results (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  style text not null check (style in ('fixer', 'replayer', 'laugher', 'owner', 'vault')),
  scores jsonb not null default '{}'::jsonb
    check (jsonb_typeof(scores) = 'object' and pg_column_size(scores) <= 1000),
  quiz_version smallint not null default 1 check (quiz_version between 1 and 100),
  taken_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index quiz_results_user_id_taken_at_idx on public.quiz_results (user_id, taken_at desc);

-- A result can't claim to come from the future.
create function public.quiz_results_clamp_taken_at()
returns trigger
language plpgsql set search_path = '' as $$
begin
  new.taken_at := least(coalesce(new.taken_at, now()), now());
  return new;
end;
$$;

create trigger quiz_results_clamp_taken_at before insert on public.quiz_results
  for each row execute function public.quiz_results_clamp_taken_at();

alter table public.quiz_results enable row level security;

create policy "People can read their own quiz results" on public.quiz_results
  for select to authenticated using ((select auth.uid()) = user_id or (select public.is_admin()));
create policy "Logged-in people can save their own quiz results" on public.quiz_results
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
  );
create policy "People can delete their own quiz results" on public.quiz_results
  for delete to authenticated using ((select auth.uid()) = user_id or (select public.is_admin()));

revoke all on public.quiz_results from anon, authenticated;
grant select, insert, delete on public.quiz_results to authenticated;
