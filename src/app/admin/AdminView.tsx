'use client';

import type { Session } from '@supabase/supabase-js';
import { CircleAlert, Flag, LogOut, Mail, NotebookPen, Plus, RefreshCw, Search, ShieldAlert, Smile } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { EmptyState } from '@/components/EmptyState';
import { Icon } from '@/components/Icon';
import { useToast } from '@/components/Toast';
import {
  getAdminSupabase,
  RESOURCES,
  rowKey,
  rowToValues,
  validateRow,
  valuesToRow,
  type AdminField,
  type AdminResource,
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
    supabase.auth.getSession().then(({ data }) => checkAdmin(data.session));
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
      {session && (
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

  const resource = RESOURCES.find((r) => r.id === tab)!;

  return (
    <>
      <div className="chip-group admin-tabs" role="group" aria-label="Show">
        {RESOURCES.map((r) => (
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

  const visible = useMemo(() => {
    if (!rows) return [];
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      resource.searchable.some((k) => {
        const value = String(row[k] ?? '').toLowerCase();
        const title = k === 'mistake_id' ? (titles.get(String(row[k])) ?? '').toLowerCase() : '';
        return value.includes(q) || title.includes(q);
      }),
    );
  }, [rows, query, resource, titles]);

  const editingRow = editing && editing !== 'new' ? (rows?.find((r) => rowKey(resource, r) === editing) ?? null) : null;

  const renderCell = (row: Row, column: (typeof resource.columns)[number]) => {
    const value = row[column.key];
    switch (column.kind) {
      case 'date':
        return formatDateTime(value);
      case 'id':
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

      {loadError && (
        <p className="field__error">
          <Icon icon={CircleAlert} size={16} className="field__error-icon" />
          Couldn&rsquo;t load {resource.label.toLowerCase()}: {loadError}
        </p>
      )}

      {rows === null ? (
        <div className="card card--skeleton" aria-busy="true" />
      ) : visible.length === 0 ? (
        <EmptyState icon={TAB_ICONS[resource.id]} title={query ? 'Nothing matches that search' : 'Nothing here yet'}>
          <p>{query ? 'Try a different word.' : `No ${resource.label.toLowerCase()} so far.`}</p>
        </EmptyState>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                {resource.columns.map((c) => (
                  <th key={c.key} scope="col">
                    {c.label}
                  </th>
                ))}
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => {
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
      )}
    </section>
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
