import { MORNING_ATHKAR, EVENING_ATHKAR } from '../data/athkarData';
import {
  AppSettings,
  DailyProgressState,
  StatsSummary,
  ThikrCategory,
} from '../types/athkar';
import { getLocalDateKey } from './arabic';

const SETTINGS_KEY = 'athkar_app_settings_v1';
const PROGRESS_KEY = 'athkar_daily_progress_v1';
const FAVORITES_KEY = 'athkar_favorites_v1';
const STATS_KEY = 'athkar_stats_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  themeMode: 'auto',
  paperTheme: 'ivory',
  fontFamily: 'amiri',
  fontSize: 24,
  lineHeight: 'comfortable',
  counterSize: 'medium',
  readingMode: 'book',
  hapticEnabled: true,
  soundEnabled: false,
  autoAdvance: true,
  showVirtueByDefault: true,
  reminders: {
    masterEnabled: false,
    morning: { enabled: true, time: '06:00' },
    evening: { enabled: true, time: '17:00' },
  },
};

export function createInitialProgress(
  dateKey: string = getLocalDateKey(),
  lastCategory: ThikrCategory = 'morning',
  lastPageByCategory: Record<ThikrCategory, number> = { morning: 0, evening: 0 }
): DailyProgressState {
  return {
    dateKey,
    counts: {},
    morningCompletedToday: false,
    eveningCompletedToday: false,
    lastCategory,
    lastPageByCategory,
  };
}

export const DEFAULT_STATS: StatsSummary = {
  totalMorningCompletions: 0,
  totalEveningCompletions: 0,
  history: {},
};

function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage quota or private browsing
  }
}

export function loadSettings(): AppSettings {
  const parsed = safeRead<Partial<AppSettings>>(SETTINGS_KEY, {});
  return {
    ...DEFAULT_SETTINGS,
    ...parsed,
    reminders: {
      ...DEFAULT_SETTINGS.reminders,
      ...(parsed.reminders || {}),
      morning: {
        ...DEFAULT_SETTINGS.reminders.morning,
        ...(parsed.reminders?.morning || {}),
      },
      evening: {
        ...DEFAULT_SETTINGS.reminders.evening,
        ...(parsed.reminders?.evening || {}),
      },
    },
  };
}

export function saveSettings(settings: AppSettings): void {
  safeWrite(SETTINGS_KEY, settings);
}

export function loadProgress(): DailyProgressState {
  const today = getLocalDateKey();
  const saved = safeRead<DailyProgressState | null>(PROGRESS_KEY, null);
  if (!saved) {
    return createInitialProgress(today);
  }
  if (saved.dateKey !== today) {
    // New day: preserve lastCategory, reset today's counters and page position cleanly
    return createInitialProgress(today, saved.lastCategory || 'morning', {
      morning: 0,
      evening: 0,
    });
  }
  return {
    ...createInitialProgress(today),
    ...saved,
    lastPageByCategory: {
      morning: saved.lastPageByCategory?.morning ?? 0,
      evening: saved.lastPageByCategory?.evening ?? 0,
    },
  };
}

export function saveProgress(progress: DailyProgressState): void {
  safeWrite(PROGRESS_KEY, progress);
}

export function loadFavorites(): string[] {
  return safeRead<string[]>(FAVORITES_KEY, []);
}

export function saveFavorites(favorites: string[]): void {
  safeWrite(FAVORITES_KEY, favorites);
}

export function loadStats(): StatsSummary {
  const saved = safeRead<Partial<StatsSummary>>(STATS_KEY, {});
  return {
    totalMorningCompletions: saved.totalMorningCompletions ?? 0,
    totalEveningCompletions: saved.totalEveningCompletions ?? 0,
    history: saved.history ?? {},
  };
}

export function saveStats(stats: StatsSummary): void {
  safeWrite(STATS_KEY, stats);
}

export function computeCategoryProgress(
  category: ThikrCategory,
  counts: Record<string, number>
): { completedItems: number; totalItems: number; completedTaps: number; totalTaps: number; percentage: number } {
  const items = category === 'morning' ? MORNING_ATHKAR : EVENING_ATHKAR;
  let completedItems = 0;
  let completedTaps = 0;
  let totalTaps = 0;

  for (const item of items) {
    const count = Math.min(counts[item.id] ?? 0, item.repeat);
    completedTaps += count;
    totalTaps += item.repeat;
    if (count >= item.repeat) {
      completedItems += 1;
    }
  }

  const percentage = items.length > 0 ? Math.round((completedItems / items.length) * 100) : 0;
  return {
    completedItems,
    totalItems: items.length,
    completedTaps,
    totalTaps,
    percentage,
  };
}

export function calculateStreak(history: Record<string, { morningDone: boolean; eveningDone: boolean }>): number {
  let streak = 0;
  const cursor = new Date();
  const todayKey = getLocalDateKey(cursor);
  const todayEntry = history[todayKey];
  const todayCompleted = Boolean(todayEntry && (todayEntry.morningDone || todayEntry.eveningDone));

  if (!todayCompleted) {
    cursor.setDate(cursor.getDate() - 1);
  }

  for (let i = 0; i < 365; i++) {
    const key = getLocalDateKey(cursor);
    const entry = history[key];
    if (entry && (entry.morningDone || entry.eveningDone)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
