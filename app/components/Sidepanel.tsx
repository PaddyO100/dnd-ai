"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useGameStore } from '@/lib/state/gameStore';
import { getCurrentDirectorState } from '@/lib/engine/director';
import type { DirectorState, PacingType, TensionLevel } from '@/lib/engine/director/types';
import QuestsTab from './tabs/QuestsTab';
import SpellsTab from './tabs/SpellsTab';
import SavesTab from './tabs/SavesTab';
import InventoryTab from './tabs/InventoryTab';
import SkillsTab from './tabs/SkillsTab';

type Tab = 'character' | 'inventory' | 'skills' | 'spells' | 'quests' | 'director' | 'saves';


interface BarProps {
  label: string;
  value?: number;
  max: number;
  color: string;
}

const Bar: React.FC<BarProps> = ({ label, value, max, color }) => {
  const pct = value !== undefined ? Math.max(0, Math.min(1, value / max)) : 0;
  return (
    <div className="flex items-center gap-1">
      <span className="text-[10px] text-amber-700 dark:text-amber-300 font-medium">{label}</span>
      <div className="relative w-12 h-2 bg-amber-100 dark:bg-amber-900/30 rounded-full overflow-hidden">
        <div className={`absolute left-0 top-0 h-2 rounded-full ${color}`} style={{ width: `${pct * 100}%` }} />
      </div>
      <span className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold">{value ?? '—'}</span>
    </div>
  );
};

export default function Sidepanel() {
  const { inventory, quests, party, history, setSelectedPlayer } = useGameStore();
  const [tab, setTab] = useState<Tab>('character');
  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  const player = useMemo(() => party.find((p) => p.id === (activeId ?? party[0]?.id)), [party, activeId]);
  
  // Real-time director analysis
  const directorState = useMemo(() => {
    if (history.length === 0 || party.length === 0) return null;
    return getCurrentDirectorState(history, party);
  }, [history, party]);

  useEffect(() => {
    if (!activeId && party[0]) { setActiveId(party[0].id); setSelectedPlayer(party[0].id); }
  }, [activeId, party, setSelectedPlayer]);

  // Image generation removed.

  return (
    <aside className="card-fantasy p-4 w-full space-y-4">
      {/* Player selector (only if >1) */}
      {party.length > 1 && (
        <select
          className="select text-sm"
          value={activeId}
          onChange={(e) => { setActiveId(e.target.value); setSelectedPlayer(e.target.value); }}
        >
          {party.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — {p.cls}
            </option>
          ))}
        </select>
      )}

      {/* Mini party strip */}
      {party.length > 0 && (
        <div className="flex gap-3 overflow-x-auto py-2 px-1">
          {party.map((p) => (
            <div 
              key={p.id} 
              className={`flex items-center gap-2 text-xs p-2 rounded-lg cursor-pointer transition-all ${
                activeId === p.id 
                  ? 'bg-amber-100 border-2 border-amber-300 shadow-md' 
                  : 'bg-amber-50/50 border border-amber-200 hover:bg-amber-100'
              }`}
              onClick={() => { setActiveId(p.id); setSelectedPlayer(p.id); }}
            >
              <Image 
                unoptimized 
                src={p.portraitUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=amber&color=fff&size=128&font-size=0.5`}
                alt={p.name}
                width={32}
                height={40}
                className="w-8 h-10 rounded object-cover border-2 border-amber-300" 
              />
              <div className="min-w-[60px]">
                <div className="font-medium leading-3 text-amber-900">{p.name}</div>
                <div className="flex flex-col gap-0.5">
                  <Bar label="HP" value={p.hp} max={20} color="bg-red-500" />
                  <Bar label="MP" value={p.mp} max={20} color="bg-blue-500" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}


    <div className="grid grid-cols-4 gap-2">
  {(['character', 'inventory', 'skills', 'spells', 'quests', 'director', 'saves'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              tab === t ? 'tab-active' : 'tab-inactive'
            }`}
          >
            {t === 'character' && 'Charakter'}
            {t === 'inventory' && 'Inventar'}
            {t === 'skills' && 'Fähigkeiten'}
            {t === 'spells' && 'Zauber'}
            {t === 'quests' && 'Quests'}
            {t === 'director' && 'Director'}
            {t === 'saves' && 'Spielstände'}
          </button>
        ))}
      </div>

      {tab === 'character' && (
        <CharacterTab
          playerId={player?.id}
          name={player?.name}
          cls={player?.cls}
          race={player?.race}
          hp={player?.hp}
          maxHp={player?.maxHp}
          mp={player?.mp}
          maxMp={player?.maxMp}
          level={player?.level}
          experience={player?.experience}
          armorClass={player?.armorClass}
          stats={player?.stats}
          skills={player?.skills}
          spells={player?.spells}
          traits={player?.traits}
          inventory={player?.inventory}
          conditions={player?.conditions}
          backstory={player?.backstory}
          portraitUrl={player?.portraitUrl}
        />
      )}

      {tab === 'inventory' && (
        <InventoryTab player={player} />
      )}

      {tab === 'skills' && (
        <SkillsTab player={player} />
      )}

      {tab === 'spells' && (
        <SpellsTab player={player} />
      )}

      {tab === 'quests' && (
        <QuestsTab quests={quests} />
      )}

  {/* Map tab removed */}

  {tab === 'director' && <DirectorTab directorState={directorState} />}

  {tab === 'saves' && <SavesTab />}
  </aside>
  );
}

