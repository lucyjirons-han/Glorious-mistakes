'use client';

import { CircleAlert, ExternalLink, ImageUp, LogIn, Shapes, Trash2, UserRoundX, VenetianMask } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Avatar } from '@/components/Avatar';
import { EmptyState } from '@/components/EmptyState';
import { Icon, IconBadge } from '@/components/Icon';
import { ProfileCard } from '@/components/ProfileCard';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/lib/auth';
import { loginHref } from '@/lib/login';
import { QUIZ_STYLES } from '@/lib/quiz';
import { useQuizResults } from '@/lib/quiz-results';
import {
  AVATAR_BUCKET,
  AVATAR_MAX_INPUT_BYTES,
  emptyLinks,
  googleAvatarUrl,
  parseHandle,
  PROFILE_COLUMNS,
  PROFILE_FIELD_LIMITS,
  profileHref,
  profileToRow,
  resizeAvatar,
  rowToProfile,
  SOCIAL_PLATFORMS,
  suggestUsername,
  tidyUsername,
  tidyWebsite,
  usernameProblem,
  websiteProblem,
  type AvatarSource,
  type PublicProfile,
  type PublicProfileRow,
  type SocialId,
  type SocialLinks,
} from '@/lib/profiles';
import { SITE_URL } from '@/lib/site';
import { getSupabase } from '@/lib/supabase';

const header = (
  <header className="page-header">
    <p className="eyebrow">Your account</p>
    <h1 className="page-header__title">Your profile</h1>
    <p className="page-header__lead">
      A little page about you that others can visit: a username, a photo, a few words and links to your socials. It&rsquo;s
      optional, and you can hide it any time.
    </p>
  </header>
);

