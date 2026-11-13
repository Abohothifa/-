import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bell, BookOpen, X } from 'lucide-react';
import {
  AppSettings,
  AppView,
  DailyProgressState,
  StatsSummary,
  ThikrCategory,
  ThikrItem,
} from './types/athkar';
import {
  DEFAULT_STATS,
  computeCategoryProgress,
  createInitialProgress,
  loadFavorites,
  loadProgress,
  loadSettings,
  loadStats,
  saveFavorites,
  saveProgress,
  saveSettings,
  saveStats,
} from './utils/storage';
import { getLocalDateKey } from './utils/arabic';
import { playCompletionTone, playSoftClick, triggerHaptic } from './utils/sound';
import { useReminders } from './hooks/useReminders';
import { SplashScreen } from './components/SplashScreen';
import { NavigationBar } from './components/NavigationBar';
import { HomeView } from './components/HomeView';
import { BookReaderView } from './components/BookReaderView';
import { FavoritesView } from './components/FavoritesView';
import { StatsView } from './components/StatsView';
import { SettingsView } from './components/SettingsView';
import { AboutView } from './components/AboutView';
import { SearchModal } from './components/SearchModal';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [progress, setProgress] = useState<DailyProgressState>(() => loadProgress());
  const [favorites, setFavorites] = useState<string[]>(() => loadFavorites());
  const [stats, setStats] = useState<StatsSummary>(() => loadStats());
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [readerImmersive, setReaderImmersive] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [inAppReminder, setInAppReminder] = useState<{
    category: ThikrCategory;
    title: string;
    body: string;
  } | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const t = window.setTimeout(() => setToastMessage(null), 2400);
    return () => window.clearTimeout(t);
  }, [toastMessage]);

  // Listen to OS dark mode changes
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const isDark = useMemo(() => {
    if (settings.themeMode === 'night') return true;
    if (settings.themeMode === 'day') return false;
    return systemPrefersDark;
  }, [settings.themeMode, systemPrefersDark]);

  // Sync `.dark` class on <html> and <meta name="theme-color">
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', isDark ? '#0E1113' : '#143D31');
    }
  }, [isDark]);

  // Persist changes automatically
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  useEffect(() => {
    saveStats(stats);
  }, [stats]);

  // Daily rollover check when tab becomes active
  useEffect(() => {
    const checkDateRollover = () => {
      const todayKey = getLocalDateKey();
      setProgress((prev) => {
        if (prev.dateKey === todayKey) return prev;
        return createInitialProgress(todayKey, prev.lastCategory, {
          morning: 0,
          evening: 0,
        });
      });
    };
    document.addEventListener('visibilitychange', checkDateRollover);
    return () => document.removeEventListener('visibilitychange', checkDateRollover);
  }, []);

  // Reminders hook
  const handleInAppReminder = useCallback(
    (category: ThikrCategory, title: string, body: string) => {
      setInAppReminder({ category, title, body });
    },
    []
  );

  const { permission, requestPermission, sendTestNotification } = useReminders(
    settings.reminders,
    handleInAppReminder
  );

  const handleUpdateSettings = useCallback((partial: Partial<AppSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...partial,
      reminders: partial.reminders ? partial.reminders : prev.reminders,
    }));
  }, []);

  const handleToggleTheme = useCallback(() => {
    setSettings((prev) => {
      const currentlyDark =
        prev.themeMode === 'night' || (prev.themeMode === 'auto' && systemPrefersDark);
      const nextMode = currentlyDark ? 'day' : 'night';
      const nextPaper =
        nextMode === 'night'
          ? prev.paperTheme === 'midnight'
            ? 'midnight'
            : 'obsidian'
          : prev.paperTheme === 'obsidian' || prev.paperTheme === 'midnight'
          ? 'ivory'
          : prev.paperTheme;
      return {
        ...prev,
        themeMode: nextMode,
        paperTheme: nextPaper,
      };
    });
  }, [systemPrefersDark]);

  const handleOpenReader = useCallback((category?: ThikrCategory, pageIndex?: number) => {
    setProgress((prev) => {
      const targetCat = category ?? prev.lastCategory;
      const targetPage =
        typeof pageIndex === 'number' ? pageIndex : prev.lastPageByCategory[targetCat] ?? 0;
      return {
        ...prev,
        lastCategory: targetCat,
        lastPageByCategory: {
          ...prev.lastPageByCategory,
          [targetCat]: targetPage,
        },
      };
    });
    setCurrentView('reader');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleNavigate = useCallback((view: AppView) => {
    setReaderImmersive(false);
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleChangeCategory = useCallback((category: ThikrCategory) => {
    setProgress((prev) => ({
      ...prev,
      lastCategory: category,
    }));
  }, []);

  const handleChangePage = useCallback((pageIndex: number) => {
    setProgress((prev) => ({
      ...prev,
      lastPageByCategory: {
        ...prev.lastPageByCategory,
        [prev.lastCategory]: pageIndex,
      },
    }));
  }, []);

  const recordCompletionInStats = useCallback(
    (category: ThikrCategory, updatedCounts: Record<string, number>, dateKey: string) => {
      const catProg = computeCategoryProgress(category, updatedCounts);
      const isDoneNow = catProg.completedItems === catProg.totalItems;

      setStats((prevStats) => {
        const prevEntry = prevStats.history[dateKey] || {
          dateKey,
          morningDone: false,
          eveningDone: false,
          morningTaps: 0,
          eveningTaps: 0,
        };

        const morningProg = computeCategoryProgress('morning', updatedCounts);
        const eveningProg = computeCategoryProgress('evening', updatedCounts);

        const nextEntry = {
          dateKey,
          morningDone: prevEntry.morningDone || (category === 'morning' && isDoneNow),
          eveningDone: prevEntry.eveningDone || (category === 'evening' && isDoneNow),
          morningTaps: Math.max(prevEntry.morningTaps, morningProg.completedTaps),
          eveningTaps: Math.max(prevEntry.eveningTaps, eveningProg.completedTaps),
        };

        let nextMorningTotal = prevStats.totalMorningCompletions;
        let nextEveningTotal = prevStats.totalEveningCompletions;

        if (category === 'morning' && isDoneNow && !prevEntry.morningDone) {
          nextMorningTotal += 1;
        }
        if (category === 'evening' && isDoneNow && !prevEntry.eveningDone) {
          nextEveningTotal += 1;
        }

        return {
          totalMorningCompletions: nextMorningTotal,
          totalEveningCompletions: nextEveningTotal,
          history: {
            ...prevStats.history,
            [dateKey]: nextEntry,
          },
        };
      });
    },
    []
  );

  const handleIncrementCount = useCallback(
    (thikr: ThikrItem) => {
      const todayKey = getLocalDateKey();
      let didCompleteThikr = false;

      setProgress((prev) => {
        const base = prev.dateKey === todayKey ? prev : createInitialProgress(todayKey, prev.lastCategory);
        const current = base.counts[thikr.id] ?? 0;
        if (current >= thikr.repeat) return base;
        const nextVal = current + 1;
        didCompleteThikr = nextVal >= thikr.repeat;

        const nextCounts = {
          ...base.counts,
          [thikr.id]: nextVal,
        };

        const catProg = computeCategoryProgress(thikr.category, nextCounts);
        const categoryDone = catProg.completedItems === catProg.totalItems;

        recordCompletionInStats(thikr.category, nextCounts, todayKey);

        return {
          ...base,
          counts: nextCounts,
          morningCompletedToday:
            thikr.category === 'morning' ? base.morningCompletedToday || categoryDone : base.morningCompletedToday,
          eveningCompletedToday:
            thikr.category === 'evening' ? base.eveningCompletedToday || categoryDone : base.eveningCompletedToday,
        };
      });

      if (settings.hapticEnabled) triggerHaptic(didCompleteThikr ? 24 : 12);
      if (settings.soundEnabled) {
        if (didCompleteThikr) playCompletionTone();
        else playSoftClick();
      }
    },
    [settings.hapticEnabled, settings.soundEnabled, recordCompletionInStats]
  );

  const handleDecrementCount = useCallback((thikr: ThikrItem) => {
    setProgress((prev) => {
      const current = prev.counts[thikr.id] ?? 0;
      if (current <= 0) return prev;
      return {
        ...prev,
        counts: {
          ...prev.counts,
          [thikr.id]: current - 1,
        },
      };
    });
  }, []);

  const handleResetCount = useCallback((thikr: ThikrItem) => {
    setProgress((prev) => ({
      ...prev,
      counts: {
        ...prev.counts,
        [thikr.id]: 0,
      },
    }));
  }, []);

  const handleToggleFavorite = useCallback(
    (thikrId: string) => {
      setFavorites((prev) => {
        const exists = prev.includes(thikrId);
        const next = exists ? prev.filter((id) => id !== thikrId) : [...prev, thikrId];
        showToast(exists ? 'أُزيل الذكر من المفضلة' : 'أُضيف الذكر إلى المفضلة');
        return next;
      });
    },
    [showToast]
  );

  const handleResetTodayProgress = useCallback(() => {
    setProgress((prev) => createInitialProgress(getLocalDateKey(), prev.lastCategory));
    showToast('تم تصفير عدّادات اليوم بنجاح');
  }, [showToast]);

  const handleResetAllStats = useCallback(() => {
    setStats(DEFAULT_STATS);
    showToast('تم مسح سجل الإحصائيات');
  }, [showToast]);

  const activeCategory = progress.lastCategory || 'morning';
  const activePage = progress.lastPageByCategory[activeCategory] ?? 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F1E7] dark:bg-[#0E1113] text-[#1D1B18] dark:text-[#EFE9DC] transition-colors duration-200">
      {showSplash && <SplashScreen onDismiss={() => setShowSplash(false)} />}

      {!(currentView === 'reader' && readerImmersive) && (
        <NavigationBar
          currentView={currentView}
          activeCategory={activeCategory}
          onNavigate={handleNavigate}
          onOpenReader={(cat) => handleOpenReader(cat)}
        />
      )}

      {/* Quiet In-App Reminder Banner */}
      {inAppReminder && (
        <div className="max-w-4xl mx-auto w-full px-4 pt-3">
          <div className="rounded-xl border border-[#185341]/30 dark:border-[#3E8E72]/40 bg-[#185341]/10 dark:bg-[#3E8E72]/15 px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Bell className="w-5 h-5 text-[#185341] dark:text-[#6CC4A5] shrink-0" />
              <div className="min-w-0">
                <div className="text-sm font-bold text-[#1D1B18] dark:text-[#EFE9DC]">
                  {inAppReminder.title}
                </div>
                <div className="text-xs text-[#5C5549] dark:text-[#A6A092] truncate">
                  {inAppReminder.body}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  handleOpenReader(inAppReminder.category, 0);
                  setInAppReminder(null);
                }}
                className="min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#185341] text-white text-xs font-medium cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>قراءة الآن</span>
              </button>
              <button
                type="button"
                onClick={() => setInAppReminder(null)}
                aria-label="إغلاق التذكير"
                className="min-h-[38px] min-w-[38px] rounded-lg flex items-center justify-center text-[#5C5549] dark:text-[#A6A092] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            progress={progress}
            stats={stats}
            favoritesCount={favorites.length}
            isDark={isDark}
            onToggleTheme={handleToggleTheme}
            onOpenReader={handleOpenReader}
            onNavigate={handleNavigate}
            onOpenSearch={() => setIsSearchOpen(true)}
          />
        )}

        {currentView === 'reader' && (
          <BookReaderView
            category={activeCategory}
            currentPage={activePage}
            counts={progress.counts}
            favorites={favorites}
            settings={settings}
            isDark={isDark}
            onChangeCategory={handleChangeCategory}
            onChangePage={handleChangePage}
            onIncrementCount={handleIncrementCount}
            onDecrementCount={handleDecrementCount}
            onResetCount={handleResetCount}
            onToggleFavorite={handleToggleFavorite}
            onUpdateSettings={handleUpdateSettings}
            onToggleTheme={handleToggleTheme}
            onOpenSearch={() => setIsSearchOpen(true)}
            onNotifyToast={showToast}
            onExitFullscreenReader={setReaderImmersive}
          />
        )}

        {currentView === 'favorites' && (
          <FavoritesView
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onOpenInBook={(cat, idx) => handleOpenReader(cat, idx)}
            onNotifyToast={showToast}
          />
        )}

        {currentView === 'stats' && <StatsView progress={progress} stats={stats} />}

        {currentView === 'settings' && (
          <SettingsView
            settings={settings}
            notificationPermission={permission}
            onUpdateSettings={handleUpdateSettings}
            onRequestNotificationPermission={requestPermission}
            onTestNotification={sendTestNotification}
            onResetTodayProgress={handleResetTodayProgress}
            onResetAllStats={handleResetAllStats}
          />
        )}

        {currentView === 'about' && <AboutView />}
      </main>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectThikr={(cat, idx) => handleOpenReader(cat, idx)}
      />

      {/* Quiet Toast Feedback */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-[#1D1B18] dark:bg-[#EFE9DC] text-[#FAF6EE] dark:text-[#1D1B18] text-xs sm:text-sm font-medium shadow-lg whitespace-nowrap"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
