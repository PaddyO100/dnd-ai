# Aethel's Forge – Active QA To‑Do

Last updated: 2025-08-19

## Recent Fixes (2025-08-19 Session)

- [x] **Empty Inventories Fixed**
  - Updated `startGame()` to properly equip multiple starter items (weapons + chest armor).
  - Enhanced inventory location assignment to ensure all items have proper categories.

- [x] **Music Looping & Settings Return Issues**
  - Fixed `audioManager.changeScene()` to not restart identical tracks.
  - Music now continues seamlessly after returning from settings.
  - Reduced aggressive scene changes on every DM message; only on combat/location changes.

- [x] **DM Character Addressing**
  - Enhanced AI prompts to always address characters by name (e.g., "Liora, du siehst...").
  - Added specific guidance for multi-character scenarios.

- [x] **Dice Roll Display & Visual Dice**
  - Fixed dice results handling to use `data.diceResults` format.
  - Ensured visual dice overlay appears when dice are requested.
  - Updated `DiceResultsDisplay` component for better integration.

- [x] Portraits not shown in GameView
  - Likely cause: portrait URL pattern/assets mismatch or UI not using `getPortraitUrl` consistently.
  - Tasks:
  - Verify assets in `public/portraits/**` and the path schema produced by `getPortraitUrl`. (verified)
  - Ensure player cards fall back gracefully if an image is missing (extended to GameView + Sidepanel mini strip and header).
  - Align `portraitSystem` mappings with actual filenames (race/class/gender). (matches folders; added safe fallback via ui-avatars)

- [x] In‑game music shouldn’t default to “Lake”; it should match the start scene
  - Tasks:
  - On `GameView` mount, derive a scene from scenario title/summary and call `changeScene(scene)`. (implemented)
  - DM updates also detect German combat terms for switching to combat. (implemented)
  - AudioControls remains manual; transitions are debounced/serialized.

- [x] Inventory is empty despite items being marked
  - Tasks:
  - Confirm character generation returns starting equipment. (starter kits + normalization)
  - Make sure `startGame()` sets per‑player inventory and UI reads from `player.inventory` (not only the global store inventory array). (verified)
  - If equipment slots are modeled separately, map starting items to slots. (auto‑equip one logical starter for visibility)

- [x] Quests should vary per scenario and fit its theme
  - Tasks:
  - Generate a quest list tied to the selected scenario (either in scenario API or when confirming the scenario). (implemented in questGenerator)
  - Persist quests into the store on `startGame()`; display in the "Quests" tab. (wired)
  - Include basic attributes (type, status, difficulty) and dynamic text. (categories/priority/progress supported)
  - Progress:
  - [x] Seed initial quest on `startGame()` based on scenario title (open status).
  - [x] Expanded with multiple themed quests and categories.

- [x] Dice UI shouldn’t be always visible; show as popup when needed
  - Tasks:
  - Hide the persistent Dice tab. (removed from Sidepanel)
  - Keep VisualDice modal with button in GameView. (already present)
  - Dice results banner remains on-demand.

- [x] Autosave/manual save behavior & visibility (Spielstände)
  - Tasks:
  - Autosave: write to a fixed auto‑slot and overwrite silently. (server route now uses dedicated auto-save; quick load UI added)
  - Manual saves: prompt if slot not empty (2‑step confirm to overwrite). (import flow now confirms overwrite; dedicated save modal already in GameView)
  - Ensure the Spielstände tab reads and refreshes metadata after save. (tab refreshes; listens to storage changes; shows auto-save banner)
  - Verify existing saves appear and selection works; show timestamps. (present; load/delete OK)

## Completed recently (checked)

- [x] Start at Main Menu by default (cold start and reset)
  - `gameStore` reset + persist migration forces `step: 'mainMenu'` when undefined or stuck in onboarding.
- [x] Prevent double/overlapping sounds
  - `audioManager` serializes scene transitions and debounces rapid calls.
- [x] Character creation soundtrack wiring
  - Onboarding plays `character_creation` on mount; returns to `main_menu` when appropriate.
- [x] Multi‑player selection loop works (Class → Race → Gender per player)
  - Step 8 now uses the unified continue flow; advances to next player or finishes.
- [x] Scenario generation robustness
  - API returns a deterministic mock on 402/429/5xx or bad/empty JSON.
- [x] Canonical scene→music mapping everywhere
  - Mapping matches your requested list; `AudioControls` includes `main_menu`.
- [x] Responsive layout improvements
  - Viewport‑based max widths for key containers and modals.
- [x] Startup music reliability (muted autoplay, then unmute)
  - Initiates main menu music on app mount; unmutes on play/first gesture.
- [x] Zod error on empty classes resolved
  - Characters API accepts empty `classes`; uses `playerSelections`.

## Suggested order next

1) Portraits + Inventory (first‑impression blockers)
2) In‑game music scene derivation
3) Dice popup UX
4) Autosave/manual save UX + Spielstände wiring
5) Scenario‑based quest generation

---

Notes:
- I’ll avoid removing working features; fixes will be scoped to the listed components/files.
- Where external AI calls are involved, deterministic fallbacks will be provided to keep flows usable offline or under provider errors.
