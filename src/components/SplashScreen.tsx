import React, { useEffect } from 'react';
import { AppEmblem, EditorialDivider } from './IslamicOrnament';

interface SplashScreenProps {
  onDismiss: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onDismiss }) => {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, 1150);
    return () => window.clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      onClick={onDismiss}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onDismiss();
      }}
      aria-label="الدخول إلى تطبيق أذكار الصباح والمساء"
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#FAF6EE] dark:bg-[#0E1113] px-6 py-10 text-center cursor-pointer select-none transition-opacity duration-300"
    >
      <div className="text-xs text-[#7B7263] dark:text-[#8E8779] tracking-wide">
        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
      </div>

      <div className="flex flex-col items-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-[#185341]/8 dark:bg-[#3E8E72]/12 border border-[#9A7837]/25 dark:border-[#D0B070]/25 flex items-center justify-center mb-6">
          <AppEmblem className="w-12 h-12" />
        </div>

        <h1 className="font-amiri text-3xl sm:text-4xl font-bold text-[#1D1B18] dark:text-[#EFE9DC] tracking-tight">
          أذكار الصباح والمساء
        </h1>

        <p className="mt-2.5 text-sm sm:text-base text-[#5C5549] dark:text-[#A6A092]">
          كتيّب أذكار رقمي ميسّر لحصن المسلم اليومي
        </p>

        <EditorialDivider className="w-40 mt-6" />
      </div>

      <footer className="space-y-1 text-xs text-[#6B6356] dark:text-[#968E80]">
        <p className="font-medium text-[#1D1B18]/80 dark:text-[#EFE9DC]/85">
          تطوير وبرمجة: حسام بن علية
        </p>
        <p dir="ltr" className="tabular-nums opacity-80">
          HessamX © 2026
        </p>
      </footer>
    </div>
  );
};
