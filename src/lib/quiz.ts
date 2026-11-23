import { Handshake, Laugh, LockKeyhole, Rewind, Wrench, type LucideIcon } from 'lucide-react';
import type { Tone } from '@/components/Icon';

/**
 * The "What's your mistake style?" quiz at /quiz: the questions, the five result styles and the
 * scoring. Each answer leans towards one style; the style with the most answers wins.
 *
 * Bump QUIZ_VERSION whenever the questions or scoring change in a way that would make old and
 * new results unfair to compare. It's saved with every result.
 */

export const QUIZ_VERSION = 1;

/** How long to wait before retaking, to see whether the style has shifted. */
export const RETAKE_DAYS = 90;

export const STYLE_IDS = ['fixer', 'replayer', 'laugher', 'owner', 'vault'] as const;
export type StyleId = (typeof STYLE_IDS)[number];

export function isStyleId(id: unknown): id is StyleId {
  return typeof id === 'string' && (STYLE_IDS as readonly string[]).includes(id);
}

export interface QuizStyle {
  id: StyleId;
  name: string;
  tagline: string;
  summary: string;
  icon: LucideIcon;
  tone: Tone;
  /** The pastel as a hex value, for the share image (which can't read CSS variables). */
  hex: string;
  strength: { title: string; short: string; text: string };
  edge: { title: string; short: string; text: string };
  /** Ends the result: a nudge to log a mistake that fits this style. */
  logPrompt: string;
}

export const QUIZ_STYLES: Record<StyleId, QuizStyle> = {
  fixer: {
    id: 'fixer',
    name: 'The Fixer',
    tagline: 'Mop already in hand.',
    summary:
      'When something goes wrong, you go straight into repair mode. Before most people have finished saying “oh no”, you’ve got a plan.',
    icon: Wrench,
    tone: 'sky',
    hex: '#B0D3D0',
    strength: {
      title: 'Action',
      short: 'Quick to repair',
      text: 'You don’t let a mistake sit and fester. You clean up fast, people trust you in a crisis, and small stuff-ups rarely turn into big ones on your watch.',
    },
    edge: {
      title: 'Asking why',
      short: 'Pause for the why',
      text: 'Fixing fast can mean skipping the bit where you work out what caused it. Take one minute after the clean-up to ask what you’d change next time, so the same mistake doesn’t come back for a sequel.',
    },
    logPrompt:
      'Log one you fixed fast. Then answer the question you skipped: what would you do differently before it happened?',
  },
  replayer: {
    id: 'replayer',
    name: 'The Replayer',
    tagline: 'Previously, on your mistake…',
    summary:
      'Mistakes stay with you. You turn them over, look at every angle and replay the key scenes, sometimes at 2 am.',
    icon: Rewind,
    tone: 'lilac',
    hex: '#C3B8E6',
    strength: {
      title: 'Deep reflection',
      short: 'Learns deeply',
      text: 'You notice details other people miss, and you genuinely learn from what goes wrong. Nobody takes a lesson more to heart than you.',
    },
    edge: {
      title: 'Letting it rest',
      short: 'Change the channel',
      text: 'Reflection turns into rumination when the replay never ends. Once you’ve found the lesson, write it down and give yourself permission to change the channel.',
    },
    logPrompt: 'Log one you’ve replayed too many times. Write the lesson in one line, then let it rest.',
  },
  laugher: {
    id: 'laugher',
    name: 'The Laugher',
    tagline: 'It’s funny now. It was funny then, too.',
    summary:
      'You meet a stuff-up with a grin. Your mistakes become stories, and your stories make everyone feel better about theirs.',
    icon: Laugh,
    tone: 'sun',
    hex: '#F5C842',
    strength: {
      title: 'Perspective',
      short: 'Bounces back',
      text: 'Humour keeps mistakes in proportion. You bounce back quickly, and you make it safe for the people around you to own up too.',
    },
    edge: {
      title: 'Finding the lesson under the joke',
      short: 'Find the lesson',
      text: 'A good laugh can skip right past the useful bit. After the punchline, ask what the story is actually trying to tell you.',
    },
    logPrompt: 'Log your funniest stuff-up, then name the lesson hiding under the joke.',
  },
  owner: {
    id: 'owner',
    name: 'The Owner',
    tagline: 'That was me. Sorry!',
    summary:
      'You own your mistakes, quickly and out loud. You’d rather apologise twice than leave anyone wondering.',
    icon: Handshake,
    tone: 'sage',
    hex: '#D0E8C6',
    strength: {
      title: 'Accountability',
      short: 'Owns it',
      text: 'People trust you because you never pass the buck. Owning it straight away clears the air and keeps your relationships strong.',
    },
    edge: {
      title: 'Sharing the load',
      short: 'Share the load',
      text: 'Owning everything can tip into over-apologising, or carrying blame that was never all yours. Try sorting out which parts were yours and which were just the situation.',
    },
    logPrompt: 'Log one you apologised for. Then ask yourself: which part of it wasn’t actually yours?',
  },
  vault: {
    id: 'vault',
    name: 'The Vault',
    tagline: 'Handled. Quietly.',
    summary:
      'You deal with mistakes calmly and privately. Most people never know anything went wrong, because by the time they could have, you’d sorted it.',
    icon: LockKeyhole,
    tone: 'blush',
    hex: '#F6D5D8',
    strength: {
      title: 'Composure',
      short: 'Stays calm',
      text: 'You stay steady under pressure and don’t make a drama out of things. That calm helps you think clearly when something goes sideways.',
    },
    edge: {
      title: 'Letting someone in',
      short: 'Let someone in',
      text: 'Keeping it all locked away means the lessons (and the support) stay locked away too. Sharing even one mistake with someone you trust can lighten the load.',
    },
    logPrompt: 'Log one you’ve never told anyone. You can keep it completely private.',
  },
};

