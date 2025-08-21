import { analyzeText } from '../nlp/contextAnalyzer';

export type SceneType = 
  | 'main_menu'
  | 'menu' 
  | 'character_creation'
  | 'campfire'
  | 'cave'
  | 'city'
  | 'combat'
  | 'lake'
  | 'mountains'
  | 'open_field'
  | 'ruins'
  | 'sea'
  | 'woods';

export type UISound = 'button' | 'dice' | 'dice_land' | 'notification' | 'error';

class AudioManager {
  private currentTrack: HTMLAudioElement | null = null;
  private currentScene: SceneType | null = null;
  private musicVolume: number = 0.1; // Background music at 10% volume (default)
  private sfxVolume: number = 0.7; // UI sounds at 70% volume
  private fadeSpeed: number = 500; // Fade duration in ms
  private isEnabled: boolean = true;
  private isUnlocked: boolean = false; // unlocked by first user gesture
  private isTransitioning: boolean = false; // serialize scene transitions
  private lastSceneChangeAt = 0;

  // Music track mapping
  private musicTracks: Record<SceneType, string> = {
    // Safe defaults mapped to existing calm track
    main_menu: '/music/main_menu.wav',
    menu: '/music/menu.wav',
    character_creation: '/music/character_creation.wav',
    campfire: '/music/campfire.wav',
    cave: '/music/cave.wav',
    city: '/music/city.wav',
    combat: '/music/fighting.wav',
    lake: '/music/lake.wav',
    mountains: '/music/mountains.wav',
    open_field: '/music/open_field.wav',
    ruins: '/music/ruins.wav',
    sea: '/music/sea.wav',
    woods: '/music/woods.wav',
  };

  // UI sound files
  private uiSounds: Record<UISound, string> = {
    button: '/sounds/button.mp3',
    dice: '/sounds/dice_roll.mp3',
    dice_land: '/sounds/dice_land.mp3',
    notification: '/sounds/notification.mp3',
    error: '/sounds/error.mp3',
  };

  constructor() {
    // Load settings from localStorage (browser only)
    if (typeof window !== 'undefined') {
      this.loadSettings();
      // Try to unlock audio on first user gesture (autoplay policies)
      const unlock = () => {
        this.isUnlocked = true;
        if (this.currentTrack) {
          // Ensure unmuted and at desired volume on first gesture
          this.currentTrack.muted = false;
          this.currentTrack.volume = this.musicVolume;
          if (this.currentTrack.paused) {
            this.currentTrack.play().catch(() => {/* ignore */});
          }
        }
      };
      window.addEventListener('pointerdown', unlock, { once: true });
      window.addEventListener('keydown', unlock, { once: true });
    }
  }

  private loadSettings() {
    // Only load settings in browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    
    try {
      const settings = localStorage.getItem('audioSettings');
      if (settings) {
        const parsed = JSON.parse(settings);
        // Default music volume now at 0.1 (10%)
        this.musicVolume = parsed.musicVolume ?? 0.1;
        this.sfxVolume = parsed.sfxVolume ?? 0.7;
        this.isEnabled = parsed.isEnabled ?? true;
      }
    } catch (error) {
      console.warn('Failed to load audio settings:', error);
    }
  }

  private saveSettings() {
    // Only save settings in browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    
    try {
      localStorage.setItem('audioSettings', JSON.stringify({
        musicVolume: this.musicVolume,
        sfxVolume: this.sfxVolume,
        isEnabled: this.isEnabled,
      }));
    } catch (error) {
      console.warn('Failed to save audio settings:', error);
    }
  }

  // Fade out current track
  private async fadeOut(audio: HTMLAudioElement): Promise<void> {
    return new Promise((resolve) => {
      const startVolume = audio.volume;
      const fadeStep = startVolume / (this.fadeSpeed / 50);
      
      const fadeInterval = setInterval(() => {
        audio.volume = Math.max(0, audio.volume - fadeStep);
        
        if (audio.volume <= 0) {
          clearInterval(fadeInterval);
          audio.pause();
          resolve();
        }
      }, 50);
    });
  }

