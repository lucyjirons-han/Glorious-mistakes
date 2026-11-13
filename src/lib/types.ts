export type Visibility = 'private' | 'public';

export type CategoryId =
  | 'work'
  | 'home'
  | 'social'
  | 'kitchen'
  | 'money'
  | 'tech'
  | 'travel'
  | 'other';

export type CringeLevel = 1 | 2 | 3 | 4 | 5;

export interface Mistake {
  id: string;
  title: string;
  whatHappened: string;
  lesson: string;
  category: CategoryId;
  cringe: CringeLevel;
  visibility: Visibility;
  /** Display name for the public feed. Empty means "Anonymous". */
  author: string;
  /** ISO date string. */
  createdAt: string;
  /** "Been there" reactions from other people (excludes the current visitor). */
  baseBeenThere: number;
  /** True when the current visitor wrote this entry. */
  mine: boolean;
}

/** The fields a person fills in when logging or editing a mistake. */
export type MistakeInput = Pick<
  Mistake,
  'title' | 'whatHappened' | 'lesson' | 'category' | 'cringe' | 'visibility' | 'author'
>;
