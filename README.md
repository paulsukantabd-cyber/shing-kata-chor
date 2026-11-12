# সিঁধেল চোর — শিংকাটা কাহিনি

> “সিঁধ কাটবি, না ধরা খাবি?”

A Bangladeshi rural-night **comedy stealth** browser game. You play a barefoot
village thief in a lungi, sneak towards a mud house, and try to cut a hole in its
wall without waking the whole bazaar.

**Phase 1** delivers a production-quality foundation and a genuinely playable
prototype: cinematic welcome screen, character customisation, preparation
oils, a real Phaser night village with parallax layers, a controllable
animated thief, touch controls, and the “সিঁধ কাটা” mini-game.

---

## Tech stack

| Layer      | Choice                                                  |
| ---------- | ------------------------------------------------------- |
| App shell  | Vue 3 (`<script setup>`) + TypeScript (strict)           |
| Gameplay   | Phaser 3 (`3.90.0`)                                      |
| State      | Pinia 4                                                  |
| Styling    | Tailwind CSS 3                                           |
| Build      | Vite 8                                                   |
| Audio      | Web Audio API — fully procedural, zero audio files       |
| Art        | Procedural: SVG character parts + Canvas2D village paint |
| Tests      | Vitest 5 + `@vue/test-utils` + puppeteer-core smoke test |

No backend. Everything persists to `localStorage`.

---

## Getting started

```bash
npm install
npm run dev          # http://localhost:5173
```

### All scripts

| Script              | What it does                                                  |
| ------------------- | ------------------------------------------------------------- |
| `npm run dev`       | Vite dev server with HMR                                       |
| `npm run build`     | Type-check (`vue-tsc -b`) then production build into `dist/`   |
| `npm run preview`   | Serve the production build (used by the smoke test)            |
| `npm run typecheck` | Strict TypeScript check only                                   |
| `npm test`          | Vitest unit + component suite                                  |
| `npm run smoke`     | Headless-Chrome gameplay smoke test (see below)                |

### Browser smoke test

The smoke test drives the **real game** in headless Chrome — it walks the
welcome → setup → preparation → village path, moves the thief with the
keyboard, opens the house interaction, plays the mini-game and returns to the
menu. It fails on any console error, page error or failed request.

```bash
npm run build
npm run preview -- --port 4173        # terminal 1
npm run smoke                         # terminal 2
```

Screenshots and a JSON report land in `smoke-shots/`.

---

## How to play

**Desktop**

| Key                    | Action                |
| ---------------------- | --------------------- |
| `A` / `←`              | Move left             |
| `D` / `→`              | Move right            |
| `Shift`                | Run                   |
| `E`                    | Interact (cut the সিঁধ) |
| `Esc`                  | Pause / resume        |

**Mobile** — an on-screen pad appears automatically on touch devices (Left,
Right, Run and a contextual action button). Multi-touch is supported, and the
pad never covers the player or the house.

Walk up to the mud house, wait for **“সিঁধ কাটবে?”**, then press the action
button. In the challenge a marker sweeps across a gauge: tap while it sits in
the calm green zone to advance the cut. Sloppy taps raise the noise meter, and
a full meter wakes the village up.

---

## Project structure

```
src/
├── app shell
│   ├── App.vue                  # screen router + modal overlays
│   └── main.ts
├── components/
│   ├── character/               # SVG portrait shared with the engine
│   ├── game/                    # canvas host, HUD, touch pad, overlays
│   ├── overlays/                # settings / how-to-play / leaderboard
│   ├── preparation/             # oil selection
│   ├── setup/                   # name + appearance
│   ├── ui/                      # GameButton, ModalShell
│   └── welcome/                 # title screen + animated backdrop
├── composables/                 # useAudio, useViewport
├── game/                        # ── engine, independent of Vue ──
│   ├── animations/CharacterRig  # articulated, animated thief
│   ├── assets/                  # SVG parts, portrait builder, texture bakers
│   ├── config/                  # palette, constants, character, oils, layout
│   ├── events.ts                # typed engine → UI event contract
│   ├── scenes/                  # BootScene, VillageScene, CutScene
│   └── systems/                 # AudioSystem, InputSystem, CutChallenge
├── stores/                      # Pinia: player, session, settings
├── styles/main.css
├── types/                       # shared domain types
└── utils/                       # storage, validation, fonts, rng
```

### Architecture notes

- **One source of truth for the character.** `src/game/assets/characterSvg.ts`
  describes every limb as SVG markup. The Vue portrait composes those parts as
  inline SVG; the Phaser rig bakes the *same* parts into canvas textures. What
  you pick on the setup screen is exactly what shows up in the village.
- **The engine never imports Vue.** Phaser owns real-time state; Pinia owns
  persistent configuration and navigation. They talk through a small typed
  event contract (`src/game/events.ts`) plus one shared input object.
- **Pure logic is extracted for testing.** The mini-game rules live in
  `src/game/systems/CutChallenge.ts` with no Phaser dependency.
- **The engine is lazy-loaded.** Phaser is only fetched when you enter the
  village, so the menu boots instantly on cheap phones.

### Replacing the provisional art

Every visual is behind a texture key or a named SVG part, so final illustrated
assets can be dropped in without touching gameplay code:

- village paint → `src/game/assets/villageTextures.ts` (keys in
  `VILLAGE_TEXTURE_KEYS`)
- character parts → `src/game/assets/characterSvg.ts`
- NPCs → `src/game/assets/npcSvg.ts`

---

## Brand

| Token           | Value     |
| --------------- | --------- |
| Deep forest     | `#17251C` |
| Midnight green  | `#101B17` |
| Lantern gold    | `#E8B85C` |
| Clay brown      | `#9B6545` |
| Muted olive     | `#687A52` |
| Warm cream      | `#F3E8CF` |
| Danger red      | `#C95745` |

Bengali text uses **Hind Siliguri**, English/numerals use **Sora**.

---

## Notes and limitations (Phase 1)

- The four preparation oils are **fictional arcade power-ups** (mustard energy
  boost, soybean balanced mode, kerosene sneezing chaos, mobile-oil slippery
  mode). They are game mechanics only and are not real-world advice.
- The “সিঁধ কাটা” challenge is a deliberately stylised arcade timing game, not
  a simulation of anything real.
- The leaderboard is a clearly labelled *coming soon* placeholder; only a
  local best score is stored.
- There is no backend yet — a Laravel API, database, accounts and an online
  leaderboard are Phase 2 work. The store layer is designed to be swapped for
  API calls without touching the UI.

## Phase 2 backlog

Loot and the house interior · morning bazaar and reward economy · multiple
nightly levels · villager patrol AI · the full run loop
`Setup → Preparation → Night → Cut → Loot → Escape → Bazaar → Rewards`.

## License

Original artwork and audio, generated procedurally for this project.
