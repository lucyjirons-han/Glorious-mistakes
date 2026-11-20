import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { CATEGORIES, CRINGE_LEVELS } from './constants';
import { REACTIONS } from './community';

/**
 * The admin page's Supabase client and the tables it manages.
 *
 * Admins sign in with an email and password (a normal Supabase user listed in `public.admins`).
 * The session is kept under its own storage key, so signing in here never replaces the
 * browser's anonymous visitor session (and the entries tied to it). Row level security does the
 * real access control: `public.is_admin()` must be true for any of this to return rows.
 */

/**
 * TEMPORARY: false while the admin page is open to anyone (so a tutor can see it). The page then
 * signs in anonymously instead of asking for a password, and the database's is_admin() says yes
 * to every session (migration 20261120012502_temporarily_open_admin). To switch the login back
 * on, set this to true AND restore is_admin() as described in that migration.
 */
export const ADMIN_LOGIN_REQUIRED = false;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let client: SupabaseClient | null | undefined;

export function getAdminSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  client =
    url && key
      ? createClient(url, key, { auth: { storageKey: 'glorious-mistakes-admin', persistSession: true } })
      : null;
  return client;
}

export type Row = Record<string, unknown>;

export interface AdminField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'email' | 'select' | 'mistake';
  options?: { value: string; label: string }[];
  required?: boolean;
  maxLength?: number;
  /** Stored as a number (the select's value is converted before saving). */
  numeric?: boolean;
}

export interface AdminColumn {
  key: string;
  label: string;
  kind?: 'date' | 'id' | 'mistake' | 'long';
  /**
   * How the column can be filtered: words it contains, one of `options`, a date range, or
   * (for owners) example entries versus visitors' entries. Leave out for no filter.
   */
  filter?: 'text' | 'select' | 'date' | 'owner';
  options?: { value: string; label: string }[];
}

export interface AdminResource {
  id: 'mistakes' | 'reactions' | 'reports' | 'newsletter_signups';
  label: string;
  /** One row, for the "Add" button and the empty state. */
  singular: string;
  orderBy: string;
  /** Columns that together identify a row, used to update and delete it. */
  primaryKey: string[];
  /** Fields shown when adding or editing. Anything else is set by the database. */
  fields: AdminField[];
  columns: AdminColumn[];
  /** Columns the search box looks through. */
  searchable: string[];
  /** Shown above the table. */
  note?: string;
  /** Name for a CSV download of the table (e.g. "newsletter-subscribers"); leave out for none. */
  exportName?: string;
  /** TEMPORARY: true hides the section from the admin page (the data and rules stay as they are). */
  hidden?: boolean;
}

const categoryOptions = CATEGORIES.map((c) => ({ value: c.id, label: c.label }));
const cringeOptions = CRINGE_LEVELS.map((c) => ({ value: String(c.level), label: `${c.level} · ${c.label}` }));
const reactionOptions = REACTIONS.map((r) => ({ value: r.id, label: r.label }));
const visibilityOptions = [
  { value: 'public', label: 'Public (on the feed)' },
  { value: 'private', label: 'Private' },
];

export const RESOURCES: AdminResource[] = [
  {
    id: 'mistakes',
    label: 'Mistakes',
    singular: 'mistake',
    orderBy: 'created_at',
    primaryKey: ['id'],
    fields: [
      { key: 'title', label: 'Headline', type: 'text', required: true, maxLength: 300 },
      { key: 'what_happened', label: 'The story', type: 'textarea', required: true, maxLength: 10000 },
      { key: 'lesson', label: 'The lesson', type: 'textarea', maxLength: 10000 },
      { key: 'category', label: 'Category', type: 'select', options: categoryOptions, required: true },
      { key: 'cringe', label: 'Cringe level', type: 'select', options: cringeOptions, required: true, numeric: true },
      {
        key: 'visibility',
        label: 'Visibility',
        type: 'select',
        required: true,
        options: visibilityOptions,
      },
      { key: 'author', label: 'Display name', type: 'text', maxLength: 80 },
    ],
    columns: [
      { key: 'title', label: 'Headline', kind: 'long', filter: 'text' },
      { key: 'category', label: 'Category', filter: 'select', options: categoryOptions },
      { key: 'visibility', label: 'Visibility', filter: 'select', options: visibilityOptions },
      { key: 'author', label: 'Name', filter: 'text' },
      { key: 'created_at', label: 'Logged', kind: 'date', filter: 'date' },
      { key: 'user_id', label: 'Owner', kind: 'id', filter: 'owner' },
    ],
    searchable: ['title', 'what_happened', 'lesson', 'author', 'id', 'user_id'],
    note: 'Every entry, including the example entries (shown with “Example” as the owner).',
  },
  {
    id: 'reactions',
    label: 'Reactions',
    singular: 'reaction',
    orderBy: 'created_at',
    primaryKey: ['mistake_id', 'user_id', 'reaction'],
    fields: [
      { key: 'mistake_id', label: 'Mistake', type: 'mistake', required: true, maxLength: 100 },
      { key: 'reaction', label: 'Reaction', type: 'select', options: reactionOptions, required: true },
    ],
    columns: [
      { key: 'mistake_id', label: 'Mistake', kind: 'mistake' },
      { key: 'reaction', label: 'Reaction' },
      { key: 'created_at', label: 'Added', kind: 'date' },
      { key: 'user_id', label: 'From', kind: 'id' },
    ],
    searchable: ['mistake_id', 'reaction', 'user_id'],
    note: 'Reactions you add here count as yours, so you can add each reaction once per entry.',
    // TEMPORARY: hidden for now; set to false (or remove) to bring the Reactions tab back.
    hidden: true,
  },
  {
    id: 'reports',
    label: 'Reports',
    singular: 'report',
    orderBy: 'created_at',
    primaryKey: ['id'],
    fields: [{ key: 'mistake_id', label: 'Mistake', type: 'mistake', required: true, maxLength: 100 }],
    columns: [
      { key: 'mistake_id', label: 'Reported entry', kind: 'mistake' },
      { key: 'created_at', label: 'Reported', kind: 'date' },
      { key: 'reporter_id', label: 'Reporter', kind: 'id' },
    ],
    searchable: ['mistake_id', 'reporter_id'],
    note: 'Deleting a report only clears the flag. To take an entry down, make it private or delete it under Mistakes.',
    // TEMPORARY: hidden for now; set to false (or remove) to bring the Reports tab back.
    hidden: true,
  },
  {
    id: 'newsletter_signups',
    label: 'Newsletter',
    singular: 'subscriber',
    orderBy: 'consented_at',
    primaryKey: ['id'],
    fields: [
      { key: 'first_name', label: 'First name', type: 'text', required: true, maxLength: 60 },
      { key: 'email', label: 'Email', type: 'email', required: true, maxLength: 254 },
    ],
    columns: [
      { key: 'first_name', label: 'First name', filter: 'text' },
      { key: 'email', label: 'Email', filter: 'text' },
      { key: 'consented_at', label: 'Signed up', kind: 'date', filter: 'date' },
    ],
    searchable: ['first_name', 'email'],
    note: 'Only add people who have asked to be on the list.',
    exportName: 'newsletter-subscribers',
  },
];

