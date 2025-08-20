# Kritische Gameplay-Bugs - Analyse und Lösungsplan

## 🚨 Identifizierte Probleme

### 1. **Hauptkonflikt hat keinen Einfluss auf Szenarien**
- **Problem**: User-Input des Hauptkonflikts wird in der Szenario-Generierung ignoriert
- **Auswirkung**: Generierte Szenarien passen nicht zur gewünschten Geschichte
- **Vermutete Ursache**: Conflict-Parameter wird nicht korrekt an AI-Prompts weitergegeben

### 2. **Charakter-Klasse stimmt nicht überein (Paladin → Zauberer)**
- **Problem**: Wizard-Auswahl (Männlicher Menschen Paladin) wird ignoriert
- **Angezeigt**: Männlicher Menschen Zauberer 
- **Vermutete Ursache**: 
  - `classNameToSlug()` Normalisierung fehlerhaft
  - Character-Parsing in `generate-characters` API überschreibt User-Selections
  - Race/Class-Mapping zwischen Wizard und AI-Generation inkonsistent

### 3. **Leeres Inventar trotz Startausrüstung**
- **Problem**: Characters haben keine Items trotz Auto-Equip Logic
- **Vermutete Ursache**:
  - `normalizeInventory()` Funktion generiert keine Items
  - Auto-Equip Logic in `gameStore.startGame()` schlägt fehl
  - Mock-Inventory-Generation funktioniert nicht

### 4. **Quests nicht vollständig in Deutsch**
- **Problem**: Mischung aus deutschen und englischen Quest-Texten
- **Vermutete Ursache**: 
  - AI-Prompts verwenden inkonsistente Sprachvorgaben
  - Quest-Generation berücksichtigt `settings.language` nicht
  - Fallback-Quests sind auf Englisch

### 5. **Würfel-Ergebnisse passen nicht zu DM-Antworten**
- **Problem**: Gewürfelte Zahlen stimmen nicht mit DM-Interpretation überein
- **Zusätzlich**: DM-Antworten passen nicht zu User-Input
- **Vermutete Ursache**:
  - Dice-Results werden nicht korrekt an AI-Context weitergegeben
  - Director-AI erhält falsche/unvollständige Informationen
  - Turn-Processing ignoriert tatsächliche Würfel-Ergebnisse

## 🔧 Lösungsplan

### Phase 1: Character-Generation Fix
1. **Überprüfe `classNameToSlug()` Normalisierung**
   - Sicherstellen: "Paladin" → "paladin" mapping
   - Teste alle Character-Classes auf korrekte Normalisierung
   
2. **Validiere Character-Parsing Logic**
   - `mockParty()` muss `playerSelections` priorisieren
   - AI-Generated Classes dürfen User-Selection nicht überschreiben
   
3. **Inventory-Generation reparieren**
   - `normalizeInventory()` muss tatsächliche Items generieren
   - Class-spezifische Starter-Equipment implementieren
   - Auto-Equip Logic in `startGame()` validieren

### Phase 2: Scenario & Language Fix  
4. **Conflict-Integration in Szenario-Generation**
   - API-Route `generate-scenarios` muss Conflict-Parameter verwenden
   - AI-Prompts müssen User-Conflict einbeziehen
   
5. **Deutsche Sprachkonsistenz**
   - Alle AI-Prompts auf `language: 'de'` Parameter prüfen
   - Quest-Generation muss `settings.language` respektieren
   - Fallback-Texte auf Deutsch umstellen

### Phase 3: Dice & Context Integration
6. **Würfel-Ergebnis Integration**
   - Dice-Results müssen korrekt an `next-turn` API weitergegeben werden
   - Director-AI muss tatsächliche Roll-Ergebnisse erhalten
   - DM-Antworten müssen User-Input und Würfel-Context berücksichtigen

## 📝 Test-Szenarien nach Fix

1. **Character-Test**: Erstelle "Männlicher Menschen Paladin" → Validiere Class/Race/Gender
2. **Inventory-Test**: Prüfe Startausrüstung für alle Klassen
3. **Szenario-Test**: Eingabe spezifischen Conflicts → Validiere Integration 
4. **Language-Test**: Deutsche Sprache → Alle Texte auf Deutsch
5. **Dice-Test**: Würfeln + Action → DM berücksichtigt echte Ergebnisse

## 🎯 Erfolgskriterien

- ✅ Wizard-Selections werden 100% korrekt übernommen
- ✅ Alle Characters haben class-spezifische Startausrüstung
- ✅ User-Conflicts erscheinen im generierten Szenario  
- ✅ Komplette deutsche Lokalisierung
- ✅ Würfel-Ergebnisse stimmen mit DM-Antworten überein
- ✅ DM-Antworten sind kontextuell relevant zu User-Actions

---

**Nächste Schritte**: Systematische Implementierung aller Fixes mit Validierung nach jeder Phase.
