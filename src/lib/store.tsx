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
import type { Mistake, MistakeInput, ReactionId, Visibility } from './types';

/**
 * Client-side store for the visitor's own mistakes and their reactions.
 * Data lives in localStorage, so everything stays on this device. Reaction and report
 * storage lives in ./community.ts; swap those helpers for API calls to back it with a
 * real database.
 */

const MINE_KEY = 'glorious-mistakes:mine:v1';

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
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

interface MistakesContextValue {
  /** False until saved data has been loaded from the device. */
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
  const [mine, setMine] = useState<Mistake[]>([]);
  const [reactions, setReactions] = useState<MyReactions>({});

  useEffect(() => {
    const storedMine = readJSON<Mistake[]>(MINE_KEY, []);
    setMine(
      Array.isArray(storedMine)
        ? storedMine.map((m) => ({ ...m, category: normaliseCategory(m.category) }))
        : [],
    );
    setReactions(loadMyReactions());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) writeJSON(MINE_KEY, mine);
  }, [ready, mine]);

  useEffect(() => {
    if (ready) saveMyReactions(reactions);
  }, [ready, reactions]);

  const addMistake = useCallback((input: MistakeInput) => {
    const mistake: Mistake = {
      ...clean(input),
      id: makeId(),
      createdAt: new Date().toISOString(),
      baseBeenThere: 0,
      mine: true,
    };
    setMine((prev) => [mistake, ...prev]);
    return mistake;
  }, []);

  const updateMistake = useCallback((id: string, input: MistakeInput) => {
    setMine((prev) => prev.map((m) => (m.id === id ? { ...m, ...clean(input) } : m)));
  }, []);

  const setVisibility = useCallback((id: string, visibility: Visibility) => {
    setMine((prev) => prev.map((m) => (m.id === id ? { ...m, visibility } : m)));
  }, []);

  const deleteMistake = useCallback((id: string) => {
    setMine((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const toggleReaction = useCallback((id: string, reaction: ReactionId) => {
    setReactions((prev) => toggleReactionIn(prev, id, reaction));
  }, []);

  const value = useMemo<MistakesContextValue>(() => {
    const has = (id: string, reaction: ReactionId) => reactions[id]?.includes(reaction) ?? false;
    const count = (m: Mistake, reaction: ReactionId) =>
      baseReactionCount(m, reaction) + (has(m.id, reaction) ? 1 : 0);
    const sortedMine = [...mine].sort(byNewest);
    return {
      ready,
      mine: sortedMine,
      publicFeed: [...sortedMine.filter((m) => m.visibility === 'public'), ...SEED_MISTAKES].sort(
        byNewest,
      ),
      getMine: (id) => mine.find((m) => m.id === id),
      getMistake: (id) => mine.find((m) => m.id === id) ?? SEED_MISTAKES.find((m) => m.id === id),
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
  }, [ready, mine, reactions, addMistake, updateMistake, setVisibility, deleteMistake, toggleReaction]);

  return <MistakesContext.Provider value={value}>{children}</MistakesContext.Provider>;
}

export function useMistakes(): MistakesContextValue {
  const ctx = useContext(MistakesContext);
  if (!ctx) throw new Error('useMistakes must be used inside <MistakesProvider>');
  return ctx;
}
