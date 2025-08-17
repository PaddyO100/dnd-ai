// Tutorial step definitions for Aethel's Forge RPG
// Contextual tutorials that guide users through game features

export type TutorialTrigger = 
  | 'game_start' 
  | 'first_combat' 
  | 'first_spell' 
  | 'first_inventory_use'
  | 'first_dice_roll'
  | 'first_character_creation'
  | 'map_generation'
  | 'portrait_generation'
  | 'settings_access'
  | 'save_load'
  | 'side_panel_first_open'
  | 'visual_dice_first_use'
  | 'vision_first_use'
  | 'first_error_encounter'
  | 'first_export_import'
  | 'first_image_modal'
  | 'first_character_selection'
  | 'first_quest_completion'
  | 'first_level_up'
  | 'advanced_features'
  | 'manual_trigger';

export type TutorialStepAction = 
  | 'highlight' 
  | 'click' 
  | 'type' 
  | 'scroll'
  | 'wait'
  | 'demo'
  | 'focus'
  | 'hover'
  | 'multi_highlight';

export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  target?: string; // CSS selector for highlighting
  targets?: string[]; // Multiple targets for multi-highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'auto';
  action?: TutorialStepAction;
  autoAction?: boolean; // If true, automatically perform the action
  demoValue?: string; // Value to use for demo actions
  skippable?: boolean;
  delay?: number; // Delay before showing this step
  prerequisite?: string[]; // Required completed tutorial IDs
  optional?: boolean; // Can be skipped without affecting progression
  showProgress?: boolean; // Show step progress indicator
  contextualHints?: string[]; // Additional contextual information
  nextStepDelay?: number; // Custom delay before auto-advancing
  interactionRequired?: boolean; // Step requires user interaction to continue
  adaptiveContent?: { // Content that changes based on game state
    condition: string;
    content: string;
  }[];
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: 'basics' | 'gameplay' | 'features' | 'advanced';
  trigger: TutorialTrigger;
  priority: number; // Higher priority tutorials show first
  steps: TutorialStep[];
  isRepeatable?: boolean;
  conditions?: () => boolean; // Custom conditions to show tutorial
}

// Basic game introduction tutorial
export const gameIntroTutorial: Tutorial = {
  id: 'game_intro',
  title: 'Willkommen bei Aethel\'s Forge',
  description: 'Lernen Sie die Grundlagen des Spiels kennen',
  category: 'basics',
  trigger: 'game_start',
  priority: 100,
  steps: [
    {
      id: 'welcome',
      title: 'Willkommen!',
      content: 'Willkommen bei Aethel\'s Forge! Dies ist ein KI-gestütztes Tabletop-RPG-Erlebnis. Lassen Sie uns mit einer kurzen Tour beginnen.',
      position: 'center',
      skippable: true
    },
    {
      id: 'story_panel',
      title: 'Geschichte Panel',
      content: 'Hier verfolgen Sie die Geschichte Ihres Abenteuers. Die KI-DM (Aethel) erzählt die Geschichte, und Sie antworten mit Ihren Aktionen.',
      target: 'section.card-fantasy:has(h2:contains("Geschichte"))',
      position: 'right',
      skippable: true
    },
    {
      id: 'input_area',
      title: 'Aktionseingabe',
      content: 'Beschreiben Sie hier Ihre Aktionen. Seien Sie kreativ! Die KI versteht natürliche Sprache und antwortet entsprechend.',
      target: '.card-fantasy:has(input[placeholder*="Was tust du"])',
      position: 'top',
      skippable: true
    },
    {
      id: 'side_panel',
      title: 'Charakterpanel',
      content: 'Hier finden Sie alle Informationen über Ihre Charaktere, Inventar und Quests. Klicken Sie auf einen Charakter, um Details zu sehen.',
      target: 'aside',
      position: 'left',
      skippable: true
    },
    {
      id: 'action_buttons',
      title: 'Aktionsschaltflächen',
      content: 'Diese Schaltflächen bieten schnelle Aktionen wie Kartengeneration, Porträts und Würfeln.',
  target: '.flex:has(button:contains("Würfeln"))',
      position: 'top',
      skippable: true
    }
  ]
};

// Input and interaction tutorial
export const inputTutorial: Tutorial = {
  id: 'input_basics',
  title: 'Eingabe und Interaktion',
  description: 'Lernen Sie, wie Sie mit dem Spiel interagieren',
  category: 'basics',
  trigger: 'manual_trigger',
  priority: 90,
  steps: [
    {
      id: 'input_demo',
      title: 'Aktionen eingeben',
      content: 'Versuchen Sie, eine einfache Aktion einzugeben. Zum Beispiel: "Ich schaue mich um"',
      target: 'input[placeholder*="Was tust du"]',
      position: 'top',
      action: 'type',
      demoValue: 'Ich schaue mich um',
      autoAction: false,
      skippable: true
    },
    {
      id: 'submit_action',
      title: 'Aktion ausführen',
      content: 'Drücken Sie Enter oder klicken Sie auf "Aktion", um Ihre Eingabe zu senden.',
      target: 'button:contains("Aktion")',
      position: 'left',
      action: 'highlight',
      skippable: true
    }
  ]
};

