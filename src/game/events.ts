/**
 * Typed event contract between the Phaser engine and the Vue application.
 *
 * The engine emits, the UI listens. Nothing flows the other way except
 * through the input system, which keeps the two layers decoupled.
 */
import type { CutResult } from '../types'

export const GAME_EVENTS = {
  /** The village scene finished booting. */
  ready: 'shing:ready',
  /** Interaction prompt visibility changed. */
  prompt: 'shing:prompt',
  /** The "সিঁধ কাটা" challenge started. */
  cutStarted: 'shing:cut:started',
  /** The challenge resolved (success or failure). */
  cutFinished: 'shing:cut:finished',
  /** The challenge overlay closed. */
  cutClosed: 'shing:cut:closed',
  /** Short status line for the HUD. */
  toast: 'shing:toast',
} as const

export interface PromptPayload {
  visible: boolean
  /** Bengali prompt text, e.g. "সিঁধ কাটবে?" */
  text: string
}

export interface ToastPayload {
  text: string
  tone: 'info' | 'success' | 'danger'
}

export interface CutStartedPayload {
  /** Display name of the player. */
  playerName: string
}

export interface CutClosedPayload {
  outcome: 'success' | 'failed'
}

export interface GameEventMap {
  [GAME_EVENTS.ready]: undefined
  [GAME_EVENTS.prompt]: PromptPayload
  [GAME_EVENTS.cutStarted]: CutStartedPayload
  [GAME_EVENTS.cutFinished]: CutResult
  [GAME_EVENTS.cutClosed]: CutClosedPayload
  [GAME_EVENTS.toast]: ToastPayload
}

export type GameEventName = (typeof GAME_EVENTS)[keyof typeof GAME_EVENTS]
