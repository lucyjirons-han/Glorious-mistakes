# 💥 Glorious Mistakes

Log a mistake you made and what it taught you. Keep it private, or share it to the public feed
where other people can react with **🙋 Been there**.

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
| `/about`, `/guidelines` | About the site, and the community guidelines              |

`/mine` and `/log` are marked `noindex`. The sitemap (`/sitemap.xml`) and `robots.txt` are
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

There is no backend yet. Your entries and reactions are saved in the browser's `localStorage`
(see [`src/lib/store.tsx`](src/lib/store.tsx)), and the public feed is padded with example
entries from [`src/lib/seed.ts`](src/lib/seed.ts). This means entries you "share" currently
only appear in the feed on your own device; the FAQ says so. When this changes (or accounts or
pricing are added), update the answers in [`src/app/faq/questions.ts`](src/app/faq/questions.ts).
To make sharing truly public across people,
replace the read/write helpers in the store with calls to an API and database.

## Project structure

```
src/
  app/          Routes (App Router), layout, global styles, sitemap and robots
  components/   Header, footer, cards, form, reactions, toast
  content/      Learn articles (Markdown / MDX)
  lib/          Types, constants, seed data, the client store, site metadata and articles
```

## Design

Playful, chunky "sticker" style: 2px navy outlines, offset shadows and bouncy transitions.

| Token      | Colour    |
| ---------- | --------- |
| Primary    | `#E879F9` |
| Secondary  | `#38BDF8` |
| Accent     | `#FBBF24` |
| Background | `#FDF4FF` |
| Text       | `#1E1B4B` |

Text always sits in navy on the bright colours, so every pairing passes WCAG AA contrast.
Includes a skip link, visible focus rings, labelled form fields with inline errors, `aria-pressed`
toggles, a polite live region for toasts, and reduced-motion support.
