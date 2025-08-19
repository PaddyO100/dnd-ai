'use client';

import { useState, useEffect } from 'react';
import { saveManager } from '@/lib/saves/saveManager';
import { audioManager } from '@/lib/audio/audioManager';
import type { SaveMetadata } from '@/lib/saves/saveManager';

interface SaveGameManagerProps {
  onClose: () => void;
  onLoadGame: (saveId: string) => void;
}

export default function SaveGameManager({ onClose, onLoadGame }: SaveGameManagerProps) {
  const [savedGames, setSavedGames] = useState<SaveMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSave, setSelectedSave] = useState<SaveMetadata | null>(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newName, setNewName] = useState('');

  // Load available save games
  useEffect(() => {
    loadSaves();
  }, []);

  const loadSaves = async () => {
    try {
      setLoading(true);
      const saves = await saveManager.getAllSaves();
      setSavedGames(saves);
    } catch (error) {
      console.error('Failed to load saved games:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSave = async (saveId: string) => {
    try {
      if (!confirm('Sind Sie sicher, dass Sie diesen Spielstand löschen möchten?')) {
        return;
      }

      audioManager.playUISound('button');
      
      // Extract slot number from save ID
      const slotMatch = saveId.match(/slot_(\d+)$/);
      if (!slotMatch) throw new Error('Invalid save ID format');
      
      const slotNumber = parseInt(slotMatch[1]);
      await saveManager.deleteSave(slotNumber);
      
      // Refresh save list
      await loadSaves();
      
      audioManager.playUISound('notification');
    } catch (error) {
      console.error('Failed to delete save:', error);
      audioManager.playUISound('error');
    }
  };

  const handleRenameSave = async () => {
    if (!selectedSave || !newName.trim()) return;

    try {
      audioManager.playUISound('button');
      
      // Extract slot number
      const slotMatch = selectedSave.id.match(/slot_(\d+)$/);
      if (!slotMatch) throw new Error('Invalid save ID format');
      
      const slotNumber = parseInt(slotMatch[1]);
      
      // Load the save, update name, and save again
      const savedGame = await saveManager.loadFromSlot(slotNumber);
      await saveManager.saveToSlot(savedGame.gameState, slotNumber, newName.trim(), savedGame.metadata.autoSave);
      
      // Refresh save list
      await loadSaves();
      
      setShowRenameModal(false);
      setSelectedSave(null);
      setNewName('');
      
      audioManager.playUISound('notification');
    } catch (error) {
      console.error('Failed to rename save:', error);
      audioManager.playUISound('error');
    }
  };

  const startRename = (save: SaveMetadata) => {
    setSelectedSave(save);
    setNewName(save.name);
    setShowRenameModal(true);
  };

  const formatPlayTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes} min`;
    } else {
      return '< 1 min';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-[min(95vw,1280px)] max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Spielstand-Verwaltung</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {savedGames.length} Spielstände gefunden
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={loadSaves}
                className="btn-secondary flex items-center gap-2"
                disabled={loading}
              >
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Aktualisieren
              </button>
              <button
                onClick={onClose}
                className="btn-secondary"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Lade Spielstände...</p>
            </div>
          ) : savedGames.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Keine Spielstände gefunden</h3>
              <p className="text-gray-600 dark:text-gray-400">Beginne ein neues Spiel, um deinen ersten Spielstand zu erstellen.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedGames.map((save) => (
                <div key={save.id} className="card bg-white dark:bg-gray-800 p-6 relative group hover:shadow-lg transition-shadow">
                  {/* Save Info */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg truncate pr-2">
                        {save.name}
                      </h3>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startRename(save)}
                          className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                          title="Umbenennen"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteSave(save.id)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          title="Löschen"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <span>
                        {new Date(save.timestamp).toLocaleDateString('de-DE', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {save.autoSave && (
                        <span className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded">
                          Auto-Save
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Game Details */}
                  <div className="space-y-3 mb-6 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Ort:</span>
                      <span className="text-gray-900 dark:text-white font-medium truncate ml-2">
                        {save.lastLocation}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Gruppe Level:</span>
                      <span className="text-gray-900 dark:text-white font-medium">{save.partyLevel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Fortschritt:</span>
                      <span className="text-gray-900 dark:text-white font-medium">{save.campaignProgress}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Spielzeit:</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {formatPlayTime(save.playTime)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${save.campaignProgress}%` }}
                      />
                    </div>
                  </div>

                  {/* Load Button */}
                  <button
                    onClick={() => onLoadGame(save.id)}
                    className="btn w-full"
                  >
                    Spielstand laden
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rename Modal */}
      {showRenameModal && selectedSave && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Spielstand umbenennen
            </h3>
            
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="input w-full mb-4"
              placeholder="Neuer Name..."
              onKeyDown={(e) => e.key === 'Enter' && handleRenameSave()}
            />
            
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowRenameModal(false);
                  setSelectedSave(null);
                  setNewName('');
                }}
                className="btn-secondary"
              >
                Abbrechen
              </button>
              <button
                onClick={handleRenameSave}
                disabled={!newName.trim()}
                className="btn"
              >
                Umbenennen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
