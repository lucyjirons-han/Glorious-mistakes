'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  baseReactionCount,
  loadMyReactions,
  readJSON,
  saveMyReactions,
  toggleReactionIn,
  writeJSON,
  type MyReactions,
} from './community';
import { normaliseCategory } from './constants';
import { SEED_MISTAKES } from './seed';
import { ensureUserId, getSupabase, inputToRow, rowToMistake, type MistakeRow } from './supabase';
import type { Mistake, MistakeInput, ReactionId, Visibility } from './types';

/**
 * Client-side store for the visitor's own mistakes, other people's public entries and
 * reactions.
 *
 * With Supabase configured (see ./supabase.ts) the visitor is signed in anonymously and
 * everything is saved to the database. Entries saved on the device by earlier versions are
 * uploaded once. Without Supabase, or if it can't be reached, data stays in localStorage.
 * Writes update the screen straight away and are sent to the database in the background.
 */

const MINE_KEY = 'glorious-mistakes:mine:v1';
/** Set once this device's localStorage entries have been uploaded to the database. */
const UPLOADED_KEY = 'glorious-mistakes:uploaded:v1';
/** How many of other people's public entries to load into the feed. */
const FEED_LIMIT = 200;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  // Fallback v4 UUID, so ids are valid in the database too.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function clean(input: MistakeInput): MistakeInput {
  return {
    ...input,
    title: input.title.trim(),
    whatHappened: input.whatHappened.trim(),
    lesson: input.lesson.trim(),
    author: input.author.trim(),
  };
}

const byNewest = (a: Mistake, b: Mistake) => b.createdAt.localeCompare(a.createdAt);

/** Other people's reactions from the database, keyed by mistake id. */
type ReactionCounts = Record<string, Partial<Record<ReactionId, number>>>;

function loadLocalMine(): Mistake[] {
  const stored = readJSON<Mistake[]>(MINE_KEY, []);
  return Array.isArray(stored)
    ? stored.map((m) => ({ ...m, category: normaliseCategory(m.category) }))
    : [];
}

function logError(action: string, error: unknown) {
  console.error(`Glorious Mistakes: couldn't ${action}`, error);
}

/**
 * Uploads entries and reactions saved on this device by earlier versions, once.
 * Old entries may have non-UUID ids, so those get new ids (and their reactions follow).
 */
async function uploadLocalData(userId: string) {
  const supabase = getSupabase();
  if (!supabase || readJSON<boolean>(UPLOADED_KEY, false)) return;

  const idMap = new Map<string, string>();
  const rows = loadLocalMine().map((m) => {
    const id = UUID.test(m.id) ? m.id : makeId();
    idMap.set(m.id, id);
    return { id, user_id: userId, created_at: m.createdAt, ...inputToRow(clean(m)) };
  });
  if (rows.length) {
    const { error } = await supabase.from('mistakes').upsert(rows, { ignoreDuplicates: true });
    if (error) throw error;
  }

  const reactionRows = Object.entries(loadMyReactions()).flatMap(([mistakeId, list]) =>
    list.map((reaction) => ({
      mistake_id: idMap.get(mistakeId) ?? mistakeId,
      user_id: userId,
      reaction,
    })),
  );
  if (reactionRows.length) {
    const { error } = await supabase
      .from('reactions')
      .upsert(reactionRows, { ignoreDuplicates: true });
    if (error) throw error;
  }

  writeJSON(UPLOADED_KEY, true);
}

interface RemoteData {
  mine: Mistake[];
  others: Mistake[];
  reactions: MyReactions;
  counts: ReactionCounts;
}

