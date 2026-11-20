'use client';

import type { Session } from '@supabase/supabase-js';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, CircleAlert, Flag, LogOut, Mail, NotebookPen, Plus, RefreshCw, Search, ShieldAlert, Smile } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { EmptyState } from '@/components/EmptyState';
import { Icon } from '@/components/Icon';
import { useToast } from '@/components/Toast';
import {
  ADMIN_LOGIN_REQUIRED,
  getAdminSupabase,
  matchesFilters,
  rowKey,
  rowToValues,
  validateRow,
  valuesToRow,
  VISIBLE_RESOURCES,
  type AdminField,
  type AdminColumn,
  type AdminResource,
  type Filters,
  type Row,
} from '@/lib/admin';

type Status = 'loading' | 'signed-out' | 'not-admin' | 'admin';

const TAB_ICONS = {
  mistakes: NotebookPen,
  reactions: Smile,
  reports: Flag,
  newsletter_signups: Mail,
} as const;

const dateTime = new Intl.DateTimeFormat('en-AU', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

function formatDateTime(value: unknown): string {
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? '' : dateTime.format(date);
}

export function AdminView() {
  const supabase = getAdminSupabase();
  const [status, setStatus] = useState<Status>('loading');
  const [session, setSession] = useState<Session | null>(null);

  const checkAdmin = useCallback(
    async (next: Session | null) => {
      setSession(next);
      if (!supabase || !next) {
        setStatus('signed-out');
        return;
      }
      const { data, error } = await supabase.rpc('is_admin');
      setStatus(!error && data === true ? 'admin' : 'not-admin');
    },
    [supabase],
  );

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session && !ADMIN_LOGIN_REQUIRED) {
        // Login is switched off: sign in anonymously so the page can read and save.
        const { error } = await supabase.auth.signInAnonymously();
        if (error) await checkAdmin(null);
        return; // onAuthStateChange picks up the new session.
      }
      await checkAdmin(data.session);
    });
    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') void checkAdmin(next);
    });
    return () => data.subscription.unsubscribe();
  }, [supabase, checkAdmin]);

  const signOut = async () => {
    await supabase?.auth.signOut();
  };

  const header = (
    <header className="page-header page-header--split">
      <div>
        <p className="eyebrow">Behind the scenes</p>
        <h1 className="page-header__title">Admin</h1>
        <p className="page-header__lead">See, fix and tidy up everything people have shared.</p>
      </div>
      {session && ADMIN_LOGIN_REQUIRED && (
        <div className="admin-account">
          <span className="admin-account__email">{session.user.email}</span>
          <button type="button" className="btn btn--sm" onClick={signOut}>
            <Icon icon={LogOut} size={16} />
            Sign out
          </button>
        </div>
      )}
    </header>
  );

  if (!supabase) {
    return (
      <div className="container page">
        {header}
        <EmptyState icon={ShieldAlert} title="No database connected">
          <p>The admin page needs Supabase. Add the keys to .env.local and restart the site.</p>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="container page">
      {header}
      {status === 'loading' && <div className="card card--skeleton" aria-busy="true" />}
      {status === 'signed-out' && <SignInForm />}
      {status === 'not-admin' && (
        <EmptyState
          icon={ShieldAlert}
          title="This account isn’t an admin"
          action={
            <button type="button" className="btn btn--primary" onClick={signOut}>
              Sign out
            </button>
          }
        >
          <p>You&rsquo;re signed in, but this account isn&rsquo;t on the admin list.</p>
        </EmptyState>
      )}
      {status === 'admin' && <Dashboard />}
    </div>
  );
}

/* Sign in ------------------------------------------------------------------ */

