
'use client';
import Image from 'next/image';

import { useState, useEffect } from 'react';
import { useGameStore, type GameState, type Player } from '@/lib/state/gameStore';
import { type CharacterClass } from '@/schemas/character';
import Sidepanel from './Sidepanel';
import VisualDice from './VisualDice';
import DiceResultsDisplay from './DiceResultsDisplay';
import TutorialOverlay from './tutorial/TutorialOverlay';
import { AudioControls } from './AudioControls';
import { useTutorialStore } from '@/lib/tutorial/tutorialState';
import { getEnhancedDirectorAdvice } from '@/lib/engine/director';
import { getClassDisplayName } from '@/lib/character/portraitSystem';
import { audioManager } from '@/lib/audio/audioManager';
import toast from 'react-hot-toast';

type HistoryItem = GameState['history'][number];

interface DiceResult {
  formula: string;
  rolls: number[];
  modifier: number;
  total: number;
  description?: string;
}

export default function GameView() {
  const selections = useGameStore(state => state.selections);
  const party = useGameStore(state => state.party);
  const history = useGameStore(state => state.history);
  const pushHistory = useGameStore(state => state.pushHistory);
  const applyEffects = useGameStore(state => state.applyEffects);
  const { triggerEvent } = useTutorialStore();
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [showVisualDice, setShowVisualDice] = useState(false);
  const [isSidepanelOpen, setSidepanelOpen] = useState(true);
  const [lastDiceResults, setLastDiceResults] = useState<DiceResult[]>([]);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveName, setSaveName] = useState('');

  // Initialize tutorial and audio when GameView first loads
  useEffect(() => {
    triggerEvent('game_start');
    
    // Start ambient music for the game
    const initAudio = async () => {
      // Detect current scene from game context
      const { history, selections } = useGameStore.getState();
      const gameContext = {
        scenario: selections.scenario,
        // Prefer scenario title + summary for initial music
        location: [selections.scenario?.title, selections.scenario?.summary, history.slice(-3).map(h => h.content).join(' ')].filter(Boolean).join(' '),
        inCombat: false, // improved detection happens on DM responses
        history
      };
      
      const scene = audioManager.detectSceneFromContext(gameContext);
      await audioManager.changeScene(scene);
    };
    
    // Small delay to let components mount
    setTimeout(initAudio, 1000);
  }, [triggerEvent]);

  // Removed image-generation polling

  async function submit(messageOverride?: string) {
    const msg = (messageOverride ?? input).trim();
    if (!msg) return;

    // Play UI sound feedback
    audioManager.playUISound('button');

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

      // Play notification sound when DM responds
      if (data.dmText) {
        useGameStore.getState().pushHistory({ role: 'dm', content: data.dmText });
        audioManager.playUISound('notification');
        
        // Update scene only if context suggests a significant change
        const lower = data.dmText.toLowerCase();
        const inCombat = ['combat','kampf','angriff','attack','fight','schlacht'].some(k => lower.includes(k));
        const hasLocationChange = ['enter','betrete','arrive','ankomm','travel','reise','leave','verlasse'].some(k => lower.includes(k));
        
        // Only change scene if there's combat or a clear location change
        if (inCombat || hasLocationChange) {
          const gameContext = {
            scenario: selections.scenario,
            location: data.dmText,
            inCombat,
            history: [...history, { role: 'dm', content: data.dmText }]
          };
          const newScene = audioManager.detectSceneFromContext(gameContext);
          await audioManager.changeScene(newScene);
        }
      }
      
      // Handle dice results and play dice sound
      if (data.diceResults && data.diceResults.length > 0) {
        audioManager.playUISound('dice');
        
        // Convert API dice format to DiceResult format
        const diceResults: DiceResult[] = data.diceResults.map((dice: {
          formula?: string;
          result?: number;
          rolls?: number[];
        }) => ({
          formula: dice.formula || '1d20',
          rolls: dice.rolls || [dice.result || 0],
          modifier: 0, // API doesn't return modifier separately
          total: dice.result || 0,
        }));
        
        setLastDiceResults(diceResults);
        
        // Show visual dice overlay
        setShowVisualDice(true);
        
        // Auto-hide dice results after 15 seconds
        setTimeout(() => {
          setLastDiceResults([]);
        }, 15000);
      }
      
      if (data.effects) applyEffects(data.effects);
      // Ignore any vision instructions (image generation removed)
      if (!messageOverride) setInput('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unbekannter Fehler beim nächsten Zug.';
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  

  async function confirmSave() {
    try {
      const saveId = await useGameStore.getState().saveGameManual(saveName || `Save ${Date.now()}`);
      
      audioManager.playUISound('notification');
      setSaveModalOpen(false);
      setSaveName('');
      console.log('Game saved to database with ID:', saveId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Fehler beim Speichern';
      toast.error(message);
      audioManager.playUISound('error');
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
                onClick={() => useGameStore.getState().setMainMenuStep()}
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

        {/* Party Panel - Enhanced and moved under scenario */}
        {party && party.length > 0 && (
          <section className="card-fantasy p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Deine Abenteurer-Gruppe</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {party.map((character: Player, index: number) => (
                <div key={character.id || index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  {/* Character Portrait */}
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                    <Image
                      src={character.portraitUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&background=amber&color=fff&size=128&font-size=0.5`}
                      alt={`${character.name} Portrait`}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                      unoptimized
                      priority={index === 0}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">{character.name}</h3>
                      <span className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full">
                        Level {character.level || 1}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                      <span>{getClassDisplayName(character.cls as CharacterClass)}</span>
                      <span>•</span>
                      <span>❤️ {character.hp || 0}/{character.maxHp || 0}</span>
                      <span>•</span>
                      <span>🧠 {character.mp || 0}/{character.maxMp || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Audio Controls */}
        <AudioControls className="mb-4" showSceneSelector={true} />

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
              {busy && (
                <div className="chat-bubble-dm animate-pulse">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-amber-200 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                      Aethel (DM)
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">...</p>
                </div>
              )}
            </div>
          </section>

          {/* Side Panel Toggle Button (for small screens) */}
          <div className="lg:hidden text-center mb-4">
            <button 
              onClick={() => setSidepanelOpen(!isSidepanelOpen)}
              className="btn-secondary"
            >
              {isSidepanelOpen ? 'Sidepanel ausblenden' : 'Sidepanel anzeigen'}
            </button>
          </div>

          {/* Side Panel */}
          {isSidepanelOpen && <Sidepanel />}
        </div>

        {/* Dice Results Display - On-Demand */}
        <DiceResultsDisplay 
          results={lastDiceResults}
          onShowVisualDice={() => setShowVisualDice(true)}
        />

        

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
  
      </div>
      <VisualDice isOpen={showVisualDice} onClose={() => setShowVisualDice(false)} />
      <TutorialOverlay />

      {/* Save Game Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Spiel Speichern
            </h3>
            
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              className="input w-full mb-4"
              placeholder="Name des Spielstands..."
              onKeyDown={(e) => e.key === 'Enter' && confirmSave()}
            />
            
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setSaveModalOpen(false);
                  setSaveName('');
                }}
                className="btn-secondary"
              >
                Abbrechen
              </button>
              <button
                onClick={confirmSave}
                disabled={!saveName.trim()}
                className="btn"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
