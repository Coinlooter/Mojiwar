# Emojitsu

Emojitsu is an async multiplayer emoji auto-battler RPG. Players pick an emoji,
name it, equip up to three permanent cards at the start, and challenge other
emojis in server-simulated round battles. Opponents do not need to be online:
when they return, they see how many battles happened, which ones were won or
lost, and which rewards were earned.

## Tech stack

- Next.js App Router
- React + TypeScript
- Supabase Auth + Postgres
- Supabase Row Level Security for player-owned data
- Vitest for isolated game-rule tests

## Game architecture

The core rule code is intentionally independent from React and Supabase:

```txt
src/lib/game/
  battle-engine.ts     deterministic round simulation
  calculate-power.ts   central combat-power formula
  cards.ts             starter card catalog
  leveling.ts          XP and level progression
  matchmaking.ts       power-range opponent selection
  rewards.ts           weighted card rewards
```

The client never decides battle outcomes. A server path should:

1. load both character loadouts and decks,
2. simulate the battle with a server-generated seed,
3. persist the battle log, XP changes, and card reward,
4. return the battle id so the UI can replay the stored log.

## Supabase schema

Initial schema lives in:

```txt
supabase/migrations/20260609175505_initial_schema.sql
```

Tables:

- `profiles`
- `characters`
- `cards`
- `player_cards`
- `deck_slots`
- `battles`

All public tables have RLS enabled. Client-visible keys must be provided via:

```txt
NEXT_PUBLIC_SUPABASE_URL=https://xqbnqfntxeaqbcjakzfd.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_WSExgYEUSmMbfKqCkCoOuA_UQsUHRRK
```

Copy `.env.example` to `.env.local` for local development.

Project:

- Supabase project: `Emojitsu`
- Project ref: `xqbnqfntxeaqbcjakzfd`
- Region: `eu-west-1`

## Auth flow

Emojitsu starts with a kid-friendly anonymous Supabase account:

1. A new player clicks **Sofort spielen**.
2. The browser creates an anonymous Supabase Auth user.
3. The player chooses an emoji and name on `/onboarding`.
4. `profiles` and `characters` rows are stored with the authenticated `user_id`.
5. Returning on the same device reuses the cookie-backed session.

Enable **Anonymous Sign-ins** in the Supabase project's Auth providers before
using the flow in production.

Progress can be secured in two ways:

1. **Login code** — color + animal + two digits (e.g. `blauerelefant65`), created in the dashboard
2. **Parent email** — links the anonymous account via Supabase `updateUser`

Log in on a new device via `/login`. Set the Supabase Auth
redirect URL to `https://<your-domain>/auth/confirm` for email confirmation.

## Local development

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run typecheck
npm run test
npm run build
```

## MVP routes

- `/` landing page with a simulated battle summary
- `/dashboard` offline battle inbox concept
- `/opponents` targeted and automatic matchmaking concept
- `/deck` starter card/deck concept
- `/battle/demo` replay prototype for a stored battle log