// Visual dice tutorial
export const diceTutorial: Tutorial = {
  id: 'dice_tutorial',
  title: '3D Würfel System',
  description: 'Entdecken Sie das interaktive Würfelsystem',
  category: 'features',
  trigger: 'first_dice_roll',
  priority: 70,
  steps: [
    {
      id: 'dice_button',
      title: '3D Würfel',
      content: 'Mit diesem Button können Sie verschiedene Würfel in 3D werfen. Perfekt für Schadenswürfe oder Fertigkeitschecks!',
      target: 'button:contains("3D Würfel")',
      position: 'top',
      action: 'highlight',
      skippable: true
    },
    {
      id: 'dice_usage',
      title: 'Würfel verwenden',
      content: 'Sie können auch direkt in Ihren Aktionen würfeln, indem Sie schreiben: "Ich würfle einen W20 für Wahrnehmung"',
      position: 'center',
      skippable: true
    }
  ]
};

// Map generation tutorial
export const mapTutorial: Tutorial = {
  id: 'map_tutorial',
  title: 'Kartengeneration',
  description: 'Lernen Sie, wie KI-generierte Karten funktionieren',
  category: 'features',
  trigger: 'map_generation',
  priority: 60,
  steps: [
    {
      id: 'map_generation',
      title: 'Karten erstellen',
      content: 'Die KI kann automatisch Karten basierend auf Ihrem aktuellen Szenario generieren. Dies dauert normalerweise 30-60 Sekunden.',
  target: 'button:contains("Würfeln")',
      position: 'top',
      action: 'highlight',
      skippable: true
    },
    {
      id: 'map_display',
      title: 'Kartenanzeige',
      content: 'Generierte Karten erscheinen hier als Vorschaubild. Klicken Sie darauf, um sie in voller Größe anzuzeigen.',
      target: 'div:has(img[alt="Karte"])',
      position: 'top',
      skippable: true,
      delay: 2000
    }
  ]
};

// Character and portraits tutorial
export const characterTutorial: Tutorial = {
  id: 'character_tutorial',
  title: 'Charaktere und Porträts',
  description: 'Verstehen Sie das Charaktersystem',
  category: 'gameplay',
  trigger: 'first_character_creation',
  priority: 80,
  steps: [
    {
      id: 'character_selection',
      title: 'Charakterauswahl',
      content: 'Klicken Sie auf einen Charakter im Seitenpanel, um ihn auszuwählen und seine Details zu sehen.',
      target: 'aside .space-y-4 > div:first-child',
      position: 'left',
      action: 'highlight',
      skippable: true
    },
    {
      id: 'portrait_generation',
      title: 'Porträt anfordern',
      content: 'Sie können KI-generierte Porträts für Ihre Charaktere erstellen lassen.',
      target: 'button:contains("Porträt Anfordern")',
      position: 'top',
      action: 'highlight',
      skippable: true
    }
  ]
};

// Vision system tutorial
export const visionTutorial: Tutorial = {
  id: 'vision_tutorial',
  title: 'Tipps',
  description: 'Entdecken Sie das KI-Vision-System',
  category: 'features',
  trigger: 'vision_first_use',
  priority: 50,
  steps: [
    {
      id: 'vision_button',
      title: 'Vision anfordern',
  content: 'Nutze die Würfel und Fähigkeiten, um die Szene zu gestalten. Bilderzeugung wurde entfernt.',
  target: 'button:contains("Würfel")',
      position: 'top',
      action: 'highlight',
      skippable: true
    },
    {
      id: 'vision_modal',
      title: 'Vision anzeigen',
      content: 'Visionen werden in einem Modal-Fenster angezeigt. Sie können sie herunterladen oder schließen.',
      position: 'center',
      skippable: true,
      delay: 3000
    }
  ]
};

// Settings tutorial
export const settingsTutorial: Tutorial = {
  id: 'settings_tutorial',
  title: 'Spieleinstellungen',
  description: 'Passen Sie das Spiel an Ihre Vorlieben an',
  category: 'basics',
  trigger: 'settings_access',
  priority: 40,
  steps: [
    {
      id: 'settings_button',
      title: 'Einstellungen öffnen',
      content: 'Hier können Sie Sprache, KI-Modell, Schwierigkeit und andere Einstellungen anpassen.',
      target: 'button:contains("Einstellungen")',
      position: 'bottom',
      action: 'highlight',
      skippable: true
    }
  ]
};

