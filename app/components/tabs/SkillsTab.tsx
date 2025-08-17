"use client";

import { useState } from 'react';
import { useGameStore, type Player } from '@/lib/state/gameStore';
import type { Skill } from '@/schemas/character';

interface SkillsTabProps {
  player?: Player;
}

export default function SkillsTab({ player }: SkillsTabProps) {
  const { updatePlayerSkill, addPlayerSkill } = useGameStore();
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  
  const skills = player?.skills || [];
  const availableSkillPoints = Math.max(0, (player?.level || 1) * 2 - skills.reduce((sum, s) => sum + s.level, 0));

  // Predefined skill categories for better organization
  const skillCategories = {
    combat: ['Kampf', 'Verteidigung', 'Bogenschießen', 'Zweihandkampf', 'Duell'],
    magic: ['Zauberei', 'Heilung', 'Beschwörung', 'Elementar', 'Schutzmagie'],
    social: ['Überreden', 'Täuschung', 'Einschüchtern', 'Diplomatie', 'Führung'],
    exploration: ['Spurenlesen', 'Überleben', 'Klettern', 'Schleichen', 'Wahrnehmung'],
    knowledge: ['Geschichte', 'Arkane Kunde', 'Natur', 'Religion', 'Untersuchen'],
    craft: ['Alchemie', 'Schmieden', 'Schlösser knacken', 'Fallen entschärfen', 'Handwerk']
  };

  const getSkillByName = (name: string): Skill | undefined => {
    return skills.find(s => s.name === name);
  };

  const canLevelUp = (skillName: string): boolean => {
    const skill = getSkillByName(skillName);
    const currentLevel = skill?.level || 0;
    return availableSkillPoints > 0 && currentLevel < (skill?.max || 5);
  };

  const levelUpSkill = (skillName: string) => {
    if (!player || !canLevelUp(skillName)) return;
    
    const skill = getSkillByName(skillName);
    const newLevel = (skill?.level || 0) + 1;
    
    // If skill doesn't exist, create it
    if (!skill) {
      const newSkill: Skill = {
        name: skillName,
        level: 1,
        max: 5,
        description: getSkillDescription(skillName)
      };
      addPlayerSkill(player.id, newSkill);
    } else {
      updatePlayerSkill(player.id, skillName, newLevel);
    }
  };

  const getSkillDescription = (skillName: string): string => {
    const descriptions: Record<string, string> = {
      'Kampf': 'Nahkampffertigkeiten mit Waffen und waffenlosem Kampf',
      'Verteidigung': 'Blocken, Parieren und defensive Manöver',
      'Bogenschießen': 'Präzision mit Bögen und Fernkampfwaffen',
      'Zweihandkampf': 'Führung schwerer zweihändiger Waffen',
      'Duell': 'Finesse und Geschicklichkeit im Einzelkampf',
      'Zauberei': 'Grundlagen der Magie und Zaubersprüche',
      'Heilung': 'Magische und mundane Heilfertigkeiten',
      'Beschwörung': 'Herbeirufen von Kreaturen und Objekten',
      'Elementar': 'Kontrolle über die Elemente',
      'Schutzmagie': 'Defensive Zauber und Bannsprüche',
      'Überreden': 'Andere durch Argumente überzeugen',
      'Täuschung': 'Lügen und Verstellung meistern',
      'Einschüchtern': 'Furcht und Respekt einflößen',
      'Diplomatie': 'Verhandlung und Konfliktlösung',
      'Führung': 'Andere inspirieren und anleiten',
      'Spurenlesen': 'Spuren verfolgen und interpretieren',
      'Überleben': 'In der Wildnis zurechtkommen',
      'Klettern': 'Schwierige Oberflächen erklimmen',
      'Schleichen': 'Unentdeckt bewegen',
      'Wahrnehmung': 'Aufmerksamkeit für Details',
      'Geschichte': 'Wissen über vergangene Ereignisse',
      'Arkane Kunde': 'Verständnis magischer Phänomene',
      'Natur': 'Kenntnisse über Flora und Fauna',
      'Religion': 'Wissen über Götter und Glauben',
      'Untersuchen': 'Hinweise finden und analysieren',
      'Alchemie': 'Tränke und magische Substanzen brauen',
      'Schmieden': 'Waffen und Rüstungen herstellen',
      'Schlösser knacken': 'Mechanische Verschlüsse öffnen',
      'Fallen entschärfen': 'Gefahren erkennen und beseitigen',
      'Handwerk': 'Allgemeine Fertigungsfertigkeiten'
    };
    return descriptions[skillName] || 'Eine nützliche Fertigkeit für Abenteurer';
  };

  const getSkillIcon = (category: string) => {
    const icons = {
      combat: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
      magic: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01",
      social: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
      exploration: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9",
      knowledge: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
      craft: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
    };
    return icons[category as keyof typeof icons] || icons.combat;
  };

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

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto scroll-fantasy pr-2">
      {/* Skill Points Display */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3 border border-amber-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="font-semibold text-amber-900">Verfügbare Fertigkeitspunkte</span>
          </div>
          <span className="text-xl font-bold text-amber-700">{availableSkillPoints}</span>
        </div>
        <div className="text-xs text-amber-600 mt-1">
          Steige auf Level {(player.level || 1) + 1} auf, um mehr Punkte zu erhalten
        </div>
      </div>

      {/* Skill Categories */}
      {Object.entries(skillCategories).map(([category, categorySkills]) => (
        <div key={category} className="space-y-2">
          <div className="flex items-center gap-2 pb-2 border-b border-amber-200">
            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getSkillIcon(category)} />
            </svg>
            <h3 className="font-semibold text-amber-900 capitalize">
              {category === 'combat' ? 'Kampf' :
               category === 'magic' ? 'Magie' :
               category === 'social' ? 'Soziales' :
               category === 'exploration' ? 'Erkundung' :
               category === 'knowledge' ? 'Wissen' :
               category === 'craft' ? 'Handwerk' : category}
            </h3>
          </div>
          
          <div className="grid gap-2">
            {categorySkills.map((skillName) => {
              const skill = getSkillByName(skillName);
              const currentLevel = skill?.level || 0;
              const maxLevel = skill?.max || 5;
              const canLevel = canLevelUp(skillName);
              
              return (
                <div
                  key={skillName}
                  className={`bg-white rounded-lg p-3 border transition-all cursor-pointer ${
                    selectedSkill === skillName 
                      ? 'border-amber-400 bg-amber-50 shadow-md' 
                      : 'border-amber-200 hover:border-amber-300 hover:bg-amber-50/50'
                  }`}
                  onClick={() => setSelectedSkill(selectedSkill === skillName ? null : skillName)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-amber-900">{skillName}</span>
                    <div className="flex items-center gap-2">
                      {/* Skill Level Dots */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: maxLevel }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-3 h-3 rounded-full border transition-all ${
                              i < currentLevel 
                                ? 'bg-amber-500 border-amber-600' 
                                : 'bg-amber-100 border-amber-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-amber-600 font-medium min-w-[30px]">
                        {currentLevel}/{maxLevel}
                      </span>
                      {canLevel && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            levelUpSkill(skillName);
                          }}
                          className="ml-2 w-6 h-6 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold transition-colors"
                          title="Fertigkeit verbessern"
                        >
                          +
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {selectedSkill === skillName && (
                    <div className="border-t border-amber-200 pt-2 mt-2">
                      <p className="text-xs text-amber-700 mb-2">
                        {skill?.description || getSkillDescription(skillName)}
                      </p>
                      
                      {currentLevel > 0 && (
                        <div className="space-y-1">
                          <div className="text-xs font-medium text-amber-800">Level-Boni:</div>
                          {Array.from({ length: currentLevel }).map((_, i) => (
                            <div key={i} className="text-xs text-amber-600 flex items-center gap-1">
                              <span className="w-4 h-4 bg-amber-500 text-white rounded-full flex items-center justify-center text-[10px]">
                                {i + 1}
                              </span>
                              <span>
                                {i === 0 && "Grundfertigkeit erlernt"}
                                {i === 1 && "Verbesserte Effizienz (+1 Bonus)"}
                                {i === 2 && "Fortgeschrittene Techniken (+2 Bonus)"}
                                {i === 3 && "Expertenfertigkeiten (+3 Bonus)"}
                                {i === 4 && "Meisterhafte Beherrschung (+4 Bonus)"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {currentLevel < maxLevel && (
                        <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                          <div className="text-xs font-medium text-green-800 mb-1">
                            Nächstes Level ({currentLevel + 1}):
                          </div>
                          <div className="text-xs text-green-700">
                            {currentLevel === 0 && "Erlernt die Grundlagen dieser Fertigkeit"}
                            {currentLevel === 1 && "Erhöht Effizienz und Präzision"}
                            {currentLevel === 2 && "Schaltet fortgeschrittene Techniken frei"}
                            {currentLevel === 3 && "Ermöglicht Expertenmanöver"}
                            {currentLevel === 4 && "Erreicht meisterhafte Perfektion"}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {skills.length === 0 && (
        <div className="text-center py-8">
          <svg className="w-16 h-16 mx-auto text-amber-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <p className="text-amber-600 mb-2">Noch keine Fertigkeiten erlernt</p>
          <p className="text-xs text-amber-500">Klicke auf eine Fertigkeit, um sie zu erlernen</p>
        </div>
      )}
    </div>
  );
}