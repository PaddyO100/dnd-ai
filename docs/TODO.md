# Aethel's Forge - Bug Fixes and Feature Tasks

This document tracks the required changes and their status.

## Task List

- [x] **Localization:**
    - [x] Translate class selection attributes (Dexterity, Wisdom, etc.) to German.
    - [x] Translate attributes in the "Distribute Attributes" step to German.
    - [x] Translate skill selection attributes (combat, magic, etc.) to German.
    
    **Weitere Verbesserungen:**
    - [x] **Konsistente Deutsche Terminologie**
        - Implementiert: `lib/i18n/germanTerms.ts` mit D&D-Begriffsdatenbank
        - Einheitliche Übersetzungen im UI (z. B. Geschicklichkeit statt Dexterity)
        - Tooltip-System für Fachbegriffe implementiert (`app/components/ui/Tooltip.tsx`)

- [ ] **Character Creation Wizard:**
    - [x] Fix the broken name generation feature.
    - [x] Remove the "Distribute Attributes" step and replace it with a dice roll mechanism.
    
    **Verbesserungen für bessere UX:**
    - [ ] **Erweiterte Charaktervorschau**
        - Live-Preview des Charakters während der Erstellung
        - Visuelle Darstellung der Attributswerte (Balken/Sterne)
        - Klassenspezifische Beschreibungen und Tipps
        - "Was bedeutet das?"-Tooltips für Anfänger
    
    - [ ] **Intelligente Namengenerierung**
        - Rassen-spezifische Namensmuster (Elfisch, Zwergisch, etc.)
        - Geschlechtsspezifische Namen
        - Titel und Beinamen-Generator
        - History-basierte Vorschläge
    
    - [ ] **Guided Mode für Anfänger**
        - Optionaler "Geführter Modus" mit Empfehlungen
        - Vorgefertigte Archetypen (Tank, Healer, DPS)
        - Quick-Start mit "Zufälliger Held" Option
    
    - [x] **Implement comprehensive, class-specific equipment selection**
        **✅ IMPLEMENTIERT:**
        - ✅ Erweitert `data/equipment.ts` mit klassenspezifischen Equipment-Sets
        - ✅ Erstellt umfassende Datenbank mit Equipment für alle 9 Klassen:
          - Krieger: Schwere Rüstungen, Schilde, Zweihandwaffen
          - Magier: Roben, Zauberstäbe, Fokusse, Zauberbücher
          - Schurke: Leichte Rüstungen, Dolche, Dietriche, Gifte
          - Paladin: Mittlere/Schwere Rüstungen, Heilige Symbole
          - Waldläufer: Bögen, Fallen, Überlebensausrüstung
          - Druide: Naturstäbe, Kräuter, Tierfelle
          - Mönch: Kampfstäbe, Handschuhe, Meditationsperlen
          - Hexenmeister: Pakte, Grimoires, Ritualkomponenten
          - Barde: Instrumente, Aufführungsausrüstung
        - ✅ Updated `CharacterCreator.tsx` Step 4 mit kategorisierten Auswahlmöglichkeiten
        - ✅ Equipment-Sets mit Synergien (z.B. passende Rüstung + Waffe = Bonus)
    
    - [x] **Implement class- and race-specific spell lists**
        **✅ IMPLEMENTIERT:**
        - ✅ Erweitert `data/spells.ts` mit vollständigen Zauberlisten:
          - Magier: 7+ Zauber (Feuerball, Teleport, Zeitstop, etc.)
          - Hexenmeister: Eldritch Blast Varianten, Paktmagie
          - Paladin: Heilzauber, Schutzsegen, Göttliche Intervention
          - Druide: Naturzauber, Tiergestalt-Varianten, Wettermagie
          - Barde: Inspirationszauber, Illusionen, Verzauberungen
          - Waldläufer: Jägerzeichen, Tierfreundschaft
        - ✅ Erstellt vollständige `SpellData` Interface mit:
          - Zauber-Datenbank mit deutschen Übersetzungen
          - Zauberplatz-System basierend auf Charakterlevel
          - Mana/Zauberpunkte-System integriert
          - Spell-Kombos und Synergien zwischen Zaubern
        - ✅ Komplett neue `SpellsTab.tsx` mit erweiterter Funktionalität

