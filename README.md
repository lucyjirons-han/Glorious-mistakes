# Glorious Mistakes

Log a mistake you made and what it taught you. Keep it private, or share it to the public feed
where other people can react with **Been there**.

- **Celebrate, don't hide.** Mistakes mean you tried something.
- **Build a reflection habit.** Two questions: what happened, and what did I take from it?
- **You're not alone.** Everyone stuffs up.
- **Keep it light.** Sharing should feel safe and fun.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

| Script              | What it does              |
| ------------------- | ------------------------- |
| `npm run dev`       | Start the dev server      |
| `npm run build`     | Production build          |
| `npm start`         | Serve the production build |
| `npm run typecheck` | Type-check with `tsc`     |

## Pages

| Route        | Purpose                                                              |
| ------------ | -------------------------------------------------------------------- |
| `/`          | Landing page: hero, how it works, fan-favourite mistakes             |
| `/feed`      | Public feed with search, category filters, sorting and reactions     |
| `/log`       | Three-step form: what happened, the lesson, private or shared        |
| `/log?edit=` | Edit one of your entries                                             |
| `/mine`      | Your entries with stats, visibility toggle, edit and delete          |
| `/feed?category=` | The feed filtered to one category, e.g. `/feed?category=food`   |
| `/learn`     | Learn articles, listed as cards                                      |
| `/learn/[slug]` | One Learn article                                                 |
| `/faq`       | Frequently asked questions                                           |
| `/search?q=` | Site search (opened from the header, which suggests matches as you type): entries, Learn articles, FAQ answers and pages. The pages list is `SITE_PAGES` in `src/lib/search.ts` |
| `/about`, `/guidelines` | About the site, and the community guidelines              |
| `/admin`     | Admin: view, add, edit and delete entries, reactions, reports and subscribers |

`/mine`, `/log` and `/search` are marked `noindex`. The sitemap (`/sitemap.xml`) and `robots.txt` are
generated from `src/app/sitemap.ts` and `src/app/robots.ts`.

## Adding a Learn article

Articles are Markdown files in [`src/content/learn`](src/content/learn). The file name becomes
the address: `my-new-article.mdx` is shown at `/learn/my-new-article`.

1. Copy one of the existing `.mdx` files and give it a new name (lowercase, words joined by
   hyphens).
2. Update the `meta` block at the top: `title`, `summary` (the one-liner on the card),
   `description` (for search results, about 150 characters), `published` (YYYY-MM-DD), and
   optionally `updated`, `order` and `related` (other article file names, without `.mdx`).
