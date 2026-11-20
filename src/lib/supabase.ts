import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { normaliseCategory } from './constants';
import type { CringeLevel, Mistake, MistakeInput, Visibility } from './types';

/**
 * The browser's Supabase client, or null when the env vars aren't set (the site then falls
 * back to keeping everything in localStorage). Visitors are signed in anonymously so they can
 * read and react; logging a mistake needs a Google login (row level security checks it), and
 * row level security keeps each person's private entries to them.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let client: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  client = url && key ? createClient(url, key) : null;
  return client;
}

let pendingUserId: Promise<string> | null = null;

/**
 * Returns the visitor's user id, signing them in anonymously the first time. Calls that
 * overlap share one sign-in, so a page can't create two anonymous users at once.
 */
export function ensureUserId(supabase: SupabaseClient): Promise<string> {
  pendingUserId ??= (async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) return data.session.user.id;
    const { data: signedIn, error } = await supabase.auth.signInAnonymously();
    if (error || !signedIn.user) throw error ?? new Error('Anonymous sign-in failed');
    return signedIn.user.id;
  })().finally(() => {
    pendingUserId = null;
  });
  return pendingUserId;
}

/** A row of the `mistakes` table. */
export interface MistakeRow {
  id: string;
  /** Null for the site's example entries. */
  user_id: string | null;
  title: string;
  what_happened: string;
  lesson: string;
  category: string;
  cringe: number;
  visibility: Visibility;
  author: string;
  created_at: string;
  /** Made-up starting counts for example entries, e.g. {"been-there": 248}. */
  base_reactions?: Record<string, number> | null;
}

export function rowToMistake(row: MistakeRow, userId: string | null): Mistake {
  const { 'been-there': beenThere = 0, ...otherBase } = row.base_reactions ?? {};
  return {
    id: row.id,
    title: row.title,
    whatHappened: row.what_happened,
    lesson: row.lesson,
    category: normaliseCategory(row.category),
    cringe: Math.min(5, Math.max(1, row.cringe)) as CringeLevel,
    visibility: row.visibility,
    author: row.author,
    createdAt: row.created_at,
    baseBeenThere: Number(beenThere) || 0,
    baseReactions: otherBase as Mistake['baseReactions'],
    mine: userId !== null && row.user_id === userId,
  };
}

export function inputToRow(input: MistakeInput) {
  return {
    title: input.title,
    what_happened: input.whatHappened,
    lesson: input.lesson,
    category: input.category,
    cringe: input.cringe,
    visibility: input.visibility,
    author: input.author,
  };
}
