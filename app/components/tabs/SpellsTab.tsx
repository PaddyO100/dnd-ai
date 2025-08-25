"use client";

import { useState, useEffect } from 'react';
import { useGameStore, type Player } from '@/lib/state/gameStore';
import { SpellSystem } from '@/data/spells';
import type { SpellData, MagicSchool } from '@/data/spells';
import type { CharacterClass } from '@/schemas/character';
import Tooltip from '../ui/Tooltip';
import { getGermanTerm } from '@/lib/i18n/germanTerms';

interface SpellsTabProps {
  player?: Player;
}

interface SpellCooldown {
  spellId: string;
  remainingTurns: number;
}

export default function SpellsTab({ player }: SpellsTabProps) {
  const { addPlayerSpell, updatePlayerMP } = useGameStore();
  const [selectedSpell, setSelectedSpell] = useState<string | null>(null);
  const [cooldowns, setCooldowns] = useState<SpellCooldown[]>([]);
  const [castingSpell, setCastingSpell] = useState<string | null>(null);
  const [spellFilter, setSpellFilter] = useState<'all' | 'available' | 'known'>('all');
  const [schoolFilter, setSchoolFilter] = useState<'all' | MagicSchool>('all');

  const spells = player?.spells || [];
  const currentMP = player?.mp || 0;
  const playerLevel = player?.level || 1;
  const playerClass = player?.cls || 'mage';

  // Convert class name to CharacterClass enum
  const classMap: Record<string, CharacterClass> = {
    'Krieger': 'warrior',
    'Magier': 'mage', 
    'Schurke': 'rogue',
    'Barde': 'bard',
    'Paladin': 'paladin',
    'Waldläufer': 'ranger',
    'Druide': 'druid',
    'Mönch': 'monk',
    'Hexenmeister': 'warlock'
  };
  
  const characterClass = classMap[playerClass] || 'mage' as CharacterClass;

  // Get available spells for the player's class and level
  const availableSpells = SpellSystem.getAvailableSpells(characterClass, playerLevel);
  const spellSlots = SpellSystem.getSpellSlots(playerLevel);
  const knownSpells = spells.map(s => s.name);

  // Filter spells based on current filter settings
  const filteredSpells = availableSpells.filter(spell => {
    if (spellFilter === 'known' && !knownSpells.includes(spell.nameDE)) return false;
    if (spellFilter === 'available' && !SpellSystem.canCastSpell(spell, currentMP, spellSlots)) return false;
    if (schoolFilter !== 'all' && spell.school !== schoolFilter) return false;
    return true;
  });

  // Group spells by school
  const spellsBySchool = filteredSpells.reduce((acc, spell) => {
    if (!acc[spell.school]) acc[spell.school] = [];
    acc[spell.school].push(spell);
    return acc;
  }, {} as Record<MagicSchool, SpellData[]>);

  const schoolColors: Record<MagicSchool, string> = {
    'evocation': 'red',
    'enchantment': 'purple',
    'conjuration': 'green',
    'abjuration': 'blue',
    'divination': 'yellow',
    'illusion': 'pink',
    'necromancy': 'gray',
    'transmutation': 'indigo',
    'elemental': 'orange',
    'divine': 'gold',
    'nature': 'emerald',
    'arcane': 'violet'
  };

  const schoolNames: Record<MagicSchool, string> = {
    'evocation': 'Hervorrufung',
    'enchantment': 'Verzauberung',
    'conjuration': 'Beschwörung',
    'abjuration': 'Bannmagie',
    'divination': 'Wahrsagung',
    'illusion': 'Illusion',
    'necromancy': 'Nekromantie',
    'transmutation': 'Verwandlung',
    'elemental': 'Elementarmagie',
    'divine': 'Göttliche Magie',
    'nature': 'Naturmagie',
    'arcane': 'Arkane Magie'
  };

  const handleLearnSpell = (spell: SpellData) => {
    if (!player || knownSpells.includes(spell.nameDE)) return;
    
    // Add spell to player's known spells
    addPlayerSpell(player.id, {
      name: spell.nameDE,
      level: spell.level,
      cost: spell.manaCost,
      description: spell.descriptionDE,
      school: spell.school
    });
  };

  const handleCastSpell = async (spell: SpellData) => {
    if (!player || castingSpell) return;
    
    const canCast = SpellSystem.canCastSpell(spell, currentMP, spellSlots);
    if (!canCast) return;

    setCastingSpell(spell.id);
    
    try {
      // Deduct mana cost
      updatePlayerMP(player.id, currentMP - spell.manaCost);
      
      // Add cooldown if spell has one
      if (spell.level > 0) {
        setCooldowns(prev => [...prev, { spellId: spell.id, remainingTurns: spell.level }]);
      }
      
      // Simulate spell casting delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`✨ ${player.name} casts ${spell.nameDE}!`);
    } catch (error) {
      console.error('Error casting spell:', error);
    } finally {
      setCastingSpell(null);
    }
  };

  // Update cooldowns each turn
  useEffect(() => {
    const interval = setInterval(() => {
      setCooldowns(prev => 
        prev.map(cd => ({ ...cd, remainingTurns: cd.remainingTurns - 1 }))
           .filter(cd => cd.remainingTurns > 0)
      );
    }, 30000); // Assume 30 seconds per turn

    return () => clearInterval(interval);
  }, []);

  const isSpellOnCooldown = (spellId: string) => {
    return cooldowns.some(cd => cd.spellId === spellId);
  };

  const getSpellCooldown = (spellId: string) => {
    const cooldown = cooldowns.find(cd => cd.spellId === spellId);
    return cooldown?.remainingTurns || 0;
  };

  if (!player) {
    return (
      <div className="p-4">
        <p className="text-gray-500">Kein Charakter ausgewählt.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
          Zaubersprüche
        </h3>
        <div className="text-sm text-amber-700 dark:text-amber-300">
          MP: {currentMP} | Level: {playerLevel}
        </div>
      </div>

      {/* Spell Slots Display */}
      {Object.keys(spellSlots).length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <h4 className="text-sm font-medium mb-2">
            <Tooltip content={`${getGermanTerm('spellSlots')?.title}\n${getGermanTerm('spellSlots')?.description || ''}`}>
              <span className="cursor-help">Zauberplätze</span>
            </Tooltip>
          </h4>
          <div className="flex gap-2">
            {Object.entries(spellSlots).map(([level, slots]) => (
              <div key={level} className="text-xs">
                <span className="font-medium">Lvl {level}:</span> {slots}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select 
          value={spellFilter}
          onChange={(e) => setSpellFilter(e.target.value as 'all' | 'available' | 'known')}
          className="text-xs border rounded px-2 py-1"
        >
          <option value="all">Alle Zauber</option>
          <option value="available">Verfügbare</option>
          <option value="known">Bekannte</option>
        </select>
        
        <select 
          value={schoolFilter}
          onChange={(e) => setSchoolFilter(e.target.value as 'all' | MagicSchool)}
          className="text-xs border rounded px-2 py-1"
        >
          <option value="all">Alle Schulen</option>
          {Object.entries(schoolNames).map(([school, name]) => (
            <option key={school} value={school}>{name}</option>
          ))}
        </select>
      </div>

      {/* Spells by School */}
      <div className="space-y-4">
        {Object.entries(spellsBySchool).map(([school, schoolSpells]) => (
          <div key={school} className="space-y-2">
            <h4 className={`text-sm font-medium text-${schoolColors[school as MagicSchool]}-600 dark:text-${schoolColors[school as MagicSchool]}-400`}>
              {schoolNames[school as MagicSchool]} ({schoolSpells.length})
            </h4>
            
            <div className="grid gap-2">
              {schoolSpells.map((spell) => {
                const isKnown = knownSpells.includes(spell.nameDE);
                const canCast = SpellSystem.canCastSpell(spell, currentMP, spellSlots);
                const onCooldown = isSpellOnCooldown(spell.id);
                const cooldownTurns = getSpellCooldown(spell.id);
                
                return (
                  <div 
                    key={spell.id}
                    className={`p-3 rounded-lg border transition-all ${
                      selectedSpell === spell.id 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-700'
                    } ${!canCast && 'opacity-50'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium text-sm">{spell.nameDE}</h5>
                          <span className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">
                            Lvl {spell.level}
                          </span>
                          <span className="text-xs text-blue-600 dark:text-blue-400">
                            {spell.manaCost} MP
                          </span>
                          {isKnown && (
                            <span className="text-xs bg-green-100 text-green-800 px-1 rounded">
                              Bekannt
                            </span>
                          )}
                          {onCooldown && (
                            <span className="text-xs bg-red-100 text-red-800 px-1 rounded">
                              Cooldown: {cooldownTurns}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          {spell.descriptionDE}
                        </p>
                        
                        <div className="flex flex-wrap gap-1 text-xs text-gray-500">
                          <span>Reichweite: {spell.range}</span>
                          <span>•</span>
                          <span>Dauer: {spell.duration}</span>
                          {spell.concentration && (
                            <>
                              <span>•</span>
                              <Tooltip content={`${getGermanTerm('concentration')?.title}\n${getGermanTerm('concentration')?.description || ''}`}>
                                <span className="text-yellow-600 cursor-help">Konzentration</span>
                              </Tooltip>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-1 ml-2">
                        {!isKnown && (
                          <button
                            onClick={() => handleLearnSpell(spell)}
                            className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition-colors"
                            disabled={castingSpell !== null}
                          >
                            Lernen
                          </button>
                        )}
                        
                        {isKnown && (
                          <button
                            onClick={() => handleCastSpell(spell)}
                            className="text-xs bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded transition-colors disabled:opacity-50"
                            disabled={!canCast || onCooldown || castingSpell !== null}
                          >
                            {castingSpell === spell.id ? 'Zaubern...' : 'Wirken'}
                          </button>
                        )}
                        
                        <button
                          onClick={() => setSelectedSpell(selectedSpell === spell.id ? null : spell.id)}
                          className="text-xs bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded transition-colors"
                        >
                          {selectedSpell === spell.id ? 'Weniger' : 'Details'}
                        </button>
                      </div>
                    </div>
                    
                    {/* Spell Combos */}
                    {selectedSpell === spell.id && spell.comboPotential && (
                      <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                        <h6 className="text-xs font-medium mb-1">Zauber-Kombinationen:</h6>
                        <div className="flex flex-wrap gap-1">
                          {spell.comboPotential.map(comboId => {
                            const comboSpell = SpellSystem.getSpellById(comboId);
                            return comboSpell ? (
                              <span key={comboId} className="text-xs bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
                                {comboSpell.nameDE}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {filteredSpells.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Keine Zaubersprüche verfügbar.</p>
          {characterClass === 'warrior' || characterClass === 'rogue' || characterClass === 'monk' ? (
            <p className="text-xs mt-1">Diese Klasse hat keinen Zugang zu Zaubern.</p>
          ) : (
            <p className="text-xs mt-1">Verändere die Filter oder steige im Level auf, um mehr Zauber zu erhalten.</p>
          )}
        </div>
      )}
    </div>
  );
}