import { getRaceDisplayName } from '@/lib/character/portraitSystem';

function CharacterTab(props: {
  playerId?: string;
  name?: string;
  cls?: string;
  race?: string;
  hp?: number;
  maxHp?: number;
  mp?: number;
  maxMp?: number;
  level?: number;
  experience?: number;
  armorClass?: number;
  stats?: Record<string, number>;
  skills?: any[];
  spells?: any[];
  traits?: any[];
  inventory?: any[];
  conditions?: any[];
  backstory?: any;
  portraitUrl?: string;
  // image-generation removed
}) {
  const { 
    name, cls, hp, maxHp, mp, maxMp, level, experience, armorClass, 
  stats, skills, spells, traits, inventory, conditions, backstory, 
  portraitUrl 
  } = props;
  
  if (!name) return <div className="text-center py-8 text-amber-600">Kein Charakter ausgewählt</div>;
  
  return (
    <div className="space-y-4 text-sm max-h-96 overflow-y-auto scroll-fantasy pr-2">
      {/* Character Header */}
      <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg">
        <Image 
          unoptimized 
          src={portraitUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=amber&color=fff&size=256&font-size=0.5`}
          alt={name}
          width={80}
          height={100}
          className="w-20 h-24 rounded-lg object-cover border-2 border-amber-300 shadow-md" 
        />
        <div className="flex-1">
          <div className="font-bold text-lg text-amber-900">{name}</div>
          <div className="text-amber-700 font-medium">{cls}</div>
          <div className="text-amber-700 font-medium">{getRaceDisplayName(props.race as any)}</div>
          <div className="text-xs text-amber-600 mb-2">
            Lvl {level || 1} • RK {armorClass || 10} • XP: {experience || 0}
          </div>
          
          {/* HP and MP bars with status indicators */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-600 w-6 font-semibold">HP</span>
              <div className="flex-1 bg-red-100 rounded-full h-3 relative overflow-hidden">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    (hp || 0) <= (maxHp || hp || 1) * 0.25 ? 'bg-red-700 animate-pulse' :
                    (hp || 0) <= (maxHp || hp || 1) * 0.5 ? 'bg-red-600' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.max(0, ((hp || 0) / (maxHp || hp || 1)) * 100)}%` }}
                />
              </div>
              <span className={`text-xs font-bold w-12 ${
                (hp || 0) <= (maxHp || hp || 1) * 0.25 ? 'text-red-700' : 'text-red-600'
              }`}>
                {hp}/{maxHp || hp}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-600 w-6 font-semibold">MP</span>
              <div className="flex-1 bg-blue-100 rounded-full h-3 relative overflow-hidden">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    (mp || 0) <= (maxMp || mp || 1) * 0.25 ? 'bg-blue-700 animate-pulse' :
                    (mp || 0) <= (maxMp || mp || 1) * 0.5 ? 'bg-blue-600' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.max(0, ((mp || 0) / (maxMp || mp || 1)) * 100)}%` }}
                />
              </div>
              <span className={`text-xs font-bold w-12 ${
                (mp || 0) <= (maxMp || mp || 1) * 0.25 ? 'text-blue-700' : 'text-blue-600'
              }`}>
                {mp}/{maxMp || mp}
              </span>
            </div>
            
            {/* Status indicators */}
            <div className="flex items-center gap-1 pt-1">
              {(hp || 0) <= (maxHp || hp || 1) * 0.25 && (
                <span className="text-[8px] bg-red-200 text-red-800 px-1 py-0.5 rounded animate-pulse">
                  Kritisch
                </span>
              )}
              {(mp || 0) === 0 && (
                <span className="text-[8px] bg-blue-200 text-blue-800 px-1 py-0.5 rounded">
                  Erschöpft
                </span>
              )}
              {(hp || 0) === (maxHp || hp) && (mp || 0) === (maxMp || mp) && (
                <span className="text-[8px] bg-green-200 text-green-800 px-1 py-0.5 rounded">
                  Gesund
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Stats Grid */}
      {stats && (
        <div>
          <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Attribute
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(stats).map(([k, v]) => {
              const modifier = Math.floor((v - 10) / 2);
              const isHighStat = v >= 16;
              const isLowStat = v <= 8;
              return (
                <div key={k} className={`border rounded-lg p-2 text-center transition-all hover:shadow-sm ${
                  isHighStat ? 'bg-green-50 border-green-200' :
                  isLowStat ? 'bg-red-50 border-red-200' : 
                  'bg-amber-50 border-amber-200'
                }`}>
                  <div className={`text-[10px] uppercase font-semibold ${
                    isHighStat ? 'text-green-600' :
                    isLowStat ? 'text-red-600' : 'text-amber-600'
                  }`}>
                    {k === 'str' ? 'STÄ' :
                     k === 'dex' ? 'GES' :
                     k === 'con' ? 'KON' :
                     k === 'int' ? 'INT' :
                     k === 'wis' ? 'WEI' :
                     k === 'cha' ? 'CHA' : k.toUpperCase()}
                  </div>
                  <div className={`text-lg font-bold ${
                    isHighStat ? 'text-green-800' :
                    isLowStat ? 'text-red-800' : 'text-amber-800'
                  }`}>
                    {v}
                  </div>
                  <div className={`text-[9px] font-medium ${
                    isHighStat ? 'text-green-500' :
                    isLowStat ? 'text-red-500' : 'text-amber-500'
                  }`}>
                    {modifier >= 0 ? '+' : ''}{modifier}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Quick Stats Summary */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-amber-50 rounded p-2 border border-amber-200">
              <span className="text-amber-600 font-medium">Rettungswürfe:</span>
              <div className="text-amber-800 mt-1">
                {Object.entries(stats).slice(0, 3).map(([k, v]) => {
                  const modifier = Math.floor((v - 10) / 2) + (level || 1) >= 3 ? 2 : 0;
                  return (
                    <div key={k} className="flex justify-between">
                      <span>{k.toUpperCase()}:</span>
                      <span className="font-mono">+{modifier}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="bg-amber-50 rounded p-2 border border-amber-200">
              <span className="text-amber-600 font-medium">Fertigkeiten:</span>
              <div className="text-amber-800 mt-1">
                <div className="flex justify-between">
                  <span>Initiative:</span>
                  <span className="font-mono">+{Math.floor(((stats.dex || 10) - 10) / 2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Wahrnehmung:</span>
                  <span className="font-mono">+{Math.floor(((stats.wis || 10) - 10) / 2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Überzeugung:</span>
                  <span className="font-mono">+{Math.floor(((stats.cha || 10) - 10) / 2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conditions */}
      {conditions && conditions.length > 0 && (
        <div>
          <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Status-Effekte
          </h4>
          <div className="space-y-1">
            {conditions.map((condition: any, i: number) => (
              <div key={i} className={`text-xs px-2 py-1 rounded-full inline-block mr-1 ${
                condition.type === 'buff' ? 'bg-green-100 text-green-800' :
                condition.type === 'debuff' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {condition.name}
                {condition.duration !== undefined && condition.duration > 0 && (
                  <span className="ml-1">({condition.duration})</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Traits */}
      {traits && traits.length > 0 && (
        <div>
          <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Charaktereigenschaften
          </h4>
          <div className="space-y-3">
            {/* Racial Traits */}
            {traits.filter((trait: any) => trait.type === 'racial').length > 0 && (
              <div>
                <h5 className="text-xs font-semibold text-green-700 mb-1 uppercase tracking-wide">Rassenfähigkeiten</h5>
                <div className="space-y-2">
                  {traits.filter((trait: any) => trait.type === 'racial').map((trait: any, i: number) => (
                    <div key={i} className="bg-green-50 rounded-lg p-2 border border-green-200">
                      <div className="font-medium text-green-900 text-sm">{trait.name}</div>
                      <p className="text-xs text-green-700 mt-1">{trait.description}</p>
                      {trait.effects && trait.effects.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {trait.effects.map((effect: any, ei: number) => (
                            <span key={ei} className="text-[9px] bg-green-100 text-green-600 px-1 py-0.5 rounded">
                              {effect.type}: {effect.value} {effect.target}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Class Traits */}
            {traits.filter((trait: any) => trait.type === 'class').length > 0 && (
              <div>
                <h5 className="text-xs font-semibold text-blue-700 mb-1 uppercase tracking-wide">Klassenfähigkeiten</h5>
                <div className="space-y-2">
                  {traits.filter((trait: any) => trait.type === 'class').map((trait: any, i: number) => (
                    <div key={i} className="bg-blue-50 rounded-lg p-2 border border-blue-200">
                      <div className="font-medium text-blue-900 text-sm">{trait.name}</div>
                      <p className="text-xs text-blue-700 mt-1">{trait.description}</p>
                      {/* Special display for weapon restrictions */}
                      {trait.name === 'Waffenbeherrschung' && trait.effects?.[0]?.condition && (
                        <div className="mt-1 text-[10px] text-blue-600">
                          <strong>Primärwaffen:</strong> {trait.effects[0].condition}
                        </div>
                      )}
                      {trait.name === 'Waffenrestriktionen' && trait.effects?.[0]?.condition && (
                        <div className="mt-1 text-[10px] text-red-600">
                          <strong>Verboten:</strong> {trait.effects[0].condition}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Other Traits */}
            {traits.filter((trait: any) => !trait.type || !['racial', 'class'].includes(trait.type)).length > 0 && (
              <div>
                <h5 className="text-xs font-semibold text-purple-700 mb-1 uppercase tracking-wide">Weitere Eigenschaften</h5>
                <div className="space-y-2">
                  {traits.filter((trait: any) => !trait.type || !['racial', 'class'].includes(trait.type)).map((trait: any, i: number) => (
                    <div key={i} className="bg-purple-50 rounded-lg p-2 border border-purple-200">
                      <div className="font-medium text-purple-900 text-sm">{trait.name}</div>
                      <p className="text-xs text-purple-700 mt-1">{trait.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backstory */}
      {backstory && (
        <div>
          <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Hintergrundgeschichte
          </h4>
          <div className="bg-amber-50 rounded-lg p-3 space-y-2">
            {backstory.origin && (
              <div>
                <span className="font-medium text-amber-800">Herkunft: </span>
                <span className="text-amber-700 text-xs">{backstory.origin}</span>
              </div>
            )}
            {backstory.personality && (
              <div>
                <span className="font-medium text-amber-800">Persönlichkeit: </span>
                <span className="text-amber-700 text-xs">{backstory.personality}</span>
              </div>
            )}
            {backstory.motivation && (
              <div>
                <span className="font-medium text-amber-800">Motivation: </span>
                <span className="text-amber-700 text-xs">{backstory.motivation}</span>
              </div>
            )}
            {backstory.flaw && (
              <div>
                <span className="font-medium text-amber-800">Schwäche: </span>
                <span className="text-amber-700 text-xs">{backstory.flaw}</span>
              </div>
            )}
            {backstory.background && (
              <p className="text-xs text-amber-600 italic border-t border-amber-200 pt-2">
                {backstory.background}
              </p>
            )}
          </div>
        </div>
      )}
      
  {/* portrait generation removed */}
    </div>
  );
}

function DirectorTab({ directorState }: { directorState: DirectorState | null }) {
  if (!directorState) {
    return (
      <div className="text-center py-8 text-amber-600">
        <svg className="w-16 h-16 mx-auto text-amber-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <p>Noch keine Daten für Director-Analyse</p>
        <p className="text-xs mt-1">Spiele einige Züge, um Empfehlungen zu erhalten</p>
      </div>
    );
  }

  const { pacing, spotlight, tension, difficulty, encounterSuggestions } = directorState;

  const getPacingColor = (type: PacingType) => {
    const colors = {
      combat: 'bg-red-100 text-red-800',
      social: 'bg-blue-100 text-blue-800',
      exploration: 'bg-green-100 text-green-800',
      puzzle: 'bg-purple-100 text-purple-800',
      downtime: 'bg-gray-100 text-gray-800'
    };
    return colors[type];
  };

  const getTensionColor = (level: TensionLevel) => {
    const colors = {
      low: 'bg-blue-500',
      building: 'bg-yellow-500',
      high: 'bg-orange-500',
      climax: 'bg-red-500',
      resolution: 'bg-green-500'
    };
    return colors[level];
  };

  const getTensionWidth = (score: number) => `${Math.min(score * 100, 100)}%`;

  return (
    <div className="space-y-4 text-sm max-h-96 overflow-y-auto scroll-fantasy pr-2">
      {/* Pacing Analysis */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
        <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Pacing-Analyse
        </h3>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-purple-700">Aktuell:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPacingColor(pacing.currentPacing)}`}>
              {pacing.currentPacing === 'combat' ? 'Kampf' :
               pacing.currentPacing === 'social' ? 'Sozial' :
               pacing.currentPacing === 'exploration' ? 'Erkundung' :
               pacing.currentPacing === 'puzzle' ? 'Rätsel' : 'Ruhe'}
            </span>
          </div>
          
          <div className="text-xs text-purple-700">
            <div>Letzter Kampf: vor {pacing.timeSinceLastCombat} Zügen</div>
            <div>Letzte soziale Szene: vor {pacing.timeSinceLastSocial} Zügen</div>
            <div>Letzte Erkundung: vor {pacing.timeSinceLastExploration} Zügen</div>
          </div>
          
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-purple-700">Abwechslung:</span>
              <span className="text-purple-900 font-medium">{Math.round(pacing.varietyScore * 100)}%</span>
            </div>
            <div className="w-full bg-purple-200 rounded-full h-2 mt-1">
              <div className="bg-purple-500 h-2 rounded-full transition-all" style={{ width: `${pacing.varietyScore * 100}%` }} />
            </div>
          </div>
          
          <div className="bg-purple-100 rounded p-2 text-xs text-purple-800 mt-2">
            <strong>Empfehlung:</strong> {pacing.recommendation}
          </div>
        </div>
      </div>

      {/* Spotlight Analysis */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          </svg>
          Spotlight-Balance
        </h3>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-blue-700">Balance-Score:</span>
            <span className="text-blue-900 font-medium">{Math.round(spotlight.balanceScore * 100)}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${spotlight.balanceScore * 100}%` }} />
          </div>
          
          {spotlight.suggestedCharacter && (
            <div className="bg-blue-100 rounded p-2 text-xs text-blue-800">
              <strong>Spotlight-Empfehlung:</strong> {spotlight.reason}
            </div>
          )}
          
          <div className="space-y-1">
            {Object.entries((spotlight as any).characterInvolvement ?? (spotlight as any).characterSpotlights ?? {}).map(([name, data]: [string, any]) => (
              <div key={name} className="flex items-center justify-between text-xs">
                <span className="text-blue-700">{name}:</span>
                <div className="flex items-center gap-2">
                  <span className="text-blue-900">{data.recentActivity} Aktivitäten</span>
                  <div className="w-12 bg-blue-200 rounded-full h-1">
                    <div 
                      className="bg-blue-500 h-1 rounded-full" 
                      style={{ width: `${Math.min((data.recentActivity || 0) * 25, 100)}%` }} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tension Analysis */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
        <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Spannungs-Level
        </h3>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-amber-700">Aktuell:</span>
            <span className="text-amber-900 font-medium capitalize">
              {tension.currentLevel === 'low' ? 'Niedrig' :
               tension.currentLevel === 'building' ? 'Aufbauend' :
               tension.currentLevel === 'high' ? 'Hoch' :
               tension.currentLevel === 'climax' ? 'Höhepunkt' : 'Auflösung'}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              tension.trajectory === 'rising' ? 'bg-orange-100 text-orange-800' :
              tension.trajectory === 'falling' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {tension.trajectory === 'rising' ? '↗ Steigend' :
               tension.trajectory === 'falling' ? '↘ Fallend' : '→ Stabil'}
            </span>
          </div>
          
          <div className="w-full bg-amber-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all ${getTensionColor(tension.currentLevel)}`}
              style={{ width: getTensionWidth(tension.intensityScore) }}
            />
          </div>
          
          <div className="bg-amber-100 rounded p-2 text-xs text-amber-800">
            <strong>Nächster Story-Beat:</strong> {tension.nextBeatSuggestion}
          </div>
        </div>
      </div>

      {/* Difficulty Analysis */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
        <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Schwierigkeits-Balance
        </h3>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-green-700">Aktuell:</span>
            <span className="text-green-900 font-medium capitalize">
              {difficulty.currentScale === 'trivial' ? 'Trivial' :
               difficulty.currentScale === 'easy' ? 'Leicht' :
               difficulty.currentScale === 'moderate' ? 'Moderat' :
               difficulty.currentScale === 'hard' ? 'Schwer' : 'Extrem'}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="text-green-700">Empfohlen:</span>
            <span className="text-green-900 font-medium capitalize">
              {difficulty.recommendation === 'trivial' ? 'Trivial' :
               difficulty.recommendation === 'easy' ? 'Leicht' :
               difficulty.recommendation === 'moderate' ? 'Moderat' :
               difficulty.recommendation === 'hard' ? 'Schwer' : 'Extrem'}
            </span>
          </div>
          
          <div className="bg-green-100 rounded p-2 text-xs text-green-800">
            <strong>Grund:</strong> {difficulty.reasoning}
          </div>
          
          {difficulty.recentChallenges.length > 0 && (
            <div className="text-xs">
              <div className="text-green-700 mb-1">Letzte Herausforderungen:</div>
              {difficulty.recentChallenges.slice(-3).map((challenge, i) => (
                <div key={i} className="flex justify-between">
                  <span>{challenge.type}</span>
                  <span className={`${
                    challenge.outcome === 'success' ? 'text-green-600' :
                    challenge.outcome === 'failure' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {challenge.outcome === 'success' ? '✓' :
                     challenge.outcome === 'failure' ? '✗' : '~'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Encounter Suggestions */}
      {encounterSuggestions.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-amber-900 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Begegnungs-Vorschläge
          </h4>
          {encounterSuggestions.map((suggestion, i) => (
            <div key={i} className="bg-white rounded border border-amber-200 hover:bg-amber-50 transition-colors">
              <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-amber-900 text-xs">{suggestion.description}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    suggestion.priority === 'high' ? 'bg-red-100 text-red-800' :
                    suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {suggestion.priority === 'high' ? 'Hoch' :
                     suggestion.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                  </span>
                </div>
                <p className="text-xs text-amber-700">{suggestion.reasoning}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DiceBox() {
  const [formula, setFormula] = useState('1d20');
  const [out, setOut] = useState<string>('');
  const [rolling, setRolling] = useState(false);

  async function roll() {
    setRolling(true);
    setOut('');
    const res = await fetch('/api/dice', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ formula }) });
    const data = await res.json();
    if (res.ok) {
      setOut(`${data.formula} → ${data.result} (${(data.rolls || []).join(',')})`);
    } else {
      setOut(data.error || 'Fehler');
    }
    setTimeout(() => setRolling(false), 1000);
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input 
          className="input text-sm" 
          value={formula} 
          onChange={(e) => setFormula(e.target.value)} 
          placeholder="z.B. 2d6+3"
        />
        <button 
          className={`btn flex items-center gap-2 ${rolling ? 'animate-pulse' : ''}`}
          onClick={roll}
          disabled={rolling}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          {rolling ? 'Würfelt...' : 'Würfeln'}
        </button>
      </div>
      
      {out && (
        <div className="bg-amber-50 rounded-lg p-3 text-center">
          <div className="font-bold text-amber-900 text-lg">{out.split(' → ')[1]}</div>
          <div className="text-xs text-amber-600">{out.split(' → ')[0]}</div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        <button className="btn-secondary text-xs" onClick={() => setFormula('1d20')}>d20</button>
        <button className="btn-secondary text-xs" onClick={() => setFormula('2d6')}>2d6</button>
        <button className="btn-secondary text-xs" onClick={() => setFormula('1d100')}>d100</button>
      </div>
    </div>
  );
}
