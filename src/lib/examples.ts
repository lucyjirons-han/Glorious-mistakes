import { createClient } from '@supabase/supabase-js';
import { cache } from 'react';
import { SEED_MISTAKES } from './seed';
import { rowToMistake, type MistakeRow } from './supabase';
import type { Mistake } from './types';

/** How often (in seconds) pages pick up changes to the examples made in Supabase. */
export const EXAMPLES_REVALIDATE = 600;

/**
 * The site's example entries: rows in Supabase's `mistakes` table with no owner. Edit them
 * from the admin page or the Supabase dashboard; pages show the changes within
 * EXAMPLES_REVALIDATE seconds.
 *
 * Runs on the server, so example pages and the feed arrive with the entries in their HTML.
 * Falls back to the copies in ./seed.ts when Supabase isn't configured or can't be reached.
 */
export const getExampleMistakes = cache(async (): Promise<Mistake[]> => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return SEED_MISTAKES;

  try {
    const supabase = createClient(url, key, {
      auth: { persistSession: false },
      global: {
        fetch: (input, init) => fetch(input, { ...init, next: { revalidate: EXAMPLES_REVALIDATE } }),
      },
    });
    const { data, error } = await supabase
      .from('mistakes')
      .select('*')
      .is('user_id', null)
      .eq('visibility', 'public')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as MistakeRow[]).map((row) => rowToMistake(row, null));
  } catch (error) {
    console.error('[examples] could not load from Supabase, using the built-in copies', error);
    return SEED_MISTAKES;
  }
});
