// lib/character/portraitGenerator.ts

import { Character } from '@/schemas/character';

export interface PortraitSettings {
  seed: number;
  style: 'fantasy' | 'realistic' | 'anime' | 'painted' | 'sketch';
  quality: 'draft' | 'standard' | 'high';
  aspectRatio: '1:1' | '3:4' | '4:3';
}

/**
 * Generiert einen Prompt für Charakterportraits basierend auf Charakterdaten
 */
export function generatePortraitPrompt(character: Character): string {
  const className = character.cls?.toLowerCase() || 'adventurer';
  const stats = character.stats || {};
  
  // Base description
  let promptText = `portrait of ${character.name}, a ${character.cls}`;
  
  // Physical attributes
  if (character.age) promptText += `, age ${character.age}`;
  if (character.hair) promptText += `, ${character.hair} hair`;
  if (character.eyes) promptText += `, ${character.eyes} eyes`;
  if (character.skin) promptText += `, ${character.skin} skin`;
  
  // Class-specific features
  const classDescriptions = {
    warrior: 'strong muscular build, battle scars, determined expression, wearing armor',
    mage: 'intelligent eyes, flowing robes, mysterious aura, holding a staff or tome',
    rogue: 'nimble appearance, leather armor, cunning smile, daggers at belt',
    ranger: 'weathered face, practical clothing, bow and quiver, nature-worn gear',
    cleric: 'serene expression, holy symbol, blessed armor, divine radiance'
  };
  
  promptText += `, ${classDescriptions[className as keyof typeof classDescriptions] || 'adventurous appearance'}`;
  
  // Stat-influenced features
  if (stats.strength && stats.strength >= 15) promptText += ', powerful physique';
  if (stats.dexterity && stats.dexterity >= 15) promptText += ', graceful posture';
  if (stats.intelligence && stats.intelligence >= 15) promptText += ', intelligent gaze';
  if (stats.wisdom && stats.wisdom >= 15) promptText += ', wise demeanor';
  if (stats.charisma && stats.charisma >= 15) promptText += ', charismatic presence';
  
  // Style and quality
  promptText += ', fantasy art style, detailed character portrait, professional digital art';
  promptText += ', good lighting, clear details, medieval fantasy setting';
  
  return promptText;
}

/**
 * Generiert einen negativen Prompt für bessere Bildqualität
 */
export function generateNegativePrompt(): string {
  return [
    'blurry', 'low quality', 'pixelated', 'distorted face',
    'multiple heads', 'extra limbs', 'deformed', 'ugly',
    'bad anatomy', 'bad proportions', 'watermark', 'signature',
    'text', 'modern clothing', 'contemporary', 'nsfw'
  ].join(', ');
}

/**
 * Erstellt Portrait-Parameter für die Bildgenerierung
 */
export function createPortraitParameters(
  character: Character,
  settings: Partial<PortraitSettings> = {}
): {
  prompt: string;
  negative_prompt: string;
  seed: number;
  width: number;
  height: number;
  steps: number;
  cfg_scale: number;
} {
  const {
    seed = character.portraitSeed || Math.floor(Math.random() * 1000000),
    style = 'fantasy',
    quality = 'standard',
    aspectRatio = '1:1'
  } = settings;
  
  let prompt = generatePortraitPrompt(character);
  
  // Style-specific additions
  const stylePrompts = {
    fantasy: 'fantasy art, dramatic lighting, epic fantasy',
    realistic: 'photorealistic, detailed skin, natural lighting',
    anime: 'anime style, cel shading, vibrant colors',
    painted: 'oil painting, classical art style, masterpiece',
    sketch: 'pencil sketch, detailed line art, monochrome'
  };
  
  prompt += `, ${stylePrompts[style]}`;
  
  // Dimensions based on aspect ratio
  const dimensions = {
    '1:1': { width: 512, height: 512 },
    '3:4': { width: 512, height: 683 },
    '4:3': { width: 683, height: 512 }
  };
  
  // Quality settings
  const qualitySettings = {
    draft: { steps: 20, cfg_scale: 7 },
    standard: { steps: 30, cfg_scale: 8 },
    high: { steps: 50, cfg_scale: 10 }
  };
  
  return {
    prompt,
    negative_prompt: generateNegativePrompt(),
    seed,
    ...dimensions[aspectRatio],
    ...qualitySettings[quality]
  };
}

/**
 * Generiert ein Portrait über die API
 */
export async function generateCharacterPortrait(
  character: Character,
  settings: Partial<PortraitSettings> = {}
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  try {
    const params = createPortraitParameters(character, settings);
    
    const response = await fetch('/api/ai/img/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...params,
        targetId: character.id,
        targetName: character.name
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Portrait generation failed');
    }
    
    const result = await response.json();
    
    return {
      success: true,
      imageUrl: result.imageUrl
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Aktualisiert das Portrait-Seed eines Charakters
 */
export function updatePortraitSeed(character: Character): Character {
  return {
    ...character,
    portraitSeed: Math.floor(Math.random() * 1000000)
  };
}

/**
 * Generiert mehrere Portrait-Varianten
 */
export async function generatePortraitVariants(
  character: Character,
  count: number = 3
): Promise<Array<{ seed: number; imageUrl?: string; error?: string }>> {
  const variants = [];
  
  for (let i = 0; i < count; i++) {
    const seed = Math.floor(Math.random() * 1000000);
    const result = await generateCharacterPortrait(character, { seed });
    
    variants.push({
      seed,
      imageUrl: result.imageUrl,
      error: result.error
    });
  }
  
  return variants;
}

/**
 * Validiert Portrait-URL und gibt Fallback zurück
 */
export function getPortraitUrl(character: Character, fallback?: string): string {
  if (character.portraitUrl && character.portraitUrl.startsWith('http')) {
    return character.portraitUrl;
  }
  
  // Generate a placeholder based on character name and class
  if (fallback) return fallback;
  
  // Generate deterministic placeholder
  const hash = character.name.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const colors = ['amber', 'blue', 'green', 'purple', 'red', 'indigo'];
  const color = colors[Math.abs(hash) % colors.length];
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(character.name)}&background=${color}&color=white&size=256&font-size=0.6`;
}

/**
 * Erstellt Portrait-Prompt für spezifische Szenen
 */
export function generateScenePortraitPrompt(
  character: Character,
  scene: 'battle' | 'peaceful' | 'magical' | 'social' | 'exploring'
): string {
  const basePrompt = generatePortraitPrompt(character);
  
  const sceneModifiers = {
    battle: 'in combat, fierce expression, weapons drawn, battle ready',
    peaceful: 'serene expression, relaxed posture, peaceful setting',
    magical: 'casting spell, magical aura, arcane energies swirling',
    social: 'confident smile, diplomatic pose, formal attire',
    exploring: 'alert expression, adventure gear, ready for danger'
  };
  
  return `${basePrompt}, ${sceneModifiers[scene]}`;
}

/**
 * Exportiert Portrait-Einstellungen
 */
export function exportPortraitSettings(character: Character): PortraitSettings {
  return {
    seed: character.portraitSeed || 0,
    style: 'fantasy',
    quality: 'standard',
    aspectRatio: '1:1'
  };
}

/**
 * Importiert Portrait-Einstellungen
 */
export function importPortraitSettings(
  character: Character,
  settings: PortraitSettings
): Character {
  return {
    ...character,
    portraitSeed: settings.seed
  };
}