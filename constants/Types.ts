// Scholar Quote — Core Types

export interface Scholar {
  id: string;
  name: string;
  shortName: string;
  nameAr: string;
  era: string;
  school: string;
  bio: string;
  accentColor: string;
  isPremium: boolean;
  initials: string;
  quoteCount: number;
}

export interface Book {
  id: string;
  title: string;
  titleAr: string;
  scholarId: string;
  yearWritten?: string;
}

export interface Quote {
  id: string;
  text: string;
  textAr?: string;
  scholarId: string;
  bookId: string;
  topic: Topic;
  isPremium: boolean;
  isVerified: boolean;
  scholar?: Scholar;
  book?: Book;
}

export interface DailyQuote {
  id: string;
  quoteId: string;
  date: string;
  quote?: Quote;
}

export interface UserSave {
  id: string;
  quoteId: string;
  createdAt: string;
}

export type Topic =
  | 'Heart'
  | 'Knowledge'
  | 'Dunya'
  | 'Character'
  | 'Spirituality'
  | 'Patience'
  | 'Gratitude'
  | 'Death'
  | 'Brotherhood';

export const TOPICS: Topic[] = [
  'Heart',
  'Knowledge',
  'Dunya',
  'Character',
  'Spirituality',
  'Patience',
  'Gratitude',
  'Death',
  'Brotherhood',
];

export const TOPIC_ICONS: Record<Topic, string> = {
  Heart: '♥',
  Knowledge: '📖',
  Dunya: '🌍',
  Character: '⭐',
  Spirituality: '🕌',
  Patience: '🌙',
  Gratitude: '🤲',
  Death: '⏳',
  Brotherhood: '🤝',
};