function SignInForm() {
  const supabase = getAdminSupabase();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      emailRef.current?.focus();
      return;
    }
    setBusy(true);
    setError('');
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (signInError) {
      setError('That email and password don’t match an account.');
      emailRef.current?.focus();
    }
  };

  return (
    <form className="admin-signin form-step" onSubmit={handleSubmit} noValidate>
      <h2 className="form-step__title">Sign in</h2>
      <div className="field">
        <label htmlFor="admin-email" className="field__label">
          Email
        </label>
        <input
          ref={emailRef}
          id="admin-email"
          type="email"
          className="input"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'admin-signin-error' : undefined}
        />
      </div>
      <div className="field">
        <label htmlFor="admin-password" className="field__label">
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          className="input"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'admin-signin-error' : undefined}
        />
      </div>
      {error && (
        <p id="admin-signin-error" className="field__error">
          <Icon icon={CircleAlert} size={16} className="field__error-icon" />
          {error}
        </p>
      )}
      <div>
        <button type="submit" className="btn btn--primary" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </div>
    </form>
  );
}

/* Dashboard ---------------------------------------------------------------- */

function Dashboard() {
  const supabase = getAdminSupabase()!;
  const [tab, setTab] = useState<AdminResource['id']>('mistakes');
  // Every stored entry, so reactions and reports can show headlines instead of ids.
  const [mistakes, setMistakes] = useState<Row[]>([]);

  const loadMistakes = useCallback(async () => {
    const { data } = await supabase.from('mistakes').select('id, title, user_id').order('created_at', { ascending: false });
    setMistakes(data ?? []);
  }, [supabase]);

  useEffect(() => {
    void loadMistakes();
  }, [loadMistakes]);

  const mistakeOptions = useMemo(
    () => ({
      // Example entries are the ones with no owner.
      stored: mistakes.filter((m) => m.user_id).map((m) => ({ value: String(m.id), label: String(m.title) })),
      examples: mistakes.filter((m) => !m.user_id).map((m) => ({ value: String(m.id), label: String(m.title) })),
    }),
    [mistakes],
  );

  const titles = useMemo(() => {
    const map = new Map<string, string>();
    for (const o of [...mistakeOptions.examples, ...mistakeOptions.stored]) map.set(o.value, o.label);
    return map;
  }, [mistakeOptions]);

  const resource = VISIBLE_RESOURCES.find((r) => r.id === tab) ?? VISIBLE_RESOURCES[0];

  return (
    <>
      <div className="chip-group admin-tabs" role="group" aria-label="Show">
        {VISIBLE_RESOURCES.map((r) => (
          <button key={r.id} type="button" className="chip" aria-pressed={tab === r.id} onClick={() => setTab(r.id)}>
            <Icon icon={TAB_ICONS[r.id]} size={16} />
            {r.label}
          </button>
        ))}
      </div>
      <ResourcePanel
        key={resource.id}
        resource={resource}
        titles={titles}
        mistakeOptions={mistakeOptions}
        onMistakesChanged={loadMistakes}
      />
    </>
  );
}

type MistakeOptions = { stored: { value: string; label: string }[]; examples: { value: string; label: string }[] };

interface PanelProps {
  resource: AdminResource;
  titles: Map<string, string>;
  mistakeOptions: MistakeOptions;
  onMistakesChanged: () => void;
}

