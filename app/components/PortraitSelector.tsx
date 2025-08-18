"use client"

import { useState } from 'react'
import Image from 'next/image'
import type { Race, Gender, CharacterClass } from '@/schemas/character'
import {
  getPortraitUrl,
  getPortraitInfo,
  getRaceDisplayName,
  getGenderDisplayName,
  getClassDisplayName,
  getAllRaces,
  getAllGenders,
  getFallbackPortraitUrl,
  isPortraitAvailable
} from '@/lib/character/portraitSystem'
import { getRaceInfo, getRacialTraits } from '@/lib/character/raceSystem'

interface PortraitSelectorProps {
  selectedClass: CharacterClass
  selectedRace: Race
  selectedGender: Gender
  onRaceChange: (race: Race) => void
  onGenderChange: (gender: Gender) => void
  showClassSelection?: boolean
  onClassChange?: (characterClass: CharacterClass) => void
}

export default function PortraitSelector({
  selectedClass,
  selectedRace,
  selectedGender,
  onRaceChange,
  onGenderChange,
  showClassSelection = false,
  onClassChange
}: PortraitSelectorProps) {
  const [imageError, setImageError] = useState(false)

  const currentPortraitUrl = isPortraitAvailable(selectedClass, selectedRace, selectedGender)
    ? getPortraitUrl(selectedClass, selectedRace, selectedGender)
    : getFallbackPortraitUrl()

  const portraitInfo = getPortraitInfo(selectedClass, selectedRace, selectedGender)

  return (
    <div className="space-y-4">
      {/* Portrait Display */}
      <div className="flex flex-col items-center space-y-3">
        <div className="relative w-48 h-48 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
          <Image
            src={imageError ? getFallbackPortraitUrl() : currentPortraitUrl}
            alt={portraitInfo.displayName}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
            onLoad={() => setImageError(false)}
          />
        </div>
        
        <div className="text-center">
          <h3 className="font-semibold text-lg">{portraitInfo.displayName}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{portraitInfo.description}</p>
        </div>
      </div>

      {/* Selection Controls */}
      <div className="space-y-4">
        {/* Class Selection (optional) */}
        {showClassSelection && onClassChange && (
          <div>
            <label className="block text-sm font-medium mb-2">Klasse</label>
            <select
              value={selectedClass}
              onChange={(e) => onClassChange(e.target.value as CharacterClass)}
              className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-white/90 dark:bg-black/40 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="warrior">{getClassDisplayName('warrior')}</option>
              <option value="mage">{getClassDisplayName('mage')}</option>
              <option value="rogue">{getClassDisplayName('rogue')}</option>
              <option value="bard">{getClassDisplayName('bard')}</option>
              <option value="paladin">{getClassDisplayName('paladin')}</option>
              <option value="ranger">{getClassDisplayName('ranger')}</option>
              <option value="druid">{getClassDisplayName('druid')}</option>
              <option value="monk">{getClassDisplayName('monk')}</option>
              <option value="warlock">{getClassDisplayName('warlock')}</option>
            </select>
          </div>
        )}

        {/* Race Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Rasse</label>
          <div className="grid grid-cols-2 gap-2">
            {getAllRaces().map((race) => (
              <button
                key={race}
                onClick={() => onRaceChange(race)}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                  selectedRace === race
                    ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/20 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {getRaceDisplayName(race)}
              </button>
            ))}
          </div>
        </div>

        {/* Gender Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Geschlecht</label>
          <div className="grid grid-cols-2 gap-2">
            {getAllGenders().map((gender) => (
              <button
                key={gender}
                onClick={() => onGenderChange(gender)}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                  selectedGender === gender
                    ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/20 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {getGenderDisplayName(gender)}
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced Race Abilities */}
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">Rassenfähigkeiten</h4>
          <div className="space-y-2">
            {(() => {
              const raceInfo = getRaceInfo(selectedRace);
              const racialTraits = getRacialTraits(selectedRace);
              return (
                <>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <strong>Stat Boni:</strong> {Object.entries(raceInfo.statBonuses)
                      .map(([stat, bonus]) => `${stat.charAt(0).toUpperCase()}${stat.slice(1)} ${bonus > 0 ? '+' : ''}${bonus}`)
                      .join(', ')}
                  </div>
                  {racialTraits.slice(0, 2).map((trait, index) => (
                    <div key={index} className="text-xs">
                      <strong className="text-indigo-600 dark:text-indigo-400">{trait.name}:</strong>
                      <span className="text-gray-600 dark:text-gray-400 ml-1">{trait.description}</span>
                    </div>
                  ))}
                  {racialTraits.length > 2 && (
                    <div className="text-xs text-gray-500 italic">
                      +{racialTraits.length - 2} weitere Fähigkeiten...
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Availability Warning */}
      {!isPortraitAvailable(selectedClass, selectedRace, selectedGender) && (
        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Portrait für diese Kombination noch nicht verfügbar. Fallback-Portrait wird verwendet.
          </p>
        </div>
      )}
    </div>
  )
}
