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
| `/login`     | Log in with Google (needed to log a mistake). `?next=` is where to go afterwards |
| `/settings`  | Logged-in people change their name, email address and newsletter setting |
| `/profile`   | Logged-in people set up their optional public profile, with a live preview |
| `/u/[username]` | A public profile: picture, name, pronouns, bio, links and their named public entries |
| `/admin`     | Admin (admins only): view, add, edit and delete entries, people, reactions, reports and subscribers |

`/mine`, `/log`, `/search`, `/login`, `/settings`, `/profile` and `/admin` are marked `noindex`. Public profiles can be indexed but aren't in the sitemap. The sitemap (`/sitemap.xml`) and `robots.txt` are
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
signed in anonymously on its first visit so it can read and react, and row level security means
people can read public entries plus their own, and change only their own. Logging in with
Google is needed to log a mistake; see [Accounts](#accounts) below. The store
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
  So must the **Google** provider and **manual identity linking** (see [Accounts](#accounts)).
- Entries saved in `localStorage` by earlier versions are uploaded once, on first load.
- The schema is in [`supabase/migrations`](supabase/migrations). Tables: `mistakes`,
  `reactions` (text `mistake_id`, so example entries work too), `reports`; and the
  `reaction_counts(ids)` function, which returns totals without revealing who reacted.

Newsletter sign-ups go to the `newsletter_signups` table through the `subscribe_newsletter()`
function, so the publishable key can add to the list but nobody can read it through the API.
See them in the Supabase dashboard (Table Editor). It's a stopgap: when a mailing-list provider
is connected, import the list there and empty the table.

### Accounts

Visitors can log in with Google from the header (a round button on wide screens, or in the menu
on narrow ones). Once logged in, the account menu holds My mistakes, Your profile, Settings and (for admins)
Admin. Logging a mistake needs a login: `/log` asks anonymous visitors to log in, and row level
security rejects inserts from anonymous sessions. Reading and reacting don't need one. Everything lives in [`src/lib/auth.tsx`](src/lib/auth.tsx) (`useAuth()`), and
the store reloads whenever the user changes.

- **Logging in keeps your entries.** The anonymous user is upgraded with
  `supabase.auth.linkIdentity()`, so the user id stays the same. If the Google account already
  exists (they logged in on another device first), linking fails, so we log in to that account
  instead and move this browser's entries across with a one-off code
  (`start_account_transfer()` before, `finish_account_transfer()` after; codes last an hour).
- **Logging out** (this browser only) starts a fresh anonymous session, so "My mistakes" is
  empty until they log back in.
- **Names** (`profiles` table) hold a first and last name, filled from Google the first time
  and editable in `/settings`. Only the person and admins can read them.
- **Public profiles** (`public_profiles` table, [`src/lib/profiles.ts`](src/lib/profiles.ts))
  are optional pages at `/u/<username>`, set up at `/profile`: a username, display name,
  pronouns, bio, avatar and links (website, Instagram, TikTok, YouTube, X, Threads, LinkedIn,
  Facebook). Anyone can read the ones marked public; hidden or missing ones are a 404. Only
  logged-in owners can create or edit theirs. Social accounts are stored as handles and the links
  are built in code, and the database checks every field, so a profile can't link or load a
  picture from anywhere unexpected. `useAuth().publicProfile` holds the visitor's own.
  - **Avatars** are the person's Google photo (refreshed at each login), a picture uploaded to
    the public `avatars` Storage bucket (cropped to a 400 × 400 WebP in the browser first; people
    can only write to their own `avatars/<user id>/` folder), or their initial.
  - **Entries and profiles:** a public entry with a display name links to its author's profile
    when the profile is public and "List my shared mistakes" is on. Anonymous entries never link.
    The store looks these up (`fetchAuthorProfiles`) and sets `authorProfile` on each entry.
  - The profile page is rendered on the server on every request (`src/lib/profiles-server.ts`),
    as a signed-out visitor.
  - **Reports:** anyone but the owner can report a public profile once, with a reason and an
    optional note (`profile_reports` table, `reportProfile()`). Admins see them on the
    **Profile reports** tab (through `admin_profile_reports()`, which adds the username).
- **Newsletter:** `my_newsletter_subscription()` and `set_my_newsletter_subscription()` only
  ever touch the address on the person's own account, so the list stays unreadable.
- **Changing email** uses `supabase.auth.updateUser({ email })`, which emails a confirmation
  link. Supabase's built-in email sender only delivers to your own team's addresses (and only a
  few an hour), so set up custom SMTP (Authentication → Emails) before real visitors rely on it.

Supabase settings this needs (Authentication):

1. **Sign In / Providers → Google**: on, with the client ID and secret from a Google Cloud OAuth
   client (Web application). The Google client's redirect URI is
   `https://<project>.supabase.co/auth/v1/callback`.
2. **Allow manual linking** (in the same settings): on, so anonymous visitors can upgrade.
3. **URL Configuration → Redirect URLs**: `http://localhost:3000/**` and the live site's
   address with `/**` on the end.

### Admin page

[`/admin`](src/app/admin/AdminView.tsx) lets admins see, add, edit and delete entries, people,
public profiles, reactions, reports (on entries and on profiles) and newsletter subscribers. On the **Profiles** tab, an
admin can hide a profile (Public: No), clear a bio, or switch a picture off (Picture: Initial only). Admins log in with Google like everyone else,
land on `/admin` straight after logging in, and see an **Admin** link in the account menu. Row level security does the access
control: the `public.admins` list (unreadable through the API) and `public.is_admin()`, which is
never true for anonymous sessions.

The **People** tab lists everyone who has logged in, with their email, role, number of entries
and last login, through the admin-only `admin_people()` function. To make someone an admin
(or take it away), have them log in once, then edit them there and change their **Role**; that
calls `admin_set_role()`, which won't let an admin remove their own role, so there's always at
least one. With no admins at all, add the first one in the SQL editor:

`insert into public.admins (user_id) select id from auth.users where email = 'them@example.com';`

The table, filter and form settings for each section are in
[`src/lib/admin.ts`](src/lib/admin.ts). Mistakes and Newsletter have a filter per column (text,
dropdown or date range); add `filter` to a column to give it one. Every column sorts when
you click its heading, and long tables are split into pages (10, 25, 50 or 100 rows).
Newsletter has an **Export CSV** button (the rows matching the current search and filters, in
the current order); give another section an `exportName` to add one there.

When pricing or a mailing-list provider arrives, update the answers in
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
