'use client';

import { CircleAlert, Flag } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Icon } from '@/components/Icon';
import { useToast } from '@/components/Toast';
import {
  hasReportedProfile,
  PROFILE_REPORT_DETAILS_LIMIT,
  PROFILE_REPORT_REASONS,
  reportProfile,
  type ProfileReportReason,
} from '@/lib/profiles';

/**
 * "Report this profile": a quiet link that opens a short form (what's wrong, plus an optional
 * note). The report goes to the admins; this device remembers it, so the thanks stays put.
 */
export function ReportProfile({ profileId, name }: { profileId: string; name: string }) {
  const toast = useToast();
  const [state, setState] = useState<'idle' | 'open' | 'sending' | 'sent'>('idle');
  const [reason, setReason] = useState<ProfileReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');
  const thanks = useRef<HTMLParagraphElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const firstReason = useRef<HTMLInputElement>(null);
  /** Where focus goes after the form opens or closes. */
  const focusNext = useRef<'form' | 'opener' | 'thanks' | null>(null);

  useEffect(() => {
    if (hasReportedProfile(profileId)) setState('sent');
  }, [profileId]);

  useEffect(() => {
    const target = focusNext.current;
    focusNext.current = null;
    if (target === 'form') firstReason.current?.focus();
    if (target === 'opener') opener.current?.focus();
    if (target === 'thanks') thanks.current?.focus();
  }, [state]);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    if (!reason) {
      setError('Choose what’s wrong, so we know what to look at.');
      firstReason.current?.focus();
      return;
    }
    setState('sending');
    try {
      await reportProfile(profileId, reason, details);
      focusNext.current = 'thanks';
      setState('sent');
    } catch (err) {
      console.error('Glorious Mistakes: couldn’t send the report', err);
      setState('open');
      toast('Sorry, we couldn’t send your report just now. Please try again.');
    }
  };

  if (state === 'sent') {
    return (
      <div className="report">
        <p ref={thanks} className="report__thanks" role="status" tabIndex={-1}>
          Thanks for letting us know. We&rsquo;ll take a look.
        </p>
      </div>
    );
  }

  if (state === 'idle') {
    return (
      <div className="report">
        <button
          ref={opener}
          type="button"
          className="report__link"
          onClick={() => {
            focusNext.current = 'form';
            setState('open');
          }}
        >
          <Icon icon={Flag} size={14} /> Report this profile
        </button>
      </div>
    );
  }

  return (
    <form className="report-form" onSubmit={send} noValidate aria-labelledby="report-form-title">
      <h2 id="report-form-title" className="report-form__title">
        <Icon icon={Flag} size={18} /> Report {name}&rsquo;s profile
      </h2>
      <p className="field__hint">
        Reports go to our moderators and stay private: {name} won&rsquo;t know who sent it.
      </p>

      <fieldset className="report-form__reasons" aria-describedby={error ? 'report-reason-error' : undefined}>
        <legend className="field__label">What&rsquo;s wrong?</legend>
        {PROFILE_REPORT_REASONS.map((r, i) => (
          <label key={r.id} className="radio-row">
            <input
              ref={i === 0 ? firstReason : undefined}
              type="radio"
              name="report-reason"
              value={r.id}
              checked={reason === r.id}
              aria-invalid={error ? true : undefined}
              onChange={() => {
                setReason(r.id);
                setError('');
              }}
            />
            <span>{r.label}</span>
          </label>
        ))}
        {error && (
          <p id="report-reason-error" className="field__error">
            <Icon icon={CircleAlert} size={16} className="field__error-icon" />
            {error}
          </p>
        )}
      </fieldset>

      <div className="field">
        <label htmlFor="report-details" className="field__label">
          Anything else we should know? <span className="field__optional">(optional)</span>
        </label>
        <textarea
          id="report-details"
          className="input input--textarea"
          rows={3}
          maxLength={PROFILE_REPORT_DETAILS_LIMIT}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />
      </div>

      <div className="btn-row">
        <button type="submit" className="btn btn--primary" disabled={state === 'sending'}>
          {state === 'sending' ? 'Sending…' : 'Send report'}
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => {
            focusNext.current = 'opener';
            setState('idle');
            setError('');
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
