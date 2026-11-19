/** Shared rules for the newsletter form, used by the form and by the API route. */

export const NEWSLETTER_LIMITS = { firstName: 60, email: 254 } as const;

export interface NewsletterInput {
  firstName: string;
  email: string;
}

export type NewsletterErrors = Partial<Record<keyof NewsletterInput, string>>;

// Deliberately simple: something@something.tld, no spaces. The real check is the confirmation
// email a mailing-list provider sends.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateNewsletter(values: NewsletterInput): NewsletterErrors {
  const errors: NewsletterErrors = {};
  const firstName = values.firstName.trim();
  const email = values.email.trim();

  if (!firstName) errors.firstName = 'Tell us your first name.';
  else if (firstName.length > NEWSLETTER_LIMITS.firstName)
    errors.firstName = `Keep it under ${NEWSLETTER_LIMITS.firstName} characters.`;

  if (!email) errors.email = 'Enter your email address.';
  else if (email.length > NEWSLETTER_LIMITS.email || !EMAIL_PATTERN.test(email))
    errors.email = 'That doesn’t look like an email address. Check for typos, like name@example.com.';

  return errors;
}