3. Write the article in Markdown underneath. Start sections with `##` (the title is the
   page's only H1), and link to pages with `[text](/feed)`.

That's it. The article appears on `/learn` and in the sitemap, gets Article structured data,
and its reading time is worked out automatically.

## SEO and sharing

Every page builds its title, description, canonical link and Open Graph / Twitter tags with
`pageMetadata()` in [`src/lib/site.ts`](src/lib/site.ts), which is also where the live address
(`SITE_URL`) lives. The default share image is drawn in code by `src/lib/share-image.tsx`.

## How data is stored

Entries, reactions and reports live in [Supabase](https://supabase.com). Each browser is
signed in anonymously on its first visit (no sign-up screen), and row level security means
people can read public entries plus their own, and change only their own. The store
([`src/lib/store.tsx`](src/lib/store.tsx)) loads everything and saves changes in the
background; the client is in [`src/lib/supabase.ts`](src/lib/supabase.ts).

The feed is padded with example entries. They're rows in `mistakes` with no owner
(`user_id` is null), so only admins can edit them, from `/admin` or the Supabase dashboard.
Their made-up starting counts are in `base_reactions`, which visitors can't set. The server
loads them ([`src/lib/examples.ts`](src/lib/examples.ts)) so example pages and the feed arrive
with them in the HTML; edits show up within 10 minutes. They keep their old ids (like
`seed-wave`), which is why `mistakes.id` is text. [`src/lib/seed.ts`](src/lib/seed.ts) holds
copies used when Supabase isn't configured or can't be reached.

- Copy `.env.example` to `.env.local` and fill in the project URL and publishable key.
  Without them (or if Supabase can't be reached) the site falls back to `localStorage`.
- **Anonymous sign-ins** must be enabled in Supabase: Authentication → Sign In / Providers.
- Entries saved in `localStorage` by earlier versions are uploaded once, on first load.
- The schema is in [`supabase/migrations`](supabase/migrations). Tables: `mistakes`,
  `reactions` (text `mistake_id`, so example entries work too), `reports`; and the
  `reaction_counts(ids)` function, which returns totals without revealing who reacted.

Newsletter sign-ups go to the `newsletter_signups` table through the `subscribe_newsletter()`
function, so the publishable key can add to the list but nobody can read it through the API.
See them in the Supabase dashboard (Table Editor). It's a stopgap: when a mailing-list provider
is connected, import the list there and empty the table.

### Admin page

> **Login switched off for now.** So a tutor can view it, `/admin` currently needs no sign-in
> and anyone can read and change everything, newsletter sign-ups included. To switch the login
> back on, follow the steps in
> [`supabase/migrations/20261120012502_temporarily_open_admin.sql`](supabase/migrations/20261120012502_temporarily_open_admin.sql)
> (restore `is_admin()` and set `ADMIN_LOGIN_REQUIRED` to `true` in `src/lib/admin.ts`).

[`/admin`](src/app/admin/AdminView.tsx) lets admins see, add, edit and delete entries,
reactions, reports and newsletter subscribers. It isn't linked from the site. Admins sign in
with an email and password; the session is stored separately from the anonymous visitor
session, so signing in doesn't lose that browser's own entries. Row level security does the
access control: the `public.admins` list (unreadable through the API) and `public.is_admin()`,
which is never true for anonymous sessions. To make someone an admin:

1. Supabase → Authentication → Users → Add user → Create new user (tick auto-confirm).
2. In the SQL editor:
   `insert into public.admins (user_id) select id from auth.users where email = 'them@example.com';`

The table, filter and form settings for each section are in
[`src/lib/admin.ts`](src/lib/admin.ts). Mistakes and Newsletter have a filter per column (text,
dropdown or date range); add `filter` to a column to give it one. Every column sorts when
you click its heading, and long tables are split into pages (10, 25, 50 or 100 rows).
Newsletter has an **Export CSV** button (the rows matching the current search and filters, in
the current order); give another section an `exportName` to add one there.

> **Reactions and Reports tabs hidden for now.** They're marked `hidden: true` in
> `src/lib/admin.ts`; remove that to bring them back (the data and database rules are unchanged).

When accounts or pricing are added, update the answers in
[`src/app/faq/questions.ts`](src/app/faq/questions.ts).

## Spot illustrations

Hand-drawn illustrations live in [`src/components/illustrations`](src/components/illustrations),
one inline SVG component each. They're decorative, so they're hidden from screen readers.

| Component          | Used on                                      |
| ------------------ | -------------------------------------------- |
| `NotebookScribble` | Home, How it works: "Own the oops"           |
| `WonkyLightbulb`   | Home, How it works: "Find the lesson"        |
| `PaperPlane`       | Home, How it works: "Keep it or share it"    |
| `DentedTrophy`     | Home, beside "Why celebrate mistakes?"       |
| `MicrowaveEgg`     | Home, bottom call to action                  |
| `PhoneLoveYouBye`  | Not used yet (e.g. the 404 page)             |
| `WavingHand`       | Not used yet (e.g. empty states)             |

Use one with a class that sets its width; the height follows from the drawing:

```tsx
import { WavingHand } from '@/components/illustrations';

<WavingHand className="empty-state__art" />; // .empty-state__art { width: 160px; }
```

To draw a new one, wrap the paths in `<Illustration viewBox="…">` and use the `.ill-*` classes
from `globals.css` instead of hex colours: `ill-ln` for lines, `ill-paper` for the object's fill,
`ill-wash` plus a colour (`ill-lilac`, `ill-sage`, `ill-sky`, `ill-blush`) for the blob behind, and
`ill-accent` plus a colour (or `ill-sun`) for the offset accent. The classes switch colour for dark
mode and for the dark call-to-action band on their own. Keep to the style: fine wobbly lines that
overshoot, a slight tilt, a few motion marks, at most one sparkle, and objects only, no faces.

## Project structure

```
src/
  app/          Routes (App Router), layout, global styles, sitemap and robots
  components/   Header, footer, cards, form, reactions, toast
  content/      Learn articles (Markdown / MDX)
  lib/          Types, constants, seed data, the client store, site metadata and articles
```

## Design

"Soft and confident": a warm cream page, deep navy ink, soft pastel blocks, rounded corners,
thin 1.5px outlines on pill buttons, and line icons from [Lucide](https://lucide.dev) in place of
emoji. Headings use Bricolage Grotesque (800), body text DM Sans. All styles live in
[`src/app/globals.css`](src/app/globals.css); its table of contents is at the top of the file.

| Brand colour | Value     | Used for                                  |
| ------------ | --------- | ----------------------------------------- |
| Ink          | `#1B1F4B` | Text, primary buttons, outlines            |
| Ink muted    | `#454A72` | Secondary text                             |
| Cream        | `#FAF7F0` | Page background (light mode)               |
| Lilac        | `#C3B8E6` | Pastel blocks, badges, category tints      |
| Sage         | `#D0E8C6` | Pastel blocks, lesson panels               |
| Sky          | `#B0D3D0` | Pastel blocks, "Been there"                |
| Blush        | `#F6D5D8` | Pastel blocks                              |
| Sun          | `#F5C842` | Accent, pressed reactions, dark-mode primary |
| Red          | `#B42318` | Errors and delete                          |

Components don't use these directly. They use theme tokens (`--c-bg`, `--c-surface`, `--c-text`,
`--c-muted`, `--c-primary`, `--c-focus`…), which switch for dark mode: a deep navy page
(`#14173A`) with cream text and a sun-yellow primary. Pastel blocks keep their colours in both
themes and always carry navy text, so every pairing passes WCAG AA contrast.

Light or dark follows the visitor's device until they pick one with the header toggle. The choice
is saved, and a small script in `<head>` ([`src/lib/theme.ts`](src/lib/theme.ts)) applies it
before the page paints.

Accessibility built in: a skip link, visible focus rings, labelled form fields with hints and
inline errors, `aria-pressed` toggles, a polite live region for toasts, decorative icons and
illustrations hidden from screen readers, and reduced-motion support (the scroll and reaction
animations switch off).
