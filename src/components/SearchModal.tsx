import React, { useMemo, useState } from 'react';
import { Search, X, ArrowLeft, Sun, Moon } from 'lucide-react';
import { ALL_ATHKAR, EVENING_ATHKAR, MORNING_ATHKAR } from '../data/athkarData';
import { ThikrCategory } from '../types/athkar';
import { normalizeArabicForSearch, toArabicNumerals } from '../utils/arabic';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectThikr: (category: ThikrCategory, pageIndex: number) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSelectThikr }) => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | ThikrCategory>('all');

  const results = useMemo(() => {
    const q = normalizeArabicForSearch(query);
    return ALL_ATHKAR.filter((item) => {
      if (filter !== 'all' && item.category !== filter) return false;
      if (!q) return true;
      const haystack = normalizeArabicForSearch(
        `${item.title} ${item.text} ${item.virtue ?? ''} ${item.source}`
      );
      return haystack.includes(q);
    });
  }, [query, filter]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/55 backdrop-blur-xs p-4 pt-10 sm:pt-16"
      role="dialog"
      aria-modal="true"
      aria-label="البحث في الأذكار"
    >
      <div className="w-full max-w-2xl max-h-[82vh] flex flex-col rounded-2xl bg-[#FCF9F2] dark:bg-[#15191C] border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 px-3.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 focus-within:border-[#185341]">
              <Search className="w-4 h-4 text-[#6B6356] dark:text-[#A6A092] shrink-0" />
              <input
                type="search"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث بكلمة من الذكر (يعمل بدون تشكيل)..."
                className="w-full min-h-[44px] bg-transparent text-sm text-[#1D1B18] dark:text-[#EFE9DC] placeholder:text-[#8C8374] focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق البحث"
              className="min-h-[44px] min-w-[44px] rounded-xl border border-stone-200 dark:border-stone-700 flex items-center justify-center text-[#5C5549] dark:text-[#A6A092] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {(
              [
                { id: 'all', label: 'الكل' },
                { id: 'morning', label: 'أذكار الصباح' },
                { id: 'evening', label: 'أذكار المساء' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  filter === tab.id
                    ? 'bg-[#185341] dark:bg-[#2F7C61] text-white'
                    : 'bg-stone-200/70 dark:bg-stone-800 text-[#5C5549] dark:text-[#A6A092]'
                }`}
              >
                {tab.label}
              </button>
            ))}
            <span className="mr-auto text-xs text-[#6B6356] dark:text-[#A6A092] tabular-nums">
              {toArabicNumerals(results.length)} نتيجة
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-stone-200/70 dark:divide-stone-800/70 p-2">
          {results.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#6B6356] dark:text-[#A6A092]">
              لم يُعثر على نتائج مطابقة لعبارة البحث.
            </div>
          ) : (
            results.map((item) => {
              const list = item.category === 'morning' ? MORNING_ATHKAR : EVENING_ATHKAR;
              const pageIndex = list.findIndex((x) => x.id === item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectThikr(item.category, Math.max(0, pageIndex));
                    onClose();
                  }}
                  className="w-full p-3.5 rounded-xl hover:bg-stone-200/50 dark:hover:bg-stone-800/50 text-right flex items-start justify-between gap-3 transition-colors cursor-pointer"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-[#9A7837] dark:text-[#D0B070]">
                      {item.category === 'morning' ? (
                        <Sun className="w-3.5 h-3.5" />
                      ) : (
                        <Moon className="w-3.5 h-3.5" />
                      )}
                      <span>{item.category === 'morning' ? 'أذكار الصباح' : 'أذكار المساء'}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">صفحة {toArabicNumerals(pageIndex + 1)}</span>
                    </div>
                    <h4 className="font-amiri text-base font-bold text-[#1D1B18] dark:text-[#EFE9DC]">
                      {item.title}
                    </h4>
                    <p className="text-xs text-[#5C5549] dark:text-[#A6A092] line-clamp-2">
                      {item.text}
                    </p>
                  </div>
                  <ArrowLeft className="w-4 h-4 text-[#6B6356] dark:text-[#A6A092] shrink-0 mt-2" />
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
