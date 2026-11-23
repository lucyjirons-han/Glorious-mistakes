'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '@/components/Toast';
import { useAuth } from './auth';
import { readJSON, writeJSON } from './community';
import { isStyleId, QUIZ_VERSION, STYLE_IDS, type QuizResult, type QuizScores } from './quiz';
import { getSupabase } from './supabase';

/**
 * Where quiz results live.
 *
 * - Guests (and the device-storage fallback) keep only their latest result, in localStorage.
 *   Retaking replaces it.
 * - Logged-in people save every result to Supabase's `quiz_results` table, so they can retake
 *   the quiz later and see whether their style shifts. Row level security only lets
 *   non-anonymous sessions add results.
 * - When someone logs in with a result still on this device, it's saved to their account with
 *   its original date and cleared from the device. That's what "Save this" on the result does:
 *   it sends them to log in, and this hook does the rest when they come back.
 */

const LOCAL_KEY = 'glorious-mistakes:quiz-result:v1';

export interface SavedQuizResult extends QuizResult {
  id: number;
}

interface QuizResultRow {
  id: number;
  style: string;
  scores: unknown;
  quiz_version: number;
  taken_at: string;
}

function logError(action: string, error: unknown) {
  console.error(`Glorious Mistakes: couldn't ${action}`, error);
}

function cleanScores(value: unknown): QuizScores {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return Object.fromEntries(
    STYLE_IDS.map((id) => [id, typeof source[id] === 'number' ? (source[id] as number) : 0]),
  ) as QuizScores;
}

function readLocal(): QuizResult | null {
  const stored = readJSON<Partial<QuizResult> | null>(LOCAL_KEY, null);
  if (!stored || !isStyleId(stored.style) || typeof stored.takenAt !== 'string') return null;
  if (Number.isNaN(new Date(stored.takenAt).getTime())) return null;
  return {
    style: stored.style,
    scores: cleanScores(stored.scores),
    version: typeof stored.version === 'number' ? stored.version : QUIZ_VERSION,
    takenAt: stored.takenAt,
  };
}

function rowToResult(row: QuizResultRow): SavedQuizResult | null {
  if (!isStyleId(row.style)) return null;
  return {
    id: row.id,
    style: row.style,
    scores: cleanScores(row.scores),
    version: row.quiz_version,
    takenAt: row.taken_at,
  };
}

async function insertResult(result: QuizResult): Promise<SavedQuizResult> {
  const { data, error } = await getSupabase()!
    .from('quiz_results')
    .insert({
      style: result.style,
      scores: result.scores,
      quiz_version: result.version,
      taken_at: result.takenAt,
    })
    .select('id, style, scores, quiz_version, taken_at')
    .single();
  if (error) throw error;
  const saved = rowToResult(data as QuizResultRow);
  if (!saved) throw new Error('Unexpected quiz result');
  return saved;
}

async function loadHistory(): Promise<SavedQuizResult[]> {
  const { data, error } = await getSupabase()!
    .from('quiz_results')
    .select('id, style, scores, quiz_version, taken_at')
    .order('taken_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return ((data ?? []) as QuizResultRow[]).flatMap((row) => rowToResult(row) ?? []);
}

/**
 * Saving the device's result to the account happens once, even if several components (or React's
 * development double effects) ask at the same moment.
 */
let pendingMove: Promise<boolean> | null = null;

function moveLocalResultToAccount(): Promise<boolean> {
  pendingMove ??= (async () => {
    const local = readLocal();
    if (!local) return false;
    await insertResult(local);
    writeJSON(LOCAL_KEY, null);
    return true;
  })().finally(() => {
    pendingMove = null;
  });
  return pendingMove;
}

export interface QuizResults {
  /** False until the visitor's results have been read. */
  ready: boolean;
  /** True when results can be saved to an account (Supabase is set up and reachable). */
  accountsAvailable: boolean;
  /** True when the visitor is logged in, so results are saved to their account. */
  hasAccount: boolean;
  /** The most recent result, wherever it's kept. */
  latest: QuizResult | null;
  /** Results saved to the account, newest first. Empty for guests. */
  history: SavedQuizResult[];
  /** Keeps a result that was just taken. */
  record: (result: QuizResult) => Promise<void>;
  /** Deletes a saved result from the account. */
  remove: (id: number) => Promise<void>;
}

export function useQuizResults(): QuizResults {
  const auth = useAuth();
  const toast = useToast();
  const accountsAvailable = auth.available && !auth.failed;
  const hasAccount = accountsAvailable && !!auth.user;
  const [local, setLocal] = useState<QuizResult | null>(null);
  const [history, setHistory] = useState<SavedQuizResult[]>([]);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const key = auth.ready ? `${auth.userId ?? 'device'}:${hasAccount ? 'account' : 'guest'}` : null;

  useEffect(() => {
    if (!key) return;
    let cancelled = false;

    (async () => {
      let saved: SavedQuizResult[] = [];
      if (hasAccount) {
        try {
          if (await moveLocalResultToAccount()) toast('Saved your mistake style to your account');
        } catch (error) {
          logError('save your quiz result to your account', error);
        }
        try {
          saved = await loadHistory();
        } catch (error) {
          logError('load your quiz results', error);
        }
      }
      if (cancelled) return;
      setLocal(readLocal());
      setHistory(saved);
      setLoadedFor(key);
    })();

    return () => {
      cancelled = true;
    };
    // toast is stable; re-run when the visitor changes or logs in.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, hasAccount]);

  const record = useCallback(
    async (result: QuizResult) => {
      if (hasAccount) {
        try {
          const saved = await insertResult(result);
          setHistory((prev) => [saved, ...prev]);
          return;
        } catch (error) {
          // Keep it on the device; it's saved to the account next time the results are read.
          logError('save your quiz result', error);
        }
      }
      writeJSON(LOCAL_KEY, result);
      setLocal(result);
    },
    [hasAccount],
  );

  const remove = useCallback(async (id: number) => {
    const { error } = await getSupabase()!.from('quiz_results').delete().eq('id', id);
    if (error) throw error;
    setHistory((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const latest = useMemo(() => {
    const newest = history[0] ?? null;
    if (!local) return newest;
    if (!newest) return local;
    return new Date(local.takenAt) > new Date(newest.takenAt) ? local : newest;
  }, [local, history]);

  return {
    ready: !!key && loadedFor === key,
    accountsAvailable,
    hasAccount,
    latest,
    history,
    record,
    remove,
  };
}

/** A calendar file with an all-day reminder to retake the quiz, for "Add to my calendar". */
export function retakeReminderFile(date: Date, quizUrl: string): Blob {
  const pad = (n: number) => String(n).padStart(2, '0');
  const day = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const next = new Date(date);
  next.setDate(next.getDate() + 1);
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Glorious Mistakes//Mistake style quiz//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:quiz-retake-${day(date)}-${Math.random().toString(36).slice(2)}@glorious-mistakes`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${day(date)}`,
    `DTEND;VALUE=DATE:${day(next)}`,
    'SUMMARY:Retake the mistake style quiz',
    `DESCRIPTION:Three months on. Has your mistake style shifted? ${quizUrl}`,
    `URL:${quizUrl}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return new Blob([lines.join('\r\n') + '\r\n'], { type: 'text/calendar;charset=utf-8' });
}
