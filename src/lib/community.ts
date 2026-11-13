import { Hand, HeartHandshake, Laugh, Lightbulb, Trophy, type LucideIcon } from 'lucide-react';
import type { Tone } from '@/components/Icon';
import type { Mistake, ReactionId } from './types';

/**
 * Community data: reactions and reports.
 *
 * Everything that reads or writes reactions and reports lives in this file, so moving to a
 * real database (e.g. Supabase) means changing only these functions. Today they use
 * localStorage, which means:
 *   - each visitor's own reactions are remembered on their device, and
 *   - counts are "other people's reactions" (baked into the entry) plus the visitor's own.
 *
 * With Supabase, the natural shape is a `reactions` table (mistake_id, user_id, reaction,
 * unique on all three) and a `reports` table (mistake_id, reporter_id, created_at). Counts
 * would then come from the database instead of `baseReactionCount`.
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
 * Flags an entry for review.
 *
 * TODO(database): send this to the backend instead, e.g.
 *   await supabase.from('reports').insert({ mistake_id: mistakeId });
 * and notify whoever moderates the feed. For now it is only remembered on this device so
 * the "thanks" message stays put when the visitor comes back.
 */
export async function reportMistake(mistakeId: string): Promise<void> {
  const reports = readJSON<StoredReport[]>(REPORTS_KEY, []);
  const list = Array.isArray(reports) ? reports : [];
  if (list.some((r) => r.mistakeId === mistakeId)) return;
  writeJSON(REPORTS_KEY, [...list, { mistakeId, createdAt: new Date().toISOString() }]);
}
