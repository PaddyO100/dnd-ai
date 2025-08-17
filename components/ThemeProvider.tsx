'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/lib/state/gameStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useGameStore(s => s.settings.theme);

  useEffect(() => {
    // Remove existing theme classes
    document.documentElement.removeAttribute('data-theme');
    
    // Set new theme
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update meta theme-color for browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const themeColors = {
        light: '#ffffff',
        dark: '#0f172a',
        aethel: '#0a0f1c',
        mystic: '#0f1a0f',
        dragon: '#1a0f0f'
      };
      metaThemeColor.setAttribute('content', themeColors[theme as keyof typeof themeColors] || themeColors.light);
    }
  }, [theme]);

  return <>{children}</>;
}
