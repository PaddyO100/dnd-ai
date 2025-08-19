'use client';

import type { Race } from '@/schemas/character';
import { RACE_DATA } from '@/lib/character/raceSystem';

interface RaceInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  race: Race;
}

export default function RaceInfoModal({ isOpen, onClose, race }: RaceInfoModalProps) {
  if (!isOpen) return null;

  const raceData = RACE_DATA[race];
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {raceData.displayName}
            </h2>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {raceData.size === 'medium' ? 'Mittelgroß' : raceData.size === 'small' ? 'Klein' : 'Groß'} • {raceData.speed} Meter Geschwindigkeit
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Description */}
          <section>
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              Beschreibung
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {raceData.description}
            </p>
          </section>

          {/* Stat Bonuses */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Attributsboni
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {Object.entries(raceData.statBonuses).map(([stat, bonus]) => (
                <div key={stat} className={`text-center p-3 rounded-lg ${bonus > 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-700'}`}>
                  <div className="font-medium text-sm text-gray-900 dark:text-white">
                    {stat.toUpperCase()}
                  </div>
                  <div className={`font-bold ${bonus > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                    {bonus > 0 ? `+${bonus}` : '—'}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Racial Traits */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Rassenfähigkeiten
            </h3>
            <div className="space-y-4">
              {raceData.racialTraits.map((trait, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    {trait.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {trait.description}
                  </p>
                  {trait.effects && trait.effects.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {trait.effects.map((effect, effectIndex) => (
                        <span key={effectIndex} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                          {effect.type}: {effect.value}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Languages & Proficiencies */}
          <div className="grid md:grid-cols-2 gap-6">
            <section>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                Sprachen
              </h3>
              <div className="space-y-2">
                {raceData.languages.map((language, index) => (
                  <div key={index} className="bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
                    <span className="text-blue-900 dark:text-blue-100">{language}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Fertigkeiten
              </h3>
              <div className="space-y-2">
                {raceData.proficiencies.length > 0 ? (
                  raceData.proficiencies.map((proficiency, index) => (
                    <div key={index} className="bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg">
                      <span className="text-amber-900 dark:text-amber-100">{proficiency}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 dark:text-gray-400 text-sm italic">
                    Keine besonderen Fertigkeiten
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 text-center">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Bereit, als <strong>{raceData.displayName}</strong> zu spielen?
            </p>
            <button
              onClick={onClose}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Rasse wählen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