export function ProfileEditorView() {
  const auth = useAuth();

  if (!auth.available) {
    return (
      <div className="container page">
        {header}
        <EmptyState icon={UserRoundX} title="Profiles aren’t available right now">
          <p>Profiles need an account, and accounts can&rsquo;t be reached at the moment. Please try again later.</p>
        </EmptyState>
      </div>
    );
  }

  if (!auth.ready) {
    return (
      <div className="container page">
        {header}
        <div className="card card--skeleton" aria-busy="true" />
      </div>
    );
  }

  if (!auth.user) {
    return (
      <div className="container page">
        {header}
        <EmptyState
          icon={LogIn}
          title="Log in to make your profile"
          action={
            <Link href={loginHref('/profile')} className="btn btn--primary">
              Log in
            </Link>
          }
        >
          <p>Profiles belong to your account. Log in with Google and you can set one up in a minute.</p>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="container page">
      {header}
      {/* Keyed so the form starts fresh if someone else logs in. */}
      <ProfileEditor key={auth.user.id} />
    </div>
  );
}

interface Values {
  isPublic: boolean;
  username: string;
  displayName: string;
  pronouns: string;
  bio: string;
  avatarSource: AvatarSource;
  website: string;
  /** What's typed in each box (a handle or a pasted link). */
  links: SocialLinks;
  showEntries: boolean;
  showQuizStyle: boolean;
}

type ErrorKey = 'username' | 'displayName' | 'pronouns' | 'bio' | 'avatar' | 'website' | SocialId;
type Errors = Partial<Record<ErrorKey, string>>;

/** The order fields appear in, for moving focus to the first problem. */
const FIELD_ORDER: ErrorKey[] = [
  'username',
  'displayName',
  'pronouns',
  'bio',
  'avatar',
  'website',
  ...SOCIAL_PLATFORMS.map((p) => p.id),
];

type Availability = 'idle' | 'checking' | 'available' | 'taken' | 'error';

function valuesFrom(profile: PublicProfile | null, suggestedName: string, suggestedUsername: string, hasGoogle: boolean): Values {
  if (profile) {
    return {
      isPublic: profile.isPublic,
      username: profile.username,
      displayName: profile.displayName,
      pronouns: profile.pronouns,
      bio: profile.bio,
      avatarSource: profile.avatarSource,
      website: profile.website,
      links: { ...profile.links },
      showEntries: profile.showEntries,
      showQuizStyle: profile.showQuizStyle,
    };
  }
  return {
    isPublic: true,
    username: suggestedUsername,
    displayName: suggestedName,
    pronouns: '',
    bio: '',
    avatarSource: hasGoogle ? 'google' : 'initials',
    website: '',
    links: emptyLinks(),
    showEntries: true,
    showQuizStyle: false,
  };
}

function ProfileEditor() {
  const { user, userId, profile: names, publicProfile, setPublicProfile } = useAuth();
  const toast = useToast();
  const quiz = useQuizResults();
  const supabase = getSupabase()!;
  const googlePhoto = googleAvatarUrl(user);

  const [saved, setSaved] = useState<PublicProfile | null>(publicProfile);
  const [values, setValues] = useState<Values>(() =>
    valuesFrom(
      publicProfile,
      names?.firstName ?? '',
      suggestUsername(names?.firstName ?? '', names?.lastName ?? ''),
      !!googlePhoto,
    ),
  );
  const [errors, setErrors] = useState<Errors>({});
  const [availability, setAvailability] = useState<Availability>('idle');
  const [busy, setBusy] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  /** A picture picked but not saved yet, already cropped and shrunk. */
  const [upload, setUpload] = useState<{ blob: Blob; previewUrl: string } | null>(null);
  const [processing, setProcessing] = useState(false);
  const fieldRefs = useRef<Partial<Record<ErrorKey, HTMLElement | null>>>({});
  const deleteButton = useRef<HTMLButtonElement>(null);
  const returnFocusToDelete = useRef(false);

  useEffect(() => {
    if (!confirmingDelete && returnFocusToDelete.current) {
      returnFocusToDelete.current = false;
      deleteButton.current?.focus();
    }
  }, [confirmingDelete]);

  const set = <K extends keyof Values>(key: K, value: Values[K]) => setValues((v) => ({ ...v, [key]: value }));
  const setLink = (id: SocialId, value: string) => setValues((v) => ({ ...v, links: { ...v.links, [id]: value } }));
  const clearError = (key: ErrorKey) => setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));

  // Let go of the preview picture when it's replaced or the page closes.
  useEffect(() => () => {
    if (upload) URL.revokeObjectURL(upload.previewUrl);
  }, [upload]);

  // Check the username is free a moment after they stop typing.
  const username = values.username;
  useEffect(() => {
    if (usernameProblem(username) || username === saved?.username) {
      setAvailability('idle');
      return;
    }
    setAvailability('checking');
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      const { data, error } = await supabase.rpc('username_available', { name: username });
      if (cancelled) return;
      setAvailability(error ? 'error' : data === true ? 'available' : 'taken');
    }, 450);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [username, saved?.username, supabase]);

  const pickPicture = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrors((x) => ({ ...x, avatar: 'That file isn’t a picture. Try a JPG, PNG or WebP.' }));
      return;
    }
    if (file.size > AVATAR_MAX_INPUT_BYTES) {
      setErrors((x) => ({ ...x, avatar: 'That picture is over 10 MB. Try a smaller one.' }));
      return;
    }
    setProcessing(true);
    try {
      const blob = await resizeAvatar(file);
      setUpload({ blob, previewUrl: URL.createObjectURL(blob) });
      clearError('avatar');
    } catch (error) {
      console.error('Glorious Mistakes: couldn’t read that picture', error);
      setErrors((x) => ({ ...x, avatar: 'We couldn’t open that picture. Try a JPG, PNG or WebP.' }));
    } finally {
      setProcessing(false);
    }
  };

  /** The saved picture for the chosen source, before any new upload. */
  const currentAvatarUrl = (source: AvatarSource): string => {
    if (source === 'google') return googlePhoto;
    if (source === 'upload') return saved?.avatarSource === 'upload' ? saved.avatarUrl : '';
    return '';
  };

  // What the profile will look like, from what's typed so far (invalid links left out).
  const preview = useMemo(() => {
    const links = emptyLinks();
    for (const p of SOCIAL_PLATFORMS) {
      const handle = parseHandle(p, values.links[p.id]);
      if (p.pattern.test(handle)) links[p.id] = handle;
    }
    const website = tidyWebsite(values.website);
    return {
      username: usernameProblem(values.username) ? 'username' : values.username,
      displayName: values.displayName.trim(),
      pronouns: values.pronouns.trim(),
      bio: values.bio.trim(),
      avatarSource: values.avatarSource,
      avatarUrl:
        values.avatarSource === 'upload' && upload ? upload.previewUrl : currentAvatarUrl(values.avatarSource),
      website: websiteProblem(website) ? '' : website,
      links,
      createdAt: saved?.createdAt ?? new Date().toISOString(),
    };
    // currentAvatarUrl only reads `saved` and `googlePhoto`.
  }, [values, upload, saved, googlePhoto]);

  const validate = (): { errors: Errors; links: SocialLinks; website: string } => {
    const found: Errors = {};
    const problem = usernameProblem(values.username);
    if (problem) found.username = problem;
    else if (availability === 'taken') found.username = 'Someone already has that username. Try another.';
    if (values.displayName.trim().length > PROFILE_FIELD_LIMITS.displayName) found.displayName = 'Keep it to 50 characters or fewer.';
    if (values.pronouns.trim().length > PROFILE_FIELD_LIMITS.pronouns) found.pronouns = 'Keep it to 30 characters or fewer.';
    if (values.bio.trim().length > PROFILE_FIELD_LIMITS.bio) found.bio = 'Keep it to 300 characters or fewer.';
    if (values.avatarSource === 'upload' && !upload && !currentAvatarUrl('upload')) {
      found.avatar = 'Choose a picture to upload, or pick another option.';
    }
    if (values.avatarSource === 'google' && !googlePhoto) found.avatar = 'Your Google account doesn’t have a photo.';
    const website = tidyWebsite(values.website);
    const websiteError = websiteProblem(website);
    if (websiteError) found.website = websiteError;
    const links = emptyLinks();
    for (const p of SOCIAL_PLATFORMS) {
      const handle = parseHandle(p, values.links[p.id]);
      if (handle && !p.pattern.test(handle)) {
        found[p.id] = `That doesn’t look like a valid ${p.label} handle. Use ${p.rule}.`;
      }
      links[p.id] = handle;
    }
    return { errors: found, links, website };
  };

  const focusFirst = (found: Errors) => {
    const first = FIELD_ORDER.find((k) => found[k]);
    if (first === 'avatar') {
      // The file picker when uploading, otherwise the chosen option.
      document.querySelector<HTMLElement>('#profile-avatar-file, input[name="avatar"]:checked')?.focus();
    } else if (first) {
      fieldRefs.current[first]?.focus();
    }
  };

  /** Removes uploaded pictures this profile no longer uses. */
  const tidyUploads = async (keepUrl: string) => {
    const { data, error } = await supabase.storage.from(AVATAR_BUCKET).list(userId!);
    if (error || !data) return;
    const stale = data.filter((f) => !keepUrl.endsWith(`/${userId}/${f.name}`)).map((f) => `${userId}/${f.name}`);
    if (stale.length) await supabase.storage.from(AVATAR_BUCKET).remove(stale);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (processing) return;
    const { errors: found, links, website } = validate();
    setErrors(found);
    if (Object.values(found).some(Boolean)) {
      focusFirst(found);
      return;
    }

    setBusy(true);
    try {
      // Make sure the username is still free (the check may not have finished).
      if (values.username !== saved?.username) {
        const { data, error } = await supabase.rpc('username_available', { name: values.username });
        if (!error && data !== true) {
          setAvailability('taken');
          const taken = { username: 'Someone already has that username. Try another.' };
          setErrors(taken);
          focusFirst(taken);
          return;
        }
      }

      let avatarUrl = currentAvatarUrl(values.avatarSource);
      if (values.avatarSource === 'upload' && upload) {
        const extension = upload.blob.type === 'image/webp' ? 'webp' : 'jpg';
        const path = `${userId}/avatar-${Date.now()}.${extension}`;
        const { error } = await supabase.storage
          .from(AVATAR_BUCKET)
          .upload(path, upload.blob, { contentType: upload.blob.type, cacheControl: '31536000', upsert: false });
        if (error) {
          console.error('Glorious Mistakes: couldn’t upload your picture', error.message);
          const failed = { avatar: 'We couldn’t upload that picture just now. Please try again.' };
          setErrors(failed);
          focusFirst(failed);
          return;
        }
        avatarUrl = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path).data.publicUrl;
      }

      const next = {
        id: userId!,
        username: values.username,
        displayName: values.displayName.trim(),
        pronouns: values.pronouns.trim(),
        bio: values.bio.trim(),
        avatarSource: values.avatarSource,
        avatarUrl,
        website,
        links,
        isPublic: values.isPublic,
        showEntries: values.showEntries,
        showQuizStyle: values.showQuizStyle,
      };
      const { data, error } = await supabase
        .from('public_profiles')
        .upsert(profileToRow(next))
        .select(PROFILE_COLUMNS)
        .single();
      if (error) {
        console.error('Glorious Mistakes: couldn’t save your profile', error.code, error.message);
        if (error.code === '23505') {
          setAvailability('taken');
          const taken = { username: 'Someone already has that username. Try another.' };
          setErrors(taken);
          focusFirst(taken);
        } else {
          toast('Sorry, we couldn’t save your profile just now. Please try again.');
        }
        return;
      }

      const profile = rowToProfile(data as PublicProfileRow);
      setSaved(profile);
      setPublicProfile(profile);
      setUpload(null);
      setValues((v) => ({ ...v, website: profile.website, links: { ...profile.links } }));
      void tidyUploads(profile.avatarSource === 'upload' ? profile.avatarUrl : '');
      toast(
        profile.isPublic
          ? `Saved. Your profile is live at ${SITE_URL.replace(/^https:\/\//, '')}${profileHref(profile.username)}.`
          : 'Saved. Your profile is hidden, so only you can see these details.',
      );
    } finally {
      setBusy(false);
    }
  };

  const deleteProfile = async () => {
    setBusy(true);
    const { error } = await supabase.from('public_profiles').delete().eq('id', userId!);
    setBusy(false);
    if (error) {
      console.error('Glorious Mistakes: couldn’t delete your profile', error.code, error.message);
      toast('Sorry, we couldn’t delete your profile just now. Please try again.');
      return;
    }
    void tidyUploads('');
    setSaved(null);
    setPublicProfile(null);
    setUpload(null);
    setConfirmingDelete(false);
    setValues(valuesFrom(null, names?.firstName ?? '', suggestUsername(names?.firstName ?? '', names?.lastName ?? ''), !!googlePhoto));
    setErrors({});
    toast('Your profile is deleted. Your mistakes are still safe in your account.');
  };

  const describedBy = (key: ErrorKey, ...extra: string[]) =>
    [...extra, errors[key] ? `profile-${key}-error` : ''].filter(Boolean).join(' ') || undefined;

  const errorFor = (key: ErrorKey) =>
    errors[key] && (
      <p id={`profile-${key}-error`} className="field__error">
        <Icon icon={CircleAlert} size={16} className="field__error-icon" />
        {errors[key]}
      </p>
    );

  const availabilityText: Record<Availability, string> = {
    idle: '',
    checking: 'Checking…',
    available: 'That username is free.',
    taken: 'Someone already has that username.',
    error: '',
  };

  const liveUrl = saved?.isPublic ? profileHref(saved.username) : null;

  return (
    <div className="profile-editor">
      <form className="settings-form profile-editor__form" onSubmit={handleSubmit} noValidate>
        {liveUrl && (
          <p className="profile-editor__live">
            Your profile is live.{' '}
            <Link href={liveUrl} className="profile-editor__live-link">
              View it <Icon icon={ExternalLink} size={16} />
            </Link>
          </p>
        )}

        <fieldset className="settings-form__group">
          <legend>Who can see it</legend>
          <p id="profile-public-hint" className="field__hint">
            When it&rsquo;s hidden, your profile page doesn&rsquo;t exist for anyone else and your entries don&rsquo;t link
            to it.
          </p>
          <div>
            <button
              type="button"
              role="switch"
              aria-checked={values.isPublic}
              aria-describedby="profile-public-hint"
              className="switch"
              onClick={() => set('isPublic', !values.isPublic)}
            >
              <span className="switch__track" aria-hidden="true">
                <span className="switch__thumb" />
              </span>
              <span>Show my profile to everyone</span>
            </button>
          </div>
          <div>
            <button
              type="button"
              role="switch"
              aria-checked={values.showEntries}
              aria-describedby="profile-entries-hint"
              className="switch"
              onClick={() => set('showEntries', !values.showEntries)}
            >
              <span className="switch__track" aria-hidden="true">
                <span className="switch__thumb" />
              </span>
              <span>List my shared mistakes on my profile</span>
            </button>
            <p id="profile-entries-hint" className="field__hint profile-editor__switch-hint">
              <Icon icon={VenetianMask} size={16} className="inline-icon" /> Only public entries with a name on them are
              listed and linked to your profile. Anonymous ones stay anonymous.
            </p>
          </div>
          <div>
            <button
              type="button"
              role="switch"
              aria-checked={values.showQuizStyle}
              aria-describedby="profile-quiz-style-hint"
              className="switch"
              onClick={() => set('showQuizStyle', !values.showQuizStyle)}
            >
              <span className="switch__track" aria-hidden="true">
                <span className="switch__thumb" />
              </span>
              <span>Show my mistake style on my profile</span>
            </button>
            <p id="profile-quiz-style-hint" className="field__hint profile-editor__switch-hint">
              <Icon icon={Shapes} size={16} className="inline-icon" />{' '}
              {quiz.latest ? (
                <>
                  Shows your latest result from the <Link href="/quiz">mistake style quiz</Link> (
                  {QUIZ_STYLES[quiz.latest.style].name}), and updates when you retake it. Your answers and
                  older results stay private.
                </>
              ) : (
                <>
                  You haven&rsquo;t taken the <Link href="/quiz">mistake style quiz</Link> yet. Once you have, your
                  latest style shows here. Your answers stay private.
                </>
              )}
            </p>
          </div>
        </fieldset>

        <fieldset className="settings-form__group">
          <legend>About you</legend>

          <div className="field">
            <label htmlFor="profile-username" className="field__label">
              Username
            </label>
            <p id="profile-username-hint" className="field__hint">
              3 to 30 lowercase letters, numbers and underscores. It&rsquo;s your profile&rsquo;s address:{' '}
              <span className="profile-editor__url">
                {SITE_URL.replace(/^https:\/\//, '')}/u/{values.username || 'username'}
              </span>
            </p>
            <div className="input-affix">
              <span className="input-affix__prefix" aria-hidden="true">
                @
              </span>
              <input
                ref={(el) => {
                  fieldRefs.current.username = el;
                }}
                id="profile-username"
                className="input"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                maxLength={PROFILE_FIELD_LIMITS.username + 1}
                value={values.username}
                onChange={(e) => {
                  set('username', tidyUsername(e.target.value));
                  clearError('username');
                }}
                aria-invalid={errors.username ? true : undefined}
                aria-describedby={describedBy('username', 'profile-username-hint', 'profile-username-status')}
              />
            </div>
            <p
              id="profile-username-status"
              className={`field__status${availability === 'taken' ? ' field__status--bad' : ''}`}
            >
              {errors.username ? '' : availabilityText[availability]}
            </p>
            {errorFor('username')}
          </div>

          <div className="settings-form__names">
            <div className="field">
              <label htmlFor="profile-displayName" className="field__label">
                Display name <span className="field__optional">(optional)</span>
              </label>
              <input
                ref={(el) => {
                  fieldRefs.current.displayName = el;
                }}
                id="profile-displayName"
                className="input"
                autoComplete="nickname"
                maxLength={PROFILE_FIELD_LIMITS.displayName}
                placeholder={`@${values.username || 'username'}`}
                value={values.displayName}
                onChange={(e) => set('displayName', e.target.value)}
                aria-invalid={errors.displayName ? true : undefined}
                aria-describedby={describedBy('displayName')}
              />
              {errorFor('displayName')}
            </div>
            <div className="field">
              <label htmlFor="profile-pronouns" className="field__label">
                Pronouns <span className="field__optional">(optional)</span>
              </label>
              <input
                ref={(el) => {
                  fieldRefs.current.pronouns = el;
                }}
                id="profile-pronouns"
                className="input"
                maxLength={PROFILE_FIELD_LIMITS.pronouns}
                placeholder="e.g. she/her"
                value={values.pronouns}
                onChange={(e) => set('pronouns', e.target.value)}
                aria-invalid={errors.pronouns ? true : undefined}
                aria-describedby={describedBy('pronouns')}
              />
              {errorFor('pronouns')}
            </div>
          </div>

          <div className="field">
            <label htmlFor="profile-bio" className="field__label">
              Short bio <span className="field__optional">(optional)</span>
            </label>
            <p id="profile-bio-hint" className="field__hint">
              A line or two about you. Up to 300 characters.
            </p>
            <textarea
              ref={(el) => {
                fieldRefs.current.bio = el;
              }}
              id="profile-bio"
              className="input input--textarea profile-editor__bio"
              rows={3}
              maxLength={PROFILE_FIELD_LIMITS.bio}
              placeholder="Professional over-thinker. Once microwaved an egg. Learning as I go."
              value={values.bio}
              onChange={(e) => set('bio', e.target.value)}
              aria-invalid={errors.bio ? true : undefined}
              aria-describedby={describedBy('bio', 'profile-bio-hint')}
            />
            <div className="field__footer">
              <span className="field__count" aria-hidden="true">
                {values.bio.length}/{PROFILE_FIELD_LIMITS.bio}
              </span>
            </div>
            {errorFor('bio')}
          </div>
        </fieldset>

        <fieldset className="settings-form__group" aria-describedby={errors.avatar ? 'profile-avatar-error' : undefined}>
          <legend>Profile picture</legend>
          <div className="choice-grid profile-editor__avatar-choices">
            <label className="choice choice--card">
              <input
                type="radio"
                name="avatar"
                value="google"
                disabled={!googlePhoto}
                checked={values.avatarSource === 'google'}
                onChange={() => {
                  set('avatarSource', 'google');
                  clearError('avatar');
                }}
              />
              <span>
                <Avatar src={googlePhoto || null} name={values.displayName || values.username} className="choice__icon" />
                <strong>My Google photo</strong>
                <span className="choice__desc">
                  {googlePhoto ? 'Stays in step if you change it on Google.' : 'Your Google account doesn’t have one.'}
                </span>
              </span>
            </label>
            <label className="choice choice--card">
              <input
                type="radio"
                name="avatar"
                value="upload"
                checked={values.avatarSource === 'upload'}
                onChange={() => set('avatarSource', 'upload')}
              />
              <span>
                <IconBadge icon={ImageUp} tone="sky" className="choice__icon" />
                <strong>Upload my own</strong>
                <span className="choice__desc">A JPG, PNG or WebP.</span>
              </span>
            </label>
            <label className="choice choice--card">
              <input
                type="radio"
                name="avatar"
                value="initials"
                checked={values.avatarSource === 'initials'}
                onChange={() => {
                  set('avatarSource', 'initials');
                  clearError('avatar');
                }}
              />
              <span>
                <Avatar src={null} name={values.displayName || values.username || '?'} className="choice__icon" />
                <strong>Just my initial</strong>
                <span className="choice__desc">On a pastel circle.</span>
              </span>
            </label>
          </div>

          {values.avatarSource === 'upload' && (
            <div className="file-picker">
              <input
                id="profile-avatar-file"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="file-picker__input"
                onChange={(e) => void pickPicture(e)}
                aria-describedby={describedBy('avatar', 'profile-avatar-hint')}
                aria-invalid={errors.avatar ? true : undefined}
              />
              <label htmlFor="profile-avatar-file" className="btn file-picker__button">
                <Icon icon={ImageUp} size={18} />
                {processing ? 'Getting it ready…' : upload || currentAvatarUrl('upload') ? 'Choose a different picture' : 'Choose a picture'}
              </label>
              <p id="profile-avatar-hint" className="field__hint">
                Up to 10 MB. We crop it to a square, shrink it and leave out hidden details like where it was taken.
                {upload && ' Save to use it.'}
              </p>
            </div>
          )}
          {errorFor('avatar')}
        </fieldset>

        <fieldset className="settings-form__group" aria-describedby="profile-links-hint">
          <legend>Links</legend>
          <p id="profile-links-hint" className="field__hint">
            All optional. Paste a link or just type your handle, and we&rsquo;ll tidy it up.
          </p>

          <div className="field">
            <label htmlFor="profile-website" className="field__label">
              Website
            </label>
            <input
              ref={(el) => {
                fieldRefs.current.website = el;
              }}
              id="profile-website"
              type="url"
              inputMode="url"
              className="input"
              autoComplete="url"
              placeholder="https://example.com"
              maxLength={PROFILE_FIELD_LIMITS.website + 8}
              value={values.website}
              onChange={(e) => {
                set('website', e.target.value);
                clearError('website');
              }}
              onBlur={() => values.website.trim() && set('website', tidyWebsite(values.website))}
              aria-invalid={errors.website ? true : undefined}
              aria-describedby={describedBy('website')}
            />
            {errorFor('website')}
          </div>

          <div className="profile-editor__socials">
            {SOCIAL_PLATFORMS.map((p) => (
              <div className="field" key={p.id}>
                <label htmlFor={`profile-${p.id}`} className="field__label profile-editor__social-label">
                  <Icon icon={p.icon} size={18} />
                  {p.label}
                </label>
                <div className="input-affix">
                  <span className="input-affix__prefix" aria-hidden="true">
                    {p.prefix}
                  </span>
                  <input
                    ref={(el) => {
                      fieldRefs.current[p.id] = el;
                    }}
                    id={`profile-${p.id}`}
                    className="input"
                    autoCapitalize="none"
                    spellCheck={false}
                    maxLength={200}
                    value={values.links[p.id]}
                    onChange={(e) => {
                      setLink(p.id, e.target.value);
                      clearError(p.id);
                    }}
                    onBlur={() => setLink(p.id, parseHandle(p, values.links[p.id]))}
                    aria-invalid={errors[p.id] ? true : undefined}
                    aria-describedby={describedBy(p.id)}
                  />
                </div>
                {errorFor(p.id)}
              </div>
            ))}
          </div>
        </fieldset>

        <div className="settings-form__actions">
          <button type="submit" className="btn btn--primary" disabled={busy || processing}>
            {busy ? 'Saving…' : saved ? 'Save changes' : 'Create my profile'}
          </button>
          {liveUrl && (
            <Link href={liveUrl} className="btn btn--ghost">
              View my profile
            </Link>
          )}
        </div>
      </form>

      <aside className="profile-editor__preview" aria-labelledby="profile-preview-title">
        <h2 id="profile-preview-title" className="profile-editor__preview-title">
          Preview
        </h2>
        <ProfileCard
          profile={preview}
          headingLevel={2}
          quizStyle={values.showQuizStyle ? (quiz.latest?.style ?? null) : null}
        />
      </aside>

      {saved && (
        <section className="settings-account profile-editor__delete" aria-label="Delete your profile">
          {confirmingDelete ? (
            <>
              <p>
                <strong>Delete your profile?</strong> Your username, bio, picture and links go for good. Your mistakes
                stay in your account.
              </p>
              <div className="btn-row">
                <button type="button" className="btn btn--danger" disabled={busy} onClick={() => void deleteProfile()}>
                  Yes, delete it
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    returnFocusToDelete.current = true;
                    setConfirmingDelete(false);
                  }}
                >
                  Keep it
                </button>
              </div>
            </>
          ) : (
            <>
              <p>Rather not have a profile? You can hide it above, or delete it altogether.</p>
              <button ref={deleteButton} type="button" className="btn" onClick={() => setConfirmingDelete(true)}>
                <Icon icon={Trash2} size={18} />
                Delete my profile
              </button>
            </>
          )}
        </section>
      )}
    </div>
  );
}