async function fetchRemote(): Promise<RemoteData | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const userId = await ensureUserId(supabase);
  await uploadLocalData(userId);

  const [mineRes, othersRes, reactionsRes] = await Promise.all([
    supabase.from('mistakes').select('*').eq('user_id', userId),
    supabase
      .from('mistakes')
      .select('*')
      .eq('visibility', 'public')
      .neq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(FEED_LIMIT),
    supabase.from('reactions').select('mistake_id, reaction').eq('user_id', userId),
  ]);
  if (mineRes.error) throw mineRes.error;
  if (othersRes.error) throw othersRes.error;
  if (reactionsRes.error) throw reactionsRes.error;

  const mine = (mineRes.data as MistakeRow[]).map((r) => rowToMistake(r, userId));
  const others = (othersRes.data as MistakeRow[]).map((r) => rowToMistake(r, userId));

  const reactions: MyReactions = {};
  for (const { mistake_id, reaction } of reactionsRes.data as {
    mistake_id: string;
    reaction: ReactionId;
  }[]) {
    (reactions[mistake_id] ??= []).push(reaction);
  }

  const ids = [...mine, ...others, ...SEED_MISTAKES].map((m) => m.id);
  const countsRes = await supabase.rpc('reaction_counts', { mistake_ids: ids });
  if (countsRes.error) throw countsRes.error;

  // Keep other people's reactions only; the visitor's own are added on top when counting.
  const counts: ReactionCounts = {};
  for (const { mistake_id, reaction, total } of countsRes.data as {
    mistake_id: string;
    reaction: ReactionId;
    total: number;
  }[]) {
    const own = reactions[mistake_id]?.includes(reaction) ? 1 : 0;
    (counts[mistake_id] ??= {})[reaction] = Math.max(0, Number(total) - own);
  }

  return { mine, others, reactions, counts };
}

interface MistakesContextValue {
  /** False until saved data has been loaded (from the database or the device). */
  ready: boolean;
  mine: Mistake[];
  publicFeed: Mistake[];
  getMine: (id: string) => Mistake | undefined;
  /** Any entry the visitor can open: their own (public or private) or a public one. */
  getMistake: (id: string) => Mistake | undefined;
  addMistake: (input: MistakeInput) => Mistake;
  updateMistake: (id: string, input: MistakeInput) => void;
  setVisibility: (id: string, visibility: Visibility) => void;
  deleteMistake: (id: string) => void;
  hasReaction: (id: string, reaction: ReactionId) => boolean;
  toggleReaction: (id: string, reaction: ReactionId) => void;
  reactionCount: (mistake: Mistake, reaction: ReactionId) => number;
  /** Shorthands for the "been there" reaction shown on cards. */
  hasReacted: (id: string) => boolean;
  toggleBeenThere: (id: string) => void;
  beenThereCount: (mistake: Mistake) => number;
}

const MistakesContext = createContext<MistakesContextValue | null>(null);

