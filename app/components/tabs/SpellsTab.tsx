"use client";

import { useState, useEffect } from 'react';
import { useGameStore, type Player } from '@/lib/state/gameStore';
import type { Spell } from '@/schemas/character';

interface SpellsTabProps {
  player?: Player;
}

interface SpellCooldown {
  spellName: string;
  remainingTurns: number;
}

export default function SpellsTab({ player }: SpellsTabProps) {
  const { addPlayerSpell, updatePlayerMP } = useGameStore();
  const [selectedSpell, setSelectedSpell] = useState<string | null>(null);
  const [cooldowns, setCooldowns] = useState<SpellCooldown[]>([]);
  const [castingSpell, setCastingSpell] = useState<string | null>(null);

  const spells = player?.spells || [];
  const currentMP = player?.mp || 0;

  // Spell schools and their associated spells
  const spellSchools = {
    evocation: {
      name: 'Hervorrufung',
      color: 'red',
      spells: [
        { name: 'Feuerball', cost: 3, level: 3, description: 'Schleudert einen Feuerball, der bei Aufprall explodiert und Feuerschaden verursacht.' },
        { name: 'Blitzschlag', cost: 2, level: 2, description: 'Ein Blitzstrahl trifft ein Ziel und verursacht Blitzschaden.' },
        { name: 'Magisches Geschoss', cost: 1, level: 1, description: 'Automatisch treffende Kraftpfeile, die Schaden verursachen.' },
        { name: 'Kältekegel', cost: 3, level: 3, description: 'Ein kegelförmiger Strahl eisiger Luft friert Gegner ein.' },
        { name: 'Donnerwelle', cost: 1, level: 1, description: 'Eine Welle aus Donnerschlag stößt Gegner zurück.' }
      ]
    },
    enchantment: {
      name: 'Verzauberung',
      color: 'purple',
      spells: [
        { name: 'Charme Person', cost: 1, level: 1, description: 'Bezaubert eine humanoide Kreatur, sie als Freund zu betrachten.' },
        { name: 'Schlaf', cost: 1, level: 1, description: 'Versetzt Kreaturen in magischen Schlaf.' },
        { name: 'Beherrschung Person', cost: 5, level: 5, description: 'Übernimmt die Kontrolle über eine humanoide Kreatur.' },
        { name: 'Verwirrung', cost: 4, level: 4, description: 'Verwirrt Kreaturen und lässt sie zufällig handeln.' },
        { name: 'Einschüchtern', cost: 2, level: 2, description: 'Erfüllt Gegner mit übernatürlicher Furcht.' }
      ]
    },
    conjuration: {
      name: 'Beschwörung',
      color: 'blue',
      spells: [
        { name: 'Magische Waffe', cost: 2, level: 2, description: 'Verstärkt eine Waffe mit magischer Kraft.' },
        { name: 'Dimensionstor', cost: 4, level: 4, description: 'Teleportiert sich oder andere über kurze Distanzen.' },
        { name: 'Unsichtbare Diener', cost: 1, level: 1, description: 'Beschwört einen unsichtbaren Diener für einfache Aufgaben.' },
        { name: 'Herbeirufen Tier', cost: 3, level: 3, description: 'Ruft ein Tier herbei, das dem Zauberer hilft.' },
        { name: 'Nebelwand', cost: 1, level: 1, description: 'Erschafft eine undurchsichtige Nebelwand.' }
      ]
    },
    restoration: {
      name: 'Wiederherstellung',
      color: 'green',
      spells: [
        { name: 'Heilen', cost: 1, level: 1, description: 'Stellt Trefferpunkte wieder her.' },
        { name: 'Große Heilung', cost: 3, level: 3, description: 'Heilt schwere Verletzungen vollständig.' },
        { name: 'Heilungstrank', cost: 2, level: 2, description: 'Erschafft einen magischen Heilungstrank.' },
        { name: 'Regeneration', cost: 4, level: 4, description: 'Lässt verlorene Gliedmaßen nachwachsen.' },
        { name: 'Wunden kurieren', cost: 1, level: 1, description: 'Heilt leichte Wunden und Kratzer.' }
      ]
    },
    abjuration: {
      name: 'Bannmagie',
      color: 'yellow',
      spells: [
        { name: 'Magischer Schild', cost: 1, level: 1, description: 'Erschafft eine schützende Barriere.' },
        { name: 'Dispel Magic', cost: 3, level: 3, description: 'Beendet magische Effekte.' },
        { name: 'Schutz vor Bösem', cost: 1, level: 1, description: 'Schützt vor bösen Kreaturen.' },
        { name: 'Bannkreis', cost: 5, level: 5, description: 'Erschafft einen mächtigen Schutzkreis.' },
        { name: 'Gegen Zauber', cost: 2, level: 2, description: 'Verhindert das Wirken von Zaubern in einem Bereich.' }
      ]
    },
    divination: {
      name: 'Wahrsagung',
      color: 'indigo',
      spells: [
        { name: 'Magie entdecken', cost: 1, level: 1, description: 'Entdeckt magische Auren in der Nähe.' },
        { name: 'Hellsehen', cost: 3, level: 3, description: 'Sieht entfernte Orte und Ereignisse.' },
        { name: 'Gedanken lesen', cost: 2, level: 2, description: 'Liest die Oberflächengedanken einer Kreatur.' },
        { name: 'Wahrsagen', cost: 4, level: 4, description: 'Erhält Einblicke in zukünftige Ereignisse.' },
        { name: 'Verborgenes erkennen', cost: 2, level: 2, description: 'Erkennt versteckte Türen und Fallen.' }
      ]
    }
  };

  // Helper removed: getAllSpells was unused

  const getSpellCooldown = (spellName: string): number => {
    const cooldown = cooldowns.find(c => c.spellName === spellName);
    return cooldown?.remainingTurns || 0;
  };

  const canCastSpell = (spell: Spell): boolean => {
    return currentMP >= spell.cost && getSpellCooldown(spell.name) === 0;
  };

  const castSpell = async (spell: Spell) => {
    if (!player || !canCastSpell(spell)) return;
    
    setCastingSpell(spell.name);
    
    // Simulate spell casting time
    setTimeout(() => {
      // Apply MP cost and cooldown
      const newCooldown: SpellCooldown = {
        spellName: spell.name,
        remainingTurns: Math.max(1, Math.floor(spell.level || 1))
      };
      
      setCooldowns(prev => [...prev.filter(c => c.spellName !== spell.name), newCooldown]);
      setCastingSpell(null);
      
      // Apply spell effects (MP cost, etc.)
      if (player) {
        updatePlayerMP(player.id, -spell.cost);
      }
      
      console.log(`Cast ${spell.name} for ${spell.cost} MP`);
    }, 1500);
  };

  const getSpellSchoolColor = (schoolName: string): string => {
    const school = Object.values(spellSchools).find(s => s.name === schoolName);
    const color = school?.color || 'gray';
    
    const colorMap = {
      red: 'bg-red-100 text-red-800 border-red-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    return colorMap[color as keyof typeof colorMap] || colorMap.gray;
  };

  // Decrease cooldowns each turn (this would be triggered by game events)
  useEffect(() => {
    const interval = setInterval(() => {
      setCooldowns(prev => 
        prev.map(c => ({ ...c, remainingTurns: Math.max(0, c.remainingTurns - 1) }))
           .filter(c => c.remainingTurns > 0)
      );
    }, 10000); // Every 10 seconds for demo purposes

    return () => clearInterval(interval);
  }, []);

  if (!player) {
    return (
      <div className="text-center py-8 text-amber-600">
        <svg className="w-16 h-16 mx-auto text-amber-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <p>Kein Charakter ausgewählt</p>
      </div>
    );
  }

  const knownSpells = spells.length > 0 ? spells : [];

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto scroll-fantasy pr-2">
      {/* MP Display */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            <span className="font-semibold text-blue-900">Magiepunkte</span>
          </div>
          <span className="text-xl font-bold text-blue-700">{currentMP}/{player.maxMp || player.mp}</span>
        </div>
        
        <div className="w-full bg-blue-200 rounded-full h-3">
          <div 
            className="bg-blue-500 h-3 rounded-full transition-all" 
            style={{ width: `${Math.max(0, (currentMP / (player.maxMp || player.mp || 1)) * 100)}%` }}
          />
        </div>
        
        <div className="text-xs text-blue-600 mt-2">
          {currentMP === 0 && "Keine Magiepunkte verfügbar - Raste, um MP zu regenerieren"}
          {currentMP > 0 && currentMP < (player.maxMp || player.mp) * 0.3 && "Niedrige Magiepunkte - Vorsicht bei teuren Zaubern"}
          {currentMP >= (player.maxMp || player.mp) * 0.3 && "Bereit zum Zaubern"}
        </div>
      </div>

      {/* Known Spells */}
      {knownSpells.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-amber-900 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Bekannte Zauber
          </h3>
          
          {knownSpells.map((spell, i) => {
            const cooldownTurns = getSpellCooldown(spell.name);
            const canCast = canCastSpell(spell);
            const isCasting = castingSpell === spell.name;
            
            return (
              <div
                key={i}
                className={`border rounded-lg p-3 transition-all ${
                  selectedSpell === spell.name 
                    ? 'border-purple-400 bg-purple-50 shadow-md' 
                    : canCast 
                      ? 'border-purple-200 bg-white hover:border-purple-300 hover:bg-purple-50/50 cursor-pointer'
                      : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
                onClick={() => setSelectedSpell(selectedSpell === spell.name ? null : spell.name)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-purple-900">{spell.name}</span>
                    {spell.level && (
                      <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded">
                        Lvl {spell.level}
                      </span>
                    )}
                    {spell.school && (
                      <span className={`text-xs px-2 py-1 rounded border ${getSpellSchoolColor(spell.school)}`}>
                        {spell.school}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      canCast ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {spell.cost} MP
                    </span>
                    
                    {cooldownTurns > 0 && (
                      <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded">
                        {cooldownTurns} Züge
                      </span>
                    )}
                    
                    {canCast && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          castSpell(spell);
                        }}
                        disabled={isCasting}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                          isCasting
                            ? 'bg-yellow-500 text-white cursor-not-allowed'
                            : 'bg-purple-500 hover:bg-purple-600 text-white'
                        }`}
                      >
                        {isCasting ? 'Zaubern...' : 'Wirken'}
                      </button>
                    )}
                  </div>
                </div>
                
                <p className="text-xs text-purple-700">{spell.description}</p>
                
                {selectedSpell === spell.name && (
                  <div className="border-t border-purple-200 pt-2 mt-2">
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-purple-600">Zauberzeit:</span>
                        <span className="text-purple-800">1 Aktion</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-600">Reichweite:</span>
                        <span className="text-purple-800">
                          {spell.level === 1 ? '9m' : spell.level === 2 ? '18m' : spell.level === 3 ? '36m' : '72m'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-600">Dauer:</span>
                        <span className="text-purple-800">
                          {spell.school === 'Verzauberung' ? 'Konzentration' :
                           spell.school === 'Bannmagie' ? 'Augenblicklich' :
                           spell.school === 'Wahrsagung' ? '10 Minuten' : 'Augenblicklich'}
                        </span>
                      </div>
                      {cooldownTurns > 0 && (
                        <div className="bg-red-50 rounded p-2 border border-red-200">
                          <span className="text-red-800 font-medium">
                            Abklingzeit: {cooldownTurns} Züge verbleibend
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {isCasting && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-yellow-700">
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Zauber wird gewirkt...</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Spell Learning Section */}
      <div className="space-y-3">
        <h3 className="font-semibold text-amber-900 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Neue Zauber Erlernen
        </h3>
        
        {Object.entries(spellSchools).map(([schoolKey, school]) => (
          <div key={schoolKey} className="space-y-2">
            <div className={`flex items-center gap-2 p-2 rounded-lg border ${getSpellSchoolColor(school.name)}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              <span className="font-medium">{school.name}</span>
            </div>
            
            <div className="ml-4 space-y-1">
              {school.spells
                .filter(spell => !knownSpells.find(known => known.name === spell.name))
                .slice(0, 3) // Show only first 3 for space
                .map((spell, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 bg-white rounded border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{spell.name}</span>
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                        {spell.cost} MP
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{spell.description}</p>
                  </div>
                  <button
                    className="ml-2 px-2 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs rounded transition-colors"
                    onClick={() => {
                      if (player) {
                        const newSpell: Spell = {
                          name: spell.name,
                          cost: spell.cost,
                          description: spell.description,
                          level: spell.level,
                          school: school.name
                        };
                        addPlayerSpell(player.id, newSpell);
                        console.log(`Learning spell: ${spell.name}`);
                      }
                    }}
                  >
                    Erlernen
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* No Spells State */}
      {knownSpells.length === 0 && (
        <div className="text-center py-8">
          <svg className="w-16 h-16 mx-auto text-purple-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          <p className="text-amber-600 mb-2">Noch keine Zauber bekannt</p>
          <p className="text-xs text-amber-500">Erlernt neue Zauber, um eure magischen Fähigkeiten zu erweitern</p>
        </div>
      )}
    </div>
  );
}