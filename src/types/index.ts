/**
 * Shared domain types.
 * Imported by both the Vue presentation layer and the Phaser engine layer.
 *
 * This module is intentionally dependency-free so it can be imported from
 * anywhere without creating circular imports.
 */

/** Which lungi the thief is wearing. */
export type LungiId = 'blueCheck' | 'redCheck' | 'green' | 'yellow'

/** Player chosen cosmetic options. */
export interface CharacterAppearance {
  lungi: LungiId
  moustache: boolean
  gamcha: boolean
}

/** Top level application screens. */
export type AppScreen = 'welcome' | 'setup' | 'preparation' | 'game'

/** Modal overlays that can appear on top of any screen. */
export type OverlayId = 'settings' | 'howto' | 'leaderboard' | null

/** Result of the "সিঁধ কাটা" prototype challenge. */
export interface CutResult {
  success: boolean
  /** Bengali headline shown to the player. */
  headline: string
  /** Bengali supporting line. */
  detail: string
  /** 0-100 style score derived from accuracy. */
  score: number
  /** Number of successful taps. */
  hits: number
}

export type ToastTone = 'info' | 'success' | 'danger'

export interface ToastPayload {
  id: number
  text: string
  tone: ToastTone
}
