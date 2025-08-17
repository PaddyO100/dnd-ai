# Aethel's Forge - AI Coding Agent Instructions

## Project Overview
Aethel's Forge is a browser-based, AI-moderated D&D RPG built with Next.js 15, featuring a sophisticated Director AI system for dynamic game mastering. The architecture follows a client-first approach with Zustand state management and OpenRouter AI integration.

## Architecture Essentials

### Core Data Flow
```
GameView → Zustand Store → API Routes → OpenRouter → Director AI → Effects → Store Update
```

**Critical Pattern**: All game state changes flow through `Effects` objects validated by Zod schemas, ensuring deterministic gameplay.

### State Management (Zustand + Persist)
- **Central Store**: `lib/state/gameStore.ts` - Single source of truth for all game state
- **Key Pattern**: Actions return void, state updates are immediate via `set((state) => {...})`
- **Persistence**: Automatic localStorage sync via zustand/middleware
- **Type Safety**: All state mutations go through typed actions (setSelections, applyEffects, startGame)

### AI Integration Architecture
**OpenRouter Client** (`lib/ai/openrouter.ts`):
- Uses `openai/gpt-oss-20b:free` model for cost efficiency
- Function calling support for structured tool interactions
- Environment variables: `OPENROUTER_API_KEY`, `OPENROUTER_BASE_URL`, `OPENROUTER_MODEL`

**Director AI System** (`lib/engine/director.ts`):
- Analyzes game pacing, player spotlight distribution, difficulty balance
- Generates smart tool calls for dice rolls and character updates
- Integrates with turn processing via `getEnhancedDirectorAdvice()`

**Tool Call Pattern**:
```typescript
// Tools are validated Zod schemas that convert to Effects
const toolCall: ToolCall = {
  tool: 'updateCharacter',
  args: { id: 'player1', patch: { hpDelta: -5 } }
}
// Converted to Effects object for state application
const effects: Effects = {
  party: [{ name: 'Hero', hpDelta: -5 }]
}
```

## Critical Development Patterns

### API Route Structure
All AI endpoints follow this pattern (`app/api/ai/*/route.ts`):
1. Zod input validation with explicit schemas
2. Director AI analysis integration
3. OpenRouter function calling with tool validation
4. Tool execution → Effects conversion
5. Structured JSON response with dmText, effects, and dice properties

### Component Integration
**GameView** (`app/components/GameView.tsx`):
- Main game interface orchestrating all interactions
- Tutorial system integration via `useTutorialStore` triggers
- Director AI advice injection into API calls

**State Synchronization**:
```typescript
// Always use getState() for current state in async operations
const { history, party } = useGameStore.getState();
const directorAdvice = getEnhancedDirectorAdvice({ history, party, historyCount: history.length });
```

### Auto-Save System
**Pattern**: Background persistence with conflict resolution
- `lib/saves/autoSaveManager.ts` - Configurable intervals, activity detection
- `components/AutoSaveProvider.tsx` - React integration with status monitoring
- Triggers only on meaningful game progress (>3 history entries, recent activity)

## Testing Approach

### Unit Tests (`tests/unit/`)
- **State Testing**: Mock zustand persistence, test all store actions
- **AI Integration**: Mock OpenRouter responses, test tool call parsing
- **Component Testing**: React Testing Library with mocked dependencies

### Test Patterns:
```typescript
// Always reset store state between tests
beforeEach(() => {
  useGameStore.getState().reset()
})

// Mock external dependencies consistently
vi.mock('zustand/middleware', () => ({ persist: (fn: any) => fn }))
```

## Build & Development

### Commands
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Production build with type checking
- `npm run test` - Vitest unit tests
- `npm run e2e` - Playwright E2E tests

### Environment Setup
Required variables in `.env.local`:
```bash
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=openai/gpt-oss-20b:free
```

## Key Integration Points

### Theme System
- CSS variables in `styles/themes.css` with 6 themes (light/dark/auto + 3 fantasy)
- `components/ThemeProvider.tsx` manages theme switching and meta tag updates
- Settings persist theme choice in game store

### Image Generation
- Removed. The app is text-only now.

### Tutorial System
- Non-intrusive overlay in `app/components/tutorial/TutorialOverlay.tsx`
- Event-driven triggers via `lib/tutorial/tutorialState.ts`
- Integrated into GameView with `triggerEvent('game_start')` pattern

## Common Gotchas

1. **State Updates**: Always use store actions, never mutate state directly
2. **API Types**: Use proper TypeScript imports, avoid `any` casts in API routes
3. **Effects Validation**: All game changes must flow through validated Effects schemas
4. **Director Integration**: Include director advice in API calls for enhanced AI responses
5. **CSS Issues**: Ensure @import statements come before all other CSS rules

## File Organization
- `/app` - Next.js App Router pages and components
- `/lib` - Business logic (state, AI, game engine)
- `/tests` - Unit and integration tests
- `/docs` - Architecture and specification documentation
- `/styles` - CSS themes and global styles

This codebase prioritizes type safety, deterministic gameplay, and AI-enhanced user experience. Always validate inputs, handle async operations carefully, and maintain the Director AI integration for optimal game flow.
