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

## How data is stored

There is no backend yet. Your entries and reactions are saved in the browser's `localStorage`
(see [`src/lib/store.tsx`](src/lib/store.tsx)), and the public feed is padded with example
entries from [`src/lib/seed.ts`](src/lib/seed.ts). To make sharing truly public across people,
replace the read/write helpers in the store with calls to an API and database.

## Project structure

```
src/
  app/          Routes (App Router), layout and global styles
  components/   Header, footer, cards, form, reactions, toast
  lib/          Types, constants, seed data and the client store
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
