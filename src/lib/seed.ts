import type { Mistake } from './types';

/**
 * Example entries from "other people" so the public feed is never empty.
 * In a real deployment these would come from a database.
 */
export const SEED_MISTAKES: Mistake[] = [
  {
    id: 'seed-reply-all',
    title: "Replied-all to 400 people with 'lol who invited Kevin'",
    whatHappened:
      'Company-wide invite for the end-of-year party. Meant to send my snarky comment to one friend. Sent it to the entire company. Including Kevin. Kevin organised the party.',
    lesson:
      'Check the To: field like it owes you money. Also, Kevin is lovely and I now help him plan every party.',
    category: 'work',
    cringe: 5,
    visibility: 'public',
    author: 'Priya',
    createdAt: '2026-11-11T09:12:00.000Z',
    baseBeenThere: 248,
    mine: false,
  },
  {
    id: 'seed-dish-soap',
    title: 'Put washing-up liquid in the dishwasher',
    whatHappened:
      'Ran out of dishwasher tablets, figured soap is soap. Twenty minutes later the kitchen looked like a foam party in Ibiza. The dog was thrilled.',
    lesson: 'The special detergent exists for a reason. Read the label before improvising.',
    category: 'kitchen',
    cringe: 4,
    visibility: 'public',
    author: 'Marco',
    createdAt: '2026-11-10T18:40:00.000Z',
    baseBeenThere: 131,
    mine: false,
  },
  {
    id: 'seed-wave',
    title: 'Waved back at someone who was waving at the person behind me',
    whatHappened:
      'Big enthusiastic wave across a busy café. They walked straight past me into the arms of their actual friend.',
    lesson:
      'Commit to the bit: turn it into a stretch, fix your hair, nobody will ever know. Everyone does this.',
    category: 'social',
    cringe: 3,
    visibility: 'public',
    author: '',
    createdAt: '2026-11-09T12:05:00.000Z',
    baseBeenThere: 412,
    mine: false,
  },
  {
    id: 'seed-wrong-folder',
    title: 'Deleted the wrong folder. The important one.',
    whatHappened:
      'Cleaning up my laptop at 1am. Confidently deleted "old_stuff". It was not old stuff. It was my entire thesis draft.',
    lesson:
      "Backups aren't boring, they're love letters to future you. I now back up everything twice and sleep like a baby.",
    category: 'tech',
    cringe: 5,
    visibility: 'public',
    author: 'Jo',
    createdAt: '2026-11-08T01:22:00.000Z',
    baseBeenThere: 189,
    mine: false,
  },
  {
    id: 'seed-love-you',
    title: "Ended a call with my boss by saying 'love you, bye!'",
    whatHappened:
      'Had just been on the phone to my mum. Autopilot took over. There was a long pause, then my boss said "...love you too?"',
    lesson:
      'Autopilot is powerful. Slow down at the end of calls. On the bright side, team morale has never been higher.',
    category: 'work',
    cringe: 4,
    visibility: 'public',
    author: 'Dani',
    createdAt: '2026-11-06T16:30:00.000Z',
    baseBeenThere: 356,
    mine: false,
  },
  {
    id: 'seed-cheap-flight',
    title: "Booked a 'bargain' flight to an airport 2 hours from the city",
    whatHappened:
      'Saved £40 on the flight. Spent £70 on a coach and missed the first evening of the trip.',
    lesson: 'The cheapest option often has hidden costs. Check the map, not just the price.',
    category: 'travel',
    cringe: 2,
    visibility: 'public',
    author: 'Tom',
    createdAt: '2026-11-04T07:45:00.000Z',
    baseBeenThere: 97,
    mine: false,
  },
  {
    id: 'seed-free-trials',
    title: 'Signed up for six free trials and forgot every single one',
    whatHappened:
      'Was paying for three streaming services, a language app, a meal kit and a premium weather app. A premium. Weather. App.',
    lesson: 'Set a reminder the moment you sign up for anything "free".',
    category: 'money',
    cringe: 3,
    visibility: 'public',
    author: 'Aisha',
    createdAt: '2026-11-02T20:10:00.000Z',
    baseBeenThere: 173,
    mine: false,
  },
  {
    id: 'seed-egg',
    title: 'Reheated a boiled egg in the microwave',
    whatHappened: 'It exploded the moment I bit into it. I can still hear the pop.',
    lesson: 'Eggs are tiny grenades. Some things are best eaten cold.',
    category: 'kitchen',
    cringe: 4,
    visibility: 'public',
    author: 'Sam',
    createdAt: '2026-10-30T13:00:00.000Z',
    baseBeenThere: 88,
    mine: false,
  },
  {
    id: 'seed-you-too',
    title: "Said 'you too' when the waiter said 'enjoy your meal'",
    whatHappened: 'He was not eating. He was working. We both pretended it did not happen.',
    lesson: 'Laughing it off is the right move. Nobody remembers it but you.',
    category: 'social',
    cringe: 2,
    visibility: 'public',
    author: '',
    createdAt: '2026-10-27T19:20:00.000Z',
    baseBeenThere: 521,
    mine: false,
  },
  {
    id: 'seed-mute',
    title: 'Gave a whole presentation on mute',
    whatHappened:
      'Practised for two weeks. Delivered it perfectly. Nine minutes in, someone typed "we can\'t hear you" in the chat.',
    lesson:
      'Always open with "can everyone hear me?" The boring check saves the day. My second run was even better.',
    category: 'work',
    cringe: 3,
    visibility: 'public',
    author: 'Leo',
    createdAt: '2026-10-24T10:00:00.000Z',
    baseBeenThere: 204,
    mine: false,
  },
  {
    id: 'seed-paint',
    title: 'Painted the bedroom without checking the colour in daylight',
    whatHappened:
      'Looked like a soft calming grey in the shop. In my room it is unmistakably the colour of an old swimming pool.',
    lesson: 'Test a patch first and look at it at different times of day. Or embrace the pool.',
    category: 'home',
    cringe: 2,
    visibility: 'public',
    author: 'Ngozi',
    createdAt: '2026-10-20T15:15:00.000Z',
    baseBeenThere: 64,
    mine: false,
  },
];
