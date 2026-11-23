import type { User } from '@supabase/supabase-js';
import { ensureUserId, getSupabase } from './supabase';
import { AtSign, Facebook, Globe, Instagram, Linkedin, Music2, Twitter, Youtube, type LucideIcon } from 'lucide-react';

/**
 * Public profiles: an optional page at /u/<username> (see the `public_profiles` table in
 * supabase/migrations). People choose a username, and can add a display name, pronouns, a short
 * bio, an avatar (their Google photo, a picture they upload, or initials) and links to their
 * website and social accounts.
 *
 * Social accounts are saved as handles and the links are built here, so a profile can only ever
 * link to the real site. The database checks the same rules (lengths, characters, avatar hosts).
 */

export const PROFILE_FIELD_LIMITS = { username: 30, displayName: 50, pronouns: 30, bio: 300, website: 200 } as const;

export const USERNAME_PATTERN = /^[a-z0-9_]{3,30}$/;

/** Site paths and names that could pass as official. Kept in step with the database check. */
const RESERVED_USERNAMES = new Set([
  'about', 'admin', 'administrator', 'anonymous', 'api', 'faq', 'feed', 'glorious',
  'gloriousmistakes', 'glorious_mistakes', 'guidelines', 'help', 'learn', 'log', 'login',
  'logout', 'me', 'mine', 'mistakes', 'mod', 'moderator', 'null', 'official', 'profile',
  'root', 'search', 'settings', 'staff', 'support', 'system', 'team', 'undefined', 'you',
]);

export type AvatarSource = 'google' | 'upload' | 'initials';

export type SocialId = 'instagram' | 'tiktok' | 'youtube' | 'x' | 'threads' | 'linkedin' | 'facebook';

export interface SocialPlatform {
  id: SocialId;
  label: string;
  icon: LucideIcon;
  /** Shown before the handle in the form, e.g. "tiktok.com/@". */
  prefix: string;
  /** The domains a pasted link can come from. */
  domains: string[];
  pattern: RegExp;
  /** Plain-English rule for the error message. */
  rule: string;
  href: (handle: string) => string;
  /** How the handle is shown on the profile. */
  show: (handle: string) => string;
}

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    id: 'instagram',
    label: 'Instagram',
    icon: Instagram,
    prefix: 'instagram.com/',
    domains: ['instagram.com'],
    pattern: /^[A-Za-z0-9._]{1,30}$/,
    rule: 'up to 30 letters, numbers, full stops and underscores',
    href: (h) => `https://www.instagram.com/${h}/`,
    show: (h) => `@${h}`,
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    icon: Music2,
    prefix: 'tiktok.com/@',
    domains: ['tiktok.com'],
    pattern: /^[A-Za-z0-9._]{1,30}$/,
    rule: 'up to 30 letters, numbers, full stops and underscores',
    href: (h) => `https://www.tiktok.com/@${h}`,
    show: (h) => `@${h}`,
  },
  {
    id: 'youtube',
    label: 'YouTube',
    icon: Youtube,
    prefix: 'youtube.com/@',
    domains: ['youtube.com'],
    pattern: /^[A-Za-z0-9._-]{1,100}$/,
    rule: 'letters, numbers, full stops, hyphens and underscores',
    href: (h) => `https://www.youtube.com/@${h}`,
    show: (h) => `@${h}`,
  },
  {
    id: 'x',
    label: 'X (Twitter)',
    icon: Twitter,
    prefix: 'x.com/',
    domains: ['x.com', 'twitter.com'],
    pattern: /^[A-Za-z0-9_]{1,15}$/,
    rule: 'up to 15 letters, numbers and underscores',
    href: (h) => `https://x.com/${h}`,
    show: (h) => `@${h}`,
  },
  {
    id: 'threads',
    label: 'Threads',
    icon: AtSign,
    prefix: 'threads.net/@',
    domains: ['threads.net', 'threads.com'],
    pattern: /^[A-Za-z0-9._]{1,30}$/,
    rule: 'up to 30 letters, numbers, full stops and underscores',
    href: (h) => `https://www.threads.net/@${h}`,
    show: (h) => `@${h}`,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: Linkedin,
    prefix: 'linkedin.com/in/',
    domains: ['linkedin.com'],
    pattern: /^[A-Za-z0-9-]{1,100}$/,
    rule: 'letters, numbers and hyphens',
    href: (h) => `https://www.linkedin.com/in/${h}`,
    show: (h) => h,
  },
  {
    id: 'facebook',
    label: 'Facebook',
    icon: Facebook,
    prefix: 'facebook.com/',
    domains: ['facebook.com', 'fb.com'],
    pattern: /^[A-Za-z0-9.]{1,50}$/,
    rule: 'up to 50 letters, numbers and full stops',
    href: (h) => `https://www.facebook.com/${h}`,
    show: (h) => h,
  },
];