  // Fade in track
  private async fadeIn(audio: HTMLAudioElement, targetVolume: number): Promise<void> {
    return new Promise((resolve) => {
      // Start muted to allow autoplay in most browsers
      audio.muted = true;
      audio.volume = 0;
      audio.play().then(() => {
        // Unmute once playback has started
        audio.muted = false;
      }).catch((e) => {
        // If blocked by autoplay, wait for unlock gesture
        console.warn('Audio play blocked (will retry after user gesture):', e);
        const tryPlay = () => {
          audio.play().then(() => { audio.muted = false; }).catch(() => {/* ignore */});
          window.removeEventListener('pointerdown', tryPlay);
          window.removeEventListener('keydown', tryPlay);
        };
        if (typeof window !== 'undefined') {
          window.addEventListener('pointerdown', tryPlay, { once: true });
          window.addEventListener('keydown', tryPlay, { once: true });
        }
      });
      
      const fadeStep = targetVolume / (this.fadeSpeed / 50);
      
      const fadeInterval = setInterval(() => {
        audio.volume = Math.min(targetVolume, audio.volume + fadeStep);
        
        if (audio.volume >= targetVolume) {
          clearInterval(fadeInterval);
          resolve();
        }
      }, 50);
    });
  }

  // Change scene music with smooth transition
  async changeScene(scene: SceneType): Promise<void> {
    if (!this.isEnabled) {
      return; // Still update currentScene even if disabled
    }
    
    // Update current scene immediately for state tracking
    const previousScene = this.currentScene;
    this.currentScene = scene;
    
    // If same scene and already playing, don't restart
    if (scene === previousScene && this.currentTrack && !this.currentTrack.paused) {
      return;
    }
    
    // Debounce rapid scene changes (<200ms apart)
    const now = Date.now();
    if (now - this.lastSceneChangeAt < 200) return;
    this.lastSceneChangeAt = now;

    // Serialize transitions to prevent overlapping fade/play
    if (this.isTransitioning) {
      // Drop if we're trying to change to the same scene soon
      if (scene === previousScene) return;
      // Wait briefly for the current transition to finish
      await new Promise((r) => setTimeout(r, 50));
      if (this.isTransitioning) return; // still transitioning; skip this change
    }
    this.isTransitioning = true;

    console.log(`Changing music scene from ${previousScene} to ${scene}`);

    const newTrackUrl = this.musicTracks[scene];
    if (!newTrackUrl) {
      console.warn(`No track found for scene: ${scene}`);
      this.isTransitioning = false;
      return;
    }

    try {
      // Fade out current track only if different from new track
      if (this.currentTrack && this.currentTrack.src !== new URL(newTrackUrl, window.location.origin).href) {
        await this.fadeOut(this.currentTrack);
        this.currentTrack = null;
      }

      // Don't create new track if we already have the right one
      if (!this.currentTrack) {
        // Create and setup new track
        const newTrack = new Audio(newTrackUrl);
        newTrack.loop = true;
        newTrack.preload = 'auto';

        // Wait for track to be ready
        await new Promise((resolve, reject) => {
          newTrack.addEventListener('canplaythrough', resolve, { once: true });
          newTrack.addEventListener('error', reject, { once: true });
          
          // Set a timeout to prevent hanging
          const timeout = setTimeout(() => {
            reject(new Error('Audio load timeout'));
          }, 5000);
          
          newTrack.addEventListener('canplaythrough', () => clearTimeout(timeout), { once: true });
          newTrack.addEventListener('error', () => clearTimeout(timeout), { once: true });
          
          newTrack.load();
        });

        // Fade in new track
        this.currentTrack = newTrack;
        await this.fadeIn(newTrack, this.musicVolume);
      }

    } catch (error) {
      console.warn(`Failed to change to scene ${scene}:`, error);
    } finally {
      this.isTransitioning = false;
    }
  }

