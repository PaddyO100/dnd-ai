import type { InventoryItem, CharacterClass } from '@/schemas/character';

export interface EquipmentSet {
  name: string;
  description: string;
  items: string[];
  synergy?: {
    name: string;
    description: string;
    bonus: {
      type: 'damage' | 'defense' | 'skill' | 'stat';
      value: number;
      target?: string;
    };
  };
}

export interface ClassEquipment {
  primaryWeapons: string[];
  secondaryWeapons: string[];
  armor: string[];
  tools: string[];
  consumables: string[];
  equipmentSets: EquipmentSet[];
}

// Comprehensive equipment database for all character classes
export const classEquipmentSets: Record<CharacterClass, ClassEquipment> = {
  warrior: {
    primaryWeapons: [
      'zweihandschwert', 'langschwert', 'streitkolben', 'kriegshammer', 
      'streitaxt', 'hellebarde', 'morgenstern'
    ],
    secondaryWeapons: [
      'kurzschwert', 'dolch', 'handaxt', 'wurfmesser', 'javelin'
    ],
    armor: [
      'plattenruestung', 'kettenpanzer', 'schuppenpanzer', 'lederruestung',
      'kriegsschild', 'turmschild', 'buckler', 'kriegshelm', 'stahlhandschuhe'
    ],
    tools: [
      'wetzstein', 'reparaturkit', 'seil', 'dietriche', 'feldkochergeschirr'
    ],
    consumables: [
      'heiltrank', 'krafttrank', 'ausdauertrank', 'eisenration', 'bandagen'
    ],
    equipmentSets: [
      {
        name: 'Ritter-Set',
        description: 'Vollständige Ritterausrüstung für maximalen Schutz',
        items: ['plattenruestung', 'langschwert', 'kriegsschild', 'kriegshelm'],
        synergy: {
          name: 'Ritterschutz',
          description: '+2 AC und Widerstand gegen kritische Treffer',
          bonus: { type: 'defense', value: 2 }
        }
      },
      {
        name: 'Berserker-Set',
        description: 'Aggressive Ausrüstung für maximalen Schaden',
        items: ['zweihandschwert', 'lederruestung', 'krafttrank', 'wurfaxt'],
        synergy: {
          name: 'Berserkerwut',
          description: '+3 Schaden bei Nahkampfangriffen',
          bonus: { type: 'damage', value: 3 }
        }
      }
    ]
  },

  mage: {
    primaryWeapons: [
      'zauberstab', 'kampfstab', 'kristallstab', 'elementarstab', 
      'nekromantenstab', 'illusionsstab'
    ],
    secondaryWeapons: [
      'dolch', 'kurzschwert', 'wurfmesser', 'schleuder'
    ],
    armor: [
      'magierrobe', 'zauberrobe', 'lederruestung', 'stoffhandschuhe',
      'magierkappe', 'schutzamulett', 'magieschild'
    ],
    tools: [
      'zauberbuch', 'schreibfeder', 'tinte', 'pergament', 'reagenzien',
      'kristallkugel', 'zauberkomponenten', 'alchemiekoffer'
    ],
    consumables: [
      'manatrank', 'heiltrank', 'intelligenztrank', 'unsichtbarkeitstrank',
      'feuerbomben', 'rauchgranaten', 'zauberspruchrollen'
    ],
    equipmentSets: [
      {
        name: 'Elementarmagier-Set',
        description: 'Spezialisierung auf Elementarmagie',
        items: ['elementarstab', 'magierrobe', 'kristallkugel', 'reagenzien'],
        synergy: {
          name: 'Elementarfokus',
          description: '+2 Schaden für alle Elementarzauber',
          bonus: { type: 'damage', value: 2, target: 'elemental_spells' }
        }
      },
      {
        name: 'Kampfmagier-Set',
        description: 'Ausrüstung für Magier im Nahkampf',
        items: ['kampfstab', 'lederruestung', 'schutzamulett', 'manatrank'],
        synergy: {
          name: 'Kampfzauber',
          description: 'Zauber können während Nahkampfaktionen gewirkt werden',
          bonus: { type: 'skill', value: 1, target: 'combat_casting' }
        }
      }
    ]
  },

  rogue: {
    primaryWeapons: [
      'dolch', 'kurzschwert', 'florett', 'dolchpaar', 'wurfdolch',
      'armbrust', 'kurzbogen'
    ],
    secondaryWeapons: [
      'wurfmesser', 'garrotte', 'blasrohr', 'wurfpfeile'
    ],
    armor: [
      'lederruestung', 'schwarze_kleidung', 'schatten_umhang', 
      'lederhandschuhe', 'leise_stiefel'
    ],
    tools: [
      'dietriche', 'fallen_kit', 'seil', 'enterhaken', 'gift',
      'rauchgranaten', 'taschendieb_werkzeug', 'verkleidung_kit'
    ],
    consumables: [
      'heiltrank', 'unsichtbarkeitstrank', 'gift_flasche', 'klettergurt',
      'giftpfeile', 'blendgranaten', 'heilkrauter'
    ],
    equipmentSets: [
      {
        name: 'Meisterdieb-Set',
        description: 'Perfekt für Infiltration und Diebstahl',
        items: ['dietriche', 'schatten_umhang', 'leise_stiefel', 'unsichtbarkeitstrank'],
        synergy: {
          name: 'Schattenmeister',
          description: '+3 auf alle Schleichen- und Dietrich-Würfe',
          bonus: { type: 'skill', value: 3, target: 'stealth_lockpicking' }
        }
      },
      {
        name: 'Assassinen-Set',
        description: 'Spezialisiert auf lautlose Eliminierung',
        items: ['dolchpaar', 'gift_flasche', 'garrotte', 'schwarze_kleidung'],
        synergy: {
          name: 'Lautloser Tod',
          description: 'Kritische Treffer verursachen doppelten Giftschaden',
          bonus: { type: 'damage', value: 2, target: 'critical_poison' }
        }
      }
    ]
  },

  paladin: {
    primaryWeapons: [
      'langschwert', 'zweihandschwert', 'streitkolben', 'kriegshammer',
      'heilige_lanze', 'gesegnetes_schwert'
    ],
    secondaryWeapons: [
      'kurzschwert', 'dolch', 'handaxt', 'wurfhammer'
    ],
    armor: [
      'plattenruestung', 'kettenpanzer', 'heilige_ruestung', 'kriegsschild',
      'heiliger_schild', 'kronen_helm', 'gesegnete_handschuhe'
    ],
    tools: [
      'heiliges_symbol', 'weihwasser', 'gesangbuch', 'segnungs_ol',
      'heilkrauter', 'gebetsbuch', 'reliquie'
    ],
    consumables: [
      'heiltrank', 'segenstrunk', 'weihwasser_flasche', 'heiliger_schutz_trank',
      'licht_granate', 'bannkreis_pergament', 'auferstehungs_pulver'
    ],
    equipmentSets: [
      {
        name: 'Heiliger Krieger-Set',
        description: 'Gesegnete Ausrüstung gegen das Böse',
        items: ['gesegnetes_schwert', 'heilige_ruestung', 'heiliger_schild', 'heiliges_symbol'],
        synergy: {
          name: 'Göttlicher Segen',
          description: '+2 Schaden gegen Untote und Dämonen',
          bonus: { type: 'damage', value: 2, target: 'undead_demons' }
        }
      },
      {
        name: 'Beschützer-Set',
        description: 'Fokussiert auf den Schutz von Verbündeten',
        items: ['kriegsschild', 'plattenruestung', 'heilkrauter', 'segenstrunk'],
        synergy: {
          name: 'Schutzaura',
          description: 'Nahegelegene Verbündete erhalten +1 AC',
          bonus: { type: 'defense', value: 1, target: 'allies' }
        }
      }
    ]
  },

  ranger: {
    primaryWeapons: [
      'langbogen', 'kompositbogen', 'armbrust', 'schwere_armbrust',
      'jagdspeer', 'zwillingsklingen'
    ],
    secondaryWeapons: [
      'kurzbogen', 'wurfspeere', 'dolch', 'handaxt', 'blasrohr'
    ],
    armor: [
      'lederruestung', 'studded_leather', 'waldlaeufer_umhang', 
      'tarnung_kleidung', 'wanderstiefel'
    ],
    tools: [
      'pfeil_kocher', 'fallen_kit', 'spurenlese_kit', 'uberlebens_ausrustung',
      'kletterausrustung', 'jagdmesser', 'feuerstahl', 'kompass'
    ],
    consumables: [
      'heiltrank', 'giftpfeile', 'brandpfeile', 'eisenration', 
      'tierfutter', 'heilkrauter', 'energy_jerky'
    ],
    equipmentSets: [
      {
        name: 'Meisterjäger-Set',
        description: 'Perfekt für die Jagd auf große Beute',
        items: ['kompositbogen', 'giftpfeile', 'spurenlese_kit', 'tarnung_kleidung'],
        synergy: {
          name: 'Präzisionsschuss',
          description: '+2 Schaden und +1 Kritische Trefferchance',
          bonus: { type: 'damage', value: 2, target: 'ranged_attacks' }
        }
      },
      {
        name: 'Überlebensexperte-Set',
        description: 'Ausrüstung für lange Wildnisexpeditionen',
        items: ['uberlebens_ausrustung', 'eisenration', 'fallen_kit', 'waldlaeufer_umhang'],
        synergy: {
          name: 'Wildnismeister',
          description: 'Immunität gegen Umweltschäden und +2 auf Überlebenswürfe',
          bonus: { type: 'skill', value: 2, target: 'survival' }
        }
      }
    ]
  },

  druid: {
    primaryWeapons: [
      'naturstab', 'sichelklinge', 'speer', 'schleuder',
      'dornenpeitsche', 'steinaxt'
    ],
    secondaryWeapons: [
      'dolch', 'wurfspeer', 'pfeil_und_bogen', 'steinmesser'
    ],
    armor: [
      'naturleder_ruestung', 'rindenpanzer', 'druiden_robe', 
      'tierfell_umhang', 'wurzel_sandalen'
    ],
    tools: [
      'krauter_beutel', 'sichelklinge', 'samen_sammlung', 'tierfreund_pfeife',
      'naturstein_amulett', 'mondschein_kristall', 'wachstums_elixier'
    ],
    consumables: [
      'naturheiltrank', 'gift_neutralisation', 'tierverwandlungs_trank',
      'beruhigungs_tee', 'kraftbeeren', 'heilkrauter', 'wald_honig'
    ],
    equipmentSets: [
      {
        name: 'Naturherr-Set',
        description: 'Verstärkt die Verbindung zur Natur',
        items: ['naturstab', 'naturstein_amulett', 'krauter_beutel', 'tierfell_umhang'],
        synergy: {
          name: 'Natureinheit',
          description: 'Alle Naturzauber kosten -1 Mana und haben +1 Effektstärke',
          bonus: { type: 'skill', value: 1, target: 'nature_spells' }
        }
      },
      {
        name: 'Gestaltwandler-Set',
        description: 'Optimiert für Tiergestalt-Verwandlungen',
        items: ['tierverwandlungs_trank', 'rindenpanzer', 'tierfreund_pfeife', 'kraftbeeren'],
        synergy: {
          name: 'Perfekte Verwandlung',
          description: 'Tiergestalten erhalten +2 auf alle Attribute',
          bonus: { type: 'stat', value: 2, target: 'animal_forms' }
        }
      }
    ]
  },

  monk: {
    primaryWeapons: [
      'kampfstab', 'nunchaku', 'sai_paar', 'bo_stab',
      'meditation_schwert', 'klauen_handschuhe'
    ],
    secondaryWeapons: [
      'wurfsterne', 'kampf_facher', 'kettenpeitsche', 'dolch'
    ],
    armor: [
      'monch_robe', 'meditation_gewand', 'kampfhandschuhe',
      'bandagen', 'leichte_sandalen'
    ],
    tools: [
      'meditation_perlen', 'kampfbandagen', 'druckpunkt_karte',
      'atemtechnik_buch', 'chakra_steine', 'kampfkunst_handbuch'
    ],
    consumables: [
      'heiltrank', 'meditationstee', 'energietrank', 'fokus_pillen',
      'schmerzlinderung_salbe', 'kampfstimulans', 'geist_klarungs_elixier'
    ],
    equipmentSets: [
      {
        name: 'Zen-Meister-Set',
        description: 'Maximiert innere Ruhe und Kampfkraft',
        items: ['meditation_schwert', 'monch_robe', 'meditation_perlen', 'meditationstee'],
        synergy: {
          name: 'Innere Harmonie',
          description: 'Ki-Punkte regenerieren sich doppelt so schnell',
          bonus: { type: 'skill', value: 2, target: 'ki_regeneration' }
        }
      },
      {
        name: 'Drachenstil-Set',
        description: 'Aggressiver Kampfstil mit verheerenden Kombinationen',
        items: ['klauen_handschuhe', 'kampfbandagen', 'kampfstimulans', 'wurfsterne'],
        synergy: {
          name: 'Drachenwut',
          description: 'Jeder erfolgreiche Angriff gewährt +1 Schadenbonus für 3 Runden',
          bonus: { type: 'damage', value: 1, target: 'combo_attacks' }
        }
      }
    ]
  },

  warlock: {
    primaryWeapons: [
      'pakt_stab', 'ritual_dolch', 'damonenklinge', 'seelen_sichel',
      'verfluchtes_schwert', 'schatten_zepter'
    ],
    secondaryWeapons: [
      'ritual_messer', 'opfer_dolch', 'bannende_kette', 'blut_kristall'
    ],
    armor: [
      'pakt_robe', 'schatten_mantel', 'daemon_leder', 
      'fluch_amulett', 'seelen_handschuhe'
    ],
    tools: [
      'grimoire', 'opfer_schale', 'bannkreis_kreide', 'damonensiegel',
      'seelen_kristall', 'blut_tinte', 'ritual_kerzen', 'pakt_vertrag'
    ],
    consumables: [
      'seelentrank', 'verfluchungsol', 'damonisches_blut', 'schutzpergament',
      'banntrank', 'schatten_elixier', 'pakt_pille'
    ],
    equipmentSets: [
      {
        name: 'Paktsprecher-Set',
        description: 'Verstärkt die Verbindung zum dämonischen Patron',
        items: ['pakt_stab', 'pakt_robe', 'grimoire', 'damonensiegel'],
        synergy: {
          name: 'Patronmacht',
          description: 'Eldritch Blast verursacht +2 Schaden und kann Ziele zurückdrängen',
          bonus: { type: 'damage', value: 2, target: 'eldritch_blast' }
        }
      },
      {
        name: 'Seelensammler-Set',
        description: 'Spezialisiert auf das Sammeln und Nutzen von Seelen',
        items: ['seelen_sichel', 'seelen_kristall', 'opfer_schale', 'seelentrank'],
        synergy: {
          name: 'Seelenraub',
          description: 'Kritische Treffer heilen eigene HP und gewähren temporäre Mana',
          bonus: { type: 'skill', value: 1, target: 'soul_drain' }
        }
      }
    ]
  },

  bard: {
    primaryWeapons: [
      'florett', 'kurzschwert', 'dolch', 'leichte_armbrust',
      'verzaubertes_schwert', 'melodie_klinge'
    ],
    secondaryWeapons: [
      'wurfmesser', 'schleuder', 'handaxt', 'kurzbogen'
    ],
    armor: [
      'barden_gewand', 'leichte_ruestung', 'performance_umhang',
      'verzierte_handschuhe', 'elegant_stiefel'
    ],
    tools: [
      'laute', 'flote', 'trommel', 'harfe', 'geige',
      'liederbuch', 'performance_kit', 'make_up_set', 'kostume'
    ],
    consumables: [
      'inspiration_trank', 'stimm_elixier', 'charme_parfum', 'muttrank',
      'heiltrank', 'verzauberungs_pulver', 'applaus_pille'
    ],
    equipmentSets: [
      {
        name: 'Virtuose-Set',
        description: 'Maximiert musikalische Leistung und Inspiration',
        items: ['harfe', 'barden_gewand', 'liederbuch', 'inspiration_trank'],
        synergy: {
          name: 'Meisterliche Darbietung',
          description: 'Inspirationszauber betreffen +1 zusätzliches Ziel',
          bonus: { type: 'skill', value: 1, target: 'inspiration_spells' }
        }
      },
      {
        name: 'Kampfbarde-Set',
        description: 'Verbindet Kampfkunst mit magischer Musik',
        items: ['melodie_klinge', 'performance_umhang', 'flote', 'muttrank'],
        synergy: {
          name: 'Kampflied',
          description: 'Angriffe verursachen Schallwellen, die Gegner betäuben können',
          bonus: { type: 'damage', value: 1, target: 'sonic_attacks' }
        }
      }
    ]
  }
};

