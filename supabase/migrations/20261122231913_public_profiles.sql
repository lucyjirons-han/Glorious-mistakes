-- Public profiles: an optional page at /u/<username> with a chosen username, display name,
-- pronouns, short bio, avatar (their Google photo, an uploaded picture, or initials) and links
-- to their website and social accounts. Separate from public.profiles, which holds people's
-- private first and last names and stays readable only by them and admins.
--
-- * Only logged-in (non-anonymous) people can make one, and only for themselves.
-- * Everyone can read profiles marked public; people can always read their own.
-- * Usernames are lowercase letters, numbers and underscores, 3 to 30 long, unique, and not one
--   of the reserved words below (site paths and names that could pass as official).
-- * Avatar addresses can only point at Google's photo servers or the person's own folder in the
--   avatars bucket, so a profile can't load a picture from anywhere else.
-- * Social links are stored as handles; the site builds the links, so they can't point elsewhere.

create table public.public_profiles (
  id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  username text not null
    check (username ~ '^[a-z0-9_]{3,30}$')
    check (username <> all (array[
      'about', 'admin', 'administrator', 'anonymous', 'api', 'faq', 'feed', 'glorious',
      'gloriousmistakes', 'glorious_mistakes', 'guidelines', 'help', 'learn', 'log', 'login',
      'logout', 'me', 'mine', 'mistakes', 'mod', 'moderator', 'null', 'official', 'profile',
      'root', 'search', 'settings', 'staff', 'support', 'system', 'team', 'undefined', 'you'
    ])),
  display_name text not null default '' check (char_length(display_name) <= 50),
  pronouns text not null default '' check (char_length(pronouns) <= 30),
  bio text not null default '' check (char_length(bio) <= 300),
  avatar_source text not null default 'initials' check (avatar_source in ('google', 'upload', 'initials')),
  avatar_url text not null default '' check (
    avatar_url = ''
    or avatar_url ~ '^https://[a-z0-9-]+\.googleusercontent\.com/[^\s"''<>]{1,900}$'
    or avatar_url ~ ('^https://[a-z0-9]+\.supabase\.co/storage/v1/object/public/avatars/' || id::text || '/[A-Za-z0-9._-]{1,100}$')
  ),
  website text not null default '' check (website = '' or website ~ '^https://[^\s"''<>]{3,200}$'),
  instagram text not null default '' check (instagram ~ '^[A-Za-z0-9._]{0,30}$'),
  tiktok text not null default '' check (tiktok ~ '^[A-Za-z0-9._]{0,30}$'),
  youtube text not null default '' check (youtube ~ '^[A-Za-z0-9._-]{0,100}$'),
  x text not null default '' check (x ~ '^[A-Za-z0-9_]{0,15}$'),
  threads text not null default '' check (threads ~ '^[A-Za-z0-9._]{0,30}$'),
  linkedin text not null default '' check (linkedin ~ '^[A-Za-z0-9-]{0,100}$'),
  facebook text not null default '' check (facebook ~ '^[A-Za-z0-9.]{0,50}$'),
  is_public boolean not null default false,
  -- List their public entries that carry a name (not the anonymous ones) on the profile, and
  -- link those entries back to it.
  show_entries boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index public_profiles_username_idx on public.public_profiles (username);

create trigger public_profiles_set_updated_at before update on public.public_profiles
  for each row execute function public.set_updated_at();

alter table public.public_profiles enable row level security;

create policy "Visitors can read public profiles" on public.public_profiles
  for select to anon using (is_public);
create policy "Signed-in people can read public profiles and their own" on public.public_profiles
  for select to authenticated using (is_public or (select auth.uid()) = id or (select public.is_admin()));
create policy "Logged-in people can add their own profile" on public.public_profiles
  for insert to authenticated
  with check (
    (select auth.uid()) = id
    and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
  );
create policy "Logged-in people can edit their own profile" on public.public_profiles
  for update to authenticated
  using ((select auth.uid()) = id or (select public.is_admin()))
  with check (
    ((select auth.uid()) = id and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false)
    or (select public.is_admin())
  );
create policy "People can delete their own profile" on public.public_profiles
  for delete to authenticated using ((select auth.uid()) = id or (select public.is_admin()));

revoke all on public.public_profiles from anon, authenticated;
grant select on public.public_profiles to anon, authenticated;
grant insert, update, delete on public.public_profiles to authenticated;

-- Whether a username is free (ignoring the caller's own). Private profiles' usernames are taken
-- too, but this only says yes or no, never whose it is.
create function public.username_available(name text) returns boolean
language sql stable security definer set search_path = '' as $$
  select not exists (
    select 1 from public.public_profiles p
    where p.username = lower(btrim(name)) and p.id is distinct from auth.uid()
  );
$$;

revoke execute on function public.username_available(text) from public, anon;
grant execute on function public.username_available(text) to authenticated;

-- Avatars: pictures people upload, resized in the browser to a small square. Anyone can view
-- them (the bucket is public); people can only add, replace or remove files in their own folder
-- (avatars/<user id>/...), and only once they've logged in.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 1048576, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

create policy "People can read their own avatar files" on storage.objects
  for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Logged-in people can upload their own avatar" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
  );
create policy "Logged-in people can replace their own avatar" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) = false
  );
create policy "People can remove their own avatar" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Admins can manage avatars" on storage.objects
  for all to authenticated
  using (bucket_id = 'avatars' and (select public.is_admin()))
  with check (bucket_id = 'avatars' and (select public.is_admin()));