  // Play UI sound effect
  playUISound(sound: UISound): void {
    if (!this.isEnabled) return;

    try {
      // Try the configured path first, then alternate folder as fallback
      const configuredUrl = this.uiSounds[sound];
      const alternateUrl = configuredUrl.startsWith('/music')
        ? configuredUrl.replace('/music', '/sounds')
        : configuredUrl.replace('/sounds', '/music');

      const audio = new Audio(configuredUrl);
      audio.volume = this.sfxVolume;

      // If primary fails (404/decoding error), retry with fallback
      const onError = () => {
        const alt = new Audio(alternateUrl);
        alt.volume = this.sfxVolume;
        alt.play().catch(console.warn);
      };
      audio.addEventListener('error', onError, { once: true });
      audio.play().catch((e) => {
        console.warn('Primary UI sound failed, trying fallback:', e);
        onError();
      });
    } catch (error) {
      console.warn(`Failed to play UI sound ${sound}:`, error);
    }
  }

  // Stop current music
  async stopMusic(): Promise<void> {
    if (this.currentTrack) {
      await this.fadeOut(this.currentTrack);
      this.currentTrack = null;
      this.currentScene = null;
    }
  }

  // Volume controls
  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.currentTrack) {
      this.currentTrack.volume = this.musicVolume;
    }
    this.saveSettings();
  }

  setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  // Enable/disable audio
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled && this.currentTrack) {
      this.stopMusic();
    }
    this.saveSettings();
  }

  // Getters
  getMusicVolume(): number { return this.musicVolume; }
  getSFXVolume(): number { return this.sfxVolume; }
  isAudioEnabled(): boolean { return this.isEnabled; }
  getCurrentScene(): SceneType | null { return this.currentScene; }

  // Scene detection from game context
  detectSceneFromContext(gameContext: {
    scenario?: { summary?: string };
    location?: string;
    inCombat?: boolean;
    history?: Array<{ content: string }>;
  }): SceneType {
    // Combat takes priority
    if (gameContext.inCombat) {
      return 'combat';
    }

    // Analyze current location or recent history for scene hints
    const content = gameContext.location || 
                   gameContext.scenario?.summary || 
                   gameContext.history?.slice(-3).map(h => h.content).join(' ') || 
                   '';

    const contentLower = content.toLowerCase();

    // Match keywords to appropriate scenes
    if (contentLower.includes('cave') || contentLower.includes('höhle') || contentLower.includes('underground')) {
      return 'cave';
    }
    if (contentLower.includes('city') || contentLower.includes('stadt') || contentLower.includes('town')) {
      return 'city';
    }
    if (contentLower.includes('lake') || contentLower.includes('see') || contentLower.includes('water')) {
      return 'lake';
    }
    if (contentLower.includes('mountain') || contentLower.includes('berg') || contentLower.includes('peak')) {
      return 'mountains';
    }
    if (contentLower.includes('ruin') || contentLower.includes('ruine') || contentLower.includes('ancient')) {
      return 'ruins';
    }
    if (contentLower.includes('sea') || contentLower.includes('meer') || contentLower.includes('ocean')) {
      return 'sea';
    }
    if (contentLower.includes('forest') || contentLower.includes('wood') || contentLower.includes('wald')) {
      return 'woods';
    }
    if (contentLower.includes('camp') || contentLower.includes('lager') || contentLower.includes('fire')) {
      return 'campfire';
    }
    if (contentLower.includes('field') || contentLower.includes('plain') || contentLower.includes('meadow')) {
      return 'open_field';
    }

    const analysis = analyzeText(content);
    switch (analysis.dominantCategory) {
        case 'combat':
            return 'combat';
        case 'social':
            return 'city';
        case 'exploration':
            return 'open_field';
        case 'puzzle':
            return 'ruins';
        case 'downtime':
            return 'campfire';
        default:
            return 'open_field';
    }
  }
}

// Global audio manager instance
export const audioManager = new AudioManager();