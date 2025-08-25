'use client';

import { useState } from 'react';
import { Character, Skill, Race, Gender, CharacterClass } from '@/schemas/character';
import { 
  generateCharacter, 
  characterClasses
} from '@/lib/character/characterGenerator';
import { skillDefinitions, SkillName } from '@/lib/character/skillSystem';
import { getRaceDisplayName, getGenderDisplayName } from '@/lib/character/portraitSystem';
import { getClassWeaponInfo } from '@/lib/character/classWeaponSystem';
import { useTranslation } from '@/lib/hooks/useTranslation';
import PortraitSelector from './PortraitSelector';
import Tooltip from './ui/Tooltip';
import { getGermanTerm } from '@/lib/i18n/germanTerms';
import type { StatDistribution, CharacterClass as GenCharacterClass } from '@/lib/character/characterGenerator';
import type { TermKey } from '@/lib/i18n/germanTerms';

interface CharacterCreatorProps {
  onCharacterCreated: (character: Character) => void;
  onClose: () => void;
}

export default function CharacterCreator({ onCharacterCreated, onClose }: CharacterCreatorProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Character data
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<CharacterClass>('warrior');
  const [selectedRace, setSelectedRace] = useState<Race>('human');
  const [selectedGender, setSelectedGender] = useState<Gender>('male');
  const [selectedSkills, setSelectedSkills] = useState<SkillName[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [generateBackstory, setGenerateBackstory] = useState(true);
  
  // Map stat keys to tooltip term keys (type-safe, no any-casts)
  const statKeyMap: Record<keyof StatDistribution, TermKey> = {
    strength: 'strength',
    dexterity: 'dexterity',
    constitution: 'constitution',
    intelligence: 'intelligence',
    wisdom: 'wisdom',
    charisma: 'charisma',
  };
  
  const steps = [
    { title: 'Name & Klasse', description: 'Grundlegende Charakterinformationen' },
    { title: 'Rasse & Portrait', description: 'Rasse und Aussehen wählen' },
  { title: 'Attribute', description: 'Verteilung der Charakterwerte (4d6, niedrigsten ablegen)' },
    { title: 'Fertigkeiten', description: 'Zusätzliche Fähigkeiten wählen' },
    { title: 'Ausrüstung', description: 'Waffen und Rüstung wählen' },
    { title: 'Hintergrund', description: 'Charaktergeschichte und Details' },
    { title: 'Bestätigung', description: 'Charaktererstellung abschließen' }
  ];

  

  const handleCreateCharacter = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!name.trim() || !selectedClass) {
        throw new Error('Name und Klasse sind erforderlich');
      }

      const character = await generateCharacter(
        name, 
        selectedClass,
        {
          race: selectedRace,
          gender: selectedGender,
          generateBackstory,
          customEquipment: selectedEquipment
        }
      );

      // Add selected skills
      const additionalSkills: Skill[] = selectedSkills
        .filter(skillName => !character.skills.some(s => s.name === skillName))
        .map(skillName => ({
          name: skillDefinitions[skillName]?.name || skillName,
          level: 1,
          max: 5,
          description: skillDefinitions[skillName]?.description
        }));
      
      character.skills.push(...additionalSkills);

      onCharacterCreated(character);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler bei der Charaktererstellung');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Charaktername</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-amber-200 rounded-lg focus:border-amber-400 transition-colors"
                  placeholder="Gib deinem Charakter einen Namen..."
                />
                <button
                  onClick={async () => {
                    setLoading(true);
                    const res = await fetch('/api/ai/generate-name', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ class: selectedClass, race: selectedRace, gender: selectedGender }),
                    });
                    const data = await res.json();
                    setName(data.name);
                    setLoading(false);
                  }}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors disabled:opacity-50"
                >
                  {loading ? '...' : '🎲'}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Klasse</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(Object.entries(characterClasses) as Array<[string, GenCharacterClass]>).map(([key, classData]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedClass(key as CharacterClass)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedClass === key
                        ? 'border-amber-400 bg-amber-50'
                        : 'border-amber-200 hover:border-amber-300'
                    }`}
                  >
                    <h3 className="font-semibold text-lg">{classData.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{classData.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {classData.primaryStats.map((stat) => {
                        const term = getGermanTerm(statKeyMap[stat]);
                        return (
                        <Tooltip key={stat} content={`${term?.title || t(`character.stats.${stat}`)}\n${term?.description || ''}`}>
                          <span
                            className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded cursor-help"
                          >
                            {t(`character.stats.${stat}`)}
                          </span>
                        </Tooltip>
                        );
                      })}
                    </div>
                    {/* Show weapon restrictions for selected class */}
                    {selectedClass === key && (
                      <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
                        {(() => {
                          const weaponInfo = getClassWeaponInfo(key as CharacterClass);
                          return (
                            <div>
                              <div><strong>Primärwaffen:</strong> {weaponInfo.weaponRestrictions.primary.slice(0, 3).join(', ')}{weaponInfo.weaponRestrictions.primary.length > 3 ? '...' : ''}</div>
                              <div className="mt-1"><strong>Verboten:</strong> {weaponInfo.weaponRestrictions.forbidden.slice(0, 2).join(', ')}{weaponInfo.weaponRestrictions.forbidden.length > 2 ? '...' : ''}</div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">Rasse und Portrait</h3>
              <p className="text-gray-600">Wähle die Rasse deines Charakters und sein Aussehen</p>
            </div>
            
            <PortraitSelector
              selectedClass={selectedClass}
              selectedRace={selectedRace}
              selectedGender={selectedGender}
              onRaceChange={setSelectedRace}
              onGenderChange={setSelectedGender}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Attribute werden zufällig gewürfelt (4d6, niedrigsten Würfel weglassen).
              </p>
            </div>
          </div>
        );

      case 3:
        const availableSkills = Object.entries(skillDefinitions)
          .filter(([skillName]) => 
            selectedClass && 
            !characterClasses[selectedClass].startingSkills.includes(skillName as SkillName)
          );
        
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Zusätzliche Fertigkeiten (Optional - max. 3)
              </label>
              <p className="text-sm text-gray-600 mb-4">
                Wähle zusätzliche Fertigkeiten, die zu deinem Charakter passen.
                Deine Klasse bringt bereits Startfertigkeiten mit.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {availableSkills.map(([skillName, skillDef]) => (
                <button
                  key={skillName}
                  onClick={() => {
                    const isSelected = selectedSkills.includes(skillName as SkillName);
                    if (isSelected) {
                      setSelectedSkills(prev => prev.filter(s => s !== skillName));
                    } else if (selectedSkills.length < 3) {
                      setSelectedSkills(prev => [...prev, skillName as SkillName]);
                    }
                  }}
                  disabled={!selectedSkills.includes(skillName as SkillName) && selectedSkills.length >= 3}
                  className={`p-3 rounded-lg border-2 text-left transition-all disabled:opacity-50 ${
                    selectedSkills.includes(skillName as SkillName)
                      ? 'border-amber-400 bg-amber-50'
                      : 'border-amber-200 hover:border-amber-300'
                  }`}
                >
                  <h4 className="font-medium">{skillDef.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{skillDef.description}</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {t(`character.skills.${skillDef.category.toLowerCase()}`)}
                  </span>
                </button>
              ))}
            </div>

            {selectedSkills.length > 0 && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium">Ausgewählte Fertigkeiten:</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedSkills.map(skillName => (
                    <span
                      key={skillName}
                      className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded"
                    >
                      {skillDefinitions[skillName].name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 4: {
        const classData = characterClasses[selectedClass];
        if (!classData) return null;

        const availableEquipment = classData.startingItems;

        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Ausrüstung wählen
              </label>
              <p className="text-sm text-gray-600 mb-4">
                Wähle die Startausrüstung für deinen Charakter.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {availableEquipment.map((itemKey) => {
                // const item = itemTemplates[itemKey];
                

                const isSelected = selectedEquipment.includes(itemKey);

                return (
                  <button
                    key={itemKey}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedEquipment(prev => prev.filter(i => i !== itemKey));
                      } else {
                        setSelectedEquipment(prev => [...prev, itemKey]);
                      }
                    }}
                    className={`p-3 rounded-lg border-2 text-left transition-all disabled:opacity-50 ${
                      isSelected
                        ? 'border-amber-400 bg-amber-50'
                        : 'border-amber-200 hover:border-amber-300'
                    }`}
                  >
                    <h4 className="font-medium">{itemKey}</h4>
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Hintergrundgeschichte</h3>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={generateBackstory}
                  onChange={(e) => setGenerateBackstory(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">
                  Automatisch eine KI-generierte Hintergrundgeschichte erstellen
                </span>
              </label>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2">Was wird generiert?</h4>
              <ul className="text-sm space-y-1">
                <li>• Herkunft und frühes Leben</li>
                <li>• Persönlichkeitsmerkmale</li>
                <li>• Motivation für Abenteuer</li>
                <li>• Charakterschwächen</li>
                <li>• Wichtige Bindungen</li>
                <li>• Persönliche Ideale und Ängste</li>
              </ul>
            </div>

            {!generateBackstory && (
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Du kannst die Hintergrundgeschichte später manuell ausfüllen oder 
                  jederzeit eine KI-generierte Geschichte erstellen lassen.
                </p>
              </div>
            )}
          </div>
        );

      case 6: {
        const classData = selectedClass ? characterClasses[selectedClass] : null;
        
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Charakterzusammenfassung</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Grunddaten</h4>
                  <p><strong>Name:</strong> {name}</p>
                  <p><strong>Klasse:</strong> {classData?.name}</p>
                  <p><strong>Rasse:</strong> {getRaceDisplayName(selectedRace)}</p>
                  <p><strong>Geschlecht:</strong> {getGenderDisplayName(selectedGender)}</p>
                  <p><strong>Methode:</strong> Gewürfelt</p>
                </div>

                
              </div>

              <div className="space-y-4">
                {selectedSkills.length > 0 && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Zusätzliche Fertigkeiten</h4>
                    {selectedSkills.map(skillName => (
                      <p key={skillName}>{skillDefinitions[skillName].name}</p>
                    ))}
                  </div>
                )}

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Hintergrund</h4>
                  <p>{generateBackstory ? 'KI-generiert' : 'Manuell ausfüllen'}</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{error}</p>
              </div>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 sm:p-4">
  <div className="bg-white rounded-none sm:rounded-xl shadow-2xl w-full h-full sm:w-full sm:max-w-[min(95vw,1400px)] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Charakter erstellen</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>

          {/* Progress */}
          <div className="flex items-center">
            {steps.map((stepData, index) => (
              <div key={index} className={`flex items-center ${index < steps.length - 1 ? 'flex-grow' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                  index <= step 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-1 mx-2 rounded flex-grow ${
                    index < step ? 'bg-amber-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-2 text-center">
            <h3 className="font-semibold">{steps[step].title}</h3>
            <p className="text-sm text-gray-600">{steps[step].description}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderStep()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between">
          <button
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
            className="px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-gray-300 hover:border-gray-400"
          >
            Zurück
          </button>

          {step < steps.length - 1 ? (
            <button
              onClick={() => {
                setError(null);
                setStep(s => s + 1);
              }}
              disabled={(step === 0 && (!name.trim() || !selectedClass))}
              className="px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-amber-500 text-white hover:bg-amber-600"
            >
              Weiter
            </button>
          ) : (
            <button
              onClick={handleCreateCharacter}
              disabled={loading}
              className="px-8 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-green-500 text-white hover:bg-green-600 flex items-center gap-2"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              Charakter erstellen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}