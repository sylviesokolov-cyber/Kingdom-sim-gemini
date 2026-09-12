# Valenreach

An anime medieval-fantasy **kingdom simulation RPG** with companion bonds and a gacha retinue
system, built as a landscape-first PWA.

Rise from nothing to the throne of a living kingdom, where the women you bond with are the
levers that move it.

## Stack

React 18 · TypeScript · Vite 5 · Tailwind 4 · Zustand · Vitest · PWA

## Commands

```bash
npm install
npm run dev        # development server
npm run typecheck  # tsc --noEmit
npm run test       # vitest
npm run build      # production build
npm run verify     # typecheck + test + build
```

## Documentation

Start with **[`CLAUDE.md`](./CLAUDE.md)** — the development contract. Then:

| Doc | Contents |
|---|---|
| [`docs/GAME_BIBLE.md`](docs/GAME_BIBLE.md) | World, cast, tone, canon |
| [`docs/DEVELOPMENT_PLAN.md`](docs/DEVELOPMENT_PLAN.md) | Phase roadmap |
| [`docs/DEVELOPMENT_STATUS.md`](docs/DEVELOPMENT_STATUS.md) | What is actually built |
| [`docs/CONTENT_GUIDE.md`](docs/CONTENT_GUIDE.md) | Writing style and content tier |
| [`docs/UI_DESIGN_SYSTEM.md`](docs/UI_DESIGN_SYSTEM.md) | Visual system and screen map |
| [`docs/systems/`](docs/systems/) | Per-system design specs |

## Origin

A clean architectural rebuild of [`kingdom-sim`](https://github.com/sylviesokolov-cyber/kingdom-sim),
keeping its world, cast, and art while rebuilding the engine to carry a much larger game.
