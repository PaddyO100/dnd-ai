'use client';

import { useEffect } from 'react';
import { useGameStore } from '../lib/state/gameStore';

export default function AutoSaveProvider({ children }: { children: React.ReactNode }) {
  const { saveGameManual, step, party, settings } = useGameStore();

  useEffect(() => {
    if (!settings.autosaveInterval || step !== 'inGame') return;

    const interval = setInterval(async () => {
      try {
        if (party.length > 0) {
          await saveGameManual('Auto-Save');
          console.log('🔄 Auto-save completed');
        }
      } catch (error) {
        console.error('❌ Auto-save failed:', error);
      }
    }, settings.autosaveInterval * 60 * 1000); // Convert minutes to ms

    return () => clearInterval(interval);
  }, [settings.autosaveInterval, step, party.length, saveGameManual]);

  return <>{children}</>;
}
