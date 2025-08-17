'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/state/gameStore';
import type { Player, GameState } from '@/lib/state/gameStore';
import Sidepanel from './Sidepanel';
import VisualDice from './VisualDice';
import TutorialOverlay from './tutorial/TutorialOverlay';
import { useTutorialStore } from '@/lib/tutorial/tutorialState';
import { getEnhancedDirectorAdvice } from '@/lib/engine/director';

type HistoryItem = GameState['history'][number];

export default function GameView() {
  const { selections, party, history, pushHistory, applyEffects } = useGameStore();
  const { triggerEvent } = useTutorialStore();
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVisualDice, setShowVisualDice] = useState(false);

  // Initialize tutorial when GameView first loads
  useEffect(() => {
    triggerEvent('game_start');
  }, [triggerEvent]);

  // Removed image-generation polling

  async function submit(messageOverride?: string) {
    const msg = (messageOverride ?? input).trim();
    if (!msg) return;
    setError(null);

    pushHistory({ role: 'player', content: msg });
    setBusy(true);
  try {
      // Get Director AI analysis for enhanced game mastering
      const { history, party, selections } = useGameStore.getState();
      const directorAdvice = getEnhancedDirectorAdvice({ 
        history, 
        party, 
        historyCount: history.length,
        sessionStartTime: new Date()
      });

      const res = await fetch('/api/ai/next-turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
          history, 
          state: { selections, party }, 
          playerInput: msg,
          directorAdvice // Include AI Director insights for better story flow
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Fehler im DM-Schritt');
      }

  if (data.dmText) useGameStore.getState().pushHistory({ role: 'dm', content: data.dmText });
  if (data.effects) applyEffects(data.effects);
  // Ignore any vision instructions (image generation removed)
  if (!messageOverride) setInput('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unbekannter Fehler beim nächsten Zug.';
      setError(message);
    } finally {
      setBusy(false);
    }
  }

  function exportGame() {
    const blob = new Blob([JSON.stringify(useGameStore.getState(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'aethel-save.json'; a.click();
    URL.revokeObjectURL(url);
  }

  async function importGame(file: File) {
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      useGameStore.getState().importState(json);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Fehler beim Import';
      setError(message);
    }
  }

  // Image generation and vision features removed

  return (
    <div className="min-h-screen">
      <div className="container-page space-y-6 py-6">
        {/* Navigation Header */}
        <header className="card-fantasy p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-amber-900 dark:text-amber-100">{selections.scenario?.title || "Aethel's Forge"}</h1>
                <p className="text-sm text-amber-700 dark:text-amber-300">{selections.scenario?.summary}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm bg-amber-100 dark:bg-amber-900/20 dark:text-amber-200 px-3 py-1 rounded-full">
                <span className="font-semibold">Party:</span> {party.map((p: Player) => p.name).join(', ') || 'Keine Charaktere'}
              </div>
              <button
                onClick={() => window.location.href = '/settings'}
                className="btn-secondary flex items-center gap-2 text-sm px-3 py-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Einstellungen
              </button>
              <button
                onClick={() => useGameStore.getState().reset()}
                className="btn-secondary flex items-center gap-2 text-sm px-3 py-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m0 0V11a1 1 0 011-1h2a1 1 0 011 1v10m0 0h3a1 1 0 001-1V10M9 21h6" />
                </svg>
                Hauptmenü
              </button>
            </div>
          </div>
        </header>

  {/* Main Game Area */}
  <div className="grid grid-cols-1 lg:grid-cols-[1fr,480px] gap-6">
          {/* Chat/Story Panel */}
          <section className="card-fantasy p-6 h-[60vh] flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h2 className="fantasy-subtitle">Geschichte</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto scroll-fantasy space-y-3 pr-2">
              {history.map((h: HistoryItem, i: number) => (
                <div 
                  key={i} 
                  className={`${h.role === 'dm' ? 'chat-bubble-dm' : 'chat-bubble-player'} animate-fade-in`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      h.role === 'dm' ? 'bg-amber-200 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200' : 'bg-blue-200 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                    }`}>
                      {h.role === 'dm' ? 'Aethel (DM)' : 'Du'}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">{h.content}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Side Panel */}
            <Sidepanel />
        </div>

        {/* Error Display */}
        {error && (
          <div className="card bg-red-50 border-red-200 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Input Area */}
        <div className="card-fantasy p-6">
          <div className="flex gap-3">
            <input
              className="input text-base"
              placeholder="Was tust du? Beschreibe deine Aktion..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !busy && submit()}
            />
            <button 
              onClick={() => submit()} 
              disabled={busy}
              className="btn px-8 flex items-center gap-2"
            >
              {busy ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Denk...
                </>
              ) : (
                'Aktion'
              )}
            </button>
          </div>
        </div>

  {/* Action Buttons */}
  <div className="flex flex-wrap gap-3 items-center">
          <button onClick={exportGame} className="btn-secondary flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Spiel Exportieren
          </button>
          
          <label className="btn-secondary cursor-pointer flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Spiel Importieren
            <input type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files && importGame(e.target.files[0])} />
          </label>
          
          
          <button onClick={() => setShowVisualDice(true)} className="btn-secondary flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            3D Würfel
          </button>
        </div>
      </div>
      <VisualDice isOpen={showVisualDice} onClose={() => setShowVisualDice(false)} />
      <TutorialOverlay />
    </div>
  );
}
