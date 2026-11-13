import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Copy,
  Share2,
  RotateCcw,
  Undo2,
  ListOrdered,
  SlidersHorizontal,
  Maximize2,
  Minimize2,
  EyeOff,
  Eye,
  BookOpen,
  ScrollText,
  Search,
  Sun,
  Moon,
  Check,
  Sparkles,
  BookMarked,
  X,
} from 'lucide-react';
import {
  AppSettings,
  CounterSize,
  FontChoice,
  LineHeightOption,
  PaperTheme,
  ThikrCategory,
  ThikrItem,
} from '../types/athkar';
import { getAthkarByCategory } from '../data/athkarData';
import { formatRepeatLabel, toArabicNumerals } from '../utils/arabic';
import { computeCategoryProgress } from '../utils/storage';
import { CornerArabesque, EditorialDivider } from './IslamicOrnament';

interface BookReaderViewProps {
  category: ThikrCategory;
  currentPage: number;
  counts: Record<string, number>;
  favorites: string[];
  settings: AppSettings;
  isDark: boolean;
  onChangeCategory: (category: ThikrCategory) => void;
  onChangePage: (pageIndex: number) => void;
  onIncrementCount: (thikr: ThikrItem) => void;
  onDecrementCount: (thikr: ThikrItem) => void;
  onResetCount: (thikr: ThikrItem) => void;
  onToggleFavorite: (thikrId: string) => void;
  onUpdateSettings: (partial: Partial<AppSettings>) => void;
  onToggleTheme: () => void;
  onOpenSearch: () => void;
  onNotifyToast: (message: string) => void;
  onExitFullscreenReader?: (hiddenControls: boolean) => void;
}

const FONT_CLASS_MAP: Record<FontChoice, string> = {
  amiri: 'font-amiri',
  scheherazade: 'font-scheherazade',
  naskh: 'font-naskh',
  cairo: 'font-cairo',
  tajawal: 'font-tajawal',
};

const LINE_HEIGHT_MAP: Record<LineHeightOption, string> = {
  compact: 'leading-[1.65]',
  comfortable: 'leading-[1.95]',
  relaxed: 'leading-[2.25]',
};

const PAPER_THEME_STYLES: Record<
  PaperTheme,
  { label: string; swatch: string; containerClass: string; textClass: string; mutedClass: string }
> = {
  ivory: {
    label: 'عاجي دافئ',
    swatch: '#FCF9F2',
    containerClass: 'bg-[#FCF9F2] border-[#E6DEC8]',
    textClass: 'text-[#1D1B18]',
    mutedClass: 'text-[#665E50]',
  },
  parchment: {
    label: 'ورقي كلاسيكي',
    swatch: '#F3EAD7',
    containerClass: 'bg-[#F3EAD7] border-[#DFD1B4]',
    textClass: 'text-[#231D15]',
    mutedClass: 'text-[#6A5C48]',
  },
  white: {
    label: 'أبيض نقي',
    swatch: '#FFFFFF',
    containerClass: 'bg-white border-stone-200',
    textClass: 'text-stone-900',
    mutedClass: 'text-stone-500',
  },
  sage: {
    label: 'أخضر هادئ',
    swatch: '#EDF3EE',
    containerClass: 'bg-[#EDF3EE] border-[#CFE0D3]',
    textClass: 'text-[#152820]',
    mutedClass: 'text-[#4B6658]',
  },
  obsidian: {
    label: 'ليلي داكن',
    swatch: '#15191C',
    containerClass: 'bg-[#15191C] border-stone-800',
    textClass: 'text-[#EFE9DC]',
    mutedClass: 'text-[#A6A092]',
  },
  midnight: {
    label: 'أسود مريح',
    swatch: '#0B0C0E',
    containerClass: 'bg-[#0B0C0E] border-stone-800/80',
    textClass: 'text-[#ECE6D8]',
    mutedClass: 'text-[#999386]',
  },
};