export const STYLE_LIST: QuizStyle[] = STYLE_IDS.map((id) => QUIZ_STYLES[id]);

export interface QuizAnswer {
  text: string;
  style: StyleId;
}

export interface QuizQuestion {
  id: string;
  question: string;
  answers: QuizAnswer[];
}

/** The answers are in a different order each time so no style always sits in the same spot. */
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'wrong-email',
    question: 'You’ve just sent an email to the wrong person. First move?',
    answers: [
      { style: 'fixer', text: 'Fire off a quick “please ignore” and send it to the right person.' },
      { style: 'replayer', text: 'Reread it six times, picturing their face as they open it.' },
      { style: 'laugher', text: 'Send a follow-up gif. Might as well commit to the bit.' },
      { style: 'owner', text: 'Message them straight away to apologise properly.' },
      { style: 'vault', text: 'Say nothing and hope it slips by unnoticed.' },
    ],
  },
  {
    id: 'that-night',
    question: 'That night, the mistake pops back into your head. You…',
    answers: [
      { style: 'replayer', text: 'Watch the replay. Then the director’s cut.' },
      { style: 'fixer', text: 'Write a list of what to do tomorrow to sort it out.' },
      { style: 'laugher', text: 'Turn it into a story for the group chat.' },
      { style: 'vault', text: 'Push it aside. Tomorrow’s a new day.' },
      { style: 'owner', text: 'Wonder whether you apologised enough.' },
    ],
  },
  {
    id: 'how-was-your-week',
    question: 'A friend asks how your week went. Does the stuff-up come up?',
    answers: [
      { style: 'laugher', text: 'Absolutely. It’s my best material.' },
      { style: 'owner', text: 'Yes, and I’d say upfront that it was my fault.' },
      { style: 'vault', text: 'Probably not. It’s handled.' },
      { style: 'replayer', text: 'Yes, and then we’d pick it apart for an hour.' },
      { style: 'fixer', text: 'Only to tell them how I fixed it.' },
    ],
  },
  {
    id: 'burnt-dinner',
    question: 'You’ve burnt dinner, and your guests arrive in twenty minutes.',
    answers: [
      { style: 'fixer', text: 'Already opening windows and ordering pizza.' },
      { style: 'owner', text: 'Apologise to every guest as they walk in.' },
      { style: 'laugher', text: 'Announce tonight’s theme: charcoal.' },
      { style: 'replayer', text: 'Spend the night wondering how I didn’t smell it sooner.' },
      { style: 'vault', text: 'Quietly bin it and serve the snacks like that was always the plan.' },
    ],
  },
  {
    id: 'hardest-part',
    question: 'What’s the hardest part of a mistake for you?',
    answers: [
      { style: 'vault', text: 'Asking anyone for help.' },
      { style: 'replayer', text: 'Switching my brain off afterwards.' },
      { style: 'fixer', text: 'Sitting still when there’s nothing left to fix.' },
      { style: 'owner', text: 'Not taking all the blame, even for the bits that weren’t mine.' },
      { style: 'laugher', text: 'Taking it seriously when it actually is serious.' },
    ],
  },
  {
    id: 'manager-notices',
    question: 'Someone at work points out an error in something you made. You…',
    answers: [
      { style: 'owner', text: 'Thank them and say straight away that it’s on me.' },
      { style: 'fixer', text: 'Have a corrected version back to them within the hour.' },
      { style: 'laugher', text: 'Crack a joke to ease the tension, then fix it.' },
      { style: 'vault', text: 'Nod, fix it, and keep it between us.' },
      { style: 'replayer', text: 'Fix it, then quietly re-check everything else I’ve ever sent.' },
    ],
  },
  {
    id: 'a-week-later',
    question: 'A week later, the mistake is…',
    answers: [
      { style: 'replayer', text: 'Still on rotation, just a bit less often.' },
      { style: 'laugher', text: 'A story I’m still dining out on.' },
      { style: 'vault', text: 'Filed away. I’ve moved on.' },
      { style: 'fixer', text: 'Fixed and forgotten. Next!' },
      { style: 'owner', text: 'Smoothed over with everyone involved.' },
    ],
  },
];

