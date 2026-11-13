import React, { useMemo } from 'react';
import { Sun, Moon, Flame, CalendarCheck, CheckCircle2 } from 'lucide-react';
import { DailyProgressState, StatsSummary } from '../types/athkar';
import { getLocalDateKey, toArabicNumerals } from '../utils/arabic';
import { calculateStreak, computeCategoryProgress } from '../utils/storage';
import { EditorialDivider } from './IslamicOrnament';

interface StatsViewProps {
  progress: DailyProgressState;
  stats: StatsSummary;
}

export const StatsView: React.FC<StatsViewProps> = ({ progress, stats }) => {
  const morningProg = computeCategoryProgress('morning', progress.counts);
  const eveningProg = computeCategoryProgress('evening', progress.counts);
  const todayPercentage = Math.round((morningProg.percentage + eveningProg.percentage) / 2);
  const streak = calculateStreak(stats.history);

  const last7Days = useMemo(() => {
    const days: { dateKey: string; dayLabel: string; morningDone: boolean; eveningDone: boolean }[] = [];
    const weekdayFmt = new Intl.DateTimeFormat('ar-EG', { weekday: 'short' });
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = getLocalDateKey(d);
      const entry = stats.history[key];
      days.push({
        dateKey: key,
        dayLabel: i === 0 ? 'اليوم' : weekdayFmt.format(d),
        morningDone: Boolean(entry?.morningDone),
        eveningDone: Boolean(entry?.eveningDone),
      });
    }
    return days;
  }, [stats.history]);

  const last30Days = useMemo(() => {
    const days: { dateKey: string; dayNum: number; morningDone: boolean; eveningDone: boolean }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = getLocalDateKey(d);
      const entry = stats.history[key];
      days.push({
        dateKey: key,
        dayNum: d.getDate(),
        morningDone: Boolean(entry?.morningDone),
        eveningDone: Boolean(entry?.eveningDone),
      });
    }
    return days;
  }, [stats.history]);

  const weeklyCompletedSessions = last7Days.reduce(
    (acc, d) => acc + (d.morningDone ? 1 : 0) + (d.eveningDone ? 1 : 0),
    0
  );
  const monthlyCompletedDays = last30Days.filter((d) => d.morningDone || d.eveningDone).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-12 space-y-6">
      <div>
        <h1 className="font-amiri text-2xl sm:text-3xl font-bold text-[#1D1B18] dark:text-[#EFE9DC]">
          الإحصائيات وسجل الالتزام
        </h1>
        <p className="text-sm text-[#6B6356] dark:text-[#A6A092]">
          متابعة هادئة لمحافظتك على أذكار الصباح والمساء
        </p>
      </div>

      {/* Primary KPI Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-[#FCF9F2] dark:bg-[#15191C] p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6B6356] dark:text-[#A6A092]">
            <span>إكمال الصباح</span>
            <Sun className="w-4 h-4 text-[#9A7837] dark:text-[#D0B070]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#1D1B18] dark:text-[#EFE9DC] tabular-nums">
            {toArabicNumerals(stats.totalMorningCompletions)}
          </div>
          <div className="text-xs text-[#6B6356] dark:text-[#A6A092]">مرة</div>
        </div>

        <div className="rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-[#FCF9F2] dark:bg-[#15191C] p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6B6356] dark:text-[#A6A092]">
            <span>إكمال المساء</span>
            <Moon className="w-4 h-4 text-[#185341] dark:text-[#57B694]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#1D1B18] dark:text-[#EFE9DC] tabular-nums">
            {toArabicNumerals(stats.totalEveningCompletions)}
          </div>
          <div className="text-xs text-[#6B6356] dark:text-[#A6A092]">مرة</div>
        </div>

        <div className="rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-[#FCF9F2] dark:bg-[#15191C] p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6B6356] dark:text-[#A6A092]">
            <span>سلسلة الالتزام</span>
            <Flame className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#1D1B18] dark:text-[#EFE9DC] tabular-nums">
            {toArabicNumerals(streak)}
          </div>
          <div className="text-xs text-[#6B6356] dark:text-[#A6A092]">
            {streak === 1 ? 'يوم متواصل' : 'أيام متواصلة'}
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-[#FCF9F2] dark:bg-[#15191C] p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6B6356] dark:text-[#A6A092]">
            <span>إنجاز اليوم</span>
            <CheckCircle2 className="w-4 h-4 text-[#185341] dark:text-[#57B694]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#185341] dark:text-[#57B694] tabular-nums">
            {toArabicNumerals(todayPercentage)}٪
          </div>
          <div className="text-xs text-[#6B6356] dark:text-[#A6A092]">من أذكار اليوم</div>
        </div>
      </section>

      {/* Weekly Log */}
      <section className="rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-[#FCF9F2] dark:bg-[#15191C] p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-amiri text-xl font-bold text-[#1D1B18] dark:text-[#EFE9DC]">
              السجل الأسبوعي
            </h2>
            <p className="text-xs text-[#6B6356] dark:text-[#A6A092]">
              أتممت {toArabicNumerals(weeklyCompletedSessions)} من {toArabicNumerals(14)} ورداً خلال آخر ٧ أيام
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#6B6356] dark:text-[#A6A092]">
            <span className="inline-flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-[#9A7837] dark:text-[#D0B070]" />
              الصباح
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-[#185341] dark:text-[#57B694]" />
              المساء
            </span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {last7Days.map((day) => (
            <div
              key={day.dateKey}
              className="rounded-xl border border-stone-200/70 dark:border-stone-800 bg-white/60 dark:bg-stone-900/40 p-2.5 flex flex-col items-center gap-2 text-center"
            >
              <span className="text-[11px] font-medium text-[#5C5549] dark:text-[#A6A092]">
                {day.dayLabel}
              </span>
              <div className="flex flex-col gap-1.5 w-full">
                <div
                  title={`أذكار الصباح: ${day.morningDone ? 'مكتملة' : 'غير مكتملة'}`}
                  className={`h-6 rounded-md flex items-center justify-center ${
                    day.morningDone
                      ? 'bg-[#9A7837]/20 text-[#846427] dark:bg-[#D0B070]/25 dark:text-[#E5C88B]'
                      : 'bg-stone-200/50 dark:bg-stone-800/70 text-stone-400 dark:text-stone-600'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                </div>
                <div
                  title={`أذكار المساء: ${day.eveningDone ? 'مكتملة' : 'غير مكتملة'}`}
                  className={`h-6 rounded-md flex items-center justify-center ${
                    day.eveningDone
                      ? 'bg-[#185341]/20 text-[#185341] dark:bg-[#3E8E72]/25 dark:text-[#6CC4A5]'
                      : 'bg-stone-200/50 dark:bg-stone-800/70 text-stone-400 dark:text-stone-600'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Monthly 30-day Overview */}
      <section className="rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-[#FCF9F2] dark:bg-[#15191C] p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-[#185341] dark:text-[#57B694]" />
            <div>
              <h2 className="font-amiri text-xl font-bold text-[#1D1B18] dark:text-[#EFE9DC]">
                المداومة الشهرية (آخر ٣٠ يوماً)
              </h2>
              <p className="text-xs text-[#6B6356] dark:text-[#A6A092]">
                واظبت على الذكر في {toArabicNumerals(monthlyCompletedDays)} يوماً من أصل ٣٠ يوماً
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
          {last30Days.map((day) => {
            const both = day.morningDone && day.eveningDone;
            const one = day.morningDone || day.eveningDone;
            return (
              <div
                key={day.dateKey}
                title={`${day.dateKey}: ${both ? 'الصباح والمساء' : day.morningDone ? 'الصباح' : day.eveningDone ? 'المساء' : 'لم يُسجّل إكمال'}`}
                className={`h-10 rounded-lg border flex flex-col items-center justify-center text-xs tabular-nums ${
                  both
                    ? 'bg-[#185341] border-[#185341] text-white dark:bg-[#2F7C61] dark:border-[#2F7C61]'
                    : one
                    ? 'bg-[#9A7837]/20 border-[#9A7837]/40 text-[#7D5E23] dark:bg-[#D0B070]/20 dark:border-[#D0B070]/35 dark:text-[#E5C88B]'
                    : 'bg-stone-100/70 dark:bg-stone-900/50 border-stone-200/70 dark:border-stone-800 text-[#6B6356] dark:text-[#8E8779]'
                }`}
              >
                <span>{toArabicNumerals(day.dayNum)}</span>
              </div>
            );
          })}
        </div>

        <EditorialDivider className="pt-2" />

        <p className="text-center font-amiri text-base sm:text-lg text-[#5C5549] dark:text-[#A6A092]">
          قال النبي ﷺ: «أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ تَعَالَى أَدْوَمُهَا وَإِنْ قَلَّ» — رواه البخاري ومسلم
        </p>
      </section>
    </div>
  );
};