/** The sections shown on the admin page. */
export const VISIBLE_RESOURCES = RESOURCES.filter((r) => !r.hidden);

export type Filters = Record<string, string>;

/** A date as YYYY-MM-DD in the viewer's time zone, to compare with date inputs. */
function localDay(value: unknown): string {
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * True when a row passes every column filter. Date columns use `<key>:from` and `<key>:to`
 * (both inclusive); the rest use the column's key.
 */
export function matchesFilters(columns: AdminColumn[], row: Row, filters: Filters): boolean {
  return columns.every((column) => {
    const value = row[column.key];
    switch (column.filter) {
      case 'text': {
        const wanted = (filters[column.key] ?? '').trim().toLowerCase();
        return !wanted || String(value ?? '').toLowerCase().includes(wanted);
      }
      case 'select':
        return !filters[column.key] || String(value) === filters[column.key];
      case 'owner':
        if (filters[column.key] === 'example') return !value;
        if (filters[column.key] === 'visitor') return !!value;
        return true;
      case 'date': {
        const from = filters[`${column.key}:from`];
        const to = filters[`${column.key}:to`];
        if (!from && !to) return true;
        const day = localDay(value);
        return !!day && (!from || day >= from) && (!to || day <= to);
      }
      default:
        return true;
    }
  });
}

/* CSV export -------------------------------------------------------------- */

/**
 * One CSV cell. Quotes anything with commas, quotes or line breaks, and puts an apostrophe in
 * front of values starting with = + - @ so spreadsheets don't run them as formulas.
 */
function csvCell(value: unknown): string {
  let text = value == null ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** The rows as CSV, one column per table column (dates as ISO 8601, which spreadsheets read). */
export function toCsv(columns: AdminColumn[], rows: Row[]): string {
  const header = columns.map((c) => csvCell(c.label)).join(',');
  const lines = rows.map((row) => columns.map((c) => csvCell(row[c.key])).join(','));
  return [header, ...lines].join('\r\n');
}

/** Saves text as a file in the browser's downloads. */
export function downloadCsv(filename: string, csv: string) {
  // The byte order mark tells Excel the file is UTF-8, so names with accents survive.
  const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** Checks a form's values against the field rules. Returns an error message per field. */
export function validateRow(fields: AdminField[], values: Record<string, string>): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    const value = (values[field.key] ?? '').trim();
    if (field.required && !value) {
      errors[field.key] = `${field.label} can’t be empty.`;
    } else if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors[field.key] = 'That doesn’t look like an email address.';
    } else if (field.maxLength && value.length > field.maxLength) {
      errors[field.key] = `Keep it to ${field.maxLength} characters or fewer.`;
    }
  }
  return errors;
}

/** Turns form values into a row to save: trimmed, with numeric fields converted. */
export function valuesToRow(fields: AdminField[], values: Record<string, string>): Row {
  const row: Row = {};
  for (const field of fields) {
    const value = (values[field.key] ?? '').trim();
    row[field.key] = field.numeric ? Number(value) : value;
  }
  return row;
}

export function rowToValues(fields: AdminField[], row: Row | null): Record<string, string> {
  const values: Record<string, string> = {};
  for (const field of fields) {
    const value = row?.[field.key];
    values[field.key] = value == null ? (field.options?.[0]?.value ?? '') : String(value);
  }
  return values;
}

/** A stable string id for a row, built from its primary key. */
export function rowKey(resource: AdminResource, row: Row): string {
  return resource.primaryKey.map((k) => String(row[k])).join('|');
}