export const BookReaderView: React.FC<BookReaderViewProps> = ({
  category,
  currentPage,
  counts,
  favorites,
  settings,
  isDark,
  onChangeCategory,
  onChangePage,
  onIncrementCount,
  onDecrementCount,
  onResetCount,
  onToggleFavorite,
  onUpdateSettings,
  onToggleTheme,
  onOpenSearch,
  onNotifyToast,
  onExitFullscreenReader,
}) => {
  const items = useMemo(() => getAthkarByCategory(category), [category]);
  const safePage = Math.max(0, Math.min(currentPage, items.length - 1));
  const currentThikr = items[safePage];

  // Effective paper theme respects Day/Night automatically unless user explicitly chose a compatible sheet
  const effectivePaperKey: PaperTheme = useMemo(() => {
    if (isDark && (settings.paperTheme === 'ivory' || settings.paperTheme === 'parchment' || settings.paperTheme === 'white' || settings.paperTheme === 'sage')) {
      return 'obsidian';
    }
    if (!isDark && (settings.paperTheme === 'obsidian' || settings.paperTheme === 'midnight')) {
      return 'ivory';
    }
    return settings.paperTheme;
  }, [isDark, settings.paperTheme]);

  const paperStyle = PAPER_THEME_STYLES[effectivePaperKey];
  const fontClass = FONT_CLASS_MAP[settings.fontFamily];
  const leadingClass = LINE_HEIGHT_MAP[settings.lineHeight];

  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next');
  const [showIndexDrawer, setShowIndexDrawer] = useState(false);
  const [showCustomizeDrawer, setShowCustomizeDrawer] = useState(false);
  const [hideControls, setHideControls] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [expandedVocab, setExpandedVocab] = useState(false);
  const [expandedVirtue, setExpandedVirtue] = useState(settings.showVirtueByDefault);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const readerContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const autoAdvanceTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setExpandedVocab(false);
    setExpandedVirtue(settings.showVirtueByDefault);
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = 0;
    }
  }, [safePage, category, settings.showVirtueByDefault]);

  useEffect(() => {
    if (onExitFullscreenReader) {
      onExitFullscreenReader(hideControls || isFullscreen);
    }
  }, [hideControls, isFullscreen, onExitFullscreenReader]);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  useEffect(() => {
    return () => {
      if (autoAdvanceTimeoutRef.current) {
        window.clearTimeout(autoAdvanceTimeoutRef.current);
      }
    };
  }, []);

  const goNextPage = useCallback(() => {
    if (safePage < items.length - 1) {
      setFlipDirection('next');
      onChangePage(safePage + 1);
    }
  }, [safePage, items.length, onChangePage]);

  const goPrevPage = useCallback(() => {
    if (safePage > 0) {
      setFlipDirection('prev');
      onChangePage(safePage - 1);
    }
  }, [safePage, onChangePage]);

  // Keyboard navigation in book mode (RTL: ArrowLeft = Next page, ArrowRight = Prev page)
  useEffect(() => {
    if (settings.readingMode !== 'book' || showIndexDrawer || showCustomizeDrawer) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goNextPage();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goPrevPage();
      } else if (e.key === 'Escape' && hideControls) {
        setHideControls(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [settings.readingMode, showIndexDrawer, showCustomizeDrawer, goNextPage, goPrevPage, hideControls]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (readerContainerRef.current?.requestFullscreen) {
          await readerContainerRef.current.requestFullscreen();
        } else {
          setIsFullscreen((v) => !v);
        }
      } else {
        await document.exitFullscreen();
      }
    } catch {
      setIsFullscreen((v) => !v);
    }
  };

  // Swipe gestures on book card (RTL: swipe left->right is prev, right->left is next; Wait: in RTL book, turning a page from left to right reveals the next page or dragging finger to the right flips the page forward, while dragging left also feels natural for next on phones! Let's support natural swipe: swipe left (dx < -48) OR swipe right (dx > 48): Wait—let's keep standard RTL book physics:
  // In an Arabic book opened right-to-left:
  // Page 1 is on the right, and you turn pages toward the right (swiping left-to-right dx > 48 goes forward? Wait: on Arabic mobile apps/Kindle RTL, users often expect swipe RIGHT->LEFT to advance OR LEFT->RIGHT like physical pages! Actually, in almost all Arabic mobile readers & Mushaf apps (مثل مصحف المدينة وآية وحصن المسلم), the NEXT page is to the LEFT, so you drag from LEFT to RIGHT to pull the left page over, OR tap the LEFT edge to go NEXT, tap the RIGHT edge to go PREVIOUS! Wait: let's verify:
  // If Page 2 is on the left side of Page 1, to turn to Page 2 you either:
  //   - Tap the LEFT edge (`ChevronLeft` = الصفحة التالية)
  //   - Swipe from LEFT to RIGHT (`dx > 50`? No, dragging left page to the right moves finger left->right `dx > 0`, whereas carousel LTR moves finger right->left `dx < 0`). Let's check what users intuitively expect in web RTL: in CSS `dir="rtl"`, tapping the Left arrow (`<`) advances to Next page (`التالي`), and tapping the Right arrow (`>`) goes to Previous page (`السابق`). On touch drag, dragging from left toward right (`dx > 55`) feels like turning a physical Arabic book page from left to right! Wait—some users swipe right-to-left out of smartphone habit. Let's make it crystal clear and reliable:
  //   - Tapping LEFT side edge = Next page (`الصفحة التالية`)
  //   - Tapping RIGHT side edge = Previous page (`الصفحة السابقة`)
  //   - Dragging left-to-right (`dx > 55`) = Next page (Arabic Mushaf page flip)
  //   - Dragging right-to-left (`dx < -55`) = Previous page
  // Let's also show subtle directional tooltips/labels on the navigation arrows (`السابق` on right, `التالي` on left) so there is zero ambiguity!
  const handlePointerDown = (e: React.PointerEvent) => {
    if (settings.readingMode !== 'book') return;
    // Ignore drags starting on buttons
    if ((e.target as HTMLElement).closest('button, a, input, select')) return;
    pointerStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!pointerStartRef.current || settings.readingMode !== 'book') return;
    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;
    const dt = Date.now() - pointerStartRef.current.time;
    pointerStartRef.current = null;

    if (dt < 600 && Math.abs(dx) > 52 && Math.abs(dx) > Math.abs(dy) * 1.25) {
      if (dx > 0) {
        // Dragged left-to-right (physical Arabic book forward page flip)
        goNextPage();
      } else {
        // Dragged right-to-left
        goPrevPage();
      }
    }
  };

  const handleCounterTap = (thikr: ThikrItem) => {
    const current = counts[thikr.id] ?? 0;
    if (current >= thikr.repeat) return;
    const nextVal = current + 1;
    onIncrementCount(thikr);

    if (
      settings.readingMode === 'book' &&
      settings.autoAdvance &&
      nextVal >= thikr.repeat &&
      safePage < items.length - 1
    ) {
      if (autoAdvanceTimeoutRef.current) {
        window.clearTimeout(autoAdvanceTimeoutRef.current);
      }
      autoAdvanceTimeoutRef.current = window.setTimeout(() => {
        setFlipDirection('next');
        onChangePage(safePage + 1);
      }, 460);
    }
  };

  const handleCopy = async (thikr: ThikrItem) => {
    const fullCopy = `${thikr.title}\n\n${thikr.text}\n\n(${formatRepeatLabel(thikr.repeat)} · ${thikr.source})`;
    try {
      await navigator.clipboard.writeText(fullCopy);
      setCopiedId(thikr.id);
      onNotifyToast('تم نسخ الذكر إلى الحافظة');
      window.setTimeout(() => setCopiedId((prev) => (prev === thikr.id ? null : prev)), 1800);
    } catch {
      onNotifyToast('تعذر النسخ التلقائي');
    }
  };

  const handleShare = async (thikr: ThikrItem) => {
    const shareText = `${thikr.title}\n\n${thikr.text}\n\n${formatRepeatLabel(thikr.repeat)}\n${thikr.source}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: thikr.title,
          text: shareText,
        });
        return;
      } catch {
        // User cancelled or unsupported
      }
    }
    await handleCopy(thikr);
  };

  const categoryProgress = computeCategoryProgress(category, counts);
  const currentTapCount = Math.min(counts[currentThikr.id] ?? 0, currentThikr.repeat);
  const remainingCount = Math.max(0, currentThikr.repeat - currentTapCount);
  const isCompleted = currentTapCount >= currentThikr.repeat;
  const isFavorite = favorites.includes(currentThikr.id);

  const counterHeightClass =
    settings.counterSize === 'small'
      ? 'h-12 text-sm'
      : settings.counterSize === 'large'
      ? 'h-20 text-lg'
      : 'h-16 text-base';

  const paperBgForWrapper = isFullscreen ? 'bg-[#F6F1E7] dark:bg-[#0E1113] min-h-screen' : '';

  return (
    <div
      ref={readerContainerRef}
      className={`max-w-5xl mx-auto px-3 sm:px-6 py-3 sm:py-5 ${
        hideControls ? 'pb-6' : 'pb-24 md:pb-10'
      } ${paperBgForWrapper}`}
    >
      {/* Top Reader Toolbar */}
      {!hideControls ? (
        <div className="mb-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Morning / Evening Quick Switch */}
            <div className="inline-flex items-center p-1 rounded-xl bg-stone-200/75 dark:bg-stone-800/80 border border-stone-300/40 dark:border-stone-700/50">
              <button
                type="button"
                onClick={() => onChangeCategory('morning')}
                className={`min-h-[38px] inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  category === 'morning'
                    ? 'bg-[#FCF9F2] dark:bg-[#15191C] text-[#185341] dark:text-[#57B694] shadow-sm'
                    : 'text-[#5C5549] dark:text-[#A6A092] hover:text-[#1D1B18] dark:hover:text-[#EFE9DC]'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>أذكار الصباح</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeCategory('evening')}
                className={`min-h-[38px] inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  category === 'evening'
                    ? 'bg-[#FCF9F2] dark:bg-[#15191C] text-[#185341] dark:text-[#57B694] shadow-sm'
                    : 'text-[#5C5549] dark:text-[#A6A092] hover:text-[#1D1B18] dark:hover:text-[#EFE9DC]'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>أذكار المساء</span>
              </button>
            </div>

            {/* Reader Utility Tools */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Reading Mode Switch: Book vs Continuous */}
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({
                    readingMode: settings.readingMode === 'book' ? 'continuous' : 'book',
                  })
                }
                title={settings.readingMode === 'book' ? 'التبديل إلى القراءة المتصلة' : 'التبديل إلى نظام الصفحات'}
                className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-[#FCF9F2] dark:bg-[#15191C] text-xs font-medium text-[#1D1B18] dark:text-[#EFE9DC] hover:border-[#9A7837]/50 transition-colors whitespace-nowrap cursor-pointer"
              >
                {settings.readingMode === 'book' ? (
                  <>
                    <ScrollText className="w-4 h-4 text-[#185341] dark:text-[#57B694]" />
                    <span className="hidden sm:inline">قراءة متصلة</span>
                  </>
                ) : (
                  <>
                    <BookOpen className="w-4 h-4 text-[#185341] dark:text-[#57B694]" />
                    <span className="hidden sm:inline">تقليب الصفحات</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowIndexDrawer(true)}
                aria-label="فهرس الأذكار والانتقال السريع"
                title="فهرس الأذكار"
                className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center gap-1.5 px-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-[#FCF9F2] dark:bg-[#15191C] text-xs font-medium text-[#1D1B18] dark:text-[#EFE9DC] hover:border-[#9A7837]/50 transition-colors cursor-pointer"
              >
                <ListOrdered className="w-4 h-4" />
                <span className="hidden sm:inline">الفهرس</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCustomizeDrawer(true)}
                aria-label="أدوات القراءة والخط"
                title="أدوات القراءة"
                className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center gap-1.5 px-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-[#FCF9F2] dark:bg-[#15191C] text-xs font-medium text-[#1D1B18] dark:text-[#EFE9DC] hover:border-[#9A7837]/50 transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">الخط والمظهر</span>
              </button>

              <button
                type="button"
                onClick={onOpenSearch}
                aria-label="بحث"
                title="بحث"
                className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-xl border border-stone-200 dark:border-stone-700 bg-[#FCF9F2] dark:bg-[#15191C] text-[#1D1B18] dark:text-[#EFE9DC] hover:border-[#9A7837]/50 transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onToggleTheme}
                aria-label={isDark ? 'الوضع النهاري' : 'الوضع الليلي'}
                title={isDark ? 'الوضع النهاري' : 'الوضع الليلي'}
                className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-xl border border-stone-200 dark:border-stone-700 bg-[#FCF9F2] dark:bg-[#15191C] text-[#1D1B18] dark:text-[#EFE9DC] hover:border-[#9A7837]/50 transition-colors cursor-pointer"
              >
                {isDark ? <Sun className="w-4 h-4 text-[#D0B070]" /> : <Moon className="w-4 h-4 text-[#185341]" />}
              </button>

              <button
                type="button"
                onClick={() => setHideControls(true)}
                aria-label="إخفاء عناصر التحكم"
                title="إخفاء عناصر التحكم أثناء القراءة"
                className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-xl border border-stone-200 dark:border-stone-700 bg-[#FCF9F2] dark:bg-[#15191C] text-[#1D1B18] dark:text-[#EFE9DC] hover:border-[#9A7837]/50 transition-colors cursor-pointer"
              >
                <EyeOff className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label={isFullscreen ? 'إنهاء ملء الشاشة' : 'ملء الشاشة'}
                title={isFullscreen ? 'إنهاء ملء الشاشة' : 'وضع ملء الشاشة'}
                className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-xl border border-stone-200 dark:border-stone-700 bg-[#FCF9F2] dark:bg-[#15191C] text-[#1D1B18] dark:text-[#EFE9DC] hover:border-[#9A7837]/50 transition-colors cursor-pointer"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Reading Progress Ribbon */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full bg-stone-200/80 dark:bg-stone-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#185341] dark:bg-[#57B694] transition-all duration-300"
                style={{ width: `${categoryProgress.percentage}%` }}
              />
            </div>
            <span className="text-xs text-[#5C5549] dark:text-[#A6A092] tabular-nums whitespace-nowrap">
              {settings.readingMode === 'book'
                ? `صفحة ${toArabicNumerals(safePage + 1)} من ${toArabicNumerals(items.length)}`
                : `أُنجز ${toArabicNumerals(categoryProgress.completedItems)} من ${toArabicNumerals(items.length)}`}
            </span>
          </div>
        </div>
      ) : (
        /* Quiet restore bar when controls are hidden */
        <div className="mb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setHideControls(false)}
            className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900/10 dark:bg-white/10 text-xs font-medium text-[#1D1B18] dark:text-[#EFE9DC] backdrop-blur-sm cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>إظهار الأدوات</span>
          </button>
          <span className="text-xs text-[#6B6356] dark:text-[#A6A092] tabular-nums">
            {toArabicNumerals(safePage + 1)} / {toArabicNumerals(items.length)}
          </span>
        </div>
      )}

      {/* MODE 1: BOOK PAGE-FLIPPER MODE */}
      {settings.readingMode === 'book' ? (
        <div className="space-y-4">
          {/* Book Stage with Side Edge Tap Zones & 3D Flip Animation */}
          <div
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            className="relative touch-pan-y select-text"
            style={{ perspective: '1600px' }}
          >
            {/* Left Side Edge Tap Zone (Next page in RTL) */}
            <button
              type="button"
              onClick={goNextPage}
              disabled={safePage >= items.length - 1}
              aria-label="الصفحة التالية"
              className="hidden sm:flex absolute left-0 top-12 bottom-12 w-10 z-20 items-center justify-center opacity-40 hover:opacity-100 disabled:opacity-0 transition-opacity cursor-pointer"
            >
              <span className="w-8 h-8 rounded-full bg-stone-900/8 dark:bg-white/10 flex items-center justify-center text-[#1D1B18] dark:text-[#EFE9DC]">
                <ChevronLeft className="w-5 h-5" />
              </span>
            </button>

            {/* Right Side Edge Tap Zone (Prev page in RTL) */}
            <button
              type="button"
              onClick={goPrevPage}
              disabled={safePage <= 0}
              aria-label="الصفحة السابقة"
              className="hidden sm:flex absolute right-0 top-12 bottom-12 w-10 z-20 items-center justify-center opacity-40 hover:opacity-100 disabled:opacity-0 transition-opacity cursor-pointer"
            >
              <span className="w-8 h-8 rounded-full bg-stone-900/8 dark:bg-white/10 flex items-center justify-center text-[#1D1B18] dark:text-[#EFE9DC]">
                <ChevronRight className="w-5 h-5" />
              </span>
            </button>

            <AnimatePresence mode="wait" initial={false}>
              <motion.article
                key={currentThikr.id}
                initial={{
                  opacity: 0,
                  rotateY: flipDirection === 'next' ? 14 : -14,
                  x: flipDirection === 'next' ? -24 : 24,
                }}
                animate={{
                  opacity: 1,
                  rotateY: 0,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  rotateY: flipDirection === 'next' ? -14 : 14,
                  x: flipDirection === 'next' ? 24 : -24,
                }}
                transition={{
                  duration: 0.28,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{ transformStyle: 'preserve-3d' }}
                className={`relative rounded-2xl border ${paperStyle.containerClass} ${paperStyle.textClass} book-page-shadow-light overflow-hidden`}
              >
                <CornerArabesque position="tr" />
                <CornerArabesque position="tl" />
                <CornerArabesque position="br" />
                <CornerArabesque position="bl" />

                {/* Subtle inner Mushaf-inspired frame line */}
                <div className="m-2 sm:m-3 rounded-xl border border-[#9A7837]/20 dark:border-[#D0B070]/15 p-4 sm:p-8">
                  {/* Page Header */}
                  <div className="flex items-start justify-between gap-3 pb-4 border-b border-stone-200/70 dark:border-stone-800/70">
                    <div className="space-y-1">
                      <div className={`text-xs ${paperStyle.mutedClass} tabular-nums`}>
                        {category === 'morning' ? 'أذكار الصباح' : 'أذكار المساء'} · الذكر {toArabicNumerals(safePage + 1)} من {toArabicNumerals(items.length)}
                      </div>
                      <h2 className="font-amiri text-xl sm:text-2xl font-bold">
                        {currentThikr.title}
                      </h2>
                    </div>

                    {/* Per-Page Action Buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => onToggleFavorite(currentThikr.id)}
                        aria-label={isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                        title={isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                        className={`min-h-[42px] min-w-[42px] inline-flex items-center justify-center rounded-xl transition-colors cursor-pointer ${
                          isFavorite
                            ? 'text-rose-600 dark:text-rose-400 bg-rose-500/10'
                            : `${paperStyle.mutedClass} hover:bg-stone-500/10`
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopy(currentThikr)}
                        aria-label="نسخ الذكر"
                        title="نسخ الذكر"
                        className={`min-h-[42px] min-w-[42px] inline-flex items-center justify-center rounded-xl ${paperStyle.mutedClass} hover:bg-stone-500/10 transition-colors cursor-pointer`}
                      >
                        {copiedId === currentThikr.id ? (
                          <Check className="w-4 h-4 text-[#185341] dark:text-[#57B694]" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleShare(currentThikr)}
                        aria-label="مشاركة الذكر"
                        title="مشاركة الذكر"
                        className={`min-h-[42px] min-w-[42px] inline-flex items-center justify-center rounded-xl ${paperStyle.mutedClass} hover:bg-stone-500/10 transition-colors cursor-pointer`}
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Scrollable Thikr Text Body (prevents text clipping on any screen size) */}
                  <div
                    ref={scrollAreaRef}
                    className="reader-scroll max-h-[46vh] sm:max-h-[48vh] overflow-y-auto py-6 sm:py-7 px-1 sm:px-3"
                  >
                    <p
                      className={`${fontClass} ${leadingClass} whitespace-pre-line text-center sm:text-right max-w-3xl mx-auto`}
                      style={{ fontSize: `${settings.fontSize}px` }}
                    >
                      {currentThikr.text}
                    </p>
                  </div>

                  {/* Source, Virtue & Difficult Vocabulary */}
                  <EditorialDivider className="my-3" />

                  <div className="space-y-3 pt-1">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
                      <span className={`${paperStyle.mutedClass}`}>
                        <strong className="font-semibold">التكرار:</strong>{' '}
                        {formatRepeatLabel(currentThikr.repeat)}
                      </span>
                      <span className={`${paperStyle.mutedClass}`}>
                        {currentThikr.source}
                      </span>
                    </div>

                    {/* Virtue & Vocabulary Toggles */}
                    {(currentThikr.virtue || (currentThikr.vocabulary && currentThikr.vocabulary.length > 0)) && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {currentThikr.virtue && (
                          <button
                            type="button"
                            onClick={() => setExpandedVirtue((v) => !v)}
                            className="min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#9A7837]/10 dark:bg-[#D0B070]/12 text-xs font-medium text-[#7D5E23] dark:text-[#E2C585] cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{expandedVirtue ? 'إخفاء فضل الذكر' : 'فضل الذكر'}</span>
                          </button>
                        )}
                        {currentThikr.vocabulary && currentThikr.vocabulary.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setExpandedVocab((v) => !v)}
                            className="min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#185341]/10 dark:bg-[#3E8E72]/15 text-xs font-medium text-[#185341] dark:text-[#6CC4A5] cursor-pointer"
                          >
                            <BookMarked className="w-3.5 h-3.5" />
                            <span>{expandedVocab ? 'إخفاء معاني الكلمات' : 'معاني الكلمات'}</span>
                          </button>
                        )}
                      </div>
                    )}

                    {expandedVirtue && currentThikr.virtue && (
                      <div className="rounded-xl bg-[#9A7837]/8 dark:bg-[#D0B070]/8 border border-[#9A7837]/20 dark:border-[#D0B070]/20 p-3.5 text-xs sm:text-sm leading-relaxed">
                        <span className="font-semibold text-[#7D5E23] dark:text-[#E2C585]">فضل الذكر: </span>
                        <span className={paperStyle.mutedClass}>{currentThikr.virtue}</span>
                      </div>
                    )}

                    {expandedVocab && currentThikr.vocabulary && (
                      <div className="rounded-xl bg-[#185341]/6 dark:bg-[#3E8E72]/10 border border-[#185341]/15 dark:border-[#3E8E72]/20 p-3.5 space-y-1.5 text-xs sm:text-sm">
                        {currentThikr.vocabulary.map((vocab) => (
                          <div key={vocab.word} className="leading-relaxed">
                            <strong className="text-[#185341] dark:text-[#6CC4A5]">{vocab.word}: </strong>
                            <span className={paperStyle.mutedClass}>{vocab.meaning}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.article>
            </AnimatePresence>
          </div>

          {/* Smart Counter & Book Page Navigation Dock */}
          <div className="rounded-2xl border border-stone-200/90 dark:border-stone-800 bg-[#FCF9F2] dark:bg-[#15191C] p-3.5 sm:p-4 space-y-3">
            {/* Counter Row */}
            <div className="flex items-center gap-2.5">
              {/* Undo Accidental Tap */}
              <button
                type="button"
                onClick={() => onDecrementCount(currentThikr)}
                disabled={currentTapCount <= 0}
                aria-label="تراجع عن آخر ضغطة"
                title="تراجع عن آخر ضغطة"
                className="min-h-[48px] min-w-[48px] px-3 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center justify-center gap-1.5 text-xs font-medium text-[#5C5549] dark:text-[#A6A092] hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-35 transition-colors cursor-pointer disabled:cursor-default"
              >
                <Undo2 className="w-4 h-4" />
                <span className="hidden sm:inline">تراجع</span>
              </button>

              {/* Main Large Tap-to-Count Button */}
              <button
                type="button"
                onClick={() => handleCounterTap(currentThikr)}
                className={`flex-1 ${counterHeightClass} rounded-xl font-semibold transition-all active:scale-[0.99] flex items-center justify-between px-4 sm:px-6 cursor-pointer select-none ${
                  isCompleted
                    ? 'bg-[#185341]/14 dark:bg-[#3E8E72]/20 text-[#185341] dark:text-[#6CC4A5] border border-[#185341]/30 dark:border-[#3E8E72]/40'
                    : 'bg-[#185341] hover:bg-[#134234] dark:bg-[#2F7C61] dark:hover:bg-[#256650] text-white shadow-sm'
                }`}
              >
                <span className="flex items-center gap-2">
                  {isCompleted ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>أتممت هذا الذكر</span>
                    </>
                  ) : (
                    <span>اضغط للتسبيح والعد</span>
                  )}
                </span>

                <span className="flex items-center gap-2 tabular-nums">
                  <span className="text-xs opacity-85">
                    {isCompleted
                      ? `${toArabicNumerals(currentThikr.repeat)} / ${toArabicNumerals(currentThikr.repeat)}`
                      : `المتبقي ${toArabicNumerals(remainingCount)}`}
                  </span>
                  <span className="inline-flex items-center justify-center min-w-[2.4rem] h-8 px-2 rounded-lg bg-black/15 dark:bg-white/15 font-bold">
                    {toArabicNumerals(currentTapCount)}
                  </span>
                </span>
              </button>

              {/* Reset / Re-read Thikr */}
              <button
                type="button"
                onClick={() => {
                  onResetCount(currentThikr);
                  if (scrollAreaRef.current) scrollAreaRef.current.scrollTop = 0;
                }}
                aria-label="إعادة العداد وقراءة الذكر"
                title="إعادة العداد"
                className="min-h-[48px] min-w-[48px] px-3 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center justify-center gap-1.5 text-xs font-medium text-[#5C5549] dark:text-[#A6A092] hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">إعادة</span>
              </button>
            </div>

            {/* Bottom Page Turn Bar (Explicit Right=Prev / Left=Next in RTL) */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-200/70 dark:border-stone-800/70 text-xs sm:text-sm">
              <button
                type="button"
                onClick={goPrevPage}
                disabled={safePage <= 0}
                className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[#1D1B18] dark:text-[#EFE9DC] hover:bg-stone-200/60 dark:hover:bg-stone-800 disabled:opacity-35 transition-colors cursor-pointer disabled:cursor-default"
              >
                <ChevronRight className="w-4 h-4" />
                <span>الصفحة السابقة</span>
              </button>

              <button
                type="button"
                onClick={() => setShowIndexDrawer(true)}
                className="min-h-[44px] px-3 py-1.5 rounded-xl text-xs font-medium text-[#6B6356] dark:text-[#A6A092] hover:bg-stone-200/50 dark:hover:bg-stone-800 tabular-nums cursor-pointer"
              >
                صفحة {toArabicNumerals(safePage + 1)} / {toArabicNumerals(items.length)}
              </button>

              <button
                type="button"
                onClick={goNextPage}
                disabled={safePage >= items.length - 1}
                className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[#1D1B18] dark:text-[#EFE9DC] hover:bg-stone-200/60 dark:hover:bg-stone-800 disabled:opacity-35 transition-colors cursor-pointer disabled:cursor-default"
              >
                <span>الصفحة التالية</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Peaceful Completion Banner */}
          {categoryProgress.percentage === 100 && (
            <div className="rounded-2xl border border-[#185341]/30 dark:border-[#3E8E72]/35 bg-[#185341]/8 dark:bg-[#3E8E72]/12 p-5 text-center space-y-2">
              <p className="font-amiri text-xl font-bold text-[#185341] dark:text-[#6CC4A5]">
                تقبّل الله طاعتك وبارك في يومك
              </p>
              <p className="text-sm text-[#5C5549] dark:text-[#A6A092]">
                أتممت قراءة جميع {category === 'morning' ? 'أذكار الصباح' : 'أذكار المساء'} بحمد الله.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* MODE 2: CONTINUOUS READING MODE */
        <div className="space-y-5">
          {items.map((thikr, idx) => {
            const tapCount = Math.min(counts[thikr.id] ?? 0, thikr.repeat);
            const rem = Math.max(0, thikr.repeat - tapCount);
            const done = tapCount >= thikr.repeat;
            const fav = favorites.includes(thikr.id);

            return (
              <article
                key={thikr.id}
                className={`rounded-2xl border ${paperStyle.containerClass} ${paperStyle.textClass} p-5 sm:p-7 space-y-4`}
              >
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-stone-200/60 dark:border-stone-800/70">
                  <div>
                    <div className={`text-xs ${paperStyle.mutedClass} tabular-nums`}>
                      {toArabicNumerals(idx + 1)} · {formatRepeatLabel(thikr.repeat)}
                    </div>
                    <h3 className="font-amiri text-xl font-bold mt-0.5">{thikr.title}</h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onToggleFavorite(thikr.id)}
                      aria-label="المفضلة"
                      className={`min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-xl cursor-pointer ${
                        fav ? 'text-rose-600 dark:text-rose-400' : paperStyle.mutedClass
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(thikr)}
                      aria-label="نسخ"
                      className={`min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-xl cursor-pointer ${paperStyle.mutedClass}`}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShare(thikr)}
                      aria-label="مشاركة"
                      className={`min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-xl cursor-pointer ${paperStyle.mutedClass}`}
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p
                  className={`${fontClass} ${leadingClass} whitespace-pre-line`}
                  style={{ fontSize: `${settings.fontSize}px` }}
                >
                  {thikr.text}
                </p>

                {thikr.virtue && (
                  <p className={`text-xs sm:text-sm ${paperStyle.mutedClass} pt-1`}>
                    <strong className="text-[#9A7837] dark:text-[#D0B070]">الفضل: </strong>
                    {thikr.virtue}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <span className={`text-xs ${paperStyle.mutedClass}`}>{thikr.source}</span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onDecrementCount(thikr)}
                      disabled={tapCount <= 0}
                      aria-label="تراجع"
                      className="min-h-[44px] min-w-[44px] rounded-xl border border-stone-200 dark:border-stone-700 flex items-center justify-center disabled:opacity-35 cursor-pointer"
                    >
                      <Undo2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCounterTap(thikr)}
                      className={`min-h-[44px] px-5 rounded-xl text-sm font-semibold flex items-center gap-2 tabular-nums cursor-pointer ${
                        done
                          ? 'bg-[#185341]/15 dark:bg-[#3E8E72]/20 text-[#185341] dark:text-[#6CC4A5]'
                          : 'bg-[#185341] dark:bg-[#2F7C61] text-white'
                      }`}
                    >
                      {done ? <Check className="w-4 h-4" /> : null}
                      <span>
                        {done ? 'مكتمل' : `العد (${toArabicNumerals(rem)} متبقي)`}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onResetCount(thikr)}
                      aria-label="إعادة العداد"
                      className="min-h-[44px] min-w-[44px] rounded-xl border border-stone-200 dark:border-stone-700 flex items-center justify-center cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Index & Direct Page Jump Modal/Drawer */}
      {showIndexDrawer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4" role="dialog" aria-modal="true">
          <div className="w-full sm:max-w-lg max-h-[85vh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-[#FCF9F2] dark:bg-[#15191C] border border-stone-200 dark:border-stone-800 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 dark:border-stone-800">
              <div>
                <h3 className="font-amiri text-xl font-bold text-[#1D1B18] dark:text-[#EFE9DC]">
                  فهرس {category === 'morning' ? 'أذكار الصباح' : 'أذكار المساء'}
                </h3>
                <p className="text-xs text-[#6B6356] dark:text-[#A6A092]">
                  اختر الذكر أو مرّر للانتقال المباشر إلى أي صفحة
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowIndexDrawer(false)}
                aria-label="إغلاق الفهرس"
                className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-[#5C5549] dark:text-[#A6A092] hover:bg-stone-200/50 dark:hover:bg-stone-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Direct Page Slider */}
            <div className="px-5 py-3 bg-stone-100/70 dark:bg-stone-900/50 border-b border-stone-200 dark:border-stone-800 flex items-center gap-3">
              <span className="text-xs text-[#5C5549] dark:text-[#A6A092] whitespace-nowrap">
                انتقال سريع:
              </span>
              <input
                type="range"
                min={0}
                max={items.length - 1}
                value={safePage}
                onChange={(e) => {
                  const target = Number(e.target.value);
                  setFlipDirection(target > safePage ? 'next' : 'prev');
                  onChangePage(target);
                }}
                className="flex-1 accent-[#185341]"
                aria-label="شريط الانتقال المباشر للصفحة"
              />
              <span className="text-xs font-semibold tabular-nums text-[#185341] dark:text-[#57B694] min-w-[3.5rem] text-left">
                {toArabicNumerals(safePage + 1)} / {toArabicNumerals(items.length)}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-stone-200/70 dark:divide-stone-800/70 px-2">
              {items.map((item, idx) => {
                const count = counts[item.id] ?? 0;
                const done = count >= item.repeat;
                const active = idx === safePage;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setFlipDirection(idx >= safePage ? 'next' : 'prev');
                      onChangePage(idx);
                      onUpdateSettings({ readingMode: 'book' });
                      setShowIndexDrawer(false);
                    }}
                    className={`w-full min-h-[56px] px-3 py-3 flex items-center justify-between gap-3 text-right rounded-xl transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#185341]/10 dark:bg-[#3E8E72]/15 text-[#185341] dark:text-[#6CC4A5]'
                        : 'hover:bg-stone-200/40 dark:hover:bg-stone-800/40 text-[#1D1B18] dark:text-[#EFE9DC]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-7 h-7 rounded-lg bg-stone-200/70 dark:bg-stone-800 flex items-center justify-center text-xs font-semibold tabular-nums shrink-0">
                        {toArabicNumerals(idx + 1)}
                      </span>
                      <div className="truncate">
                        <div className="text-sm font-semibold truncate">{item.title}</div>
                        <div className="text-xs text-[#6B6356] dark:text-[#A6A092]">
                          {formatRepeatLabel(item.repeat)}
                        </div>
                      </div>
                    </div>

                    {done ? (
                      <Check className="w-4 h-4 text-[#185341] dark:text-[#57B694] shrink-0" />
                    ) : (
                      <span className="text-xs text-[#6B6356] dark:text-[#A6A092] tabular-nums shrink-0">
                        {toArabicNumerals(count)}/{toArabicNumerals(item.repeat)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Reading Customization Drawer */}
      {showCustomizeDrawer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4" role="dialog" aria-modal="true">
          <div className="w-full sm:max-w-lg max-h-[88vh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-[#FCF9F2] dark:bg-[#15191C] border border-stone-200 dark:border-stone-800 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 dark:border-stone-800">
              <h3 className="font-amiri text-xl font-bold text-[#1D1B18] dark:text-[#EFE9DC]">
                أدوات القراءة والخط
              </h3>
              <button
                type="button"
                onClick={() => setShowCustomizeDrawer(false)}
                aria-label="إغلاق"
                className="min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-[#5C5549] dark:text-[#A6A092] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-6">
              {/* Font Size */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span>حجم الخط</span>
                  <span className="tabular-nums text-[#185341] dark:text-[#57B694]">
                    {toArabicNumerals(settings.fontSize)} px
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ fontSize: Math.max(18, settings.fontSize - 2) })}
                    className="min-h-[44px] min-w-[44px] rounded-xl border border-stone-200 dark:border-stone-700 font-bold cursor-pointer"
                  >
                    أ-
                  </button>
                  <input
                    type="range"
                    min={18}
                    max={36}
                    step={1}
                    value={settings.fontSize}
                    onChange={(e) => onUpdateSettings({ fontSize: Number(e.target.value) })}
                    className="flex-1 accent-[#185341]"
                  />
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ fontSize: Math.min(36, settings.fontSize + 2) })}
                    className="min-h-[44px] min-w-[44px] rounded-xl border border-stone-200 dark:border-stone-700 font-bold cursor-pointer"
                  >
                    أ+
                  </button>
                </div>
              </div>

              {/* Font Family */}
              <div className="space-y-2">
                <span className="text-sm font-medium block">نوع الخط العربي</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'amiri', label: 'أميري (مصحفي)' },
                      { id: 'scheherazade', label: 'شهرزاد (نسخ)' },
                      { id: 'naskh', label: 'نوتو نسخ' },
                      { id: 'cairo', label: 'القاهرة' },
                      { id: 'tajawal', label: 'تجول' },
                    ] as { id: FontChoice; label: string }[]
                  ).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => onUpdateSettings({ fontFamily: f.id })}
                      className={`min-h-[44px] px-3 py-2 rounded-xl border text-sm transition-colors cursor-pointer ${
                        FONT_CLASS_MAP[f.id]
                      } ${
                        settings.fontFamily === f.id
                          ? 'border-[#185341] bg-[#185341]/10 text-[#185341] dark:border-[#57B694] dark:bg-[#3E8E72]/20 dark:text-[#6CC4A5] font-bold'
                          : 'border-stone-200 dark:border-stone-700 text-[#1D1B18] dark:text-[#EFE9DC]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
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

              {/* Paper Background Color */}
              <div className="space-y-2">
                <span className="text-sm font-medium block">لون خلفية صفحات القراءة</span>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(PAPER_THEME_STYLES) as PaperTheme[]).map((key) => {
                    const item = PAPER_THEME_STYLES[key];
                    const selected = settings.paperTheme === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          const targetIsDark = key === 'obsidian' || key === 'midnight';
                          onUpdateSettings({
                            paperTheme: key,
                            themeMode: targetIsDark ? 'night' : 'day',
                          });
                        }}
                        className={`min-h-[44px] flex items-center gap-2 px-2.5 py-2 rounded-xl border text-xs font-medium cursor-pointer ${
                          selected
                            ? 'border-[#185341] dark:border-[#57B694] ring-1 ring-[#185341]/40'
                            : 'border-stone-200 dark:border-stone-700'
                        }`}
                      >
                        <span
                          className="w-5 h-5 rounded-full border border-stone-300 shrink-0"
                          style={{ backgroundColor: item.swatch }}
                        />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Counter Size */}
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
