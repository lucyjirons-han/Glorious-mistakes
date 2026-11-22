-- The avatar address check used a {1,900} repeat, but Postgres regular expressions only allow
-- up to 255, so every non-empty address failed. The length now has its own check.
alter table public.public_profiles drop constraint public_profiles_check;
alter table public.public_profiles add constraint public_profiles_avatar_url_check check (
  char_length(avatar_url) <= 1000
  and (
    avatar_url = ''
    or avatar_url ~ '^https://[a-z0-9-]+\.googleusercontent\.com/[^\s"''<>]+$'
    or avatar_url ~ ('^https://[a-z0-9]+\.supabase\.co/storage/v1/object/public/avatars/' || id::text || '/[A-Za-z0-9._-]{1,100}$')
  )
);
