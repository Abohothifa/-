import React from 'react';
import { BookCheck, ShieldCheck, WifiOff } from 'lucide-react';
import { AppEmblem, CornerArabesque, EditorialDivider } from './IslamicOrnament';

export const AboutView: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-24 md:pb-12">
      <article className="relative overflow-hidden rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-[#FCF9F2] dark:bg-[#15191C] p-6 sm:p-10 book-page-shadow-light space-y-8">
        <CornerArabesque position="tr" />
        <CornerArabesque position="tl" />
        <CornerArabesque position="br" />
        <CornerArabesque position="bl" />

        {/* Header */}
        <div className="relative z-10 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#185341]/10 dark:bg-[#3E8E72]/15 border border-[#9A7837]/25 dark:border-[#D0B070]/25 flex items-center justify-center mx-auto">
            <AppEmblem className="w-10 h-10" />
          </div>
          <h1 className="font-amiri text-3xl sm:text-4xl font-bold text-[#1D1B18] dark:text-[#EFE9DC]">
            أذكار الصباح والمساء
          </h1>
          <p className="text-base sm:text-lg text-[#5C5549] dark:text-[#A6A092] max-w-xl mx-auto leading-relaxed">
            تطبيق إسلامي يهدف إلى تيسير المحافظة على الأذكار اليومية.
          </p>
        </div>

        <EditorialDivider />

        {/* Core Pillars */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-right">
          <div className="rounded-xl border border-stone-200/70 dark:border-stone-800 p-4 space-y-2">
            <BookCheck className="w-5 h-5 text-[#185341] dark:text-[#57B694] mx-auto sm:mx-0" />
            <h2 className="font-semibold text-sm text-[#1D1B18] dark:text-[#EFE9DC]">
              مصادر موثوقة
            </h2>
            <p className="text-xs text-[#6B6356] dark:text-[#A6A092] leading-relaxed">
              نصوص الأذكار مضبوطة بالشكل ومراجَعة وفق كتاب «حصن المسلم» والكتب الستة المعتمدة.
            </p>
          </div>

          <div className="rounded-xl border border-stone-200/70 dark:border-stone-800 p-4 space-y-2">
            <WifiOff className="w-5 h-5 text-[#9A7837] dark:text-[#D0B070] mx-auto sm:mx-0" />
            <h2 className="font-semibold text-sm text-[#1D1B18] dark:text-[#EFE9DC]">
              دون اتصال بالإنترنت
            </h2>
            <p className="text-xs text-[#6B6356] dark:text-[#A6A092] leading-relaxed">
              يعمل التطبيق بالكامل دون إنترنت مع حفظ تلقائي لتقدمك وتفضيلاتك محلياً.
            </p>
          </div>

          <div className="rounded-xl border border-stone-200/70 dark:border-stone-800 p-4 space-y-2">
            <ShieldCheck className="w-5 h-5 text-[#185341] dark:text-[#57B694] mx-auto sm:mx-0" />
            <h2 className="font-semibold text-sm text-[#1D1B18] dark:text-[#EFE9DC]">
              خصوصية تامة
            </h2>
            <p className="text-xs text-[#6B6356] dark:text-[#A6A092] leading-relaxed">
              لا إعلانات، لا تتبع، ولا إرسال لأي بيانات شخصية خارج جهازك.
            </p>
          </div>
        </div>

        <EditorialDivider />

        {/* Developer Attribution Block (Exact Requested Text) */}
        <section className="relative z-10 rounded-xl border border-[#9A7837]/25 dark:border-[#D0B070]/25 bg-[#F5EFE2]/70 dark:bg-stone-900/50 p-6 text-center space-y-2">
          <h2 className="text-sm font-semibold text-[#9A7837] dark:text-[#D0B070]">
            حقوق التطوير والتصميم والبرمجة:
          </h2>
          <p className="font-amiri text-xl sm:text-2xl font-bold text-[#1D1B18] dark:text-[#EFE9DC]">
            تطوير وبرمجة: حسام بن علية
          </p>
          <p dir="ltr" className="text-sm font-semibold text-[#185341] dark:text-[#57B694] tabular-nums">
            HessamX © 2026
          </p>
          <p className="text-xs text-[#6B6356] dark:text-[#A6A092]">
            جميع الحقوق محفوظة.
          </p>
        </section>
      </article>
    </div>
  );
};