- [x] **In-Game UI/UX:**
    - [x] **Remove the AI model selection from in-game settings**
        **Implementierung:**
        - ✅ Model-Selektor entfernt – keine Auswahl mehr im UI
        - ✅ Nur Environment-Variable basierte Konfiguration (NEXT_PUBLIC_OPENROUTER_MODEL)
        - ✅ Aktuelles Modell wird Read-Only angezeigt in `app/settings/page.tsx`
    
    - [x] **Add an initial welcome message from the DM (Aethel)**
        **✅ IMPLEMENTIERT:**
        - ✅ Erweitert `app/components/GameView.tsx` mit initialem Willkommens-Hook
        - ✅ Fügt automatische Welcome-Message bei Spielstart hinzu:
          - Personalisierte Begrüßung mit Charakternamen
          - Scenario-Integration mit Zusammenfassung
          - Atmosphärische Einleitung von Aethel
          - Aufforderung zur ersten Aktion
    
    - [x] **Fix inventory items not appearing in-game**
        **✅ IMPLEMENTIERT:**
        - ✅ Problem in `InventoryTab.tsx` behoben - verwendet jetzt sowohl Player- als auch globales Inventar
        - ✅ Korrekte Verbindung zu `useGameStore` inventory Array
        - ✅ Kombiniert Player-Inventar mit globalem Inventar für vollständige Anzeige
    
    - [x] **Ensure quests are generated and displayed correctly**
        **✅ IMPLEMENTIERT:**
        - ✅ Erweitert `/api/ai/next-turn/route.ts` um Quest-Effects korrekt zu verarbeiten
        - ✅ Updated Quest Schema mit vollständigen Feldern (category, priority, progress, etc.)
        - ✅ `QuestsTab` funktioniert korrekt mit gameStore quests
    
    - [x] **Fix saved games not being displayed**
        **✅ IMPLEMENTIERT:**
        - ✅ Komplett neue IndexedDB-basierte Speicher-Lösung mit Dexie.js
        - ✅ `lib/db/database.ts` mit AethelsForgeDB-Klasse
        - ✅ Unbegrenzte Speicherslots, Versionierte Saves
        - ✅ Export/Import als JSON Backup
        - ✅ Updated `SaveGameManager.tsx` verwendet neue DB
        - ✅ Entfernt veraltete localStorage-basierte Saves
        - ✅ Neue `app/saves/page.tsx` mit IndexedDB-Integration
        - ✅ Funktionaler Export/Import von Spielständen
        - ✅ Game Store mit IndexedDB loadGame/saveGame Actions
    
    - [x] **Ensure Director panel displays initial advice**
        **✅ IMPLEMENTIERT:**
        - ✅ Initialisiert Director-State in `GameView` beim Start
        - ✅ Welcome Message System erstellt und in `GameView` integriert
        - ✅ Verwendet Partynamen und Scenario für personalisierte Begrüßungen
        - ✅ Default-Advice für neue Spiele automatisch generiert
        - ✅ Director Panel zeigt initial contextualisierte Hinweise
    - ✅ Auto-Scroll im Chat bei neuen Nachrichten
    - ✅ „Ältere Nachrichten laden“-Button für große History

## Neue Features & Verbesserungen

