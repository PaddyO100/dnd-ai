'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/state/gameStore';
import { audioManager } from '@/lib/audio/audioManager';
import SaveGameManager from './SaveGameManager';
import ClearCacheButton from './ClearCacheButton';

export default function MainMenu() {
  const { setCampaignSelectionStep, reset } = useGameStore();
  const [showSaveManager, setShowSaveManager] = useState(false);

  // Initialize main menu music
  useEffect(() => {
    const initMainMenuAudio = async () => {
      await audioManager.changeScene('main_menu');
    };
    initMainMenuAudio();
  }, []);

  const handleNewGame = () => {
    audioManager.playUISound('button');
    reset();
    useGameStore.setState({ step: 'onboarding' });
  };

  const handleCampaigns = () => {
    audioManager.playUISound('button');
    setCampaignSelectionStep();
  };

  const handleSettings = () => {
    audioManager.playUISound('button');
    window.location.href = '/settings';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-amber-900/20 dark:to-red-900/20">
  <div className="container mx-auto px-6 py-12 max-w-[min(96vw,1600px)]">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 mb-4">
            Aethel&apos;s Forge
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Ein KI-gestütztes D&D-Erlebnis mit dynamischem Storytelling und immersiven Abenteuern
          </p>
        </header>

        {/* Main Menu Options */}
  <div className="mx-auto w-full max-w-[min(96vw,1400px)]">
          {!showSaveManager ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* New Game */}
              <button
                onClick={handleNewGame}
                className="group card-fantasy p-8 text-center hover:scale-105 transform transition-all duration-200 bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-800"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-emerald-800 dark:text-emerald-200 mb-2">Neues Spiel</h3>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">Beginne ein neues Abenteuer mit dem Charakter-Assistenten</p>
              </button>

              {/* Load Game */}
              <button
                onClick={() => setShowSaveManager(true)}
                className="group card-fantasy p-8 text-center hover:scale-105 transform transition-all duration-200 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-2">Spiel Laden</h3>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Lade einen gespeicherten Spielstand
                </p>
              </button>

              {/* Campaigns */}
              <button
                onClick={handleCampaigns}
                className="group card-fantasy p-8 text-center hover:scale-105 transform transition-all duration-200 bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-800"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-purple-800 dark:text-purple-200 mb-2">Kampagnen</h3>
                <p className="text-sm text-purple-600 dark:text-purple-400">Vorgefertigte Abenteuer und Kampagnen durchsuchen</p>
              </button>

              {/* Settings */}
              <button
                onClick={handleSettings}
                className="group card-fantasy p-8 text-center hover:scale-105 transform transition-all duration-200 bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-900/20 dark:to-slate-900/20 border-gray-200 dark:border-gray-800"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-gray-500 to-slate-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Einstellungen</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Spiel-Optionen, Audio und Themes konfigurieren</p>
              </button>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 text-gray-500 dark:text-gray-400">
          <p className="text-sm mb-4">
            Powered by OpenRouter AI • Version 1.0.0
          </p>
          
          {/* System Reset Button */}
          <div className="mt-4">
            <ClearCacheButton className="text-sm px-4 py-2" />
            <p className="text-xs mt-2 text-gray-400">
              Löst Anzeige-Probleme (falsche Charaktere, leere Inventare)
            </p>
          </div>
        </footer>
      </div>

      {/* Save Game Manager Modal */}
      {showSaveManager && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Gespeicherte Spiele</h2>
              <button
                onClick={() => setShowSaveManager(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <SaveGameManager />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
