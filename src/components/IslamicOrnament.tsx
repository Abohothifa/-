import React from 'react';

export const AppEmblem: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
    <rect
      x="14"
      y="14"
      width="36"
      height="36"
      rx="4"
      stroke="currentColor"
      strokeWidth="2.2"
      className="text-[#9A7837] dark:text-[#D0B070]"
    />
    <rect
      x="14"
      y="14"
      width="36"
      height="36"
      rx="4"
      transform="rotate(45 32 32)"
      stroke="currentColor"
      strokeWidth="2.2"
      className="text-[#185341] dark:text-[#4BA485]"
    />
    <circle
      cx="32"
      cy="32"
      r="12"
      fill="currentColor"
      fillOpacity="0.08"
      stroke="currentColor"
      strokeWidth="1.6"
      className="text-[#9A7837] dark:text-[#D0B070]"
    />
    <path
      d="M24.5 35.5C27.2 33.8 29.8 33.8 32 35.5C34.2 33.8 36.8 33.8 39.5 35.5V27.2C36.8 25.5 34.2 25.5 32 27.2C29.8 25.5 27.2 25.5 24.5 27.2V35.5Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
      className="text-[#185341] dark:text-[#EFE9DC]"
    />
    <line
      x1="32"
      y1="27.2"
      x2="32"
      y2="35.5"
      stroke="currentColor"
      strokeWidth="1.6"
      className="text-[#185341] dark:text-[#EFE9DC]"
    />
  </svg>
);

export const CornerArabesque: React.FC<{ position: 'tr' | 'tl' | 'br' | 'bl' }> = ({ position }) => {
  const rotationMap = {
    tr: 'rotate(0)',
    tl: 'scale(-1, 1)',
    br: 'scale(1, -1)',
    bl: 'scale(-1, -1)',
  };

  const posClassMap = {
    tr: 'top-2.5 right-2.5',
    tl: 'top-2.5 left-2.5',
    br: 'bottom-2.5 right-2.5',
    bl: 'bottom-2.5 left-2.5',
  };

  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={`pointer-events-none absolute w-7 h-7 sm:w-8 sm:h-8 text-[#9A7837]/45 dark:text-[#D0B070]/35 ${posClassMap[position]}`}
      style={{ transform: rotationMap[position] }}
      aria-hidden="true"
    >
      <path d="M36 4H12C7.58 4 4 7.58 4 12V36" stroke="currentColor" strokeWidth="1.4" />
      <path d="M32 9H15C11.69 9 9 11.69 9 15V32" stroke="currentColor" strokeWidth="0.9" strokeOpacity="0.7" />
      <circle cx="9.5" cy="9.5" r="2" fill="currentColor" fillOpacity="0.65" />
    </svg>
  );
};

export const EditorialDivider: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden="true">
    <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[#9A7837]/35 to-[#9A7837]/10 dark:via-[#D0B070]/30 dark:to-transparent" />
    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-[#9A7837] dark:text-[#D0B070]">
      <rect x="6" y="6" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="6" y="6" width="12" height="12" rx="1.5" transform="rotate(45 12 12)" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
    <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#9A7837]/35 to-[#9A7837]/10 dark:via-[#D0B070]/30 dark:to-transparent" />
  </div>
);
