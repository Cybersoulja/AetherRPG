# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev          # Start dev server (client + server with hot reload) on port 5000
npm run check        # TypeScript type checking (run before committing)
npm run build        # Build client (Vite) + server (esbuild) for production
npm run start        # Start production server (requires build first)
npm run db:push      # Push Drizzle schema changes to Neon PostgreSQL

npm test             # Run all tests once (vitest run)
npm run test:watch   # Run tests in watch mode
npx vitest run client/src/components/game/MerchantShop.test.tsx  # Run a single test file
```

Path aliases: `@` → `client/src/`, `@shared` → `shared/`.

## Architecture Overview

**Monorepo**: `client/` (React SPA), `server/` (Express API), `shared/` (types + DB schema). All three share a single `tsconfig.json` in strict mode.

### Client State — Zustand Stores

All game state lives in `client/src/lib/stores/`. Every store uses `subscribeWithSelector` middleware. `useCharacter` and `useInventory` both hold a `GameEngine` instance (from `client/src/lib/gameEngine.ts`) which owns character creation formulas, combat math, and localStorage save/load logic.

| Store | Responsibility |
|---|---|
| `useCharacter` | Character stats, leveling, equipment, spells, talents, gold |
| `useInventory` | Items, crafting, selling, consuming |
| `useStoryEngine` | Story progression, choices, history |
| `useAIAgents` | Template-based DM/NPC responses |
| `useOracle` | Five-dice poker oracle for resolving player situations |
| `useAudio` | Background music and SFX |
| `useQuests` | Quest tracking and objectives |
| `useAchievements` | Achievement unlocks and progress |
| `useGame` | Cross-cutting game lifecycle (start, reset, save) |

### Story System

`useStoryEngine` currently uses `CustomStoryEngine` (`client/src/lib/customStoryEngine.ts`): a hand-coded story graph where each `StoryNode` has `id`, `text`, `choices[]`, and optional `tags[]`. Tags trigger side effects (item grants, quest updates). Story state persists to `localStorage` under key `rpg_story_save`.

`InkStoryEngine` (`client/src/lib/inkStory.ts`) is a drop-in alternative backed by `client/src/data/story.ink.json`. To switch engines, replace the import in `useStoryEngine.tsx`.

### AI Agents and Oracle

**AI Agents** (`client/src/lib/aiAgents.ts`): no external API. Each agent has `responseTemplates` keyed by context string (e.g., `combat_start`, `victory`). Call `getResponse(agentId, context, playerName)`.

**Oracle** (`client/src/lib/oracleEngine.ts`): rolls 5 dice, scores the hand (pairs → five-of-a-kind), maps to a tier 0–5, and returns a narrative string from hand-crafted templates.

### Server

`server/routes.ts` registers all REST endpoints:
- `POST /api/auth/register|login|logout` — bcrypt hashing, `req.session.userId` for auth
- `POST /api/characters/save`, `GET /api/characters/load` — character stored as JSONB
- `POST /api/saves`, `GET /api/saves/:slot` — per-slot game state snapshots
- `GET|POST /api/leaderboard` — leaderboard entries
- `POST /api/analytics/event` — optional event tracking

`server/storage.ts` exports `DatabaseStorage` (implements `IStorage`), which wraps Drizzle queries. Sessions are in-memory via memorystore; swap to `connect-pg-simple` for production persistence.

### Database Schema (`shared/schema.ts`)

Tables: `users`, `characters` (JSONB `character_data`), `game_saves` (JSONB `game_state` + `slot` integer), `leaderboard_entries`, `analytics_events`. All foreign-key to `users.id`. Zod insert schemas are auto-derived via `drizzle-zod`.

### Static Game Data

`client/src/data/` holds TypeScript objects imported directly — no fetch needed:
- `items.ts` — weapons, armor, consumables
- `spells.ts` — spells with mana costs and effects
- `quests.ts` — quest definitions and objectives
- `talents.ts` — skill tree nodes per class
- `achievements.ts` — achievement definitions
- `characters.ts` — `CHARACTER_CLASSES` with base stats per class
- `merchants.ts` — merchant definitions with `ShopItem[]` inventory
- `recipes.ts` — crafting recipes

### Merchant / Shop Pricing

`ShopItem` wraps `Item` with `stock` and `priceModifier`. Final buy price: `Math.ceil(item.value * priceModifier * merchant.buyPriceModifier)`. Stock is tracked in local component state per session — it is not persisted to the server.

## Testing

Tests live alongside components in `client/src/`. `vitest.config.ts` is separate from `vite.config.ts` to avoid build interference. Uses **vitest v2** (not v4) — v4's rolldown bundler is incompatible with `@vitejs/plugin-react` JSX transforms.

Mock Zustand stores per-test file with `vi.mock('../../lib/stores/useCharacter', ...)`. Do not rely on real store state in component tests.

## Key Patterns

**New Zustand store**: create `client/src/lib/stores/useYourFeature.tsx`, use `subscribeWithSelector`, define a state interface with typed actions, export `create<YourState>()(subscribeWithSelector(...))`.

**New story node**: add to `createStoryData()` in `customStoryEngine.ts` with `id`, `text`, `choices[]`, and optional `tags[]` (format: `'location:town'`, `'item:sword'`).

**Schema change**: edit `shared/schema.ts`, run `npm run db:push`, types are auto-inferred via `typeof table.$inferSelect`.

## Environment Variables

Copy `.env.example` → `.env`:
- `DATABASE_URL` — Neon PostgreSQL connection string (required for any DB operation)
- `SESSION_SECRET` — express-session secret
- `VITE_ENABLE_CLOUD_SAVES`, `VITE_ENABLE_LEADERBOARDS`, `VITE_ENABLE_MULTIPLAYER` — feature flags (`"true"`/`"false"`)
- `VITE_MAX_SAVES` (default `5`), `VITE_MAX_INVENTORY` (default `100`)

All `VITE_*` vars are inlined into the client bundle at build time and accessed via `import.meta.env`.
