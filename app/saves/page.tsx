'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useGameStore } from '../../lib/state/gameStore';
import type { SaveMetadata } from '../../lib/saves/saveManager';

interface SavesResponse {
  slots: Array<{
    id: number;
    name: string;
    isEmpty: boolean;
    metadata?: SaveMetadata & { thumbnail?: string };
  }>;
  statistics: {
    totalSaves: number;
    slotsUsed: number;
    totalPlayTime: number;
    lastSaveTime: number | null;
  };
  autoSave?: {
    timestamp: number;
    playTime: number;
    lastLocation: string;
  } | null;
}

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: string, slot: number) => Promise<void>;
}

function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [importData, setImportData] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(1);
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-yellow-400 mb-4">Import Save</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Save Data
            </label>
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              className="w-full h-32 p-3 bg-slate-700 border border-slate-600 rounded-lg text-white resize-none"
              placeholder="Paste your exported save data here..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Target Slot
            </label>
            <select
              value={selectedSlot}
              onChange={(e) => setSelectedSlot(Number(e.target.value))}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white"
            >
              {[1, 2, 3, 4, 5, 6].map(slot => (
                <option key={slot} value={slot}>Slot {slot}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleImport}
            disabled={!importData.trim() || isImporting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            {isImporting ? 'Importing...' : 'Import'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function SaveSlotCard({ slot, onLoad, onDelete, onExport }: {
  slot: SavesResponse['slots'][0];
  onLoad: (slotId: number) => void;
  onDelete: (slotId: number) => void;
  onExport: (slotId: number) => void;
}) {
  const formatPlayTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (slot.isEmpty) {
    return (
      <div className="bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-lg p-6 flex flex-col items-center justify-center min-h-[200px] text-gray-400">
        <div className="w-16 h-16 mb-4 opacity-50">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <span className="text-lg font-medium">{slot.name}</span>
      </div>
    );
  }

  const { metadata } = slot;
  if (!metadata) return null;

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-4 hover:border-yellow-500/50 transition-colors group">
      {/* Thumbnail */}
      <div className="aspect-video bg-slate-700 rounded-lg mb-4 overflow-hidden relative">
        {metadata.thumbnail ? (
          <Image
            src={metadata.thumbnail}
            alt={`${slot.name} thumbnail`}
            width={200}
            height={150}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-12 h-12">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {metadata.autoSave && (
          <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
            Auto
          </div>
        )}
      </div>

      {/* Save Info */}
      <div className="space-y-2">
        <h3 className="font-bold text-lg text-white truncate">{slot.name}</h3>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-400">Level:</span>
            <span className="text-white ml-2">{metadata.partyLevel}</span>
          </div>
          <div>
            <span className="text-gray-400">Progress:</span>
            <span className="text-white ml-2">{metadata.campaignProgress}%</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-400">Location:</span>
            <span className="text-white ml-2 truncate block">{metadata.lastLocation}</span>
          </div>
          <div>
            <span className="text-gray-400">Play Time:</span>
            <span className="text-white ml-2">{formatPlayTime(metadata.playTime)}</span>
          </div>
          <div>
            <span className="text-gray-400">Saved:</span>
            <span className="text-white ml-2">{formatTimestamp(metadata.timestamp)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onLoad(slot.id)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
        >
          Load
        </button>
        <button
          onClick={() => onExport(slot.id)}
          className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
          title="Export Save"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(slot.id)}
          className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
          title="Delete Save"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function SavesPage() {
  const router = useRouter();
  const importState = useGameStore(state => state.importState);
  
  const [saves, setSaves] = useState<SavesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  const loadSaves = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/saves?includeThumbnails=true');
      if (!response.ok) throw new Error('Failed to load saves');
      
      const data = await response.json();
      setSaves(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load saves');
      console.error('Error loading saves:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSaves();
  }, [loadSaves]);

  const handleLoadSave = async (slotId: number) => {
    try {
      const response = await fetch(`/api/saves/${slotId}`);
      if (!response.ok) throw new Error('Failed to load save');
      
      const data = await response.json();
      
      if (data.success) {
        importState(data.save.gameState);
        router.push('/');
      } else {
        throw new Error(data.error || 'Failed to load save');
      }
    } catch (err) {
      console.error('Error loading save:', err);
      alert('Failed to load save: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleDeleteSave = async (slotId: number) => {
    if (!confirm('Are you sure you want to delete this save? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/saves/${slotId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete save');
      
      await loadSaves(); // Reload saves
    } catch (err) {
      console.error('Error deleting save:', err);
      alert('Failed to delete save: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleExportSave = async (slotId: number) => {
    try {
      const response = await fetch(`/api/saves/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotNumber: slotId })
      });
      
      if (!response.ok) throw new Error('Failed to export save');
      
      const data = await response.json();
      
      if (data.success) {
        // Copy to clipboard
        await navigator.clipboard.writeText(data.exportData);
        
        // Also trigger download
        const blob = new Blob([data.exportData], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('Save exported successfully! Data copied to clipboard and downloaded.');
      } else {
        throw new Error(data.error || 'Export failed');
      }
    } catch (err) {
      console.error('Error exporting save:', err);
      alert('Failed to export save: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const handleImportSave = async (importData: string, targetSlot: number) => {
    // If target slot is not empty, confirm overwrite
    const slot = saves?.slots.find(s => s.id === targetSlot);
    if (slot && !slot.isEmpty) {
      const ok = confirm(`Slot ${targetSlot} ist bereits belegt. Überschreiben?`);
      if (!ok) return;
    }
    const response = await fetch(`/api/saves/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ encodedSave: importData, targetSlot })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Import failed');
    }
    
    await loadSaves(); // Reload saves
  };

  const formatPlayTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading saves...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error loading saves</div>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => loadSaves()}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-4xl font-bold text-yellow-400">Campaign Saves</h1>
          </div>
          
          <button
            onClick={() => setShowImportModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Import Save
          </button>
        </div>

        {/* Auto-save quick access */}
        {saves?.autoSave && (
          <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div className="text-green-200 text-sm">
              <div className="font-semibold">Auto-Save verfügbar</div>
              <div className="opacity-80">{new Date(saves.autoSave.timestamp).toLocaleString()} · Ort: {saves.autoSave.lastLocation}</div>
            </div>
            <button
              onClick={async () => {
                try {
                  const res = await fetch('/api/saves/autosave');
                  if (!res.ok) throw new Error('Kein Auto-Save gefunden');
                  const json = await res.json();
                  if (json.success) {
                    importState(json.save.gameState);
                    router.push('/');
                  }
                } catch (e) {
                  alert(e instanceof Error ? e.message : 'Auto-Save konnte nicht geladen werden');
                }
              }}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg"
            >
              Auto-Save laden
            </button>
          </div>
        )}

        {/* Statistics */}
        {saves?.statistics && (
          <div className="bg-slate-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{saves.statistics.slotsUsed}/6</div>
                <div className="text-gray-400">Slots Used</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{saves.statistics.totalSaves}</div>
                <div className="text-gray-400">Total Saves</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {formatPlayTime(saves.statistics.totalPlayTime)}
                </div>
                <div className="text-gray-400">Total Play Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {saves.statistics.lastSaveTime 
                    ? new Date(saves.statistics.lastSaveTime).toLocaleDateString()
                    : 'Never'
                  }
                </div>
                <div className="text-gray-400">Last Save</div>
              </div>
            </div>
          </div>
        )}

        {/* Auto-save info */}
        {saves?.autoSave && (
          <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6 text-green-400">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-medium text-green-300">Auto-save Available</h3>
                <p className="text-sm text-gray-300">
                  Last auto-saved {formatPlayTime(saves.autoSave.playTime)} at {saves.autoSave.lastLocation}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Save Slots */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {saves?.slots.map((slot) => (
            <SaveSlotCard
              key={slot.id}
              slot={slot}
              onLoad={handleLoadSave}
              onDelete={handleDeleteSave}
              onExport={handleExportSave}
            />
          ))}
        </div>
      </div>

      {/* Import Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportSave}
      />
    </div>
  );
}