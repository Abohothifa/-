export type ThikrCategory = 'morning' | 'evening';

export interface VocabularyWord {
  word: string;
  meaning: string;
}

export interface ThikrItem {
  id: string;
  category: ThikrCategory;
  order: number;
  title: string;
  text: string;
  repeat: number;
  source: string;
  virtue?: string;
  vocabulary?: VocabularyWord[];
}

export type ThemeMode = 'day' | 'night' | 'auto';
export type FontChoice = 'amiri' | 'scheherazade' | 'naskh' | 'cairo' | 'tajawal';
export type LineHeightOption = 'compact' | 'comfortable' | 'relaxed';
export type PaperTheme = 'ivory' | 'parchment' | 'white' | 'sage' | 'obsidian' | 'midnight';
export type CounterSize = 'small' | 'medium' | 'large';
export type ReadingMode = 'book' | 'continuous';

export interface ReminderItem {
  enabled: boolean;
  time: string; // HH:mm
}

export interface ReminderSettings {
  masterEnabled: boolean;
  morning: ReminderItem;
  evening: ReminderItem;
}

export interface AppSettings {
  themeMode: ThemeMode;
  paperTheme: PaperTheme;
  fontFamily: FontChoice;
  fontSize: number; // px, 18 to 36
  lineHeight: LineHeightOption;
  counterSize: CounterSize;
  readingMode: ReadingMode;
  hapticEnabled: boolean;
  soundEnabled: boolean;
  autoAdvance: boolean;
  showVirtueByDefault: boolean;
  reminders: ReminderSettings;
}

export interface DailyProgressState {
  dateKey: string; // YYYY-MM-DD local date
  counts: Record<string, number>; // thikrId -> completed tap count today
  morningCompletedToday: boolean;
  eveningCompletedToday: boolean;
  lastCategory: ThikrCategory;
  lastPageByCategory: Record<ThikrCategory, number>; // 0-indexed page
}

export interface DailyStatEntry {
  dateKey: string;
  morningDone: boolean;
  eveningDone: boolean;
  morningTaps: number;
  eveningTaps: number;
}

export interface StatsSummary {
  totalMorningCompletions: number;
  totalEveningCompletions: number;
  history: Record<string, DailyStatEntry>;
}

export type AppView = 'home' | 'reader' | 'favorites' | 'stats' | 'settings' | 'about';
