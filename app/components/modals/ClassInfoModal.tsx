'use client';

import type { CharacterClass } from '@/schemas/character';
import { CLASS_WEAPON_DATA } from '@/lib/character/classWeaponSystem';

interface ClassInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  characterClass: CharacterClass;
}

// Extended class information for modals
const CLASS_DETAILS: Record<CharacterClass, {
  description: string;
  primaryStats: string[];
  roleDescription: string;
  abilities: { name: string; description: string }[];
  startingEquipment: string[];
  playstyle: string;
  difficulty: 'Einfach' | 'Mittel' | 'Schwer';
}> = {
  warrior: {
    description: 'Meister des Nahkampfs und der Verteidigung. Krieger sind die Frontlinie der Gruppe und schützen ihre Verbündeten mit Stahl und Entschlossenheit.',
    primaryStats: ['Stärke', 'Konstitution'],
    roleDescription: 'Tank & Nahkämpfer',
    abilities: [
      { name: 'Kampfwut', description: 'Erhöht Schaden und Widerstand für kurze Zeit' },
      { name: 'Schildblock', description: 'Reduziert eingehenden Schaden drastisch' },
      { name: 'Kraftschlag', description: 'Mächtiger Angriff mit erhöhtem Kritik-Schaden' },
      { name: 'Verteidigungshaltung', description: 'Tauscht Beweglichkeit gegen Verteidigung' }
    ],
    startingEquipment: ['Langschwert', 'Lederrüstung', 'Heiltrank', 'Seil'],
    playstyle: 'Direkter Kampf, Schutz der Gruppe, hohe Überlebensfähigkeit',
    difficulty: 'Einfach'
  },
  mage: {
    description: 'Meister der arkanen Künste und elementaren Magie. Magier vernichten Feinde mit mächtigen Sprüchen aus sicherer Entfernung.',
    primaryStats: ['Intelligenz', 'Weisheit'],
    roleDescription: 'Fernkampf-Schadendealer & Unterstützung',
    abilities: [
      { name: 'Feuerball', description: 'Zerstörerischer Flächenschaden-Zauber' },
      { name: 'Magisches Schild', description: 'Temporärer Schutz vor physischem Schaden' },
      { name: 'Blitzschlag', description: 'Schneller Einzelziel-Elektrozauber' },
      { name: 'Teleportation', description: 'Sofortige Positionsveränderung im Kampf' }
    ],
    startingEquipment: ['Dolch', 'Manatrank (x2)', 'Antiker Schlüssel'],
    playstyle: 'Strategische Zauberverwendung, Ressourcenmanagement, Positionierung',
    difficulty: 'Schwer'
  },
  rogue: {
    description: 'Meister der Schatten und Heimlichkeit. Schurken nutzen List, Geschick und präzise Schläge um ihre Feinde zu überwältigen.',
    primaryStats: ['Geschicklichkeit', 'Intelligenz'],
    roleDescription: 'Heimlichkeit & Kritischer Schaden',
    abilities: [
      { name: 'Hinterhältiger Angriff', description: 'Enormer Schaden bei Überraschungsattacken' },
      { name: 'Schatten-Sprint', description: 'Schnelle, unentdeckte Bewegung' },
      { name: 'Schlösser knacken', description: 'Öffnet verschlossene Türen und Truhen' },
      { name: 'Giftklinge', description: 'Waffen vergiften für Dauerschaden' }
    ],
    startingEquipment: ['Kurzschwert', 'Dolch', 'Dietriche', 'Seil', 'Heiltrank'],
    playstyle: 'Taktisches Vorgehen, Überraschung nutzen, Erkundung',
    difficulty: 'Mittel'
  },
  bard: {
    description: 'Inspirationskünstler und vielseitige Unterstützer. Barden stärken ihre Verbündeten mit Musik, Magie und charismantischen Fähigkeiten.',
    primaryStats: ['Charisma', 'Geschicklichkeit'],
    roleDescription: 'Unterstützung & Vielseitigkeit',
    abilities: [
      { name: 'Inspiration', description: 'Verbessert Verbündete-Aktionen und -Würfe' },
      { name: 'Heilsong', description: 'Regeneriert Gesundheit der ganzen Gruppe' },
      { name: 'Bezauberung', description: 'Verwirrt oder bekehrt Feinde temporär' },
      { name: 'Vielwissen', description: 'Bonuswissen über verschiedene Themen' }
    ],
    startingEquipment: ['Rapier', 'Laute', 'Lederrüstung', 'Zauberkomponenten'],
    playstyle: 'Gruppenunterstützung, soziale Interaktionen, Flexibilität',
    difficulty: 'Mittel'
  },
  paladin: {
    description: 'Heilige Krieger mit göttlicher Macht. Paladine kombinieren Kampfkunst mit göttlicher Magie zum Schutz der Unschuldigen.',
    primaryStats: ['Stärke', 'Charisma'],
    roleDescription: 'Heiliger Krieger & Heiler',
    abilities: [
      { name: 'Götter-Schlag', description: 'Heiliger Schaden gegen Untote und Dämonen' },
      { name: 'Handauflegen', description: 'Mächtige Einzelziel-Heilung' },
      { name: 'Aura der Tapferkeit', description: 'Schutz vor Furcht für die ganze Gruppe' },
      { name: 'Göttliche Gunst', description: 'Temporäre Segnungen im Kampf' }
    ],
    startingEquipment: ['Kriegshammer', 'Schuppenpanzer', 'Heiltrank (x2)'],
    playstyle: 'Frontlinie-Kämpfer mit Heilfähigkeiten, moralische Führung',
    difficulty: 'Mittel'
  },
  ranger: {
    description: 'Wildnis-Experten und Meister des Fernkampfs. Ranger nutzen ihre Verbindung zur Natur und präzise Bogenschützen-Fähigkeiten.',
    primaryStats: ['Geschicklichkeit', 'Weisheit'],
    roleDescription: 'Fernkampf & Wildnis-Experte',
    abilities: [
      { name: 'Präzisionsschuss', description: 'Garantierter kritischer Treffer mit dem Bogen' },
      { name: 'Tiergefährte', description: 'Beschwört einen Tierkampf-Verbündeten' },
      { name: 'Fährtenlesen', description: 'Verfolgt Feinde und findet versteckte Pfade' },
      { name: 'Naturmagie', description: 'Einfache Heilungs- und Schutz-Zauber' }
    ],
    startingEquipment: ['Kurzbogen', 'Dolch', 'Lederrüstung', 'Seil'],
    playstyle: 'Fernkampf-Spezialist, Überlebenskunst, Taktik',
    difficulty: 'Mittel'
  },
  druid: {
    description: 'Hüter der Natur mit der Macht der Verwandlung. Druiden beherrschen Naturmagie und können ihre Gestalt wandeln.',
    primaryStats: ['Weisheit', 'Konstitution'],
    roleDescription: 'Naturmagier & Gestaltwandler',
    abilities: [
      { name: 'Gestalt wandeln', description: 'Verwandlung in Tiere mit deren Fähigkeiten' },
      { name: 'Dornenwall', description: 'Erstellt natürliche Barrieren im Kampf' },
      { name: 'Heilende Berührung', description: 'Natürliche Regenerationsfähigkeiten' },
      { name: 'Wetter kontrollieren', description: 'Beeinflusst lokale Wetterbedingungen' }
    ],
    startingEquipment: ['Holzschild', 'Krummsäbel', 'Lederrüstung', 'Kräuter'],
    playstyle: 'Vielseitigkeit durch Verwandlung, Naturverbundenheit, Heilung',
    difficulty: 'Schwer'
  },
  monk: {
    description: 'Meister der inneren Kraft und unbewaffneten Kampfkunst. Mönche kanalisieren Ki-Energie für übernatürliche Fähigkeiten.',
    primaryStats: ['Geschicklichkeit', 'Weisheit'],
    roleDescription: 'Unbewaffneter Kampf & Mobilität',
    abilities: [
      { name: 'Flurry of Blows', description: 'Serie schneller unbewaffneter Angriffe' },
      { name: 'Ki-Schlag', description: 'Energiegeladener Angriff mit Zusatzeffekten' },
      { name: 'Deflect Missiles', description: 'Abwehr und Umleitung von Projektilen' },
      { name: 'Stunning Strike', description: 'Betäubender Schlag durch Druckpunkte' }
    ],
    startingEquipment: ['Mönchsrobe', 'Holzstab', 'Meditationsperlen', 'Ration'],
    playstyle: 'Hohe Mobilität, Kombos, Ressourcen-Management (Ki-Punkte)',
    difficulty: 'Schwer'
  },
  warlock: {
    description: 'Okkulte Zauberer mit paktgebundener Macht. Warlocks haben ihre Seele für übernatürliche Kräfte verkauft.',
    primaryStats: ['Charisma', 'Konstitution'],
    roleDescription: 'Okkulter Zauberer & Pakt-Magier',
    abilities: [
      { name: 'Eldritch Blast', description: 'Mächtige okkulte Energieprojektion' },
      { name: 'Hex', description: 'Verfluchung mit Dauerschaden und Schwäche' },
      { name: 'Dämonische Resistenz', description: 'Widerstand gegen verschiedene Schadensarten' },
      { name: 'Pakt-Waffe', description: 'Beschwört übernatürliche Waffen' }
    ],
    startingEquipment: ['Mystische Klinge', 'Okkultes Amulett', 'Dämonisches Symbol'],
    playstyle: 'Kurze Ruhephasen-abhängige Magie, dunkle Macht, Fluch-Spezialist',
    difficulty: 'Schwer'
  }
};