export const WEBSITE_ICON = Globe;

export type SocialLinks = Record<SocialId, string>;

export interface PublicProfile {
  id: string;
  username: string;
  displayName: string;
  pronouns: string;
  bio: string;
  avatarSource: AvatarSource;
  avatarUrl: string;
  website: string;
  links: SocialLinks;
  isPublic: boolean;
  showEntries: boolean;
  createdAt: string;
}

/** A row of the `public_profiles` table. */
export interface PublicProfileRow {
  id: string;
  username: string;
  display_name: string;
  pronouns: string;
  bio: string;
  avatar_source: AvatarSource;
  avatar_url: string;
  website: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  x: string;
  threads: string;
  linkedin: string;
  facebook: string;
  is_public: boolean;
  show_entries: boolean;
  created_at: string;
}

export const PROFILE_COLUMNS =
  'id, username, display_name, pronouns, bio, avatar_source, avatar_url, website, instagram, tiktok, youtube, x, threads, linkedin, facebook, is_public, show_entries, created_at';

export function emptyLinks(): SocialLinks {
  return { instagram: '', tiktok: '', youtube: '', x: '', threads: '', linkedin: '', facebook: '' };
}

export function rowToProfile(row: PublicProfileRow): PublicProfile {
  const links = emptyLinks();
  for (const p of SOCIAL_PLATFORMS) links[p.id] = row[p.id] ?? '';
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    pronouns: row.pronouns,
    bio: row.bio,
    avatarSource: row.avatar_source,
    avatarUrl: row.avatar_url,
    website: row.website,
    links,
    isPublic: row.is_public,
    showEntries: row.show_entries,
    createdAt: row.created_at,
  };
}

export function profileToRow(profile: Omit<PublicProfile, 'createdAt'>) {
  return {
    id: profile.id,
    username: profile.username,
    display_name: profile.displayName,
    pronouns: profile.pronouns,
    bio: profile.bio,
    avatar_source: profile.avatarSource,
    avatar_url: profile.avatarSource === 'initials' ? '' : profile.avatarUrl,
    website: profile.website,
    ...profile.links,
    is_public: profile.isPublic,
    show_entries: profile.showEntries,
  };
}

export function profileHref(username: string): string {
  return `/u/${encodeURIComponent(username)}`;
}

/** The name shown on a profile: their display name, or @username without one. */
export function profileName(profile: Pick<PublicProfile, 'displayName' | 'username'>): string {
  return profile.displayName.trim() || `@${profile.username}`;
}

/** The picture to show, or null for initials. */
export function avatarSrc(profile: Pick<PublicProfile, 'avatarSource' | 'avatarUrl'>): string | null {
  return profile.avatarSource !== 'initials' && profile.avatarUrl ? profile.avatarUrl : null;
}

/** Why a username can't be used, or null when it's fine (availability is checked separately). */
export function usernameProblem(username: string): string | null {
  if (!username) return 'Choose a username.';
  if (username.length < 3) return 'Usernames need at least 3 characters.';
  if (username.length > PROFILE_FIELD_LIMITS.username) return 'Keep it to 30 characters or fewer.';
  if (!USERNAME_PATTERN.test(username)) return 'Use only lowercase letters, numbers and underscores.';
  if (RESERVED_USERNAMES.has(username)) return 'That one’s reserved for the site. Try another.';
  return null;
}

/** Tidies what someone types into a username: lowercase, spaces and hyphens become underscores. */
export function tidyUsername(value: string): string {
  return value.trim().replace(/^@+/, '').toLowerCase().replace(/[\s-]+/g, '_');
}

/** A first guess at a username from someone's name, e.g. "Lucy Irons" → "lucyirons". */
export function suggestUsername(firstName: string, lastName: string): string {
  const guess = `${firstName}${lastName}`
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, PROFILE_FIELD_LIMITS.username);
  return usernameProblem(guess) ? '' : guess;
}

/**
 * Turns what someone typed or pasted into a handle: "@lucy", "lucy" and
 * "https://www.tiktok.com/@lucy?lang=en" all become "lucy".
 */