export function MistakesProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  /** 'remote' once the database has loaded; 'local' when using device storage. */
  const [mode, setMode] = useState<'remote' | 'local'>('local');
  const [mine, setMine] = useState<Mistake[]>([]);
  const [others, setOthers] = useState<Mistake[]>([]);
  const [reactions, setReactions] = useState<MyReactions>({});
  const [counts, setCounts] = useState<ReactionCounts>({});

  const applyRemote = useCallback((data: RemoteData) => {
    setMine(data.mine);
    setOthers(data.others);
    setReactions(data.reactions);
    setCounts(data.counts);
  }, []);

  /** After a failed write, logs it and reloads from the database so the screen shows the truth. */
  const resync = useCallback(
    (action: string, error: unknown) => {
      logError(action, error);
      fetchRemote()
        .then((data) => data && applyRemote(data))
        .catch((e) => logError('reload data', e));
    },
    [applyRemote],
  );

  useEffect(() => {
    let cancelled = false;
    const loadFromDevice = () => {
      setMine(loadLocalMine());
      setReactions(loadMyReactions());
    };
    fetchRemote()
      .then((data) => {
        if (cancelled) return;
        if (data) {
          applyRemote(data);
          setMode('remote');
        } else {
          loadFromDevice();
        }
      })
      .catch((error) => {
        if (cancelled) return;
        logError('reach the database, so saving to this device only', error);
        loadFromDevice();
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [applyRemote]);

  // Device storage is only written in local mode; with the database, that's the source of truth.
  useEffect(() => {
    if (ready && mode === 'local') writeJSON(MINE_KEY, mine);
  }, [ready, mode, mine]);

  useEffect(() => {
    if (ready && mode === 'local') saveMyReactions(reactions);
  }, [ready, mode, reactions]);

  const remote = mode === 'remote' ? getSupabase() : null;

  const addMistake = useCallback(
    (input: MistakeInput) => {
      const mistake: Mistake = {
        ...clean(input),
        id: makeId(),
        createdAt: new Date().toISOString(),
        baseBeenThere: 0,
        mine: true,
      };
      setMine((prev) => [mistake, ...prev]);
      remote
        ?.from('mistakes')
        .insert({ id: mistake.id, created_at: mistake.createdAt, ...inputToRow(mistake) })
        .then(({ error }) => error && resync('save your mistake', error));
      return mistake;
    },
    [remote, resync],
  );

  const updateMistake = useCallback(
    (id: string, input: MistakeInput) => {
      const cleaned = clean(input);
      setMine((prev) => prev.map((m) => (m.id === id ? { ...m, ...cleaned } : m)));
      remote
        ?.from('mistakes')
        .update(inputToRow(cleaned))
        .eq('id', id)
        .then(({ error }) => error && resync('update your mistake', error));
    },
    [remote, resync],
  );

  const setVisibility = useCallback(
    (id: string, visibility: Visibility) => {
      setMine((prev) => prev.map((m) => (m.id === id ? { ...m, visibility } : m)));
      remote
        ?.from('mistakes')
        .update({ visibility })
        .eq('id', id)
        .then(({ error }) => error && resync('change who can see your mistake', error));
    },
    [remote, resync],
  );

  const deleteMistake = useCallback(
    (id: string) => {
      setMine((prev) => prev.filter((m) => m.id !== id));
      remote
        ?.from('mistakes')
        .delete()
        .eq('id', id)
        .then(({ error }) => error && resync('delete your mistake', error));
    },
    [remote, resync],
  );

  const toggleReaction = useCallback(
    (id: string, reaction: ReactionId) => {
      const had = reactions[id]?.includes(reaction) ?? false;
      setReactions((prev) => toggleReactionIn(prev, id, reaction));
      if (!remote) return;
      const request = had
        ? remote.from('reactions').delete().match({ mistake_id: id, reaction })
        : remote
            .from('reactions')
            .upsert({ mistake_id: id, reaction }, { ignoreDuplicates: true });
      request.then(({ error }) => error && resync('save your reaction', error));
    },
    [reactions, remote, resync],
  );

  const value = useMemo<MistakesContextValue>(() => {
    const has = (id: string, reaction: ReactionId) => reactions[id]?.includes(reaction) ?? false;
    const count = (m: Mistake, reaction: ReactionId) =>
      baseReactionCount(m, reaction) +
      (counts[m.id]?.[reaction] ?? 0) +
      (has(m.id, reaction) ? 1 : 0);
    const sortedMine = [...mine].sort(byNewest);
    return {
      ready,
      mine: sortedMine,
      publicFeed: [
        ...sortedMine.filter((m) => m.visibility === 'public'),
        ...others,
        ...SEED_MISTAKES,
      ].sort(byNewest),
      getMine: (id) => mine.find((m) => m.id === id),
      getMistake: (id) =>
        mine.find((m) => m.id === id) ??
        others.find((m) => m.id === id) ??
        SEED_MISTAKES.find((m) => m.id === id),
      addMistake,
      updateMistake,
      setVisibility,
      deleteMistake,
      hasReaction: has,
      toggleReaction,
      reactionCount: count,
      hasReacted: (id) => has(id, 'been-there'),
      toggleBeenThere: (id) => toggleReaction(id, 'been-there'),
      beenThereCount: (m) => count(m, 'been-there'),
    };
  }, [
    ready,
    mine,
    others,
    reactions,
    counts,
    addMistake,
    updateMistake,
    setVisibility,
    deleteMistake,
    toggleReaction,
  ]);

  return <MistakesContext.Provider value={value}>{children}</MistakesContext.Provider>;
}

export function useMistakes(): MistakesContextValue {
  const ctx = useContext(MistakesContext);
  if (!ctx) throw new Error('useMistakes must be used inside <MistakesProvider>');
  return ctx;
}
