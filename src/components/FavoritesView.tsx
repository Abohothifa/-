import React from 'react';
import { Heart, BookOpen, Copy, Sun, Moon } from 'lucide-react';
import { ALL_ATHKAR, EVENING_ATHKAR, MORNING_ATHKAR } from '../data/athkarData';
import { ThikrCategory, ThikrItem } from '../types/athkar';
import { formatRepeatLabel, toArabicNumerals } from '../utils/arabic';

interface FavoritesViewProps {
  favorites: string[];
  onToggleFavorite: (thikrId: string) => void;
  onOpenInBook: (category: ThikrCategory, pageIndex: number) => void;
  onNotifyToast: (msg: string) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favorites,
  onToggleFavorite,
  onOpenInBook,
  onNotifyToast,
}) => {
  const favoriteItems = ALL_ATHKAR.filter((item) => favorites.includes(item.id));

  const copyItem = async (item: ThikrItem) => {
    try {
      await navigator.clipboard.writeText(`${item.title}\n\n${item.text}\n\n${item.source}`);
      onNotifyToast('تم نسخ الذكر إلى الحافظة');
    } catch {
      onNotifyToast('تعذر النسخ التلقائي');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 md:pb-12 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-amiri text-2xl sm:text-3xl font-bold text-[#1D1B18] dark:text-[#EFE9DC]">
            الأذكار المفضلة
          </h1>
          <p className="text-sm text-[#6B6356] dark:text-[#A6A092]">
            أذكارك المختارة للوصول السريع والقراءة المتكررة
          </p>
        </div>
        <span className="text-sm text-[#5C5549] dark:text-[#A6A092] tabular-nums">
          {toArabicNumerals(favoriteItems.length)} ذِكر
        </span>
      </div>

      {favoriteItems.length === 0 ? (
        <div className="rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-[#FCF9F2] dark:bg-[#15191C] p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#9A7837]/10 dark:bg-[#D0B070]/12 mx-auto flex items-center justify-center text-[#9A7837] dark:text-[#D0B070]">
            <Heart className="w-6 h-6" />
          </div>
          <h2 className="font-amiri text-xl font-bold text-[#1D1B18] dark:text-[#EFE9DC]">
            لا توجد أذكار في المفضلة بعد
          </h2>
          <p className="text-sm text-[#6B6356] dark:text-[#A6A092] max-w-md mx-auto">
            يمكنك إضافة أي ذكر إلى المفضلة بالضغط على أيقونة القلب أثناء قراءة أذكار الصباح أو المساء.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {favoriteItems.map((item) => {
            const list = item.category === 'morning' ? MORNING_ATHKAR : EVENING_ATHKAR;
            const pageIdx = list.findIndex((x) => x.id === item.id);
            return (
              <article
                key={item.id}
                className="rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-[#FCF9F2] dark:bg-[#15191C] p-5 sm:p-6 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-[#9A7837] dark:text-[#D0B070]">
                      {item.category === 'morning' ? (
                        <Sun className="w-3.5 h-3.5" />
                      ) : (
                        <Moon className="w-3.5 h-3.5" />
                      )}
                      <span>{item.category === 'morning' ? 'أذكار الصباح' : 'أذكار المساء'}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatRepeatLabel(item.repeat)}</span>
                    </div>
                    <h2 className="font-amiri text-xl font-bold text-[#1D1B18] dark:text-[#EFE9DC]">
                      {item.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => copyItem(item)}
                      aria-label="نسخ"
                      className="min-h-[42px] min-w-[42px] rounded-xl flex items-center justify-center text-[#5C5549] dark:text-[#A6A092] hover:bg-stone-200/50 dark:hover:bg-stone-800 cursor-pointer"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleFavorite(item.id)}
                      aria-label="إزالة من المفضلة"
                      className="min-h-[42px] min-w-[42px] rounded-xl flex items-center justify-center text-rose-600 dark:text-rose-400 bg-rose-500/10 cursor-pointer"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                </div>

                <p className="font-amiri text-xl leading-[1.9] text-[#1D1B18] dark:text-[#EFE9DC] whitespace-pre-line">
                  {item.text}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-200/70 dark:border-stone-800/70">
                  <span className="text-xs text-[#6B6356] dark:text-[#A6A092]">{item.source}</span>
                  <button
                    type="button"
                    onClick={() => onOpenInBook(item.category, Math.max(0, pageIdx))}
                    className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#185341] dark:bg-[#2F7C61] text-white text-xs font-medium cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>فتح في الكتاب</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