// Save/Load tutorial
export const saveLoadTutorial: Tutorial = {
  id: 'save_load_tutorial',
  title: 'Speichern und Laden',
  description: 'Verwalten Sie Ihre Spielstände',
  category: 'basics',
  trigger: 'save_load',
  priority: 30,
  steps: [
    {
      id: 'export_game',
      title: 'Spiel exportieren',
      content: 'Speichern Sie Ihren aktuellen Spielstand als JSON-Datei auf Ihrem Computer.',
      target: 'button:contains("Spiel Exportieren")',
      position: 'top',
      action: 'highlight',
      skippable: true
    },
    {
      id: 'import_game',
      title: 'Spiel importieren',
      content: 'Laden Sie einen gespeicherten Spielstand von Ihrem Computer.',
      target: 'label:contains("Spiel Importieren")',
      position: 'top',
      action: 'highlight',
      skippable: true
    }
  ]
};

// Advanced combat tutorial (triggered by combat keywords)
export const combatTutorial: Tutorial = {
  id: 'combat_tutorial',
  title: 'Kampfsystem',
  description: 'Meistern Sie das Kampfsystem',
  category: 'gameplay',
  trigger: 'first_combat',
  priority: 85,
  steps: [
    {
      id: 'combat_actions',
      title: 'Kampfaktionen',
      content: 'Im Kampf können Sie spezifische Aktionen ausführen wie "Ich greife mit meinem Schwert an" oder "Ich wirke einen Feuerball".',
      position: 'center',
      skippable: true
    },
    {
      id: 'hp_tracking',
      title: 'Lebenspunkte',
      content: 'Ihre HP werden automatisch verfolgt. Schauen Sie im Charakterpanel nach Verletzungen und Heilung.',
      target: 'aside',
      position: 'left',
      action: 'highlight',
      skippable: true
    }
  ]
};

// Error handling tutorial
export const errorHandlingTutorial: Tutorial = {
  id: 'error_handling_tutorial',
  title: 'Fehlerbehandlung',
  description: 'Was tun bei Problemen?',
  category: 'basics',
  trigger: 'first_error_encounter',
  priority: 95,
  steps: [
    {
      id: 'error_occurred',
      title: 'Fehler aufgetreten',
      content: 'Ein Fehler ist aufgetreten! Das passiert manchmal. Hier sind ein paar Tipps zum Umgang mit Problemen.',
      position: 'center',
      skippable: true
    },
    {
      id: 'retry_action',
      title: 'Erneut versuchen',
      content: 'Versuchen Sie, Ihre letzte Aktion zu wiederholen oder anders zu formulieren.',
      position: 'center',
      skippable: true
    },
    {
      id: 'settings_help',
      title: 'Einstellungen prüfen',
      content: 'Prüfen Sie Ihre KI-Modell Einstellungen, falls Probleme weiterhin auftreten.',
      target: 'button:contains("Einstellungen")',
      position: 'bottom',
      action: 'highlight',
      skippable: true
    }
  ]
};

// Import/Export tutorial
export const importExportTutorial: Tutorial = {
  id: 'import_export_tutorial',
  title: 'Speichern & Laden',
  description: 'Verwalten Sie Ihre Spielstände',
  category: 'basics',
  trigger: 'first_export_import',
  priority: 60,
  steps: [
    {
      id: 'save_importance',
      title: 'Speichern ist wichtig',
      content: 'Regelmäßiges Speichern verhindert Datenverlust. Sie können Ihr Spiel als JSON-Datei exportieren.',
      target: 'button:contains("Spiel Exportieren")',
      position: 'top',
      action: 'highlight',
      skippable: true
    },
    {
      id: 'import_games',
      title: 'Spiele laden',
      content: 'Mit "Spiel Importieren" können Sie gespeicherte Spielstände wiederherstellen.',
      target: 'label:contains("Spiel Importieren")',
      position: 'top',
      action: 'highlight',
      skippable: true
    }
  ]
};

// Character selection tutorial
export const characterSelectionTutorial: Tutorial = {
  id: 'character_selection_tutorial',
  title: 'Charakterauswahl',
  description: 'Verwalten Sie Ihre Party-Mitglieder',
  category: 'gameplay',
  trigger: 'first_character_selection',
  priority: 75,
  steps: [
    {
      id: 'selecting_characters',
      title: 'Charakter auswählen',
      content: 'Klicken Sie auf einen Charakter, um ihn auszuwählen und seine Details zu sehen.',
      target: 'aside .space-y-4 > div:first-child',
      position: 'left',
      action: 'highlight',
      skippable: true
    },
    {
      id: 'character_stats',
      title: 'Charakterdetails',
      content: 'Hier sehen Sie Lebenspunkte, Fähigkeiten, Inventar und Zustände Ihres Charakters.',
      position: 'center',
      skippable: true
    },
    {
      id: 'portrait_feature',
      title: 'Charakterporträts',
      content: 'Verwenden Sie "Porträt Anfordern" um KI-generierte Bilder Ihrer Charaktere zu erstellen.',
      target: 'button:contains("Porträt Anfordern")',
      position: 'top',
      action: 'highlight',
      skippable: true
    }
  ]
};

