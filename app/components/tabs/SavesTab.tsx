"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useGameStore } from '@/lib/state/gameStore';

type SaveMetadata = {
  timestamp: number;
  partyLevel: number;
  campaignProgress: number;
  lastLocation: string;
  playTime: number;
  thumbnail?: string;
  autoSave?: boolean;
};

type SavesResponse = {
  slots: Array<{
    id: number;
    name: string;
    isEmpty: boolean;
    metadata?: SaveMetadata;
  }>;
};

export default function SavesTab() {
  const router = useRouter();
  const importState = useGameStore((s) => s.importState);
  const [data, setData] = useState<SavesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/saves?includeThumbnails=true', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch saves');
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch saves');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleLoad = async (slotId: number) => {
    try {
      const res = await fetch(`/api/saves/${slotId}`);
      if (!res.ok) throw new Error('Failed to load save');
      const json = await res.json();
      if (json.success) {
        importState(json.save.gameState);
        // Navigate back to main game view
        router.push('/');
      } else {
        throw new Error(json.error || 'Load failed');
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to load save');
    }
  };

  const handleDelete = async (slotId: number) => {
    if (!confirm('Diesen Spielstand wirklich löschen?')) return;
    try {
      const res = await fetch(`/api/saves/${slotId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete save');
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to delete save');
    }
  };

  if (loading) {
    return <div className="text-sm text-amber-700">Lade Spielstände…</div>;
  }

  if (error) {
    return (
      <div className="text-sm text-red-600">
        Fehler beim Laden: {error}
        <button onClick={load} className="btn ml-2">Erneut versuchen</button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scroll-fantasy">
      <div className="grid grid-cols-1 gap-3">
        {data.slots.map((slot) => (
          <div key={slot.id} className="p-3 rounded-lg border bg-white/70 border-amber-200">
            {slot.isEmpty ? (
              <div className="flex items-center justify-between text-amber-600">
                <div className="font-medium">{slot.name}</div>
                <div className="text-xs">Leer</div>
              </div>
            ) : (
              <div className="flex gap-3">
                <div className="w-28 h-16 bg-amber-100 rounded overflow-hidden flex items-center justify-center">
                  {slot.metadata?.thumbnail ? (
                    <Image src={slot.metadata.thumbnail} alt="Thumbnail" width={112} height={64} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-amber-600 text-xs">Kein Bild</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-amber-900 truncate">{slot.name}</div>
                    <div className="text-xs text-amber-600">{new Date(slot.metadata!.timestamp).toLocaleString()}</div>
                  </div>
                  <div className="text-xs text-amber-700 flex gap-3 mt-1">
                    <span>Lvl {slot.metadata!.partyLevel}</span>
                    <span>Fortschritt {slot.metadata!.campaignProgress}%</span>
                    <span className="truncate">Ort: {slot.metadata!.lastLocation}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => handleLoad(slot.id)} className="btn">Laden</button>
                    <button onClick={() => handleDelete(slot.id)} className="btn-secondary">Löschen</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
  <div className="text-xs text-amber-600">Weitere Optionen (Export/Import) findest du auf der Seite &quot;Saves&quot;.</div>
    </div>
  );
}