export type QuizScores = Record<StyleId, number>;

export interface QuizResult {
  style: StyleId;
  scores: QuizScores;
  version: number;
  /** ISO date string. */
  takenAt: string;
}

/**
 * Counts each style's answers. A tie goes to whichever tied style was picked most recently, so
 * the same answers always give the same result.
 */
export function scoreAnswers(answers: StyleId[]): { style: StyleId; scores: QuizScores } {
  const scores = Object.fromEntries(STYLE_IDS.map((id) => [id, 0])) as QuizScores;
  for (const style of answers) scores[style] += 1;
  const best = Math.max(...Object.values(scores));
  const tied = STYLE_IDS.filter((id) => scores[id] === best);
  const style = [...answers].reverse().find((s) => tied.includes(s)) ?? tied[0];
  return { style, scores };
}

/** The style's public page, which is also the link people share. */
export function styleHref(id: StyleId): string {
  return `/quiz/${id}`;
}

/** The style's page showing the visitor's own result panel. */
export function yourResultHref(id: StyleId): string {
  return `/quiz/${id}?you=1`;
}

/** When a result can be retaken to see whether it has shifted. */
export function retakeDate(takenAt: string): Date {
  const date = new Date(takenAt);
  date.setDate(date.getDate() + RETAKE_DAYS);
  return date;
}

export function isRetakeDue(takenAt: string, now = new Date()): boolean {
  return retakeDate(takenAt).getTime() <= now.getTime();
}

const dayFormatter = new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });

/** e.g. "23 November 2026". */
export function formatQuizDate(date: Date | string): string {
  return dayFormatter.format(typeof date === 'string' ? new Date(date) : date);
}
