-- An opt-in mistake style badge on public profiles. Quiz results stay private (only their owner
-- and admins can read quiz_results); when someone switches show_quiz_style on, their latest
-- style, and nothing else, can be read through profile_quiz_style().

alter table public.public_profiles
  add column show_quiz_style boolean not null default false;

-- The latest mistake style of a profile that shows it: public profiles for everyone, and your
-- own even while it's hidden (for the editor's preview). Null otherwise.
create function public.profile_quiz_style(profile_id uuid)
returns text
language sql stable security definer set search_path = '' as $$
  select r.style
  from public.public_profiles p
  join public.quiz_results r on r.user_id = p.id
  where p.id = profile_id
    and p.show_quiz_style
    and (p.is_public or p.id = (select auth.uid()))
  order by r.taken_at desc
  limit 1;
$$;

revoke execute on function public.profile_quiz_style(uuid) from public;
grant execute on function public.profile_quiz_style(uuid) to anon, authenticated;
