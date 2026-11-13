import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Monitor,
  Bell,
  BellOff,
  RotateCcw,
  Trash2,
  Volume2,
  Vibrate,
} from 'lucide-react';
import {
  AppSettings,
  CounterSize,
  FontChoice,
  LineHeightOption,
  PaperTheme,
  ReadingMode,
  ThemeMode,
} from '../types/athkar';
import { toArabicNumerals } from '../utils/arabic';
import { NotificationPermissionState } from '../hooks/useReminders';
import { EditorialDivider } from './IslamicOrnament';

interface SettingsViewProps {
  settings: AppSettings;
  notificationPermission: NotificationPermissionState;
  onUpdateSettings: (partial: Partial<AppSettings>) => void;
  onRequestNotificationPermission: () => Promise<NotificationPermissionState>;
  onTestNotification: (category: 'morning' | 'evening') => void;
  onResetTodayProgress: () => void;
  onResetAllStats: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  notificationPermission,
  onUpdateSettings,
  onRequestNotificationPermission,
  onTestNotification,
  onResetTodayProgress,
  onResetAllStats,
}) => {
  const [confirmAction, setConfirmAction] = useState<'today' | 'stats' | null>(null);

  const handleToggleMasterReminders = async (enabled: boolean) => {
    if (enabled && notificationPermission === 'default') {
      await onRequestNotificationPermission();
    }
    onUpdateSettings({
      reminders: {
        ...settings.reminders,
        masterEnabled: enabled,
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-12 space-y-6">
      <div>
        <h1 className="font-amiri text-2xl sm:text-3xl font-bold text-[#1D1B18] dark:text-[#EFE9DC]">
          الإعدادات والتخصيص
        </h1>
        <p className="text-sm text-[#6B6356] dark:text-[#A6A092]">
          تُحفظ جميع تفضيلاتك تلقائياً على جهازك وتعمل دون إنترنت
        </p>
      </div>

      {/* Appearance & Theme */}
      <section className="rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-[#FCF9F2] dark:bg-[#15191C] p-5 sm:p-6 space-y-5">
        <h2 className="font-amiri text-xl font-bold text-[#1D1B18] dark:text-[#EFE9DC]">
          المظهر والوضع الليلي
        </h2>

        <div className="grid grid-cols-3 gap-2.5">
          {(
            [
              { id: 'day', label: 'الوضع النهاري', icon: <Sun className="w-4 h-4" /> },
              { id: 'night', label: 'الوضع الليلي', icon: <Moon className="w-4 h-4" /> },
              { id: 'auto', label: 'تلقائي', icon: <Monitor className="w-4 h-4" /> },
            ] as { id: ThemeMode; label: string; icon: React.ReactNode }[]
          ).map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => onUpdateSettings({ themeMode: mode.id })}
              className={`min-h-[48px] flex items-center justify-center gap-2 rounded-xl border text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                settings.themeMode === mode.id
                  ? 'border-[#185341] bg-[#185341]/10 text-[#185341] dark:border-[#57B694] dark:bg-[#3E8E72]/20 dark:text-[#6CC4A5]'
                  : 'border-stone-200 dark:border-stone-700 text-[#1D1B18] dark:text-[#EFE9DC]'
              }`}
            >
              {mode.icon}
              <span>{mode.label}</span>
            </button>
          ))}
        </div>

        {/* Paper Background */}
        <div className="space-y-2">
          <span className="text-sm font-medium text-[#1D1B18] dark:text-[#EFE9DC] block">
            لون ورق صفحات القراءة
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(
              [
                { id: 'ivory', label: 'عاجي دافئ', color: '#FCF9F2' },
                { id: 'parchment', label: 'ورقي كلاسيكي', color: '#F3EAD7' },
                { id: 'white', label: 'أبيض نقي', color: '#FFFFFF' },
                { id: 'sage', label: 'أخضر هادئ', color: '#EDF3EE' },
                { id: 'obsidian', label: 'ليلي داكن', color: '#15191C' },
                { id: 'midnight', label: 'أسود مريح', color: '#0B0C0E' },
              ] as { id: PaperTheme; label: string; color: string }[]
            ).map((theme) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => {
                  const isNightPaper = theme.id === 'obsidian' || theme.id === 'midnight';
                  onUpdateSettings({
                    paperTheme: theme.id,
                    themeMode: isNightPaper ? 'night' : 'day',
                  });
                }}
                className={`min-h-[44px] flex items-center gap-2.5 px-3 rounded-xl border text-xs sm:text-sm font-medium cursor-pointer ${
                  settings.paperTheme === theme.id
                    ? 'border-[#185341] dark:border-[#57B694] ring-1 ring-[#185341]/30'
                    : 'border-stone-200 dark:border-stone-700'
                }`}
              >
                <span
                  className="w-5 h-5 rounded-full border border-stone-300 shrink-0"
                  style={{ backgroundColor: theme.color }}
                />
                <span className="truncate">{theme.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Typography & Reading Experience */}
      <section className="rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-[#FCF9F2] dark:bg-[#15191C] p-5 sm:p-6 space-y-5">
        <h2 className="font-amiri text-xl font-bold text-[#1D1B18] dark:text-[#EFE9DC]">
          الخطوط وتجربة القراءة
        </h2>

        {/* Reading Mode */}
        <div className="space-y-2">
          <span className="text-sm font-medium block">نمط عرض الأذكار</span>
          <div className="grid grid-cols-2 gap-2.5">
            {(
              [
                { id: 'book', label: 'صفحات كتاب (تقليب)' },
                { id: 'continuous', label: 'قراءة متصلة (تمرير)' },
              ] as { id: ReadingMode; label: string }[]
            ).map((rm) => (
              <button
                key={rm.id}
                type="button"
                onClick={() => onUpdateSettings({ readingMode: rm.id })}
                className={`min-h-[44px] rounded-xl border text-xs sm:text-sm font-medium cursor-pointer ${
                  settings.readingMode === rm.id
                    ? 'border-[#185341] bg-[#185341]/10 text-[#185341] dark:border-[#57B694] dark:text-[#6CC4A5]'
                    : 'border-stone-200 dark:border-stone-700'
                }`}
              >
                {rm.label}
              </button>
            ))}
          </div>
        </div>

        {/* Arabic Font */}
        <div className="space-y-2">
          <span className="text-sm font-medium block">نوع الخط العربي</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(
              [
                { id: 'amiri', label: 'أميري', cls: 'font-amiri' },
                { id: 'scheherazade', label: 'شهرزاد', cls: 'font-scheherazade' },
                { id: 'naskh', label: 'نوتو نسخ', cls: 'font-naskh' },
                { id: 'cairo', label: 'القاهرة', cls: 'font-cairo' },
                { id: 'tajawal', label: 'تجول', cls: 'font-tajawal' },
              ] as { id: FontChoice; label: string; cls: string }[]
            ).map((font) => (
              <button
                key={font.id}
                type="button"
                onClick={() => onUpdateSettings({ fontFamily: font.id })}
                className={`min-h-[44px] px-3 rounded-xl border text-sm font-medium cursor-pointer ${font.cls} ${
                  settings.fontFamily === font.id
                    ? 'border-[#185341] bg-[#185341]/10 text-[#185341] dark:border-[#57B694] dark:text-[#6CC4A5]'
                    : 'border-stone-200 dark:border-stone-700'
                }`}
              >
                {font.label}
              </button>
            ))}
          </div>
        </div>

        {/* Font Size */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">حجم خط الأذكار</span>
            <span className="tabular-nums text-[#185341] dark:text-[#57B694]">
              {toArabicNumerals(settings.fontSize)} px
            </span>
          </div>
          <input
            type="range"
            min={18}
            max={36}
            value={settings.fontSize}
            onChange={(e) => onUpdateSettings({ fontSize: Number(e.target.value) })}
            className="w-full accent-[#185341]"
          />
          <p
            className={`p-3 rounded-xl border border-stone-200/70 dark:border-stone-800 bg-white/60 dark:bg-stone-900/50 text-center ${
              settings.fontFamily === 'amiri'
                ? 'font-amiri'
                : settings.fontFamily === 'scheherazade'
                ? 'font-scheherazade'
                : settings.fontFamily === 'naskh'
                ? 'font-naskh'
                : settings.fontFamily === 'cairo'
                ? 'font-cairo'
                : 'font-tajawal'
            }`}
            style={{ fontSize: `${settings.fontSize}px` }}
          >
            سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ
          </p>
        </div>

        {/* Line Height */}
        <div className="space-y-2">
          <span className="text-sm font-medium block">تباعد الأسطر</span>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: 'compact', label: 'مضغوط' },
                { id: 'comfortable', label: 'مريح' },
                { id: 'relaxed', label: 'واسع' },
              ] as { id: LineHeightOption; label: string }[]
            ).map((lh) => (
              <button
                key={lh.id}
                type="button"
                onClick={() => onUpdateSettings({ lineHeight: lh.id })}
                className={`min-h-[44px] rounded-xl border text-xs sm:text-sm font-medium cursor-pointer ${
                  settings.lineHeight === lh.id
                    ? 'border-[#185341] bg-[#185341]/10 text-[#185341] dark:border-[#57B694] dark:text-[#6CC4A5]'
                    : 'border-stone-200 dark:border-stone-700'
                }`}
              >
                {lh.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Smart Counter Behavior */}
      <section className="rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-[#FCF9F2] dark:bg-[#15191C] p-5 sm:p-6 space-y-4">
        <h2 className="font-amiri text-xl font-bold text-[#1D1B18] dark:text-[#EFE9DC]">
          العداد الذكي والتفاعل
        </h2>

        <div className="space-y-2">
          <span className="text-sm font-medium block">حجم زر العداد</span>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: 'small', label: 'صغير' },
                { id: 'medium', label: 'متوسط' },
                { id: 'large', label: 'كبير' },
              ] as { id: CounterSize; label: string }[]
            ).map((cs) => (
              <button
                key={cs.id}
                type="button"
                onClick={() => onUpdateSettings({ counterSize: cs.id })}
                className={`min-h-[44px] rounded-xl border text-xs sm:text-sm font-medium cursor-pointer ${
                  settings.counterSize === cs.id
                    ? 'border-[#185341] bg-[#185341]/10 text-[#185341] dark:border-[#57B694] dark:text-[#6CC4A5]'
                    : 'border-stone-200 dark:border-stone-700'
                }`}
              >
                {cs.label}
              </button>
            ))}
          </div>
        </div>

        <label className="min-h-[48px] flex items-center justify-between gap-3 py-1 cursor-pointer">
          <div>
            <div className="text-sm font-medium">انتقال تلقائي للذكر التالي</div>
            <div className="text-xs text-[#6B6356] dark:text-[#A6A092]">
              يقلب الصفحة تلقائياً عند إتمام العدد المطلوب
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.autoAdvance}
            onChange={(e) => onUpdateSettings({ autoAdvance: e.target.checked })}
            className="w-5 h-5 accent-[#185341]"
          />
        </label>

        <label className="min-h-[48px] flex items-center justify-between gap-3 py-1 cursor-pointer">
          <div className="flex items-center gap-2">
            <Vibrate className="w-4 h-4 text-[#6B6356] dark:text-[#A6A092]" />
            <div>
              <div className="text-sm font-medium">اهتزاز خفيف عند العد</div>
              <div className="text-xs text-[#6B6356] dark:text-[#A6A092]">
                على الأجهزة المحمولة الداعمة للاهتزاز
              </div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.hapticEnabled}
            onChange={(e) => onUpdateSettings({ hapticEnabled: e.target.checked })}
            className="w-5 h-5 accent-[#185341]"
          />
        </label>

        <label className="min-h-[48px] flex items-center justify-between gap-3 py-1 cursor-pointer">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-[#6B6356] dark:text-[#A6A092]" />
            <div>
              <div className="text-sm font-medium">صوت تسبيح خفيف</div>
              <div className="text-xs text-[#6B6356] dark:text-[#A6A092]">
                نقرة هادئة عند الضغط وإتمام الذكر
              </div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.soundEnabled}
            onChange={(e) => onUpdateSettings({ soundEnabled: e.target.checked })}
            className="w-5 h-5 accent-[#185341]"
          />
        </label>

        <label className="min-h-[48px] flex items-center justify-between gap-3 py-1 cursor-pointer">
          <div>
            <div className="text-sm font-medium">إظهار فضل الذكر تلقائياً</div>
            <div className="text-xs text-[#6B6356] dark:text-[#A6A092]">
              عرض الفضل الموثوق أسفل الذكر مباشرة
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.showVirtueByDefault}
            onChange={(e) => onUpdateSettings({ showVirtueByDefault: e.target.checked })}
            className="w-5 h-5 accent-[#185341]"
          />
        </label>
      </section>

      {/* Reminders & Notifications */}
      <section className="rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-[#FCF9F2] dark:bg-[#15191C] p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {settings.reminders.masterEnabled ? (
              <Bell className="w-5 h-5 text-[#185341] dark:text-[#57B694]" />
            ) : (
              <BellOff className="w-5 h-5 text-[#6B6356] dark:text-[#A6A092]" />
            )}
            <h2 className="font-amiri text-xl font-bold text-[#1D1B18] dark:text-[#EFE9DC]">
              الإشعارات والتذكير اليومي
            </h2>
          </div>

          <button
            type="button"
            onClick={() => handleToggleMasterReminders(!settings.reminders.masterEnabled)}
            className={`min-h-[40px] px-4 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              settings.reminders.masterEnabled
                ? 'bg-[#185341] dark:bg-[#2F7C61] text-white'
                : 'bg-stone-200 dark:bg-stone-800 text-[#5C5549] dark:text-[#A6A092]'
            }`}
          >
            {settings.reminders.masterEnabled ? 'مفعّلة' : 'متوقفة تماماً'}
          </button>
        </div>

        <p className="text-xs text-[#6B6356] dark:text-[#A6A092]">
          إشعارات هادئة غير مزعجة لتذكيرك بأذكار الصباح والمساء في الأوقات التي تحددها.
          {notificationPermission === 'denied' &&
            ' (تنبيه: إشعارات المتصفح محظورة حالياً في إعدادات جهازك، وسيظهر التذكير داخل التطبيق عند فتحه).'}
        </p>

        {settings.reminders.masterEnabled && (
          <div className="space-y-3 pt-2">
            {/* Morning Reminder */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-white/60 dark:bg-stone-900/40">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.reminders.morning.enabled}
                  onChange={(e) =>
                    onUpdateSettings({
                      reminders: {
                        ...settings.reminders,
                        morning: { ...settings.reminders.morning, enabled: e.target.checked },
                      },
                    })
                  }
                  className="w-4 h-4 accent-[#185341]"
                />
                <span className="text-sm font-medium">تذكير أذكار الصباح</span>
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={settings.reminders.morning.time}
                  disabled={!settings.reminders.morning.enabled}
                  onChange={(e) =>
                    onUpdateSettings({
                      reminders: {
                        ...settings.reminders,
                        morning: { ...settings.reminders.morning, time: e.target.value },
                      },
                    })
                  }
                  className="min-h-[40px] px-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-transparent text-sm tabular-nums"
                />
                <button
                  type="button"
                  onClick={() => onTestNotification('morning')}
                  className="min-h-[40px] px-3 rounded-lg border border-stone-200 dark:border-stone-700 text-xs font-medium hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                >
                  تجربة
                </button>
              </div>
            </div>

            {/* Evening Reminder */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-white/60 dark:bg-stone-900/40">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.reminders.evening.enabled}
                  onChange={(e) =>
                    onUpdateSettings({
                      reminders: {
                        ...settings.reminders,
                        evening: { ...settings.reminders.evening, enabled: e.target.checked },
                      },
                    })
                  }
                  className="w-4 h-4 accent-[#185341]"
                />
                <span className="text-sm font-medium">تذكير أذكار المساء</span>
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={settings.reminders.evening.time}
                  disabled={!settings.reminders.evening.enabled}
                  onChange={(e) =>
                    onUpdateSettings({
                      reminders: {
                        ...settings.reminders,
                        evening: { ...settings.reminders.evening, time: e.target.value },
                      },
                    })
                  }
                  className="min-h-[40px] px-2.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-transparent text-sm tabular-nums"
                />
                <button
                  type="button"
                  onClick={() => onTestNotification('evening')}
                  className="min-h-[40px] px-3 rounded-lg border border-stone-200 dark:border-stone-700 text-xs font-medium hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                >
                  تجربة
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Data Reset */}
      <section className="rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-[#FCF9F2] dark:bg-[#15191C] p-5 sm:p-6 space-y-3">
        <h2 className="font-amiri text-xl font-bold text-[#1D1B18] dark:text-[#EFE9DC]">
          إدارة البيانات والتقدم
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setConfirmAction('today')}
            className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-sm font-medium hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>تصفير عدّادات اليوم</span>
          </button>

          <button
            type="button"
            onClick={() => setConfirmAction('stats')}
            className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-300/70 dark:border-rose-800/60 text-sm font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>مسح سجل الإحصائيات</span>
          </button>
        </div>
      </section>

      {/* Developer Attribution at Bottom of Settings Page */}
      <EditorialDivider />
      <footer className="text-center space-y-1 py-2 text-xs text-[#6B6356] dark:text-[#968E80]">
        <p className="font-semibold text-[#1D1B18] dark:text-[#EFE9DC]">أذكار الصباح والمساء</p>
        <p>تطوير وبرمجة: حسام بن علية</p>
        <p dir="ltr" className="tabular-nums">
          HessamX © 2026 · جميع الحقوق محفوظة
        </p>
      </footer>

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-2xl bg-[#FCF9F2] dark:bg-[#15191C] border border-stone-200 dark:border-stone-800 p-6 space-y-4">
            <h3 className="font-amiri text-xl font-bold text-[#1D1B18] dark:text-[#EFE9DC]">
              {confirmAction === 'today' ? 'تصفير عدّادات اليوم؟' : 'مسح سجل الإحصائيات؟'}
            </h3>
            <p className="text-sm text-[#5C5549] dark:text-[#A6A092]">
              {confirmAction === 'today'
                ? 'سيتم إعادة جميع عدّادات أذكار اليوم إلى الصفر للبدء من جديد.'
                : 'سيتم حذف سجل الأيام المكتملة وسلسلة الالتزام بشكل دائم.'}
            </p>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  if (confirmAction === 'today') onResetTodayProgress();
                  else onResetAllStats();
                  setConfirmAction(null);
                }}
                className="flex-1 min-h-[44px] rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium cursor-pointer"
              >
                تأكيد
              </button>
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="flex-1 min-h-[44px] rounded-xl border border-stone-200 dark:border-stone-700 text-sm font-medium cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
