/**
 * Global gameplay + presentation constants.
 * Nothing in the codebase should hard-code these values inline.
 */

/** Logical design resolution. The canvas is scaled with FIT so art never stretches. */
export const GAME_WIDTH = 960
export const GAME_HEIGHT = 540
export const GAME_ASPECT = GAME_WIDTH / GAME_HEIGHT

/** Horizontal extent of the village. */
export const WORLD_WIDTH = 3400

/** World Y coordinate of the ground line the player walks on. */
export const GROUND_Y = 436

/** Player spawn point (left edge of the lane). */
export const PLAYER_START_X = 240

/** X position of the interactive mud house. */
export const HOUSE_X = 1260

/** Distance (px) at which the interaction prompt appears. */
export const INTERACT_RANGE = 165

/** Player movement tuning. */
export const PLAYER_TUNING = {
  walkSpeed: 185,
  runSpeed: 330,
  acceleration: 2400,
  friction: 2600,
  minX: 70,
  maxX: WORLD_WIDTH - 70,
} as const

/** Camera tuning — smooth follow, no shaking during normal play. */
export const CAMERA_TUNING = {
  lerp: 0.12,
  deadZoneWidth: 120,
  deadZoneHeight: 80,
  offsetX: 0,
  offsetY: -40,
} as const

/** Fonts used inside the Phaser canvas. */
export const FONT_BENGALI = '"Hind Siliguri", "Noto Sans Bengali", "Nirmala UI", sans-serif'
export const FONT_DISPLAY = '"Sora", "Segoe UI", system-ui, sans-serif'

/** Key bindings for desktop play. */
export const KEY_BINDINGS = {
  left: ['ArrowLeft', 'KeyA'],
  right: ['ArrowRight', 'KeyD'],
  run: ['ShiftLeft', 'ShiftRight'],
  action: ['KeyE'],
  pause: ['Escape'],
} as const

/** localStorage namespace for every persisted value. */
export const STORAGE_NAMESPACE = 'shing-kata-chor'
