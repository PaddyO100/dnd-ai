// Clear Cache Button - Implements the new database-based no-persistence system
'use client';

import { useGameStore } from '@/lib/state/gameStore';

interface ClearCacheButtonProps {
  className?: string;
}

export default function ClearCacheButton({ className = '' }: ClearCacheButtonProps) {
  const gameStore = useGameStore();

  const handleClearCache = async () => {
    const confirmed = confirm(
      '🔄 Game-Cache komplett zurücksetzen?\n\n' +
      'Dies löst folgende Probleme:\n' +
      '• Falsche Charakteranzeige (Liora → Lena)\n' +
      '• Leere Inventar-Slots\n' +
      '• Veraltete Spielstände\n\n' +
      'Das Game startet dann immer frisch im Hauptmenü.\n' +
      'Gespeicherte Spielstände bleiben erhalten.\n\n' +
      'Fortfahren?'
    );

    if (!confirmed) return;

    try {
      // Reset game store to initial state
      gameStore.reset();
      
      // Clear localStorage completely
      if (typeof window !== 'undefined') {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.includes('dnd-ai') || key.includes('aethel') || key.includes('game')) {
            localStorage.removeItem(key);
          }
        });
      }
      
      console.log('🧹 Cache komplett zurückgesetzt');
      alert('✅ Cache wurde zurückgesetzt!\n\nDie Seite wird neu geladen...');
      
      // Force page reload to ensure clean state
      window.location.reload();
      
    } catch (error) {
      console.error('❌ Fehler beim Cache-Reset:', error);
      alert('❌ Fehler beim Cache-Reset. Bitte lade die Seite manuell neu.');
    }
  };

  return (
    <button
      onClick={handleClearCache}
      className={`btn-warning flex items-center gap-2 ${className}`}
      title="Löst Anzeige-Probleme und startet immer frisch im Hauptmenü"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      System Zurücksetzen
    </button>
  );
}