// Advanced features tutorial
export const advancedTutorial: Tutorial = {
  id: 'advanced_tutorial',
  title: 'Erweiterte Funktionen',
  description: 'Meistern Sie alle Funktionen von Aethel\'s Forge',
  category: 'advanced',
  trigger: 'advanced_features',
  priority: 20,
  steps: [
    {
      id: 'advanced_intro',
      title: 'Erweiterte Funktionen',
      content: 'Sie haben die Grundlagen gemeistert! Lassen Sie uns die erweiterten Funktionen erkunden.',
      position: 'center',
      skippable: true
    },
    {
      id: 'visual_dice_advanced',
      title: '3D Würfel Tipps',
      content: 'Die 3D Würfel unterstützen verschiedene Würfeltypen. Experimentieren Sie mit W4, W6, W8, W10, W12, W20!',
      target: 'button:contains("3D Würfel")',
      position: 'top',
      action: 'highlight',
      skippable: true
    },
    {
      id: 'vision_advanced',
  title: 'Spieltipps',
  content: 'Konzentriere dich auf Text, Effekte und Entscheidungen. Bilderzeugung ist deaktiviert.',
  target: 'button:contains("Würfel")',
      position: 'top',
      action: 'highlight',
      skippable: true
    },
    {
      id: 'settings_advanced',
      title: 'Einstellungen optimieren',
      content: 'In den Einstellungen können Sie KI-Modell, Schwierigkeit und visuelle Themen anpassen.',
      target: 'button:contains("Einstellungen")',
      position: 'bottom',
      action: 'highlight',
      skippable: true
    }
  ]
};

// All tutorials registry
export const allTutorials: Tutorial[] = [
  gameIntroTutorial,
  inputTutorial,
  characterTutorial,
  combatTutorial,
  diceTutorial,
  mapTutorial,
  visionTutorial,
  settingsTutorial,
  saveLoadTutorial,
  errorHandlingTutorial,
  importExportTutorial,
  characterSelectionTutorial,
  advancedTutorial
];

// Helper functions
export function getTutorialByTrigger(trigger: TutorialTrigger): Tutorial[] {
  return allTutorials.filter(tutorial => tutorial.trigger === trigger);
}

export function getTutorialById(id: string): Tutorial | undefined {
  return allTutorials.find(tutorial => tutorial.id === id);
}

export function getTutorialsByCategory(category: Tutorial['category']): Tutorial[] {
  return allTutorials.filter(tutorial => tutorial.category === category);
}

export function shouldShowTutorial(tutorial: Tutorial, completedTutorials: string[]): boolean {
  // Check if tutorial is already completed and not repeatable
  if (completedTutorials.includes(tutorial.id) && !tutorial.isRepeatable) {
    return false;
  }

  // Check custom conditions if they exist
  if (tutorial.conditions && !tutorial.conditions()) {
    return false;
  }

  return true;
}

// Helper function to get next recommended tutorial
export function getNextRecommendedTutorial(completedTutorials: string[]): Tutorial | null {
  // Get incomplete tutorials sorted by priority
  const incompleteTutorials = allTutorials
    .filter(t => !completedTutorials.includes(t.id))
    .sort((a, b) => b.priority - a.priority);
  
  return incompleteTutorials[0] || null;
}

// Get tutorials by completion status
export function getTutorialsByStatus(completedTutorials: string[], status: 'completed' | 'available' | 'locked' = 'available'): Tutorial[] {
  switch (status) {
    case 'completed':
      return allTutorials.filter(t => completedTutorials.includes(t.id));
    case 'available':
      return allTutorials.filter(t => shouldShowTutorial(t, completedTutorials));
    case 'locked':
      return allTutorials.filter(t => !shouldShowTutorial(t, completedTutorials) && !completedTutorials.includes(t.id));
    default:
      return allTutorials;
  }
}

// Get tutorial statistics
export function getTutorialStats(completedTutorials: string[]) {
  const total = allTutorials.length;
  const completed = completedTutorials.length;
  const available = getTutorialsByStatus(completedTutorials, 'available').length;
  
  return {
    total,
    completed,
    available,
    completionRate: Math.round((completed / total) * 100),
    categories: {
      basics: allTutorials.filter(t => t.category === 'basics').length,
      gameplay: allTutorials.filter(t => t.category === 'gameplay').length,
      features: allTutorials.filter(t => t.category === 'features').length,
      advanced: allTutorials.filter(t => t.category === 'advanced').length
    }
  };
}