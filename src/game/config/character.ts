/**
 * Character definition shared by the Vue preview and the Phaser gameplay rig.
 *
 * The Vue portrait and the in-game sprite are both generated from this file,
 * which guarantees that whatever the player picks on the setup screen is
 * exactly what shows up in the village at night.
 */
import type { CharacterAppearance, LungiId } from '../../types'

export type { CharacterAppearance, LungiId }

export interface LungiStyle {
  id: LungiId
  /** Bengali label shown in the UI. */
  label: string
  /** Main fabric colour. */
  base: string
  /** Secondary colour used for the check / weave pattern. */
  pattern: string
  /** Trim colour (border + knot). */
  accent: string
  /** Short Bengali flavour text. */
  description: string
}

export interface CharacterConfig extends CharacterAppearance {
  name: string
}

export const LUNGI_STYLES: readonly LungiStyle[] = [
  {
    id: 'blueCheck',
    label: 'নীল চেক',
    base: '#2f5fa8',
    pattern: '#e7ddc4',
    accent: '#1d3f74',
    description: 'গ্রামের সবচেয়ে পরিচিত নীল চেক লুঙ্গি।',
  },
  {
    id: 'redCheck',
    label: 'লাল চেক',
    base: '#b23a33',
    pattern: '#f0e2c2',
    accent: '#7d211c',
    description: 'লাল চেক — দেখতে জোরে, চুরির ভয়ও বেশি।',
  },
  {
    id: 'green',
    label: 'সবুজ',
    base: '#4c7a3a',
    pattern: '#8fb56a',
    accent: '#31512a',
    description: 'পাতার মতো সবুজ, ঝোপড়ের মধ্যে মিশে যায়।',
  },
  {
    id: 'yellow',
    label: 'হলুদ',
    base: '#d9a53c',
    pattern: '#f4dc9d',
    accent: '#a97b1f',
    description: 'হলুদ লুঙ্গি — দিনের বেলা মানায়, রাতে না।',
  },
] as const

export const LUNGI_BY_ID: Record<LungiId, LungiStyle> = LUNGI_STYLES.reduce(
  (map, style) => {
    map[style.id] = style
    return map
  },
  {} as Record<LungiId, LungiStyle>,
)

/** Skin + ink tones used for every illustrated human in the game. */
export const SKIN = {
  base: '#d59b6b',
  shade: '#b27a4d',
  light: '#eec49b',
  deep: '#8d5c36',
  ink: '#3a2417',
  hair: '#241812',
} as const

export const DEFAULT_APPEARANCE: CharacterAppearance = {
  lungi: 'blueCheck',
  moustache: true,
  gamcha: true,
}

export const DEFAULT_PLAYER_NAME = 'রফিক'
export const MAX_NAME_LENGTH = 20

/** Default in-game rig proportions (rig-local units, origin at the feet). */
export const RIG = {
  hipY: -78,
  shoulderY: -136,
  neckY: -146,
  headCenterY: -172,
  headCenterX: 0,
  lungiTopY: -92,
  lungiBottomY: -40,
  legLength: 72,
  armLength: 60,
  /** Width of the composed portrait box. */
  boxWidth: 140,
  /** Height of the composed portrait box (feet rest on boxHeight). */
  boxHeight: 215,
} as const

export function resolveLungi(appearance: CharacterAppearance): LungiStyle {
  return LUNGI_BY_ID[appearance.lungi] ?? LUNGI_BY_ID.blueCheck
}
