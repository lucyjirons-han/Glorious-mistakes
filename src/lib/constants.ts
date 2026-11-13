import type { CategoryId, CringeLevel, Mistake } from './types';

export interface Category {
  id: CategoryId;
  label: string;
  emoji: string;
}

export const CATEGORIES: Category[] = [
  { id: 'work', label: 'Work', emoji: '💼' },
  { id: 'social', label: 'Social', emoji: '🗣️' },
  { id: 'kitchen', label: 'Kitchen', emoji: '🍳' },
  { id: 'home', label: 'Home', emoji: '🏠' },
  { id: 'money', label: 'Money', emoji: '💸' },
  { id: 'tech', label: 'Tech', emoji: '💻' },
  { id: 'travel', label: 'Travel', emoji: '✈️' },
  { id: 'other', label: 'Other', emoji: '🌀' },
];

export interface Cringe {
  level: CringeLevel;
  label: string;
  emoji: string;
}

export const CRINGE_LEVELS: Cringe[] = [
  { level: 1, label: 'Mild oops', emoji: '🙃' },
  { level: 2, label: 'Whoopsie', emoji: '😅' },
  { level: 3, label: 'Facepalm', emoji: '🤦' },
  { level: 4, label: 'Big yikes', emoji: '😬' },
  { level: 5, label: 'Legendary', emoji: '🫠' },
];

export const LIMITS = {
  title: 100,
  whatHappened: 600,
  lesson: 400,
  author: 40,
} as const;

export function getCategory(id: CategoryId): Category {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
}

export function getCringe(level: CringeLevel): Cringe {
  return CRINGE_LEVELS.find((c) => c.level === level) ?? CRINGE_LEVELS[0];
}

export function displayAuthor(mistake: Pick<Mistake, 'author'>): string {
  return mistake.author.trim() || 'Anonymous';
}

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '' : dateFormatter.format(date);
}

export const CELEBRATIONS = [
  'Glorious! Mistake logged.',
  'Nailed it. (The lesson, not the mistake.)',
  'Another one for the hall of fame!',
  'Stuffed up, levelled up.',
  'Look at you, learning things!',
];
