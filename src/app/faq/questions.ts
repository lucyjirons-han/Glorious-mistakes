import { CRINGE_LEVELS } from '@/lib/constants';
import { REACTIONS } from '@/lib/community';

/**
 * The FAQ content. The page and its FAQPage structured data are both built from this list,
 * so they always match.
 *
 * Keep the answers true to how the app works right now. In particular, revisit the "free"
 * and "where are entries stored" answers when pricing arrives. Entries are in Supabase, tied
 * to the visitor's Google account: logging a mistake needs a login, while reading the feed and
 * reacting don't.
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
              'Yes, completely free right now. Reading the feed, reacting and taking the ',
              { href: '/quiz', text: 'mistake style quiz' },
              ' cost nothing and need no account. To ',
              { href: '/log', text: 'log a mistake' },
              ' or save your quiz results, you log in with Google, which is free too. The newsletter is optional.',
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
              'Only to log a mistake or save your quiz results. Anyone can read the ',
              { href: '/feed', text: 'public feed' },
              ', react with “been there” and take the quiz. To log your own, ',
              { href: '/login', text: 'log in with Google' },
              '. That keeps your entries safe in your account, so you can see them on any device and won’t lose them if you clear your browser.',
            ],
          },
          {
            list: [
              [
                'Logged a mistake here before logins were needed? It comes with you when you log in on the same browser.',
              ],
              [
                'Once you’re logged in, the round button with your initials (top right) opens your account menu. That’s where you’ll find ',
                { href: '/mine', text: 'My mistakes' },
                ' and ',
                { href: '/settings', text: 'Settings' },
                ', where you change your name, email address and newsletter preference.',
              ],
              [
                'Logging out keeps everything safe in your account. This browser goes back to a fresh, empty start until you log in again.',
              ],
            ],
          },
        ],
      },
      {
        id: 'quiz',
        question: 'What’s the mistake style quiz?',
        answer: [
          {
            p: [
              'Seven quick questions about what you do after a stuff-up. The ',
              { href: '/quiz', text: 'quiz' },
              ' gives you one of five styles (the Fixer, the Replayer, the Laugher, the Owner or the Vault), each with a strength, a growth edge and a mistake worth logging. Anyone can take it, no login needed.',
            ],
          },
          {
            list: [
              [
                'Without an account, your latest result stays on your device, and retaking the quiz replaces it.',
              ],
              [
                'Log in with Google and each result is saved to your account, so you can retake the quiz in three months and see whether your style has shifted. Only you can see your results, and you can remove them any time.',
              ],
              [
                'Sharing a result shares the style’s page, never your name or answers.',
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
              'On the site, yes. You log in with Google to log a mistake, so we get your name and email address from Google, but they’re never shown on your entries. The name on a shared mistake is whatever you type in its display name box. Leave it blank and it’s posted as “Anonymous”.',
            ],
          },
          {
            p: [
              'If you make a public profile, shared mistakes with a name on them link to it (you can switch that off). Anonymous ones never do.',
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
        id: 'profile',
        question: 'Can I have a public profile?',
        answer: [
          {
            p: [
              'Yes, if you’d like one. Once you’re logged in, open ',
              { href: '/profile', text: 'Your profile' },
              ' to choose a username and add a short bio, a photo (your Google one, or upload your own) and links to your website, Instagram, TikTok, YouTube and more. It lives at its own address you can share, like glorious-mistakes.vercel.app/u/yourname.',
            ],
          },
          {
            p: [
              'It’s entirely optional. Your profile can list the mistakes you’ve shared with a name on them, never the anonymous or private ones, and you can hide or delete it any time.',
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
              'Only you. Private entries are saved in our database, locked to your account. Other visitors can’t see them. (If you lend someone your laptop while you’re logged in, though, they could find them in ',
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
              'In our database, linked to your account, so you can see them anywhere you log in. Clearing your browser or switching devices won’t lose them.',
            ],
          },
          {
            p: [
              'Entries logged before logins were needed are linked to an anonymous ID in the browser they were logged on. ',
              { href: '/login', text: 'Log in with Google' },
              ' on that browser to move them into your account, before clearing your browsing data loses the ID (and the entries with it).',
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
              ' to edit an entry, switch it between private and shared, or delete it. It’s in your account menu once you’re logged in (the round button with your initials, top right), and there’s a link at the bottom of every page too.',
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
