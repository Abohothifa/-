import React from 'react';
import { BookOpen, Heart, BarChart3, Settings, Home, Info } from 'lucide-react';
import { AppView, ThikrCategory } from '../types/athkar';
import { AppEmblem } from './IslamicOrnament';

interface NavigationBarProps {
  currentView: AppView;
  activeCategory: ThikrCategory;
  onNavigate: (view: AppView) => void;
  onOpenReader: (category?: ThikrCategory) => void;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  currentView,
  activeCategory,
  onNavigate,
  onOpenReader,
}) => {
  const desktopLinks: { id: AppView; label: string }[] = [
    { id: 'home', label: 'الرئيسية' },
    { id: 'favorites', label: 'المفضلة' },
    { id: 'stats', label: 'الإحصائيات' },
    { id: 'settings', label: 'الإعدادات' },
    { id: 'about', label: 'حول التطبيق' },
  ];

  const mobileTabs: { id: AppView; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'الرئيسية', icon: <Home className="w-5 h-5" /> },
    { id: 'reader', label: 'الكتاب', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'favorites', label: 'المفضلة', icon: <Heart className="w-5 h-5" /> },
    { id: 'stats', label: 'الإحصائيات', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'settings', label: 'الإعدادات', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Desktop & Tablet Top Bar (3-zone contract) */}
      <header className="sticky top-0 z-30 border-b border-stone-200/80 dark:border-stone-800/80 bg-[#FAF6EE]/92 dark:bg-[#111417]/92 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 md:h-16 flex items-center justify-between gap-4 md:gap-8">
          {/* Zone 1: Brand Mark */}
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-right whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#185341] rounded-lg py-1"
          >
            <AppEmblem className="w-7 h-7 shrink-0" />
            <span className="font-amiri text-xl font-bold text-[#1D1B18] dark:text-[#EFE9DC]">
              أذكار الصباح والمساء
            </span>
          </button>

          {/* Zone 2: Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium" aria-label="التنقل الرئيسي">
            {desktopLinks.map((link) => {
              const active = currentView === link.id;
              return (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => onNavigate(link.id)}
                  className={`relative py-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    active
                      ? 'text-[#185341] dark:text-[#57B694] font-semibold'
                      : 'text-[#5C5549] dark:text-[#A6A092] hover:text-[#1D1B18] dark:hover:text-[#EFE9DC]'
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute inset-x-0 -bottom-[1px] h-0.5 bg-[#185341] dark:bg-[#57B694] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('about')}
              aria-label="حول التطبيق"
              className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#5C5549] dark:text-[#A6A092] hover:bg-stone-200/50 dark:hover:bg-stone-800/60 transition-colors"
            >
              <Info className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => onOpenReader(activeCategory)}
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#185341] hover:bg-[#134234] dark:bg-[#2F7C61] dark:hover:bg-[#256650] text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>فتح كتاب الأذكار</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar (<= 60px height, 44px+ hitboxes) */}
      <nav
        aria-label="التنقل السفلي"
        className="md:hidden fixed bottom-0 inset-x-0 z-30 h-[60px] border-t border-stone-200/80 dark:border-stone-800/80 bg-[#FAF6EE]/95 dark:bg-[#111417]/95 backdrop-blur-md"
      >
        <div className="grid grid-cols-5 h-full max-w-lg mx-auto">
          {mobileTabs.map((tab) => {
            const active = currentView === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => (tab.id === 'reader' ? onOpenReader(activeCategory) : onNavigate(tab.id))}
                className={`flex flex-col items-center justify-center gap-0.5 min-h-[44px] transition-colors ${
                  active
                    ? 'text-[#185341] dark:text-[#57B694] font-semibold'
                    : 'text-[#6B6356] dark:text-[#968E80]'
                }`}
              >
                {tab.icon}
                <span className="text-[11px] leading-none whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
