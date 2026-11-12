import { defineStore } from 'pinia'
import { ref } from 'vue'
import { DEFAULT_OIL_ID, type OilId } from '../game/config/oils'
import { loadJson, saveJson } from '../utils/storage'
import type { AppScreen, CutResult, OverlayId, ToastPayload } from '../types'

const STORAGE_KEY = 'session'

interface PersistedSession {
  bestScore?: number
  oilId?: OilId
}

/**
 * Session + navigation state.
 *
 * The store owns *where the player is* and *what is unlocked*. Real-time
 * gameplay state stays inside Phaser; this store never mirrors it.
 */
export const useSessionStore = defineStore('session', () => {
  const stored = loadJson<PersistedSession>(STORAGE_KEY, {})

  const screen = ref<AppScreen>('welcome')
  const overlay = ref<OverlayId>(null)
  const oilId = ref<OilId>(stored.oilId ?? DEFAULT_OIL_ID)
  const bestScore = ref<number>(stored.bestScore ?? 0)
  const lastResult = ref<CutResult | null>(null)
  const toasts = ref<ToastPayload[]>([])
  let toastCounter = 0

  function persist(): void {
    saveJson<PersistedSession>(STORAGE_KEY, {
      bestScore: bestScore.value,
      oilId: oilId.value,
    })
  }

  function goTo(next: AppScreen): void {
    screen.value = next
    overlay.value = null
  }

  function openOverlay(next: OverlayId): void {
    overlay.value = next
  }

  function closeOverlay(): void {
    overlay.value = null
  }

  function setOil(id: OilId): void {
    oilId.value = id
    persist()
  }

  function recordResult(result: CutResult): void {
    lastResult.value = result
    if (result.score > bestScore.value) {
      bestScore.value = result.score
      persist()
    }
  }

  function pushToast(text: string, tone: ToastPayload['tone'] = 'info'): void {
    toastCounter += 1
    const id = toastCounter
    toasts.value = [...toasts.value, { id, text, tone }]
  }

  function dismissToast(id: number): void {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  return {
    screen,
    overlay,
    oilId,
    bestScore,
    lastResult,
    toasts,
    goTo,
    openOverlay,
    closeOverlay,
    setOil,
    recordResult,
    pushToast,
    dismissToast,
  }
})
