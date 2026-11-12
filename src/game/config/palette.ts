/**
 * Central colour system.
 *
 * Every colour used by the game (DOM/Tailwind layer *and* Phaser canvas layer)
 * is declared here so the two renderers stay visually coherent.
 *
 * The base palette follows the "cinematic rural nighttime" brief:
 * deep forest green, midnight green, warm lantern gold, clay brown,
 * muted olive, warm cream and danger red.
 */
export const PALETTE = {
  deepForest: '#17251C',
  midnightGreen: '#101B17',
  lanternGold: '#E8B85C',
  clayBrown: '#9B6545',
  mutedOlive: '#687A52',
  warmCream: '#F3E8CF',
  dangerRed: '#C95745',
} as const

export type PaletteKey = keyof typeof PALETTE

/** Additional scene colours used by the painted village backgrounds. */
export const SCENE_COLORS = {
  skyTop: '#060b09',
  skyMid: '#0f1d18',
  skyHorizon: '#2b3a27',
  skyGlow: '#3f4c30',
  moon: '#fdf7e4',
  moonHalo: 'rgba(253, 247, 228, 0.22)',
  star: '#dfe9d6',
  cloud: '#132420',
  cloudLit: '#1d3129',

  hillFar: '#16241d',
  hillNear: '#1b2d22',

  grassDark: '#16271b',
  grassMid: '#27402a',
  grassLight: '#37563a',
  grassTip: '#4a6b41',

  dirtDark: '#3a2b1e',
  dirt: '#5a412e',
  dirtLight: '#7a583c',
  dirtPebble: '#8d6a45',

  mudWall: '#7d5836',
  mudWallDark: '#5d4026',
  mudWallLight: '#9a6c42',
  mudWallShadow: '#43301d',
  straw: '#b79a55',

  tinRoof: '#6d7068',
  tinRoofLight: '#94968b',
  tinRoofDark: '#474a44',

  wood: '#6b4a2e',
  woodLight: '#8d6741',
  woodDark: '#412c1a',

  bamboo: '#5c7a3c',
  bambooLight: '#87a455',
  bambooDark: '#3b5127',
  leaf: '#2d4729',
  leafLight: '#3f6136',
  bananaLeaf: '#3d6b32',
  bananaLeafLight: '#548a41',

  water: '#1d3538',
  waterLight: '#3a6163',
  waterFoam: '#9fc9bd',

  hay: '#a8823f',
  hayLight: '#cba65e',
  hayDark: '#6d5124',

  lantern: '#ffd89b',
  lampGlass: '#f6e2ac',
  flame: '#ffb347',

  shadow: 'rgba(5, 10, 8, 0.55)',
  ink: '#2a1a10',
} as const

/** Converts `#RRGGBB` into the numeric colour format Phaser expects. */
export function hexToNumber(hex: string): number {
  return Number.parseInt(hex.replace('#', ''), 16)
}

/** Converts `#RRGGBB` into an `rgba()` string with the given alpha. */
export function withAlpha(hex: string, alpha: number): string {
  const value = hex.replace('#', '')
  const r = Number.parseInt(value.slice(0, 2), 16)
  const g = Number.parseInt(value.slice(2, 4), 16)
  const b = Number.parseInt(value.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
