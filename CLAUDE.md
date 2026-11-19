# Glorious Mistakes: working notes

A Next.js 16 (App Router) + React 19 + TypeScript site where people log mistakes and the lessons
they taught. [README.md](README.md) covers setup, pages, Learn articles, SEO, data storage,
illustrations and the design tokens. This file holds the conventions and gotchas that only live
in the code.

## Workflow

- Commit and push straight to `main`. No branches or pull requests unless asked.
- There are no tests yet. Before committing, run `npm run typecheck`, and run `npm run build` for
  anything touching routing, metadata or server/client boundaries.
- Check UI changes in the browser in **both light and dark mode**, and at phone width.
- Write copy in Australian English ("favourite", "colour", "stuff-up"), in a warm, light tone.

## Data and the backend (Supabase)

- Entries, reactions and reports live in Supabase (anonymous sign-in per browser), via
  `src/lib/store.tsx` and the helpers in `src/lib/community.ts`. The public feed is padded with
  `SEED_MISTAKES` from `src/lib/seed.ts`.
- Each browser is signed in anonymously; row level security does the access control, so
  never add a policy that lets people change rows that aren't theirs. Schema changes go in
  `supabase/migrations` as well as being applied to the project. With no env vars, or if
  Supabase can't be reached, the store falls back to `localStorage`.
- `ready` is false until the database (or device storage) has been read. Anything that depends on the visitor's own
  entries must wait for it. Seed content doesn't need to.
- The newsletter route (`src/app/api/newsletter/route.ts`) saves sign-ups to Supabase's
  `newsletter_signups` table through the `subscribe_newsletter` function, a stopgap until a
  mailing-list provider is connected. Visitors can add to the list but never read it; keep it
  that way. Never log email addresses.
- When real accounts, a mailing-list provider or pricing arrive, update the FAQ answers in
  `src/app/faq/questions.ts`. Several say the site is free and needs no account.

## Conventions

**Metadata.** Every page builds its metadata with `pageMetadata({ title, description, path })`
from `src/lib/site.ts` (add `noindex: true` for personal pages). Don't hand-write Open Graph tags.

**Icons.** Use `Icon` or `IconBadge` from `src/components/Icon.tsx`, never a raw `lucide-react`
component. They set `aria-hidden`, stroke width and sizes. Use icons instead of emoji in the UI.

**Colours.** Use the theme tokens (`--c-text`, `--c-muted`, `--c-surface`, `--c-primary`,
`--c-focus`, `--c-line`…) in CSS, not brand colours or hex values, so dark mode works. Pastel
blocks always carry navy text: add new pastel components to the "Pastel blocks" selector list
near the top of `globals.css`.

**Styles.** Everything is in `src/app/globals.css`, in the numbered sections listed at the top.
Add new rules to the matching section. Class names are BEM-ish (`block__element--modifier`).

**Illustrations.** Wrap paths in `<Illustration viewBox="…">` and colour them with the `.ill-*`
classes. The README describes the drawing style.

**Scroll animations.** `RevealOnScroll` (mounted once in the layout) reads data attributes:
- `data-reveal` on a section: its `data-reveal-stagger` children rise one after another when it
  scrolls into view.
- `data-reveal-stagger` on a container: its children are staggered. Use `revealOffset(n)` from
  `src/lib/reveal.ts` to start counting after items above it.
- `data-reveal-each` on a long list (card grids): each child rises as it reaches the screen.
Only content that starts below the fold is animated, and reduced motion switches it off.

**Client vs server.** Keep pages as server components and put interactivity in a `*View.tsx` or
component marked `'use client'`. `useSearchParams()` needs a `<Suspense>` boundary, and the page
then pre-renders only the fallback, so prefer reading `searchParams` in the server page.

## Accessibility patterns to keep

- Every input has a `<label>`. Hints and errors are linked with `aria-describedby`, invalid fields
  get `aria-invalid`, and on submit, focus moves to the first invalid field.
- Groups of radios use `<fieldset>` + `<legend>`. Toggle buttons use `aria-pressed`.
- Announce results of actions with `useToast()` (a polite live region) rather than new
  `aria-live` regions.
- Buttons that repeat on every card get a visually hidden suffix naming the entry, e.g.
  `Edit<span className="sr-only"> “{title}”</span>`.
- Decorative icons and illustrations are hidden from screen readers. Anything that carries
  meaning needs text.
- Use `:focus-visible` outlines with `--c-focus`. Never remove a focus style without replacing it.
- New animations go inside `@media (prefers-reduced-motion: no-preference)`.
