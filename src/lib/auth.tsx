'use client';

import type { Session, User } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { readJSON, writeJSON } from './community';
import { LOGIN_PENDING_KEY, safeNext } from './login';
import { ensureUserId, getSupabase } from './supabase';

/**
 * Who the visitor is: an anonymous visitor (the default, see ./supabase.ts) or someone logged in
 * with Google.
 *
 * Logging in upgrades the anonymous user with `linkIdentity`, so the user id (and every entry and
 * reaction tied to it) stays the same. If the Google account already belongs to someone (they
 * logged in on another device first), linking fails and we sign in to that account instead,
 * then move this browser's anonymous entries across with a one-off code (the
 * `start_account_transfer` / `finish_account_transfer` functions in the database).
 *
 * Logging out starts a fresh anonymous session, so "My mistakes" is empty until they log back in.
 */

export interface Profile {
  firstName: string;
  lastName: string;
}

export const PROFILE_LIMITS = { firstName: 60, lastName: 60 } as const;

/** The code that moves anonymous entries to an existing account, kept while logging in. */
const TRANSFER_KEY = 'glorious-mistakes:transfer:v1';

interface AuthContextValue {
  /** False when Supabase isn't configured: there are no accounts, only device storage. */
  available: boolean;
  /** False until we know who the visitor is (and, when logged in, their profile). */
  ready: boolean;
  /** True when no session could be started, so the site falls back to device storage. */
  failed: boolean;
  /** The visitor's user id, anonymous or not. Null until ready. */
  userId: string | null;
  /** The logged-in account, or null for anonymous visitors. */
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  /** How many entries were moved from this browser into the account at the last login. */
  movedEntries: number;
  clearMovedEntries: () => void;
  /**
   * Goes to Google to log in, coming back to `next`. Pass `link: false` to skip upgrading the
   * anonymous user (used when that failed because the account already exists). Returns an error
   * message if it couldn't start.
   */
  signInWithGoogle: (next: string, options?: { link?: boolean }) => Promise<string | null>;
  signOut: () => Promise<void>;
  saveProfile: (profile: Profile) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function logError(action: string, error: unknown) {
  console.error(`Glorious Mistakes: couldn't ${action}`, error);
}

/** A first guess at someone's name from their Google details. They can change it in Settings. */
function namesFromUser(user: User): Profile {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '');
  let firstName = text(meta.given_name);
  let lastName = text(meta.family_name);
  if (!firstName && !lastName) {
    const [first = '', ...rest] = (text(meta.full_name) || text(meta.name)).split(/\s+/).filter(Boolean);
    firstName = first;
    lastName = rest.join(' ');
  }
  return {
    firstName: firstName.slice(0, PROFILE_LIMITS.firstName),
    lastName: lastName.slice(0, PROFILE_LIMITS.lastName),
  };
}

/** The account's profile, creating it from their Google details the first time. */
async function loadProfile(user: User): Promise<Profile> {
  const supabase = getSupabase()!;
  const { data, error } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', user.id)
    .maybeSingle();
  if (error) throw error;
  const profile = namesFromUser(user);

  if (data) {
    const saved = { firstName: data.first_name, lastName: data.last_name };
    // A profile can be made before Google is linked (e.g. an existing email account), so fill
    // in an empty one once Google's name is available.
    if (saved.firstName || saved.lastName || (!profile.firstName && !profile.lastName)) return saved;
    const { error: fillError } = await supabase
      .from('profiles')
      .update({ first_name: profile.firstName, last_name: profile.lastName })
      .eq('id', user.id);
    if (fillError) throw fillError;
    return profile;
  }

  const { error: insertError } = await supabase
    .from('profiles')
    .upsert({ id: user.id, first_name: profile.firstName, last_name: profile.lastName }, { ignoreDuplicates: true });
  if (insertError) throw insertError;
  return profile;
}