function ResourcePanel({ resource, titles, mistakeOptions, onMistakesChanged }: PanelProps) {
  const supabase = getAdminSupabase()!;
  const toast = useToast();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({});
  /** null keeps the order rows were loaded in (newest first). */
  const [sort, setSort] = useState<Sort | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZES[1]);
  const tableRef = useRef<HTMLDivElement>(null);
  /** 'new' while adding, a row key while editing, null otherwise. */
  const [editing, setEditing] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const titleId = `admin-${resource.id}-title`;

  const load = useCallback(async () => {
    setLoadError('');
    const { data, error } = await supabase
      .from(resource.id)
      .select('*')
      .order(resource.orderBy, { ascending: false });
    if (error) {
      setLoadError(error.message);
      toast(`Couldn’t load ${resource.label.toLowerCase()}.`);
      setRows([]);
    } else {
      setRows(data ?? []);
    }
  }, [supabase, resource, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async (values: Record<string, string>, original: Row | null): Promise<string | null> => {
    const row = valuesToRow(resource.fields, values);
    let request;
    if (original) {
      let q = supabase.from(resource.id).update(row);
      for (const k of resource.primaryKey) q = q.eq(k, original[k] as string);
      request = q;
    } else {
      request = supabase.from(resource.id).insert(row);
    }
    const { error } = await request;
    if (error) return friendlyError(error.code, error.message);
    toast(original ? `Saved the ${resource.singular}.` : `Added the ${resource.singular}.`);
    setEditing(null);
    await load();
    if (resource.id === 'mistakes') onMistakesChanged();
    return null;
  };

  const remove = async (row: Row) => {
    let q = supabase.from(resource.id).delete();
    for (const k of resource.primaryKey) q = q.eq(k, row[k] as string);
    const { error } = await q;
    setConfirmingDelete(null);
    if (error) {
      toast(`Couldn’t delete that ${resource.singular}: ${error.message}`);
      return;
    }
    toast(`Deleted the ${resource.singular}.`);
    await load();
    if (resource.id === 'mistakes') onMistakesChanged();
  };

  const filterable = resource.columns.filter((c) => c.filter);
  const activeFilters = Object.values(filters).filter((v) => v.trim()).length;
  const narrowed = query.trim() !== '' || activeFilters > 0;

  const visible = useMemo(() => {
    if (!rows) return [];
    const q = query.trim().toLowerCase();
    return rows.filter(
      (row) =>
        matchesFilters(resource.columns, row, filters) &&
        (!q ||
          resource.searchable.some((k) => {
            const value = String(row[k] ?? '').toLowerCase();
            const title = k === 'mistake_id' ? (titles.get(String(row[k])) ?? '').toLowerCase() : '';
            return value.includes(q) || title.includes(q);
          })),
    );
  }, [rows, query, filters, resource, titles]);

  const sorted = useMemo(() => {
    if (!sort) return visible;
    const column = resource.columns.find((c) => c.key === sort.key);
    if (!column) return visible;
    const factor = sort.direction === 'ascending' ? 1 : -1;
    // Array.prototype.sort is stable, so ties keep their newest-first order.
    return [...visible].sort((a, b) => factor * compareCells(column, a, b, titles));
  }, [visible, sort, resource, titles]);

  // A new search, filter, sort or page size starts again from page 1.
  useEffect(() => {
    setPage(1);
  }, [query, filters, sort, pageSize]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  // Deleting the last row on the last page would otherwise leave an empty page.
  const currentPage = Math.min(page, pageCount);
  const firstIndex = (currentPage - 1) * pageSize;
  const pageRows = sorted.slice(firstIndex, firstIndex + pageSize);

  const goToPage = (next: number) => {
    setPage(next);
    toast(`Page ${next} of ${pageCount}.`);
    const top = tableRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) tableRef.current?.scrollIntoView({ block: 'start' });
  };

  const toggleSort = (column: AdminColumn) => {
    const direction: SortDirection =
      sort?.key === column.key && sort.direction === 'ascending' ? 'descending' : 'ascending';
    setSort({ key: column.key, direction });
    toast(`Sorted by ${column.label}, ${sortDescription(column, direction)}.`);
  };

  const editingRow = editing && editing !== 'new' ? (rows?.find((r) => rowKey(resource, r) === editing) ?? null) : null;

  const renderCell = (row: Row, column: (typeof resource.columns)[number]) => {
    const value = row[column.key];
    switch (column.kind) {
      case 'date':
        return formatDateTime(value);
      case 'id':
        if (!value) return <span className="admin-table__missing">Example</span>;
        return (
          <code className="admin-table__id" title={String(value)}>
            {String(value).slice(0, 8)}
          </code>
        );
      case 'mistake': {
        const id = String(value);
        const title = titles.get(id);
        return (
          <Link href={`/mistakes/${encodeURIComponent(id)}`} className="admin-table__link">
            {title ?? <span className="admin-table__missing">Deleted or private entry ({id.slice(0, 8)})</span>}
          </Link>
        );
      }
      default:
        return String(value ?? '') || <span className="admin-table__missing">None</span>;
    }
  };

  return (
    <section className="admin-panel" aria-labelledby={titleId}>
      <div className="section__header section__header--compact">
        <h2 id={titleId} className="section__title section__title--sm">
          {resource.label}
          {rows && <span className="admin-panel__count"> ({rows.length})</span>}
        </h2>
        <div className="admin-panel__actions">
          <button type="button" className="btn btn--sm" onClick={() => void load()}>
            <Icon icon={RefreshCw} size={16} />
            Refresh
          </button>
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={() => setEditing('new')}
            disabled={editing === 'new'}
          >
            <Icon icon={Plus} size={16} />
            Add {resource.singular}
          </button>
        </div>
      </div>

      {resource.note && <p className="admin-panel__note">{resource.note}</p>}

      {editing !== null && (editing === 'new' || editingRow) && (
        <RowForm
          key={editing}
          resource={resource}
          row={editingRow}
          mistakeOptions={mistakeOptions}
          onSave={(values) => save(values, editingRow)}
          onCancel={() => setEditing(null)}
        />
      )}

      <div className="admin-filters">
        <div className="toolbar__search admin-panel__search">
          <Icon icon={Search} size={18} className="toolbar__search-icon" />
          <label htmlFor={`admin-${resource.id}-search`} className="sr-only">
            Search {resource.label.toLowerCase()}
          </label>
          <input
            id={`admin-${resource.id}-search`}
            type="search"
            className="input"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {filterable.length > 0 && (
          <fieldset className="admin-filters__fields">
            <legend className="admin-filters__legend">Filter by column</legend>
            <div className="admin-filters__grid">
              {filterable.map((column) => (
                <ColumnFilter
                  key={column.key}
                  idPrefix={`admin-${resource.id}-filter`}
                  column={column}
                  filters={filters}
                  onChange={(key, value) => setFilters((f) => ({ ...f, [key]: value }))}
                />
              ))}
            </div>
          </fieldset>
        )}

        {rows && narrowed && (
          <div className="admin-filters__summary">
            <p>
              Showing {visible.length} of {rows.length}
            </p>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => {
                setFilters({});
                setQuery('');
                toast('Filters cleared.');
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {loadError && (
        <p className="field__error">
          <Icon icon={CircleAlert} size={16} className="field__error-icon" />
          Couldn&rsquo;t load {resource.label.toLowerCase()}: {loadError}
        </p>
      )}

      {rows === null ? (
        <div className="card card--skeleton" aria-busy="true" />
      ) : visible.length === 0 ? (
        <EmptyState icon={TAB_ICONS[resource.id]} title={narrowed ? 'Nothing matches' : 'Nothing here yet'}>
          <p>{narrowed ? 'Try loosening the search or filters.' : `No ${resource.label.toLowerCase()} so far.`}</p>
        </EmptyState>
      ) : (
        <>
          <div className="admin-table-wrap" ref={tableRef}>
            <table className="admin-table">
              <thead>
                <tr>
                  {resource.columns.map((c) => {
                    const direction = sort?.key === c.key ? sort.direction : undefined;
                    return (
                      <th key={c.key} scope="col" aria-sort={direction ?? 'none'}>
                        <button
                          type="button"
                          className={`admin-table__sort${direction ? ' admin-table__sort--active' : ''}`}
                          onClick={() => toggleSort(c)}
                        >
                          {c.label}
                          <Icon
                            icon={direction === 'ascending' ? ArrowUp : direction === 'descending' ? ArrowDown : ArrowUpDown}
                            size={14}
                          />
                          <span className="sr-only">
                            {direction
                              ? `, sorted ${sortDescription(c, direction)}`
                              : ', select to sort'}
                          </span>
                        </button>
                      </th>
                    );
                  })}
                  <th scope="col">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row) => {
                  const key = rowKey(resource, row);
                  const name = describeRow(resource, row, titles);
                  return (
                    <tr key={key} className={editing === key ? 'admin-table__editing' : undefined}>
                      {resource.columns.map((c) => (
                        <td key={c.key} className={c.kind === 'long' ? 'admin-table__long' : undefined}>
                          {renderCell(row, c)}
                        </td>
                      ))}
                      <td className="admin-table__actions">
                        {confirmingDelete === key ? (
                          <div className="confirm" role="group" aria-label={`Delete ${name}?`}>
                            <p className="confirm__text">Delete for good?</p>
                            <button type="button" className="btn btn--danger btn--sm" onClick={() => void remove(row)}>
                              Yes, delete
                            </button>
                            <button
                              type="button"
                              className="btn btn--ghost btn--sm"
                              autoFocus
                              onClick={() => setConfirmingDelete(null)}
                            >
                              Keep it
                            </button>
                          </div>
                        ) : (
                          <div className="owner-actions">
                            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setEditing(key)}>
                              Edit<span className="sr-only"> {name}</span>
                            </button>
                            <button
                              type="button"
                              className="btn btn--ghost btn--sm btn--danger-text"
                              onClick={() => setConfirmingDelete(key)}
                            >
                              Delete<span className="sr-only"> {name}</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="admin-pagination">
            <p className="admin-pagination__summary">
              Showing {firstIndex + 1}&ndash;{firstIndex + pageRows.length} of {sorted.length}
            </p>

            <div className="admin-pagination__size">
              <label htmlFor={`admin-${resource.id}-page-size`}>Rows per page</label>
              <select
                id={`admin-${resource.id}-page-size`}
                className="input input--select"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            {pageCount > 1 && (
              <nav className="admin-pagination__pages" aria-label={`${resource.label} pages`}>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <Icon icon={ChevronLeft} size={16} />
                  Previous<span className="sr-only"> page</span>
                </button>
                <ul className="admin-pagination__list">
                  {pageNumbers(currentPage, pageCount).map((n, i) =>
                    n === null ? (
                      <li key={`gap-${i}`} className="admin-pagination__gap" aria-hidden="true">
                        &hellip;
                      </li>
                    ) : (
                      <li key={n}>
                        <button
                          type="button"
                          className="admin-pagination__page"
                          aria-current={n === currentPage ? 'page' : undefined}
                          onClick={() => goToPage(n)}
                        >
                          <span className="sr-only">Page </span>
                          {n}
                        </button>
                      </li>
                    ),
                  )}
                </ul>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === pageCount}
                >
                  Next<span className="sr-only"> page</span>
                  <Icon icon={ChevronRight} size={16} />
                </button>
              </nav>
            )}
          </div>
        </>
      )}
    </section>
  );
}

/* Pagination -------------------------------------------------------------- */

const PAGE_SIZES = [10, 25, 50, 100] as const;

/**
 * The page numbers to show: all of them when there are few, otherwise the first, the last and
 * the ones either side of the current page, with null marking a gap ("…").
 */
function pageNumbers(current: number, count: number): (number | null)[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const wanted = new Set([1, count, current - 1, current, current + 1]);
  const list: (number | null)[] = [];
  for (let n = 1; n <= count; n++) {
    if (!wanted.has(n)) continue;
    const last = list[list.length - 1];
    if (typeof last === 'number' && n - last > 1) list.push(null);
    list.push(n);
  }
  return list;
}

/* Sorting ----------------------------------------------------------------- */

type SortDirection = 'ascending' | 'descending';
type Sort = { key: string; direction: SortDirection };

const collator = new Intl.Collator('en-AU', { sensitivity: 'base', numeric: true });

/** What a cell is sorted by: what the table shows, not the stored code. */
function sortText(column: AdminColumn, row: Row, titles: Map<string, string>): string {
  const value = row[column.key];
  if (column.kind === 'mistake') return titles.get(String(value)) ?? '';
  if (column.kind === 'id') return value ? `1${value}` : '0'; // Example entries (no owner) first.
  const option = column.options?.find((o) => o.value === String(value));
  return option?.label ?? String(value ?? '');
}

function compareCells(column: AdminColumn, a: Row, b: Row, titles: Map<string, string>): number {
  if (column.kind === 'date') {
    return new Date(String(a[column.key])).getTime() - new Date(String(b[column.key])).getTime();
  }
  const left = sortText(column, a, titles);
  const right = sortText(column, b, titles);
  // Empty cells go last when sorting A to Z.
  if (!left !== !right) return left ? -1 : 1;
  return collator.compare(left, right);
}

/** "A to Z", "oldest first" and so on, for the toast and screen-reader text. */
function sortDescription(column: AdminColumn, direction: SortDirection): string {
  if (column.kind === 'date') return direction === 'ascending' ? 'oldest first' : 'newest first';
  if (column.kind === 'id') return direction === 'ascending' ? 'examples first' : 'examples last';
  return direction === 'ascending' ? 'A to Z' : 'Z to A';
}

/* Column filters ----------------------------------------------------------- */

interface ColumnFilterProps {
  idPrefix: string;
  column: AdminColumn;
  filters: Filters;
  onChange: (key: string, value: string) => void;
}

const OWNER_OPTIONS = [
  { value: 'example', label: 'Example entries' },
  { value: 'visitor', label: 'Visitors’ entries' },
];

function ColumnFilter({ idPrefix, column, filters, onChange }: ColumnFilterProps) {
  const id = `${idPrefix}-${column.key}`;

  if (column.filter === 'date') {
    const fromKey = `${column.key}:from`;
    const toKey = `${column.key}:to`;
    return (
      <fieldset className="field admin-filters__dates">
        <legend className="field__label">{column.label}</legend>
        <div className="admin-filters__date-pair">
          <div className="field">
            <label htmlFor={`${id}-from`} className="admin-filters__sub-label">
              From
            </label>
            <input
              id={`${id}-from`}
              type="date"
              className="input"
              value={filters[fromKey] ?? ''}
              max={filters[toKey] || undefined}
              onChange={(e) => onChange(fromKey, e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor={`${id}-to`} className="admin-filters__sub-label">
              To
            </label>
            <input
              id={`${id}-to`}
              type="date"
              className="input"
              value={filters[toKey] ?? ''}
              min={filters[fromKey] || undefined}
              onChange={(e) => onChange(toKey, e.target.value)}
            />
          </div>
        </div>
      </fieldset>
    );
  }

  const options = column.filter === 'owner' ? OWNER_OPTIONS : column.options;

  return (
    <div className="field">
      <label htmlFor={id} className="field__label">
        {column.label}
      </label>
      {column.filter === 'text' ? (
        <input
          id={id}
          type="text"
          className="input"
          placeholder="Contains…"
          autoComplete="off"
          value={filters[column.key] ?? ''}
          onChange={(e) => onChange(column.key, e.target.value)}
        />
      ) : (
        <select
          id={id}
          className="input input--select"
          value={filters[column.key] ?? ''}
          onChange={(e) => onChange(column.key, e.target.value)}
        >
          <option value="">Any</option>
          {options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

/** A short name for a row, for screen-reader labels on its buttons. */
function describeRow(resource: AdminResource, row: Row, titles: Map<string, string>): string {
  switch (resource.id) {
    case 'mistakes':
      return `“${row.title}”`;
    case 'reactions':
      return `${row.reaction} on “${titles.get(String(row.mistake_id)) ?? row.mistake_id}”`;
    case 'reports':
      return `report on “${titles.get(String(row.mistake_id)) ?? row.mistake_id}”`;
    case 'newsletter_signups':
      return `${row.first_name} (${row.email})`;
  }
}

function friendlyError(code: string | undefined, message: string): string {
  if (code === '23505') return 'That already exists.';
  if (code === '23514') return 'One of the values isn’t allowed. Check the lengths and formats.';
  if (code === '42501') return 'The database said no. Is this account still an admin?';
  return message;
}

/* Add / edit form ---------------------------------------------------------- */

interface RowFormProps {
  resource: AdminResource;
  row: Row | null;
  mistakeOptions: MistakeOptions;
  onSave: (values: Record<string, string>) => Promise<string | null>;
  onCancel: () => void;
}

function RowForm({ resource, row, mistakeOptions, onSave, onCancel }: RowFormProps) {
  const [values, setValues] = useState(() => {
    const initial = rowToValues(resource.fields, row);
    // New reactions and reports start on the first stored entry rather than an empty choice.
    for (const f of resource.fields) {
      if (f.type === 'mistake' && !initial[f.key]) {
        initial[f.key] = mistakeOptions.stored[0]?.value ?? mistakeOptions.examples[0]?.value ?? '';
      }
    }
    return initial;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const prefix = `admin-${resource.id}-${row ? 'edit' : 'new'}`;
  const heading = row ? `Edit ${resource.singular}` : `Add a ${resource.singular}`;

  useEffect(() => {
    formRef.current?.querySelector<HTMLElement>('input, textarea, select')?.focus();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const found = validateRow(resource.fields, values);
    setErrors(found);
    setFormError('');
    const firstInvalid = resource.fields.find((f) => found[f.key]);
    if (firstInvalid) {
      document.getElementById(`${prefix}-${firstInvalid.key}`)?.focus();
      return;
    }
    setBusy(true);
    const error = await onSave(values);
    setBusy(false);
    if (error) {
      setFormError(error);
      toast(`Couldn’t save: ${error}`);
    }
  };

  const set = (key: string, value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }));
  };

  const control = (field: AdminField) => {
    const id = `${prefix}-${field.key}`;
    const common = {
      id,
      name: field.key,
      value: values[field.key] ?? '',
      required: field.required,
      'aria-invalid': errors[field.key] ? true : undefined,
      'aria-describedby': errors[field.key] ? `${id}-error` : undefined,
    };
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            className="input input--textarea"
            rows={4}
            maxLength={field.maxLength}
            onChange={(e) => set(field.key, e.target.value)}
            {...common}
          />
        );
      case 'select':
        return (
          <select className="input input--select" onChange={(e) => set(field.key, e.target.value)} {...common}>
            {field.options!.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        );
      case 'mistake': {
        const known = [...mistakeOptions.stored, ...mistakeOptions.examples].some((o) => o.value === values[field.key]);
        return (
          <select className="input input--select" onChange={(e) => set(field.key, e.target.value)} {...common}>
            {!known && values[field.key] && <option value={values[field.key]}>Unknown entry ({values[field.key]})</option>}
            <optgroup label="Stored entries">
              {mistakeOptions.stored.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="Example entries">
              {mistakeOptions.examples.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </optgroup>
          </select>
        );
      }
      default:
        return (
          <input
            type={field.type}
            className="input"
            maxLength={field.maxLength}
            autoComplete="off"
            onChange={(e) => set(field.key, e.target.value)}
            {...common}
          />
        );
    }
  };

  return (
    <form ref={formRef} className="admin-form" onSubmit={handleSubmit} noValidate aria-label={heading}>
      <h3 className="admin-form__title">{heading}</h3>
      <div className="admin-form__grid">
        {resource.fields.map((field) => (
          <div key={field.key} className={`field${field.type === 'textarea' ? ' admin-form__wide' : ''}`}>
            <label htmlFor={`${prefix}-${field.key}`} className="field__label">
              {field.label}
              {!field.required && <span className="field__optional"> (optional)</span>}
            </label>
            {control(field)}
            {errors[field.key] && (
              <p id={`${prefix}-${field.key}-error`} className="field__error">
                <Icon icon={CircleAlert} size={16} className="field__error-icon" />
                {errors[field.key]}
              </p>
            )}
          </div>
        ))}
      </div>
      {formError && (
        <p className="field__error">
          <Icon icon={CircleAlert} size={16} className="field__error-icon" />
          {formError}
        </p>
      )}
      <div className="admin-form__buttons">
        <button type="submit" className="btn btn--primary btn--sm" disabled={busy}>
          {busy ? 'Saving…' : row ? 'Save changes' : `Add ${resource.singular}`}
        </button>
        <button type="button" className="btn btn--ghost btn--sm" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
