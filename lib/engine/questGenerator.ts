// lib/engine/questGenerator.ts
// Lightweight quest seeding based on scenario and party. Matches store quest shape.
export type GeneratedQuest = {
  title: string;
  status: 'open' | 'in-progress' | 'completed' | 'failed';
  note?: string;
  category?: 'main' | 'side' | 'personal' | 'guild';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  progress?: { current: number; total: number; description?: string };
};

type SimpleScenario = { id: string; title: string; summary?: string };
type SimplePartyMember = { id: string; name: string; cls?: string };

export function generateInitialQuests(
  scenario?: SimpleScenario,
  party: SimplePartyMember[] = []
): GeneratedQuest[] {
  const quests: GeneratedQuest[] = [];
  if (scenario?.title) {
    quests.push({
      title: `Erkundet: ${scenario.title}`,
      status: 'in-progress',
      category: 'main',
      priority: 'medium',
      progress: { current: 0, total: 3, description: 'Reist in die Region und sammelt Hinweise' },
      note: 'Beginnt eure Reise und erforscht die Umgebung.'
    });
  }

  // Add a setting-flavored side quest based on common themes
  const sideHooks = [
    'Sprecht mit den Einheimischen, um Gerüchte zu sammeln.',
    'Sichert Proviant und Ausrüstung in der Stadt.',
    'Findet einen geeigneten Unterschlupf für die Nacht.',
    'Untersucht seltsame Spuren am Wegesrand.'
  ];
  const hook = sideHooks[Math.floor(Math.random() * sideHooks.length)];
  quests.push({
    title: 'Erste Schritte in der Region',
    status: 'open',
    category: 'side',
    priority: 'low',
    progress: { current: 0, total: 1, description: 'Optionale Vorbereitung' },
    note: hook
  });

  // Add a light personal quest for the first party member
  const first = party[0];
  if (first) {
    const cls = (first.cls || '').toLowerCase();
    let personalTitle = `Ein persönliches Ziel für ${first.name}`;
    if (/(mag|mage|wizard|sorcerer)/.test(cls)) personalTitle = `${first.name} sucht arkanes Wissen`;
    else if (/(krieg|warrior|fighter|soldat)/.test(cls)) personalTitle = `${first.name} sucht eine ehrbare Klinge`;
    else if (/(schurk|rogue|dieb|assassin)/.test(cls)) personalTitle = `${first.name} hat eine offene Rechnung`;
    else if (/(wald|ranger|jäger|jaeger)/.test(cls)) personalTitle = `${first.name} will die Wildnis kartieren`;
    else if (/(paladin|templ|ritter)/.test(cls)) personalTitle = `${first.name} gelobt einen heiligen Auftrag`;
    else if (/(druid|druide)/.test(cls)) personalTitle = `${first.name} schützt das Gleichgewicht der Natur`;
    else if (/(monk|mönch|moench)/.test(cls)) personalTitle = `${first.name} strebt nach innerer Meisterschaft`;
    else if (/(warlock|hexenmeister)/.test(cls)) personalTitle = `${first.name} sucht die Gunst seines Patrons`;
    else if (/(bard|barde)/.test(cls)) personalTitle = `${first.name} sucht eine Ballade würdiger Taten`;

    quests.push({
      title: personalTitle,
      status: 'open',
      category: 'personal',
      priority: 'high',
      progress: { current: 0, total: 3, description: 'Ein persönlicher Pfad entfaltet sich' },
      note: 'Ein Ziel, das eurem Charakter wichtig ist. Verfolgt Hinweise, wenn sie auftauchen.'
    });
  }

  return quests;
}