// Equipment availability by difficulty level
export const difficultyEquipmentModifiers = {
  beginner: {
    bonusConsumables: ['heiltrank', 'heiltrank'], // Extra healing
    equipmentQuality: 1.0,
    goldMultiplier: 1.5
  },
  intermediate: {
    bonusConsumables: [],
    equipmentQuality: 1.0,
    goldMultiplier: 1.0
  },
  advanced: {
    bonusConsumables: [], // No extra consumables
    equipmentQuality: 0.8, // Lower quality equipment
    goldMultiplier: 0.7 // Less starting gold
  }
};

// Equipment upgrade system
export interface EquipmentUpgrade {
  name: string;
  description: string;
  cost: number;
  requirements: string[];
  effect: {
    type: 'damage' | 'defense' | 'durability' | 'special';
    value: number;
    description: string;
  };
}

export const equipmentUpgrades: Record<string, EquipmentUpgrade[]> = {
  'langschwert': [
    {
      name: 'Schärfung',
      description: 'Verbessert die Schärfe der Klinge',
      cost: 50,
      requirements: ['wetzstein'],
      effect: { type: 'damage', value: 1, description: '+1 Schaden' }
    },
    {
      name: 'Verzauberung',
      description: 'Magische Verzauberung der Waffe',
      cost: 200,
      requirements: ['verzauberungs_stein', 'magier_level_3'],
      effect: { type: 'special', value: 1, description: 'Magisches Glühen und +1 magischer Schaden' }
    }
  ],
  'lederruestung': [
    {
      name: 'Verstärkung',
      description: 'Metallplatten an kritischen Stellen',
      cost: 75,
      requirements: ['metallplatten', 'handwerker_level_2'],
      effect: { type: 'defense', value: 1, description: '+1 Rüstungsklasse' }
    },
    {
      name: 'Komfort-Polsterung',
      description: 'Verbesserte Beweglichkeit durch bessere Polsterung',
      cost: 40,
      requirements: ['stoffpolster'],
      effect: { type: 'special', value: 1, description: '+1 auf Geschicklichkeitswürfe' }
    }
  ]
};

export default classEquipmentSets;
