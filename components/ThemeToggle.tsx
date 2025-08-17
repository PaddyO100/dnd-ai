'use client';

import { useCallback } from 'react';
import { useGameStore } from '@/lib/state/gameStore';

const order: Array<'light' | 'dark' | 'aethel' | 'mystic' | 'dragon'> = [
  'light', 'dark'
];

export default function ThemeToggle() {
  const theme = useGameStore((s) => s.settings.theme);
  const updateSettings = useGameStore((s) => s.updateSettings);

  const cycle = useCallback(() => {
    const idx = order.indexOf(theme as typeof order[number]);
    const next = order[(idx + 1) % order.length] || 'light';
    updateSettings({ theme: next });
  }, [theme, updateSettings]);

  const label = theme === 'dark' ? 'Dark' : 'Light';

  return (
    <button
      aria-label={`Theme: ${label}. Click to change.`}
      title={`Theme: ${label} (click to change)`}
      onClick={cycle}
      className="fixed top-3 right-3 z-50 inline-flex items-center gap-2 px-3 py-2 rounded-md shadow-md bg-white/90 text-gray-900 hover:bg-white transition-colors border border-gray-200"
    >
      <span aria-hidden>
        {theme === 'dark' ? (
          // Moon
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
        ) : (
          // Sun
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6.76 4.84l-1.8-1.79L3.17 4.84l1.79 1.79 1.8-1.79zM1 13h3v-2H1v2zm10 10h2v-3h-2v3zm9.83-17.96l-1.79-1.79-1.8 1.79 1.8 1.79 1.79-1.79zM20 11v2h3v-2h-3zm-2.76 8.16l1.8 1.79 1.79-1.79-1.79-1.79-1.8 1.79zM12 5a7 7 0 100 14 7 7 0 000-14zM3.17 19.16l1.79 1.79 1.8-1.79-1.8-1.79-1.79 1.79z"/></svg>
        )}
      </span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