/** Moves this browser's anonymous entries into the account, if a login started a transfer. */
async function finishTransfer(): Promise<number> {
  const token = readJSON<string | null>(TRANSFER_KEY, null);
  if (!token) return 0;
  const { data, error } = await getSupabase()!.rpc('finish_account_transfer', { transfer_token: token });
  writeJSON(TRANSFER_KEY, null);
  if (error) throw error;
  return Number(data) || 0;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = getSupabase();
  /** undefined until Supabase has told us about the stored session. */
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [settled, setSettled] = useState<{ userId: string; profile: Profile | null; isAdmin: boolean } | null>(null);
  const [failed, setFailed] = useState(false);
  const [movedEntries, setMovedEntries] = useState(0);

  useEffect(() => {
    if (!supabase) return;
    // Fires straight away with the stored session (INITIAL_SESSION), then on every change.
    // Supabase calls can't be made inside this callback, so the work happens in the effect below.
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  const sessionUser = session?.user ?? null;
  const userKey = sessionUser ? `${sessionUser.id}:${sessionUser.is_anonymous ? 'anon' : 'account'}` : null;

  useEffect(() => {
    if (!supabase || session === undefined) return;
    let cancelled = false;

    (async () => {
      if (!session) {
        // Nobody is signed in (a first visit, or just logged out): start an anonymous session.
        // onAuthStateChange then brings the new session back through here.
        try {
          await ensureUserId(supabase);
        } catch (error) {
          logError('start a session, so saving to this device only', error);
          if (!cancelled) setFailed(true);
        }
        return;
      }

      const user = session.user;
      if (user.is_anonymous) {
        if (!cancelled) setSettled({ userId: user.id, profile: null, isAdmin: false });
        return;
      }

      try {
        const moved = await finishTransfer();
        if (moved > 0 && !cancelled) setMovedEntries(moved);
      } catch (error) {
        logError('move your entries into your account', error);
      }

      const [profile, admin] = await Promise.all([
        loadProfile(user).catch((error) => {
          logError('load your profile', error);
          return namesFromUser(user);
        }),
        supabase.rpc('is_admin').then(({ data, error }) => !error && data === true),
      ]);
      if (!cancelled) setSettled({ userId: user.id, profile, isAdmin: admin });
    })();

    return () => {
      cancelled = true;
    };
    // Re-run when the person changes (or logs in), not on every token refresh.
  }, [supabase, userKey]);

  const signInWithGoogle = useCallback<AuthContextValue['signInWithGoogle']>(
    async (next, options) => {
      if (!supabase) return 'Logging in isn’t available right now.';
      const redirectTo = `${window.location.origin}/login?next=${encodeURIComponent(safeNext(next))}`;
      try {
        window.sessionStorage.setItem(LOGIN_PENDING_KEY, '1');
      } catch {
        // Storage can be blocked; the login page then just shows "you're logged in".
      }

      const { data } = await supabase.auth.getSession();
      if (data.session?.user.is_anonymous && options?.link !== false) {
        const { data: token, error: tokenError } = await supabase.rpc('start_account_transfer');
        if (tokenError) logError('prepare to move your entries', tokenError);
        else writeJSON(TRANSFER_KEY, token);

        const { error } = await supabase.auth.linkIdentity({ provider: 'google', options: { redirectTo } });
        if (!error) return null; // On the way to Google.
        logError('link your Google account', error);
      }

      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
      if (error) {
        logError('start logging in with Google', error);
        return 'We couldn’t reach Google just now. Please try again.';
      }
      return null;
    },
    [supabase],
  );

  const signOut = useCallback(async () => {
    if (!supabase) return;
    setSettled(null);
    // Only this browser: their other devices stay logged in.
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) logError('log you out', error);
  }, [supabase]);

  const saveProfile = useCallback(
    async (profile: Profile) => {
      if (!supabase || !settled) throw new Error('Not logged in');
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: settled.userId, first_name: profile.firstName, last_name: profile.lastName });
      if (error) throw error;
      setSettled((prev) => (prev ? { ...prev, profile } : prev));
    },
    [supabase, settled],
  );

  const clearMovedEntries = useCallback(() => setMovedEntries(0), []);

  // Only trust the settled state once it matches the current session.
  const current = settled && sessionUser && settled.userId === sessionUser.id ? settled : null;
  const isAccount = !!sessionUser && !sessionUser.is_anonymous;
  const ready = !supabase || failed || (!!current && (!isAccount || current.profile !== null));

  const value = useMemo<AuthContextValue>(
    () => ({
      available: !!supabase,
      ready,
      failed,
      userId: current?.userId ?? null,
      user: current && isAccount ? sessionUser : null,
      profile: current && isAccount ? current.profile : null,
      isAdmin: !!current && isAccount && current.isAdmin,
      movedEntries,
      clearMovedEntries,
      signInWithGoogle,
      signOut,
      saveProfile,
    }),
    [supabase, ready, failed, current, isAccount, sessionUser, movedEntries, clearMovedEntries, signInWithGoogle, signOut, saveProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

/** Initials for the account button, e.g. "LI". */
export function initialsFor(profile: Profile | null, user: User | null): string {
  const fromName = `${profile?.firstName.charAt(0) ?? ''}${profile?.lastName.charAt(0) ?? ''}`;
  return (fromName || user?.email?.charAt(0) || '?').toUpperCase();
}

/** The name to greet someone by. */
export function displayName(profile: Profile | null, user: User | null): string {
  const name = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ');
  return name || user?.email || 'your account';
}
