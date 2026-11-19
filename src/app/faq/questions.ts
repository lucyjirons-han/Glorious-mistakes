import { CRINGE_LEVELS } from '@/lib/constants';
import { REACTIONS } from '@/lib/community';

/**
 * The FAQ content. The page and its FAQPage structured data are both built from this list,
 * so they always match.
 *
 * Keep the answers true to how the app works right now. In particular, revisit the
 * "free / no account" and "where are entries stored" answers when accounts, pricing or a
 * shared database arrive.
 *
 * An answer is a list of blocks. A block is a paragraph (a list of text and links) or a
 * bullet list.
 */

export type Inline = string | { href: string; text: string };
export type Block = { p: Inline[] } | { list: Inline[][] };

export interface Question {
  id: string;
  question: string;
  answer: Block[];
}

export interface QuestionGroup {
  id: string;
  title: string;
  questions: Question[];
}

const otherReactions = REACTIONS.filter((r) => r.id !== 'been-there').map((r) => r.label);

export const FAQ_GROUPS: QuestionGroup[] = [
  {
    id: 'basics',
    title: 'The basics',
    questions: [
      {
        id: 'what-is-it',
        question: 'What is Glorious Mistakes?',
        answer: [
          {
            p: [
              'It’s a place to log your stuff-ups and what they taught you. Every entry answers two questions: what happened, and what did I take from it? You can keep it private, or share it to the ',
              { href: '/feed', text: 'public feed' },
              '.',
            ],
          },
          {
            p: [
              'The idea is simple: mistakes mean you tried something. They deserve a laugh and a lesson, not a cover-up. ',
              { href: '/about', text: 'More about us' },
              '.',
            ],
          },
        ],
      },
      {
        id: 'is-it-free',
        question: 'Is it free?',
        answer: [
          {
            p: [
              'Yes, completely free right now. There’s no account, no sign-up and no email address needed (the newsletter is optional). Open the site and ',
              { href: '/log', text: 'log a mistake' },
              '.',
            ],
          },
          {
            p: [
              'That may change down the track as the site grows. If it does, we’ll update this answer.',
            ],
          },
        ],
      },
      {
        id: 'cringe-levels',
        question: 'What do the cringe levels mean?',
        answer: [
          {
            p: [
              'When you log a mistake, the Cringe-o-meter asks how much it makes you squirm, on a scale of one to five:',
            ],
          },
          {
            list: CRINGE_LEVELS.map((c) => [`${c.level}. ${c.label}`]),
          },
          {
            p: [
              'It’s your call, and it’s a rating of the moment, not of you. On the feed you can sort by “Most cringe” to find the truly legendary ones.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy and your data',
    questions: [
      {
        id: 'anonymous',
        question: 'Is it really anonymous?',
        answer: [
          {
            p: [
              'Yes. There are no accounts, so logging or sharing a mistake never asks for your name, email or a password. The only place we ask for a first name and email is the optional newsletter sign-up, and that isn’t linked to your entries. If you share a mistake, the name shown on it is optional. Leave it blank and it’s posted as “Anonymous”.',
            ],
          },
          {
            p: [
              'The one thing that can give you away is the story itself, so leave out names, workplaces and other details that would make you (or anyone else) easy to spot.',
            ],
          },
        ],
      },
      {
        id: 'who-can-see',
        question: 'Who can see my private mistakes?',
        answer: [
          {
            p: [
              'Only people using this browser on this device. Private entries are never sent anywhere. (So if you lend someone your laptop, they could find them in ',
              { href: '/mine', text: 'My mistakes' },
              '.)',
            ],
          },
          {
            p: [
              'And while we’re being honest: right now, shared mistakes stay on your device too. The shared part of the feed is still being built. Mistakes you share appear in the feed in your browser, alongside example entries we’ve written to show how it works, but they aren’t sent to anyone else yet. When the feed goes properly public, we’ll update this page.',
            ],
          },
        ],
      },
      {
        id: 'storage',
        question: 'Where are my entries stored?',
        answer: [
          {
            p: [
              'In your web browser, on the device you’re using. There’s no server, database or account behind the site yet. That means:',
            ],
          },
          {
            list: [
              ['A different browser or device won’t show your entries.'],
              [
                'Clearing your browsing data (or using a private window and then closing it) deletes them for good.',
              ],
              ['There’s no backup, so we can’t get them back for you.'],
            ],
          },
        ],
      },
      {
        id: 'edit-delete',
        question: 'Can I edit or delete an entry?',
        answer: [
          {
            p: [
              'Yes, any time. Head to ',
              { href: '/mine', text: 'My mistakes' },
              ' to edit an entry, switch it between private and shared, or delete it.',
            ],
          },
          {
            p: [
              'Deleting is for good: there’s no undo and no bin. We’ll ask you to confirm first, just in case.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'posting',
    title: 'Posting and reacting',
    questions: [
      {
        id: 'been-there',
        question: 'What does “Been there” do?',
        answer: [
          {
            p: [
              'It’s the quickest way to say “me too”. Tap it on a mistake that hits a little close to home, and tap it again if you change your mind.',
            ],
          },
          {
            p: [
              `Each entry’s page also has four more reactions: ${otherReactions.slice(0, -1).join(', ')} and ${otherReactions[otherReactions.length - 1]}. You can give each one once. You can’t react to your own mistakes, though. No self-high-fives.`,
            ],
          },
          {
            p: [
              'Your reactions are saved in your browser for now. The counts on the example entries are part of the example.',
            ],
          },
        ],
      },
      {
        id: 'no-comments',
        question: 'Why are there no comments?',
        answer: [
          {
            p: [
              'To keep things kind and light. No pile-ons, no unasked-for advice, no “well, actually”. A quick reaction says everything a comment would, without the risk of someone being a goose about it.',
            ],
          },
        ],
      },
      {
        id: 'not-allowed',
        question: 'What am I not allowed to post?',
        answer: [
          {
            p: ['Share your own stuff-ups, and please don’t:'],
          },
          {
            list: [
              ['Name other people. Say “my manager” or “a mate”, not real names, usernames or tags.'],
              [
                'Share private details, like addresses, phone numbers, workplaces, health info or screenshots of other people’s messages. That goes for your own details too.',
              ],
              ['Make someone else the punchline. If the joke only works because they look bad, it’s their story to tell.'],
            ],
          },
          {
            p: [
              'The ',
              { href: '/guidelines', text: 'Community guidelines' },
              ' have the full list. Not sure? Keep it private.',
            ],
          },
        ],
      },
    ],
  },
];

export const ALL_QUESTIONS = FAQ_GROUPS.flatMap((g) => g.questions);

/** Plain text for an answer, used in the structured data. */
export function answerText(blocks: Block[]): string {
  const inline = (parts: Inline[]) => parts.map((p) => (typeof p === 'string' ? p : p.text)).join('');
  return blocks
    .map((b) => ('p' in b ? inline(b.p) : b.list.map((item) => `• ${inline(item)}`).join('\n')))
    .join('\n\n');
}
