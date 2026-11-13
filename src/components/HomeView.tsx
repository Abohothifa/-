import React, { useState } from 'react';
import {
  Sun,
  Moon,
  BookOpen,
  Heart,
  Settings,
  Search,
  BarChart3,
  ArrowLeft,
  Download,
  WifiOff,
  CheckCircle2,
  BookmarkCheck,
} from 'lucide-react';
import { AppView, DailyProgressState, StatsSummary, ThikrCategory } from '../types/athkar';
import { MORNING_ATHKAR, EVENING_ATHKAR } from '../data/athkarData';
import {
  formatGregorianDate,
  formatHijriDate,
  toArabicNumerals,
} from '../utils/arabic';
import { calculateStreak, computeCategoryProgress } from '../utils/storage';
import { AppEmblem, CornerArabesque, EditorialDivider } from './IslamicOrnament';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface HomeViewProps {
  progress: DailyProgressState;
  stats: StatsSummary;
  favoritesCount: number;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenReader: (category: ThikrCategory, pageIndex?: number) => void;
  onNavigate: (view: AppView) => void;
  onOpenSearch: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  progress,
  stats,
  favoritesCount,
  isDark,
  onToggleTheme,
  onOpenReader,
  onNavigate,
  onOpenSearch,
}) => {
  const morningProg = computeCategoryProgress('morning', progress.counts);
  const eveningProg = computeCategoryProgress('evening', progress.counts);
  const dailyOverallPercentage = Math.round((morningProg.percentage + eveningProg.percentage) / 2);
  const streak = calculateStreak(stats.history);

  const now = new Date();
  const hijriDate = formatHijriDate(now);
  const gregorianDate = formatGregorianDate(now);

  const lastCat = progress.lastCategory || 'morning';
  const lastPageIdx = progress.lastPageByCategory[lastCat] ?? 0;
  const lastList = lastCat === 'morning' ? MORNING_ATHKAR : EVENING_ATHKAR;
  const lastThikr = lastList[lastPageIdx] || lastList[0];

  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const isOnline = useOnlineStatus();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-12 space-y-8">
      {/* Hero Editorial Card */}
      <section className="relative overflow-hidden rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-[#FCF9F2] dark:bg-[#15191C] p-6 sm:p-8 book-page-shadow-light">
        <CornerArabesque position="tr" />
        <CornerArabesque position="tl" />
        <CornerArabesque position="br" />
        <CornerArabesque position="bl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[#6B6356] dark:text-[#A6A092]">
              {hijriDate && <span className="font-medium text-[#9A7837] dark:text-[#D0B070]">{hijriDate}</span>}
              {hijriDate && <span aria-hidden="true">·</span>}
              <span>{gregorianDate}</span>
              {!isOnline && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1 text-[#185341] dark:text-[#57B694]">
                    <WifiOff className="w-3.5 h-3.5" />
                    يعمل دون اتصال
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              <AppEmblem className="w-10 h-10 sm:w-12 sm:h-12 shrink-0" />
              <div>
                <h1 className="font-amiri text-2xl sm:text-4xl font-bold text-[#1D1B18] dark:text-[#EFE9DC] leading-snug">
                  أذكار الصباح والمساء
                </h1>
                <p className="text-sm sm:text-base text-[#5C5549] dark:text-[#A6A092]">
                  ﴿أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ﴾
                </p>
              </div>
            </div>
          </div>

          {/* Quick Utility Actions + Daily Completion Summary */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenSearch}
                className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white/70 dark:bg-stone-900/60 hover:bg-white dark:hover:bg-stone-800 text-sm font-medium text-[#1D1B18] dark:text-[#EFE9DC] transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4 text-[#185341] dark:text-[#57B694]" />
                <span>بحث في الأذكار</span>
              </button>

              <button
                type="button"
                onClick={onToggleTheme}
                aria-label={isDark ? 'التبديل إلى الوضع النهاري' : 'التبديل إلى الوضع الليلي'}
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl border border-stone-200 dark:border-stone-700 bg-white/70 dark:bg-stone-900/60 hover:bg-white dark:hover:bg-stone-800 text-[#1D1B18] dark:text-[#EFE9DC] transition-colors cursor-pointer"
              >
                {isDark ? <Sun className="w-4 h-4 text-[#D0B070]" /> : <Moon className="w-4 h-4 text-[#185341]" />}
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs sm:text-sm text-[#5C5549] dark:text-[#A6A092] tabular-nums">
              <span>
                إنجاز اليوم:{' '}
                <strong className="text-[#185341] dark:text-[#57B694] font-bold">
                  {toArabicNumerals(dailyOverallPercentage)}٪
                </strong>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                الالتزام المتواصل:{' '}
                <strong className="text-[#9A7837] dark:text-[#D0B070] font-bold">
                  {toArabicNumerals(streak)} {streak === 1 ? 'يوم' : 'أيام'}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Daily Progress Bar + Continue Reading */}
        <EditorialDivider className="my-5" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between text-xs text-[#5C5549] dark:text-[#A6A092]">
              <span className="flex items-center gap-1.5">
                <BookmarkCheck className="w-4 h-4 text-[#9A7837] dark:text-[#D0B070]" />
                <span>
                  آخر قراءة:{' '}
                  <strong className="text-[#1D1B18] dark:text-[#EFE9DC] font-medium">
                    {lastCat === 'morning' ? 'أذكار الصباح' : 'أذكار المساء'} — {lastThikr.title}
                  </strong>
                </span>
              </span>
              <span className="tabular-nums">
                صفحة {toArabicNumerals(lastPageIdx + 1)} من {toArabicNumerals(lastList.length)}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-stone-200/80 dark:bg-stone-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#185341] dark:bg-[#3E8E72] transition-all duration-300"
                style={{ width: `${dailyOverallPercentage}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenReader(lastCat, lastPageIdx)}
            className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#185341] hover:bg-[#134234] dark:bg-[#2F7C61] dark:hover:bg-[#256650] text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>متابعة القراءة</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Primary Book Cards: Morning & Evening */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5" aria-label="الأذكار اليومية">
        {/* Morning Card */}
        <article className="group relative rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-[#FCF9F2] dark:bg-[#15191C] p-6 flex flex-col justify-between transition-colors hover:border-[#9A7837]/50 dark:hover:border-[#D0B070]/40">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-100/70 dark:bg-amber-900/25 border border-amber-300/50 dark:border-amber-700/30 flex items-center justify-center text-amber-700 dark:text-amber-400">
                  <Sun className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-amiri text-2xl font-bold text-[#1D1B18] dark:text-[#EFE9DC]">
                    أذكار الصباح
                  </h2>
                  <p className="text-xs text-[#6B6356] dark:text-[#A6A092]">
                    من بعد صلاة الفجر إلى طلوع الشمس أو الضحى
                  </p>
                </div>
              </div>

              {morningProg.percentage === 100 && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#185341] dark:text-[#57B694]">
                  <CheckCircle2 className="w-4 h-4" />
                  مكتمل
                </span>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-[#5C5549] dark:text-[#A6A092] tabular-nums">
                <span>
                  {toArabicNumerals(morningProg.completedItems)} من {toArabicNumerals(morningProg.totalItems)} ذِكراً
                </span>
                <span>{toArabicNumerals(morningProg.percentage)}٪</span>
              </div>
              <div className="h-1.5 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#9A7837] dark:bg-[#D0B070] transition-all duration-300"
                  style={{ width: `${morningProg.percentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onOpenReader('morning', progress.lastPageByCategory.morning)}
              className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#185341] hover:bg-[#134234] dark:bg-[#2F7C61] dark:hover:bg-[#256650] text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>
                {morningProg.completedItems > 0 && morningProg.percentage < 100
                  ? 'إكمال أذكار الصباح'
                  : 'قراءة أذكار الصباح'}
              </span>
            </button>
          </div>
        </article>

        {/* Evening Card */}
        <article className="group relative rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-[#FCF9F2] dark:bg-[#15191C] p-6 flex flex-col justify-between transition-colors hover:border-[#185341]/50 dark:hover:border-[#57B694]/40">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-950/10 dark:bg-emerald-900/30 border border-[#185341]/25 dark:border-[#3E8E72]/35 flex items-center justify-center text-[#185341] dark:text-[#57B694]">
                  <Moon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-amiri text-2xl font-bold text-[#1D1B18] dark:text-[#EFE9DC]">
                    أذكار المساء
                  </h2>
                  <p className="text-xs text-[#6B6356] dark:text-[#A6A092]">
                    من بعد صلاة العصر إلى غروب الشمس وأول الليل
                  </p>
                </div>
              </div>

              {eveningProg.percentage === 100 && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#185341] dark:text-[#57B694]">
                  <CheckCircle2 className="w-4 h-4" />
                  مكتمل
                </span>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-[#5C5549] dark:text-[#A6A092] tabular-nums">
                <span>
                  {toArabicNumerals(eveningProg.completedItems)} من {toArabicNumerals(eveningProg.totalItems)} ذِكراً
                </span>
                <span>{toArabicNumerals(eveningProg.percentage)}٪</span>
              </div>
              <div className="h-1.5 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#185341] dark:bg-[#57B694] transition-all duration-300"
                  style={{ width: `${eveningProg.percentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onOpenReader('evening', progress.lastPageByCategory.evening)}
              className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#185341] hover:bg-[#134234] dark:bg-[#2F7C61] dark:hover:bg-[#256650] text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>
                {eveningProg.completedItems > 0 && eveningProg.percentage < 100
                  ? 'إكمال أذكار المساء'
                  : 'قراءة أذكار المساء'}
              </span>
            </button>
          </div>
        </article>
      </section>

      {/* Secondary Quick Access Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4" aria-label="أقسام إضافية">
        <button
          type="button"
          onClick={() => onNavigate('favorites')}
          className="min-h-[68px] flex items-center justify-between gap-3 p-4 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-[#FCF9F2] dark:bg-[#15191C] hover:border-[#9A7837]/40 transition-colors text-right cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#9A7837]/10 dark:bg-[#D0B070]/15 flex items-center justify-center text-[#9A7837] dark:text-[#D0B070]">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#1D1B18] dark:text-[#EFE9DC]">المفضلة</div>
              <div className="text-xs text-[#6B6356] dark:text-[#A6A092] tabular-nums">
                {favoritesCount > 0
                  ? `${toArabicNumerals(favoritesCount)} أذكار محفوظة`
                  : 'احفظ أذكارك المختارة'}
              </div>
            </div>
          </div>
          <ArrowLeft className="w-4 h-4 text-[#6B6356] dark:text-[#A6A092]" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('stats')}
          className="min-h-[68px] flex items-center justify-between gap-3 p-4 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-[#FCF9F2] dark:bg-[#15191C] hover:border-[#185341]/40 transition-colors text-right cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#185341]/10 dark:bg-[#3E8E72]/15 flex items-center justify-center text-[#185341] dark:text-[#57B694]">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#1D1B18] dark:text-[#EFE9DC]">سجل الالتزام</div>
              <div className="text-xs text-[#6B6356] dark:text-[#A6A092] tabular-nums">
                صباح: {toArabicNumerals(stats.totalMorningCompletions)} · مساء: {toArabicNumerals(stats.totalEveningCompletions)}
              </div>
            </div>
          </div>
          <ArrowLeft className="w-4 h-4 text-[#6B6356] dark:text-[#A6A092]" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('settings')}
          className="min-h-[68px] flex items-center justify-between gap-3 p-4 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-[#FCF9F2] dark:bg-[#15191C] hover:border-stone-400 dark:hover:border-stone-600 transition-colors text-right cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-stone-200/70 dark:bg-stone-800 flex items-center justify-center text-[#5C5549] dark:text-[#A6A092]">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#1D1B18] dark:text-[#EFE9DC]">الإعدادات والتذكير</div>
              <div className="text-xs text-[#6B6356] dark:text-[#A6A092]">
                الخطوط، المظهر، والتنبيهات
              </div>
            </div>
          </div>
          <ArrowLeft className="w-4 h-4 text-[#6B6356] dark:text-[#A6A092]" />
        </button>
      </section>

      {/* In-App PWA Install Prompt (if installable or iOS Safari) */}
      {!isInstalled && (isInstallable || isIOS) && (
        <section className="rounded-xl border border-[#9A7837]/30 dark:border-[#D0B070]/25 bg-[#FCF9F2] dark:bg-[#15191C] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[#1D1B18] dark:text-[#EFE9DC]">
              تثبيت التطبيق على جهازك للوصول السريع دون إنترنت
            </p>
            <p className="text-xs text-[#6B6356] dark:text-[#A6A092]">
              يعمل التطبيق بكامل ميزاته دون اتصال بالإنترنت بعد التثبيت.
            </p>
          </div>
          {isInstallable ? (
            <button
              type="button"
              onClick={install}
              className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#9A7837] hover:bg-[#82642D] text-white text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>تثبيت التطبيق</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowIOSGuide(true)}
              className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-[#9A7837]/40 text-sm font-medium text-[#9A7837] dark:text-[#D0B070] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>طريقة التثبيت على iOS</span>
            </button>
          )}
        </section>
      )}

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-2xl bg-[#FCF9F2] dark:bg-[#15191C] border border-stone-200 dark:border-stone-800 p-6 space-y-4">
            <h3 className="font-amiri text-xl font-bold text-[#1D1B18] dark:text-[#EFE9DC]">
              تثبيت التطبيق على iPhone / iPad
            </h3>
            <ol className="space-y-2 text-sm text-[#5C5549] dark:text-[#A6A092] list-decimal list-inside">
              <li>اضغط على زر <strong>المشاركة (Share)</strong> في شريط سفاري.</li>
              <li>مرّر للأسفل واختر <strong>إضافة إلى الشاشة الرئيسية (Add to Home Screen)</strong>.</li>
            </ol>
            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="w-full min-h-[44px] rounded-xl bg-[#185341] text-white text-sm font-medium cursor-pointer"
            >
              فهمت
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
