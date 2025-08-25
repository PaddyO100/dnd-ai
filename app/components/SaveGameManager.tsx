'use client';

import { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '@/lib/state/gameStore';
import { databaseManager } from '@/lib/db/database';
import type { SavedGame } from '@/lib/db/database';

export default function SaveGameManager() {
  const [saves, setSaves] = useState<SavedGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const gameStore = useGameStore();

  const loadSaves = useCallback(async () => {
    setLoading(true);
    try {
      const allSaves = await databaseManager.getAllSaves();
      setSaves(allSaves);
    } catch (error) {
      console.error('Fehler beim Laden der Spielstände:', error);
      setSaves([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSaves();
  }, [loadSaves]);

  const handleSave = async () => {
    if (!saveName.trim()) return;

    try {
      await gameStore.saveGameManual(saveName);
      setSaveDialogOpen(false);
      setSaveName('');
      loadSaves();
      console.log(`✅ Spiel gespeichert: ${saveName}`);
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
    }
  };

  const handleLoad = async (saveId: number) => {
    if (!saveId) return;
    
    try {
      const gameState = await databaseManager.loadGame(saveId);
      gameStore.importState({ 
        ...gameState, 
        step: 'inGame' as const 
      });
      console.log(`✅ Spielstand geladen (ID: ${saveId})`);
    } catch (error) {
      console.error('Fehler beim Laden:', error);
    }
  };

  const handleDelete = async (saveId: number) => {
    if (!saveId) return;
    
    const confirmDelete = confirm('Spielstand wirklich löschen?');
    if (!confirmDelete) return;

    try {
      await databaseManager.deleteSave(saveId);
      await loadSaves();
      console.log('✅ Spielstand gelöscht');
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
    }
  };

  const formatDate = (timestamp: Date) => {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };

  if (loading) {
    return (
      <div className="card-fantasy p-6">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Lade Spielstände...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-amber-900 dark:text-amber-100">
          Spielstände verwalten
        </h2>
        <button 
          onClick={() => setSaveDialogOpen(true)}
          className="btn flex items-center gap-2"
          disabled={gameStore.party.length === 0}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Neuer Spielstand
        </button>
      </div>

      <div className="card-fantasy p-4">
        {saves.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>Keine Spielstände gefunden</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {saves.map((save) => (
              <div key={save.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">{save.name}</h3>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{formatDate(save.timestamp)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => save.id && handleLoad(save.id)} className="btn-secondary text-sm px-3 py-1">Laden</button>
                    <button onClick={() => save.id && handleDelete(save.id)} className="btn-warning text-sm px-3 py-1">Löschen</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {saveDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Spiel speichern</h3>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              className="input w-full mb-4"
              placeholder="Name des Spielstands..."
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setSaveDialogOpen(false)} className="btn-secondary">Abbrechen</button>
              <button onClick={handleSave} disabled={!saveName.trim()} className="btn">Speichern</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}