- [x] **Lokale Datenbank Integration:**
    - [x] **IndexedDB mit Dexie.js**
        **✅ IMPLEMENTIERT:**
        - ✅ IndexedDB ist die beste Wahl für lokale Datenhaltung im Browser:
          - Große Speicherkapazität (50MB - unbegrenzt)
          - Asynchrone API verhindert UI-Blocking
          - Transaktionale Sicherheit
          - Bessere Performance als localStorage
          - Komplexe Abfragen möglich
        
        **✅ Implementiert mit Dexie.js:**
        - ✅ `lib/db/database.ts` mit AethelsForgeDB-Klasse
        - ✅ SavedGame, Campaign, CharacterTemplate, GameSettings Tabellen
        - ✅ DatabaseManager mit vollständiger CRUD-Funktionalität
        
        **✅ Features:**
        - ✅ Unbegrenzte Speicherslots
        - ✅ Versionierte Saves für Kompatibilität
        - ✅ Export/Import als JSON Backup
        - ✅ Offline-First Architektur
        - ✅ Automatische Schema-Migration
        - ✅ Game Store komplett mit IndexedDB integriert
        - ✅ Entfernung aller veralteten API-Routen (/app/api/saves/*)

- [ ] **Performance Optimierungen:**
    - [ ] **Implement Virtual Scrolling für History**
        - Verwende `react-window` für große History-Listen
        - Lazy-Load ältere History-Einträge (Basis vorhanden durch Pagination)
        - Implementiere Pagination für Saves
    
    - [ ] **Code-Splitting und Lazy Loading**
        - Splitze große Components (Modals, Tabs) mit `React.lazy()`
        - Lade Tutorial-System nur bei Bedarf
        - Optimiere Bundle-Size durch Tree-Shaking

- [ ] **UI/UX Verbesserungen:**
    - [ ] **Dark Mode Verbesserungen**
        - Verfeinere Kontraste für bessere Lesbarkeit
        - Füge Smooth-Transitions zwischen Themes hinzu
        - Implementiere System-Theme-Detection
    
    - [ ] **Mobile Responsive Design**
        - Erstelle Mobile-First Layout für Tablets/Phones
        - Swipe-Gestures für Tab-Navigation
        - Collapsible Sidepanel für kleine Screens
    
    - [ ] **Animationen und Feedback**
        - Füge Lottie-Animationen für Würfelwürfe hinzu
        - Smooth Scroll-to-Bottom bei neuen Nachrichten
        - Typing-Indicator während AI generiert
        - Toast-Notifications für wichtige Events
    
    - [ ] **Accessibility (A11y)**
        - ARIA-Labels für alle interaktiven Elemente
        - Keyboard-Navigation Support
        - Screen-Reader Kompatibilität
        - High-Contrast Mode

- [ ] **Gameplay Features:**
    - [ ] **Kampfsystem Erweiterung**
        - Initiative-Tracker mit Turn-Order
        - Detailliertes Schadenssystem (Schadenstypen)
        - Conditions/Status-Effects (Vergiftet, Gelähmt, etc.)
        - Taktische Positionierung mit Grid-System
    
    - [ ] **NPC System**
        - NPC-Generator mit Persönlichkeiten
        - Beziehungssystem (Ruf, Sympathie)
        - Händler mit dynamischen Preisen
        - Companion-NPCs die der Party beitreten können
    
    - [ ] **Crafting System**
        - Rezepte basierend auf Skills
        - Material-Sammlung aus der Umgebung
        - Ausrüstungs-Upgrades und Verzauberungen
    
    - [ ] **Achievement System**
        - Meilensteine und Erfolge tracken
        - Belohnungen für besondere Aktionen
        - Statistiken und Progress-Tracking

- [ ] **Technische Verbesserungen:**
    - [ ] **Testing Infrastructure**
        - Erweitere Unit-Tests auf 80% Coverage
        - E2E Tests für kritische User-Flows
        - Visual Regression Tests mit Playwright
        - Performance Monitoring mit Lighthouse
    
    - [ ] **Error Handling**
        - Global Error Boundary mit Fallback UI
        - Sentry Integration für Error Tracking
        - Graceful Degradation bei API-Fehlern
        - Offline-Modus mit Service Worker

- [ ] **AI Verbesserungen:**
    - [ ] **Erweiterte Director AI**
        - Emotion-Tracking für NPCs
        - Langzeit-Gedächtnis für wiederkehrende Charaktere
        - Dynamische Welt-Events basierend auf Spieleraktionen
        - Adaptive Storytelling mit mehreren Story-Arcs
        - Kontextuelle Erinnerungen (AI merkt sich wichtige Spielerentscheidungen)

- [ ] **Content & Localization:**
    - [ ] **Weitere Kampagnen**
        - 5+ vorgefertigte Kampagnen mit unterschiedlichen Themes
        - Community-Kampagnen Import/Export (via IndexedDB)
        - Kampagnen-Editor für Custom Content
        - Kampagnen-Bewertungssystem

## Architektur-Refactoring

- [ ] **State Management Optimierung**
    - Implementiere Optimistic Updates
    - Bessere State-Normalisierung
    - State-Snapshots für Undo/Redo Funktionalität
    
- [ ] **API Layer Verbesserung**
    - Request-Caching mit SWR oder React Query
    - Rate-Limiting für API Calls
    - Retry-Logic mit exponential backoff
    
- [ ] **Component Library**
    - Erstelle Storybook für UI Components
    - Design System mit Token-basierten Styles
    - Wiederverwendbare Compound Components

## Priorisierung

**Sofort (Critical):** ✅ ALLE ABGESCHLOSSEN
1. ✅ Fix Inventory Display
2. ✅ Fix Quest Generation  
3. ✅ Fix Save/Load System
4. ✅ Add Welcome Message (mit Story-Zusammenfassung)

**Kurzfristig (High):**
1. ✅ IndexedDB Integration für bessere Saves
2. ✅ Class-specific Equipment
3. ✅ Spell System
4. Mobile Responsive Design

**Mittelfristig (Medium):**
1. Kampfsystem Erweiterung
2. NPC System
3. Achievement System
4. Character Creation Wizard Verbesserungen

**Langfristig (Low):**
1. Kampagnen-Editor
2. Advanced Director AI Features
3. Performance Optimierungen
4. Testing Infrastructure
