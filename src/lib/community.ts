import { Hand, HeartHandshake, Laugh, Lightbulb, Trophy, type LucideIcon } from 'lucide-react';
import type { Tone } from '@/components/Icon';
import { ensureUserId, getSupabase } from './supabase';
import type { Mistake, ReactionId } from './types';

/**
 * Community data: reactions and reports.
 *
 * Reactions are saved by the store (./store.tsx): to Supabase's `reactions` table when it's
 * connected, otherwise in localStorage. Counts are the example entries' baked-in numbers
 * (`baseReactionCount`) plus other people's reactions from the database plus the visitor's own.
 */

export interface Reaction {
  id: ReactionId;
  icon: LucideIcon;
  /** The pastel circle behind the icon. */
  tone: Tone;
  label: string;
}

export const REACTIONS: Reaction[] = [
  { id: 'been-there', icon: Hand, tone: 'sky', label: 'Been there' },
  { id: 'glorious', icon: Laugh, tone: 'lilac', label: 'Glorious' },
  { id: 'lesson-noted', icon: Lightbulb, tone: 'sage', label: 'Lesson noted' },
  { id: 'solidarity', icon: HeartHandshake, tone: 'blush', label: 'Solidarity' },
  { id: 'legendary', icon: Trophy, tone: 'lilac', label: 'Legendary' },
];

const REACTION_IDS = new Set<string>(REACTIONS.map((r) => r.id));

/** The visitor's own reactions, keyed by mistake id. */
export type MyReactions = Record<string, ReactionId[]>;

const REACTIONS_KEY = 'glorious-mistakes:reactions:v2';
/** v1 stored a plain list of mistake ids the visitor had said "been there" to. */
const LEGACY_REACTIONS_KEY = 'glorious-mistakes:reactions:v1';
const REPORTS_KEY = 'glorious-mistakes:reports:v1';

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be full or blocked (private mode); the app still works for this visit.
  }
}

/** Loads the visitor's reactions, carrying over "been there"s saved by earlier versions. */
export function loadMyReactions(): MyReactions {
  const stored = readJSON<unknown>(REACTIONS_KEY, null);
  if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
    const result: MyReactions = {};
    for (const [mistakeId, list] of Object.entries(stored as Record<string, unknown>)) {
      if (!Array.isArray(list)) continue;
      const valid = [...new Set(list)].filter((r): r is ReactionId => REACTION_IDS.has(r as string));
      if (valid.length) result[mistakeId] = valid;
    }
    return result;
  }

  const legacy = readJSON<unknown>(LEGACY_REACTIONS_KEY, []);
  const migrated: MyReactions = {};
  if (Array.isArray(legacy)) {
    for (const id of legacy) if (typeof id === 'string') migrated[id] = ['been-there'];
  }
  return migrated;
}

export function saveMyReactions(reactions: MyReactions) {
  writeJSON(REACTIONS_KEY, reactions);
}

/** Returns a new reactions object with `reaction` added or removed for `mistakeId`. */
export function toggleReactionIn(
  reactions: MyReactions,
  mistakeId: string,
  reaction: ReactionId,
): MyReactions {
  const current = reactions[mistakeId] ?? [];
  const next = current.includes(reaction)
    ? current.filter((r) => r !== reaction)
    : [...current, reaction];
  const { [mistakeId]: _removed, ...rest } = reactions;
  return next.length ? { ...rest, [mistakeId]: next } : rest;
}

/** Reactions from other people, as stored on the entry. */
export function baseReactionCount(mistake: Mistake, reaction: ReactionId): number {
  // Entries saved before reactions existed only have a "been there" count; it carries over.
  if (reaction === 'been-there') return mistake.baseBeenThere;
  return mistake.baseReactions?.[reaction] ?? 0;
}

/* Reports ---------------------------------------------------------------- */

interface StoredReport {
  mistakeId: string;
  createdAt: string;
}

export function hasReported(mistakeId: string): boolean {
  const reports = readJSON<StoredReport[]>(REPORTS_KEY, []);
  return Array.isArray(reports) && reports.some((r) => r.mistakeId === mistakeId);
}

/**
 * Flags an entry for review. With Supabase connected the report lands in the `reports` table
 * (see it in the Supabase dashboard); it's also remembered on this device so the "thanks"
 * message stays put when the visitor comes back.
 *
 * TODO: notify whoever moderates the feed when a report comes in.
 */
export async function reportMistake(mistakeId: string): Promise<void> {
  const reports = readJSON<StoredReport[]>(REPORTS_KEY, []);
  const list = Array.isArray(reports) ? reports : [];
  if (list.some((r) => r.mistakeId === mistakeId)) return;

  const supabase = getSupabase();
  if (supabase) {
    try {
      await ensureUserId(supabase);
      const { error } = await supabase
        .from('reports')
        .upsert({ mistake_id: mistakeId }, { onConflict: 'mistake_id,reporter_id', ignoreDuplicates: true });
      if (error) throw error;
    } catch (error) {
      console.error("Glorious Mistakes: couldn't send the report", error);
    }
  }

  writeJSON(REPORTS_KEY, [...list, { mistakeId, createdAt: new Date().toISOString() }]);
}
