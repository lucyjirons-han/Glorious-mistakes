import { createClient } from '@supabase/supabase-js';
import { cache } from 'react';
import { avatarSrc, PROFILE_COLUMNS, rowToProfile, USERNAME_PATTERN, type PublicProfile, type PublicProfileRow } from './profiles';
import { isStyleId, type StyleId } from './quiz';
import { rowToMistake, type MistakeRow } from './supabase';
import type { Mistake } from './types';

/** How many of someone's entries their profile lists. */
const PROFILE_ENTRY_LIMIT = 60;

/**
 * Loads public profiles on the server, as a signed-out visitor, so only profiles marked public
 * come back (row level security). Never cached: changes show as soon as someone saves.
 */
function serverClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }) },
  });
}

export interface ProfilePageData {
  profile: PublicProfile;
  /** Their public entries that carry a name (anonymous ones never appear), newest first. */
  entries: Mistake[];
  /** Their latest mistake style, when they've chosen to show it on their profile. */
  quizStyle: StyleId | null;
}

export const getProfilePage = cache(async (username: string): Promise<ProfilePageData | null> => {
  const name = username.toLowerCase();
  if (!USERNAME_PATTERN.test(name)) return null;
  const supabase = serverClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('public_profiles')
    .select(PROFILE_COLUMNS)
    .eq('username', name)
    .eq('is_public', true)
    .maybeSingle();
  if (error) {
    console.error('[profiles] could not load a profile', error.code, error.message);
    return null;
  }
  if (!data) return null;
  const profile = rowToProfile(data as PublicProfileRow);

  let entries: Mistake[] = [];
  if (profile.showEntries) {
    const { data: rows, error: entriesError } = await supabase
      .from('mistakes')
      .select('*')
      .eq('user_id', profile.id)
      .eq('visibility', 'public')
      .neq('author', '')
      .order('created_at', { ascending: false })
      .limit(PROFILE_ENTRY_LIMIT);
    if (entriesError) console.error('[profiles] could not load entries', entriesError.code, entriesError.message);
    entries = ((rows ?? []) as MistakeRow[])
      .map((row) => rowToMistake(row, null))
      .filter((m) => m.author.trim())
      .map((m) => ({ ...m, authorProfile: { username: profile.username, avatarUrl: avatarSrc(profile) } }));
  }

  let quizStyle: StyleId | null = null;
  if (profile.showQuizStyle) {
    const { data: style, error: styleError } = await supabase.rpc('profile_quiz_style', { profile_id: profile.id });
    if (styleError) console.error('[profiles] could not load the mistake style', styleError.code, styleError.message);
    if (isStyleId(style)) quizStyle = style;
  }

  return { profile, entries, quizStyle };
});