export function parseHandle(platform: SocialPlatform, input: string): string {
  let value = input.trim();
  if (!value) return '';
  const withoutScheme = value.replace(/^https?:\/\//i, '').replace(/^(www\.|m\.|mobile\.)/i, '');
  const domain = platform.domains.find((d) => withoutScheme.toLowerCase().startsWith(`${d}/`));
  if (domain) {
    let path = withoutScheme.slice(domain.length + 1).split(/[?#]/)[0];
    if (platform.id === 'linkedin') path = path.replace(/^in\//i, '');
    value = path.split('/')[0] ?? '';
  }
  return value.replace(/^@+/, '').replace(/\/+$/, '');
}

/** Adds https:// to a website typed without it. Returns the address to save. */
export function tidyWebsite(input: string): string {
  const value = input.trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value.replace(/^https?:\/\//i, (s) => s.toLowerCase());
  return `https://${value}`;
}

export function websiteProblem(value: string): string | null {
  if (!value) return null;
  if (value.toLowerCase().startsWith('http://')) return 'Use a secure address that starts with https://.';
  if (value.length > PROFILE_FIELD_LIMITS.website) return 'Keep it to 200 characters or fewer.';
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !url.hostname.includes('.') || /[\s"'<>]/.test(value)) throw new Error();
  } catch {
    return 'That doesn’t look like a web address. Try something like https://example.com.';
  }
  return null;
}

/** "example.com/shop" for https://www.example.com/shop/. */
export function showWebsite(url: string): string {
  return url.replace(/^https:\/\//i, '').replace(/^www\./i, '').replace(/\/+$/, '');
}

/** The person's Google photo, at a size that stays sharp on the profile. */
export function googleAvatarUrl(user: User | null): string {
  if (!user) return '';
  const fromRecord = (record: Record<string, unknown> | undefined) => {
    const value = record?.avatar_url ?? record?.picture;
    return typeof value === 'string' ? value : '';
  };
  const google = user.identities?.find((i) => i.provider === 'google');
  const url = fromRecord(google?.identity_data) || fromRecord(user.user_metadata);
  if (!/^https:\/\/[a-z0-9-]+\.googleusercontent\.com\//.test(url)) return '';
  return url.replace(/=s\d+-c$/, '=s256-c');
}

/** "Joined November 2026". */
export function joinedLabel(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `Joined ${new Intl.DateTimeFormat('en-AU', { month: 'long', year: 'numeric' }).format(date)}`;
}

/* Avatars ------------------------------------------------------------------ */

export const AVATAR_BUCKET = 'avatars';
/** Pictures bigger than this are refused before resizing. */
export const AVATAR_MAX_INPUT_BYTES = 10 * 1024 * 1024;
const AVATAR_SIZE = 400;

/**
 * Crops a picture to a centred square and shrinks it to 400 × 400, as WebP (or JPEG where the
 * browser can't make WebP). Runs in the browser, so uploads stay small and photo metadata such
 * as location is left behind.
 */
export async function resizeAvatar(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement('canvas');
  canvas.width = AVATAR_SIZE;
  canvas.height = AVATAR_SIZE;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('No canvas');
  context.imageSmoothingQuality = 'high';
  context.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    AVATAR_SIZE,
    AVATAR_SIZE,
  );
  bitmap.close();
  const toBlob = (type: string) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.86));
  const webp = await toBlob('image/webp');
  if (webp && webp.type === 'image/webp') return webp;
  const jpeg = await toBlob('image/jpeg');
  if (!jpeg) throw new Error('Couldn’t encode the picture');
  return jpeg;
}

/* Reports ------------------------------------------------------------------ */

export type ProfileReportReason = 'picture' | 'words' | 'links' | 'impersonation' | 'other';

export const PROFILE_REPORT_REASONS: { id: ProfileReportReason; label: string }[] = [
  { id: 'picture', label: 'Their picture is offensive or inappropriate' },
  { id: 'words', label: 'Their name or bio is offensive' },
  { id: 'links', label: 'Their links look like spam or aren’t safe' },
  { id: 'impersonation', label: 'They’re pretending to be someone else' },
  { id: 'other', label: 'Something else' },
];

export const PROFILE_REPORT_DETAILS_LIMIT = 300;

/** Profiles this device has reported, so the "thanks" stays put on a return visit. */
const PROFILE_REPORTS_KEY = 'glorious-mistakes:profile-reports:v1';

function reportedProfiles(): string[] {
  try {
    const stored = JSON.parse(window.localStorage.getItem(PROFILE_REPORTS_KEY) ?? '[]');
    return Array.isArray(stored) ? stored.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export function hasReportedProfile(profileId: string): boolean {
  return reportedProfiles().includes(profileId);
}

/**
 * Flags a public profile for the admins (the `profile_reports` table, shown on the admin page's
 * Profile reports tab). Throws if it couldn't be sent. Reporting the same profile twice counts
 * as done.
 */
export async function reportProfile(profileId: string, reason: ProfileReportReason, details: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Reports need the database');
  await ensureUserId(supabase);
  const { error } = await supabase
    .from('profile_reports')
    .insert({ profile_id: profileId, reason, details: details.trim().slice(0, PROFILE_REPORT_DETAILS_LIMIT) });
  if (error && error.code !== '23505') throw error;
  try {
    window.localStorage.setItem(PROFILE_REPORTS_KEY, JSON.stringify([...new Set([...reportedProfiles(), profileId])]));
  } catch {
    // Storage can be blocked; the report still went through.
  }
}
