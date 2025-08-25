'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '../../lib/state/gameStore';
import type { SaveMetadata } from '../../lib/saves/saveMetadata';
import { DatabaseManager, type SavedGame } from '../../lib/db/database';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: string, slotId: string) => Promise<void>;
}

function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [importData, setImportData] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('1');
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async () => {
    if (!importData.trim()) return;
    
    setIsImporting(true);
    try {
      await onImport(importData, selectedSlot);
      setImportData('');
      onClose();
    } catch (error) {
      console.error('Import failed:', error);
      alert('Import failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Spielstand importieren</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Spielstand-Daten (JSON)
              </label>
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Fügen Sie hier den JSON-Export ein..."
                className="w-full h-32 p-2 border rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Ziel-Slot
              </label>
              <select 
                value={selectedSlot} 
                onChange={(e) => setSelectedSlot(e.target.value)}
                className="w-full p-2 border rounded"
              >
                {[1, 2, 3, 4, 5].map(slot => (
                  <option key={slot} value={slot.toString()}>
                    Slot {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex gap-2 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
            >
              Abbrechen
            </button>
            <button
              onClick={handleImport}
              disabled={!importData.trim() || isImporting}
              className="flex-1 px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded disabled:bg-gray-300"
            >
              {isImporting ? 'Importiere...' : 'Importieren'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SavesPage() {
  const router = useRouter();
  const { saveGameManual } = useGameStore();
  const [saves, setSaves] = useState<SaveMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [deletingSlot, setDeletingSlot] = useState<string | null>(null);

  const loadSaves = useCallback(async () => {
    setLoading(true);
    try {
      const dbManager = new DatabaseManager();
      const gamesList = await dbManager.getAllSaves();
      const savesList: SaveMetadata[] = gamesList.map((game: SavedGame) => ({
        id: game.id?.toString() || '0',
        timestamp: game.timestamp.getTime(),
        campaignName: game.name,
        playerNames: [], // Extract from gameState if needed
        currentLocation: game.lastLocation,
        playTime: 0, // Extract from gameState if needed
        version: game.version,
        gameState: 'active' as const
      }));
      setSaves(savesList);
    } catch (error) {
      console.error('Failed to load saves:', error);
      setSaves([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSaves();
  }, [loadSaves]);

  const handleLoadGame = useCallback(async (slotId: string) => {
    try {
      const dbManager = new DatabaseManager();
      const gameState = await dbManager.loadGame(parseInt(slotId));
      if (gameState) {
        // Use zustand's setState to load the game
        const gameStore = useGameStore.getState();
        Object.assign(gameStore, gameState);
        router.push('/');
      }
    } catch (error) {
      console.error('Failed to load game:', error);
      alert('Fehler beim Laden des Spielstands: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler'));
    }
  }, [router]);

  const handleDeleteSave = useCallback(async (slotId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Spielstand löschen möchten?')) {
      return;
    }

    setDeletingSlot(slotId);
    try {
      const dbManager = new DatabaseManager();
      await dbManager.deleteSave(parseInt(slotId));
      await loadSaves(); // Reload the list
    } catch (error) {
      console.error('Failed to delete save:', error);
      alert('Fehler beim Löschen des Spielstands: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler'));
    } finally {
      setDeletingSlot(null);
    }
  }, [loadSaves]);

  const handleExport = useCallback(async (slotId: string) => {
    try {
      const dbManager = new DatabaseManager();
      const saveData = await dbManager.loadGame(parseInt(slotId));
      
      const exportData = JSON.stringify(saveData, null, 2);
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `aethels-forge-save-${slotId}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export save:', error);
      alert('Fehler beim Exportieren: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler'));
    }
  }, []);

  const handleImport = useCallback(async (data: string, slotId: string) => {
    try {
      // Validate JSON format
      JSON.parse(data) as SavedGame;
      await saveGameManual(slotId);
      await loadSaves();
    } catch (error) {
      console.error('Failed to import save:', error);
      throw new Error('Invalid JSON data or save format');
    }
  }, [loadSaves, saveGameManual]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('de-DE');
  };

  const formatPlayTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Lade Spielstände...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Spielstände</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded flex items-center gap-2"
          >
            📤 Importieren
          </button>
          <button 
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded"
          >
            Zurück zum Spiel
          </button>
        </div>
      </div>

      {saves.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-lg font-semibold mb-2">Keine Spielstände gefunden</h3>
          <p className="text-gray-600 mb-4">
            Beginnen Sie ein neues Spiel, um Ihren ersten Spielstand zu erstellen.
          </p>
          <button 
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded"
          >
            Neues Spiel starten
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {saves.map((save) => (
            <div key={save.id} className="bg-white shadow rounded-lg hover:shadow-lg transition-shadow">
              <div className="p-4 border-b">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold">
                    {save.campaignName || 'Unbekannte Kampagne'}
                  </h3>
                  <span className="px-2 py-1 bg-gray-200 rounded text-sm">
                    Slot {save.id}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <span>📅</span>
                  {formatDate(save.timestamp)}
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {save.playerNames && save.playerNames.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-1">Charaktere:</p>
                      <div className="flex flex-wrap gap-1">
                        {save.playerNames.map((name, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 rounded text-xs">
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>⏰</span>
                    {formatPlayTime(save.playTime || 0)}
                  </div>

                  {save.currentLocation && (
                    <div className="text-sm">
                      <span className="font-medium">Ort:</span> {save.currentLocation}
                    </div>
                  )}

                  <div className="flex gap-2 pt-3">
                    <button 
                      className="flex-1 px-3 py-2 bg-green-500 text-white hover:bg-green-600 rounded text-sm flex items-center justify-center gap-1"
                      onClick={() => handleLoadGame(save.id)}
                    >
                      ▶️ Laden
                    </button>
                    <button
                      className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
                      onClick={() => handleExport(save.id)}
                      title="Exportieren"
                    >
                      💾
                    </button>
                    <button
                      className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded text-sm"
                      onClick={() => handleDeleteSave(save.id)}
                      disabled={deletingSlot === save.id}
                      title="Löschen"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
      />
    </div>
  );
}
