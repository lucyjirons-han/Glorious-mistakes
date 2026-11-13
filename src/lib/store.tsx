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
import { SEED_MISTAKES } from './seed';
import type { Mistake, MistakeInput, Visibility } from './types';

/**
 * Client-side store for the visitor's own mistakes and their "been there" reactions.
 * Data lives in localStorage, so everything stays on this device. Swap the read/write
 * helpers for API calls to back it with a real database.
 */

const MINE_KEY = 'glorious-mistakes:mine:v1';
const REACTIONS_KEY = 'glorious-mistakes:reactions:v1';

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be full or blocked (private mode); the app still works for this visit.
  }
}

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
  addMistake: (input: MistakeInput) => Mistake;
  updateMistake: (id: string, input: MistakeInput) => void;
  setVisibility: (id: string, visibility: Visibility) => void;
  deleteMistake: (id: string) => void;
  hasReacted: (id: string) => boolean;
  toggleBeenThere: (id: string) => void;
  beenThereCount: (mistake: Mistake) => number;
}

const MistakesContext = createContext<MistakesContextValue | null>(null);

export function MistakesProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [mine, setMine] = useState<Mistake[]>([]);
  const [reactions, setReactions] = useState<string[]>([]);

  useEffect(() => {
    const storedMine = readJSON<Mistake[]>(MINE_KEY, []);
    const storedReactions = readJSON<string[]>(REACTIONS_KEY, []);
    setMine(Array.isArray(storedMine) ? storedMine : []);
    setReactions(Array.isArray(storedReactions) ? storedReactions : []);
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) writeJSON(MINE_KEY, mine);
  }, [ready, mine]);

  useEffect(() => {
    if (ready) writeJSON(REACTIONS_KEY, reactions);
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

  const toggleBeenThere = useCallback((id: string) => {
    setReactions((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));
  }, []);

  const value = useMemo<MistakesContextValue>(() => {
    const reactionSet = new Set(reactions);
    const sortedMine = [...mine].sort(byNewest);
    return {
      ready,
      mine: sortedMine,
      publicFeed: [...sortedMine.filter((m) => m.visibility === 'public'), ...SEED_MISTAKES].sort(
        byNewest,
      ),
      getMine: (id) => mine.find((m) => m.id === id),
      addMistake,
      updateMistake,
      setVisibility,
      deleteMistake,
      hasReacted: (id) => reactionSet.has(id),
      toggleBeenThere,
      beenThereCount: (m) => m.baseBeenThere + (reactionSet.has(m.id) ? 1 : 0),
    };
  }, [ready, mine, reactions, addMistake, updateMistake, setVisibility, deleteMistake, toggleBeenThere]);

  return <MistakesContext.Provider value={value}>{children}</MistakesContext.Provider>;
}

export function useMistakes(): MistakesContextValue {
  const ctx = useContext(MistakesContext);
  if (!ctx) throw new Error('useMistakes must be used inside <MistakesProvider>');
  return ctx;
}
