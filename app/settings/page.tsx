'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/state/gameStore';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { AudioControls } from '@/app/components/AudioControls';
import { audioManager } from '@/lib/audio/audioManager';
import type { AppSettings } from '@/lib/state/gameStore';

export default function SettingsPage() {
  // Start menu/settings soundtrack when opening settings
  useEffect(() => {
    (async () => {
      try {
        await audioManager.changeScene('menu');
      } catch {}
    })();
    return () => {
      // When navigating back to main menu via back button, restore main menu music
      const step = useGameStore.getState().step;
      if (step === 'mainMenu') {
        audioManager.changeScene('main_menu');
      }
    };
  }, []);
  const { settings, updateSettings, resetToStartPage } = useGameStore();
  const { t } = useTranslation();
  const [hasChanges, setHasChanges] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showStartPageResetConfirm, setShowStartPageResetConfirm] = useState(false);

  const handleSettingChange = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    updateSettings({ [key]: value });
    setHasChanges(true);

    // Reflect audio on/off immediately in the audio manager
    if (key === 'enableSoundEffects' && typeof value === 'boolean') {
      audioManager.setEnabled(value);
      // If enabling, gently resume current scene music
      if (value) {
        const scene = audioManager.getCurrentScene() || 'menu';
        audioManager.changeScene(scene);
      }
    }
  };

  const resetToDefaults = () => {
    const defaultSettings: AppSettings = {
      language: 'DE',
      autosaveInterval: 5,
      enableSoundEffects: true,
      enableVisualDice: true,
      difficulty: 'normal',
      theme: 'light',
      audio: {
        masterVolume: 0.7,
        diceVolume: 0.8,
        ambientVolume: 0.6,
        uiVolume: 0.5,
      },
    };
    updateSettings(defaultSettings);
    setHasChanges(false);
    setShowResetConfirm(false);
  };

  const resetToStartPageHandler = () => {
    resetToStartPage();
    setShowStartPageResetConfirm(false);
    // Redirect to start page
    window.location.href = '/';
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'aethels-forge-settings.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string);
        updateSettings(importedSettings);
        setHasChanges(true);
      } catch {
        alert(t('settings.importError'));
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen">
      <div className="container-page space-y-8 py-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="fantasy-title">{t('settings.title')}</h1>
          <p className="text-lg text-amber-800 max-w-2xl mx-auto">
            {t('settings.subtitle')}
          </p>
          {hasChanges && (
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {t('settings.changesAutosaved')}
            </div>
          )}
        </div>

        {/* Settings Sections */}
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Language & Localization */}
          <div className="card-fantasy p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </div>
              <div>
                <h2 className="fantasy-subtitle">{t('settings.language.title')}</h2>
                <p className="text-amber-700 text-sm">{t('settings.language.subtitle')}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-amber-700">{t('settings.language.label')}</label>
                <select
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value as 'DE')}
                  className="select"
                  disabled
                >
                  <option value="DE">{t('settings.language.german')}</option>
                </select>
                <p className="text-xs text-amber-600">{t('settings.language.description')}</p>
              </div>
            </div>
          </div>

          {/* Gameplay Settings */}
          <div className="card-fantasy p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="fantasy-subtitle">{t('settings.gameplay.title')}</h2>
                <p className="text-amber-700 text-sm">{t('settings.gameplay.subtitle')}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-amber-700">{t('settings.gameplay.difficulty.label')}</label>
                <select
                  value={settings.difficulty}
                  onChange={(e) => handleSettingChange('difficulty', e.target.value as 'easy' | 'normal' | 'hard')}
                  className="select"
                >
                  <option value="easy">{t('settings.gameplay.difficulty.easy')}</option>
                  <option value="normal">{t('settings.gameplay.difficulty.normal')}</option>
                  <option value="hard">{t('settings.gameplay.difficulty.hard')}</option>
                </select>
                <p className="text-xs text-amber-600">{t('settings.gameplay.difficulty.description')}</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-amber-700">{t('settings.gameplay.autosave.label')}</label>
                <select
                  value={settings.autosaveInterval}
                  onChange={(e) => handleSettingChange('autosaveInterval', Number(e.target.value))}
                  className="select"
                >
                  <option value={1}>{t('settings.gameplay.autosave.minutes1')}</option>
                  <option value={3}>{t('settings.gameplay.autosave.minutes3')}</option>
                  <option value={5}>{t('settings.gameplay.autosave.minutes5')}</option>
                  <option value={10}>{t('settings.gameplay.autosave.minutes10')}</option>
                  <option value={0}>{t('settings.gameplay.autosave.disabled')}</option>
                </select>
                <p className="text-xs text-amber-600">{t('settings.gameplay.autosave.description')}</p>
              </div>
            </div>
          </div>

          {/* Visual & Audio Settings */}
          <div className="card-fantasy p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="fantasy-subtitle">{t('settings.audioVisual.title')}</h2>
                <p className="text-amber-700 text-sm">{t('settings.audioVisual.subtitle')}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {/* Image generation removed */}
                
                <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-amber-200">
                  <div>
                    <div className="font-medium text-amber-900">{t('settings.audioVisual.soundEffects.title')}</div>
                    <div className="text-sm text-amber-700">{t('settings.audioVisual.soundEffects.description')}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableSoundEffects}
                      onChange={(e) => handleSettingChange('enableSoundEffects', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-amber-200">
                  <div>
                    <div className="font-medium text-amber-900">{t('settings.audioVisual.visualDice.title')}</div>
                    <div className="text-sm text-amber-700">{t('settings.audioVisual.visualDice.description')}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableVisualDice}
                      onChange={(e) => handleSettingChange('enableVisualDice', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-amber-700">{t('settings.audioVisual.theme.label')}</label>
                <select
                  value={settings.theme}
                  onChange={(e) => handleSettingChange('theme', e.target.value as 'light' | 'dark' | 'aethel' | 'mystic' | 'dragon')}
                  className="select"
                >
                  <option value="light">{t('settings.audioVisual.theme.light')}</option>
                  <option value="dark">{t('settings.audioVisual.theme.dark')}</option>
                  <option value="aethel">{t('settings.audioVisual.theme.aethel')}</option>
                  <option value="mystic">{t('settings.audioVisual.theme.mystic')}</option>
                  <option value="dragon">{t('settings.audioVisual.theme.dragon')}</option>
                </select>
                <p className="text-xs text-amber-600">{t('settings.audioVisual.theme.description')}</p>
              </div>
            </div>
          </div>

          {/* ComfyUI Settings removed */}

          {/* AI Settings */}
          <div className="card-fantasy p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h2 className="fantasy-subtitle">{t('settings.ai.title')}</h2>
                <p className="text-amber-700 text-sm">{t('settings.ai.subtitle')}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-amber-700">{t('settings.ai.model.label')}</label>
                <div className="p-3 bg-white/60 rounded-lg border border-amber-200 text-sm text-amber-800">
                  Modell wird über <code className="px-1 py-0.5 bg-amber-100 rounded">OPENROUTER_MODEL</code> in der <code className="px-1 py-0.5 bg-amber-100 rounded">.env.local</code> gesetzt.<br />
                    Aktuell: <code className="px-1 py-0.5 bg-amber-100 rounded">{process.env.NEXT_PUBLIC_OPENROUTER_MODEL ?? 'openai/gpt-oss-20b:free'}</code>
                </div>
                <p className="text-xs text-amber-600">Passe .env.local an und starte den Server neu, um das Modell zu ändern.</p>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <div className="text-sm text-amber-800">
                  <div className="font-medium mb-2">{t('settings.ai.privacy.title')}</div>
                  <p>{t('settings.ai.privacy.description')}</p>
                </div>
              </div>
            </div>
            
            {/* Audio Controls Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-amber-900">Audio Controls</h3>
              <AudioControls showSceneSelector={true} />
            </div>
          </div>

          {/* Data Management */}
          {/* Data Management */}
          <div className="card-fantasy p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              </div>
              <div>
                <h2 className="fantasy-subtitle">{t('settings.dataManagement.title')}</h2>
                <p className="text-amber-700 text-sm">{t('settings.dataManagement.subtitle')}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={exportSettings}
                className="btn flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {t('settings.dataManagement.export')}
              </button>
              
              <label className="btn cursor-pointer flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                {t('settings.dataManagement.import')}
                <input
                  type="file"
                  accept=".json"
                  onChange={importSettings}
                  className="hidden"
                />
              </label>
              
              <button
                onClick={() => setShowResetConfirm(true)}
                className="btn-secondary flex items-center justify-center gap-2 text-red-600 hover:bg-red-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {t('settings.dataManagement.reset')}
              </button>

              <button
                onClick={() => setShowStartPageResetConfirm(true)}
                className="btn-secondary flex items-center justify-center gap-2 text-orange-600 hover:bg-orange-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Zur Startseite zurücksetzen
              </button>
            </div>
          </div>

          {/* Game Data Management */}
          <div className="card-fantasy p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 1.1.9 2 2 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H6a2 2 0 00-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="fantasy-subtitle">Spieldatenverwaltung</h2>
                <p className="text-amber-700 text-sm">Spieldaten exportieren, importieren oder löschen.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => useGameStore.getState().exportGame()}
                className="btn flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Spiel exportieren
              </button>
              <label className="btn cursor-pointer flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                Spiel importieren
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => e.target.files && useGameStore.getState().importGame(e.target.files[0])}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => useGameStore.getState().clearCachedCharacterData()}
                className="btn-warning flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Cache leeren
              </button>
            </div>
          </div>

          {/* Game Data Management */}
          <div className="card-fantasy p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 1.1.9 2 2 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H6a2 2 0 00-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="fantasy-subtitle">Spieldatenverwaltung</h2>
                <p className="text-amber-700 text-sm">Spieldaten exportieren, importieren oder löschen.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => useGameStore.getState().exportGame()}
                className="btn flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Spiel exportieren
              </button>
              <label className="btn cursor-pointer flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                Spiel importieren
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => e.target.files && useGameStore.getState().importGame(e.target.files[0])}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => useGameStore.getState().clearCachedCharacterData()}
                className="btn-warning flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Cache leeren
              </button>
            </div>
          </div>
        </div>

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-amber-900 mb-4">{t('settings.dataManagement.resetConfirm.title')}</h3>
              <p className="text-amber-700 mb-6">
                {t('settings.dataManagement.resetConfirm.description')}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 btn-secondary"
                >
                  {t('settings.dataManagement.resetConfirm.cancel')}
                </button>
                <button
                  onClick={resetToDefaults}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  {t('settings.dataManagement.resetConfirm.confirm')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reset to Start Page Confirmation Modal */}
        {showStartPageResetConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-amber-900 mb-4">Zur Startseite zurücksetzen</h3>
              <p className="text-amber-700 mb-6">
                Dadurch wird die Anwendung vollständig zurückgesetzt, alle gespeicherten Daten werden gelöscht und Sie gelangen zurück zum Anfang. Alle Spielfortschritte gehen verloren.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowStartPageResetConfirm(false)}
                  className="flex-1 btn-secondary"
                >
                  Abbrechen
                </button>
                <button
                  onClick={resetToStartPageHandler}
                  className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Zurücksetzen
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Back to Game */}
        <div className="text-center pt-8">
          <button
            onClick={() => window.history.back()}
            className="btn flex items-center gap-2 mx-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('settings.backToGame')}
          </button>
        </div>
      </div>
    </div>
  );
}