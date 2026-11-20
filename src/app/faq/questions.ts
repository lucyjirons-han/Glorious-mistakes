import { CRINGE_LEVELS } from '@/lib/constants';
import { REACTIONS } from '@/lib/community';

/**
 * The FAQ content. The page and its FAQPage structured data are both built from this list,
 * so they always match.
 *
 * Keep the answers true to how the app works right now. In particular, revisit the "free"
 * and "where are entries stored" answers when pricing arrives. Entries are in Supabase, tied
 * to an anonymous sign-in per browser until the visitor logs in with Google (optional).
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
              'Yes, completely free right now. You don’t need an account or an email address: open the site and ',
              { href: '/log', text: 'log a mistake' },
              '. Logging in with Google and the newsletter are both optional, and free too.',
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
        id: 'logging-in',
        question: 'Do I need to log in?',
        answer: [
          {
            p: [
              'No. You can log, share and react without an account, and your entries are saved to this browser. ',
              { href: '/login', text: 'Logging in with Google' },
              ' is optional. It keeps your entries in an account, so you can see them on any device and won’t lose them if you clear your browser.',
            ],
          },
          {
            list: [
              ['Anything you’ve already logged on this device comes with you when you log in.'],
              [
                'Once you’re logged in, ',
                { href: '/settings', text: 'Settings' },
                ' is where you change your name, email address and newsletter preference.',
              ],
              [
                'Logging out keeps everything safe in your account. This browser goes back to a fresh, empty start until you log in again.',
              ],
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
              'Yes, if you want it to be. Logging or sharing a mistake never asks for your name, email or a password. If you choose to log in with Google, we get your name and email address from Google, but they’re never shown on your entries. The name on a shared mistake is whatever you type in its display name box. Leave it blank and it’s posted as “Anonymous”.',
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
        id: 'newsletter-data',
        question: 'What happens to my email if I sign up for the newsletter?',
        answer: [
          {
            p: [
              'We keep your first name and email address in our database, separate from any mistakes you log, and use them only to send the newsletter. They’re never shown on the site and never sold or shared. If you’re logged in, you can turn the newsletter on or off any time in ',
              { href: '/settings', text: 'Settings' },
              '.',
            ],
          },
          {
            p: [
              'We haven’t sent the first issue yet. When we do, it will come through a mailing-list service, and every email will have a one-click unsubscribe link.',
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
              'Only you. Private entries are saved in our database, locked to you: to this browser, or to your account if you’ve logged in. Other visitors can’t see them. (If you lend someone your laptop while you’re logged in, though, they could find them in ',
              { href: '/mine', text: 'My mistakes' },
              ', so log out first.)',
            ],
          },
          {
            p: [
              'Mistakes you share go into the ',
              { href: '/feed', text: 'public feed' },
              ' for everyone to see, alongside some example entries we’ve written. You can switch a shared entry back to private any time.',
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
              'In our database. Until you log in, they’re linked to an anonymous ID that your browser creates the first time you visit, and we don’t know who you are. That means:',
            ],
          },
          {
            list: [
              ['A different browser or device won’t show your entries.'],
              [
                'Clearing your browsing data (or using a private window and then closing it) loses the ID, and with it your way back to your entries.',
              ],
              ['Because we don’t know who you are, we can’t reconnect you to them.'],
            ],
          },
          {
            p: [
              { href: '/login', text: 'Log in with Google' },
              ' to avoid all that: your entries move into your account, and you can see them anywhere you log in.',
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
              'Reactions are counted for everyone, so the numbers you see include other people’s. The example entries started with a few made-up reactions to get the ball rolling.',
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
