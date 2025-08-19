import React, { useState, useEffect } from 'react';
import { audioManager, SceneType } from '../../lib/audio/audioManager';

interface AudioControlsProps {
  className?: string;
  showSceneSelector?: boolean;
}

export const AudioControls: React.FC<AudioControlsProps> = ({ 
  className = '', 
  showSceneSelector = false 
}) => {
  const [musicVolume, setMusicVolume] = useState(audioManager.getMusicVolume());
  const [sfxVolume, setSFXVolume] = useState(audioManager.getSFXVolume());
  const [isEnabled, setIsEnabled] = useState(audioManager.isAudioEnabled());
  const [currentScene, setCurrentScene] = useState(audioManager.getCurrentScene());

  const scenes: Array<{ value: SceneType; label: string }> = [
    { value: 'main_menu', label: 'Main Menu' },
    { value: 'menu', label: 'Menu' },
    { value: 'character_creation', label: 'Character Creation' },
    { value: 'campfire', label: 'Campfire' },
    { value: 'cave', label: 'Cave' },
    { value: 'city', label: 'City' },
    { value: 'combat', label: 'Combat' },
    { value: 'lake', label: 'Lake' },
    { value: 'mountains', label: 'Mountains' },
    { value: 'open_field', label: 'Open Field' },
    { value: 'ruins', label: 'Ruins' },
    { value: 'sea', label: 'Sea' },
    { value: 'woods', label: 'Woods' },
  ];

  const handleMusicVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    setMusicVolume(volume);
    audioManager.setMusicVolume(volume);
  };

  const handleSFXVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(e.target.value);
    setSFXVolume(volume);
    audioManager.setSFXVolume(volume);
  };

  const handleToggleAudio = () => {
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);
    audioManager.setEnabled(newEnabled);
  };

  const handleSceneChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const scene = e.target.value as SceneType;
    setCurrentScene(scene);
    await audioManager.changeScene(scene);
  };

  const testUISound = () => {
    audioManager.playUISound('button');
  };

  // Update state when audio manager changes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentScene(audioManager.getCurrentScene());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`audio-controls ${className}`}>
      <div className="flex items-center gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        {/* Audio Toggle */}
        <button
          onClick={handleToggleAudio}
          className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
            isEnabled 
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
        >
          Audio {isEnabled ? 'ON' : 'OFF'}
        </button>

        {isEnabled && (
          <>
            {/* Music Volume */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Music:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={musicVolume}
                onChange={handleMusicVolumeChange}
                className="w-16 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-gray-600 dark:text-gray-400 w-8">
                {Math.round(musicVolume * 100)}%
              </span>
            </div>

            {/* SFX Volume */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">SFX:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={sfxVolume}
                onChange={handleSFXVolumeChange}
                className="w-16 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs text-gray-600 dark:text-gray-400 w-8">
                {Math.round(sfxVolume * 100)}%
              </span>
            </div>

            {/* Test Sound Button */}
            <button
              onClick={testUISound}
              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Test
            </button>

            {/* Scene Selector */}
            {showSceneSelector && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Scene:</span>
                <select
                  value={currentScene || ''}
                  onChange={handleSceneChange}
                  className="text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
                >
                  <option value="">None</option>
                  {scenes.map(scene => (
                    <option key={scene.value} value={scene.value}>
                      {scene.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Current Scene Display */}
            {currentScene && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Playing: {scenes.find(s => s.value === currentScene)?.label || currentScene}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