export default function ClassInfoModal({ isOpen, onClose, characterClass }: ClassInfoModalProps) {
  if (!isOpen) return null;

  const classDetails = CLASS_DETAILS[characterClass];
  const weaponData = CLASS_WEAPON_DATA[characterClass];
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Einfach': return 'text-green-600 dark:text-green-400';
      case 'Mittel': return 'text-yellow-600 dark:text-yellow-400';  
      case 'Schwer': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {weaponData.displayName}
            </h2>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {classDetails.roleDescription}
              </span>
              <span className={`text-sm font-medium ${getDifficultyColor(classDetails.difficulty)}`}>
                {classDetails.difficulty}
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
              {classDetails.description}
            </p>
          </section>

          {/* Primary Stats & Playstyle */}
          <div className="grid md:grid-cols-2 gap-6">
            <section>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Hauptattribute
              </h3>
              <div className="space-y-2">
                {classDetails.primaryStats.map(stat => (
                  <div key={stat} className="bg-indigo-50 dark:bg-indigo-900/20 px-3 py-2 rounded-lg">
                    <span className="font-medium text-indigo-900 dark:text-indigo-100">{stat}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Spielstil
              </h3>
              <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                {classDetails.playstyle}
              </p>
            </section>
          </div>

          {/* Abilities */}
          <section>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Besondere Fähigkeiten
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {classDetails.abilities.map((ability, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    {ability.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {ability.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Weapons & Equipment */}
          <div className="grid md:grid-cols-2 gap-6">
            <section>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                Bevorzugte Waffen
              </h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-green-700 dark:text-green-300 mb-1">Primärwaffen:</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {weaponData.weaponRestrictions.primary.join(', ')}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-1">Sekundärausrüstung:</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {weaponData.weaponRestrictions.secondary.join(', ')}
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                Startausrüstung
              </h3>
              <div className="space-y-2">
                {classDetails.startingEquipment.map((item, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
                    <span className="text-gray-900 dark:text-gray-100">{item}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 text-center">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Bereit, als <strong>{weaponData.displayName}</strong> zu spielen?
            </p>
            <button
              onClick={onClose}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Klasse wählen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
