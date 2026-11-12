import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loadJson, saveJson } from '../utils/storage'

const STORAGE_KEY = 'settings'

export type TouchControlMode = 'auto' | 'on' | 'off'

interface PersistedSettings {
  soundEnabled?: boolean
  ambienceEnabled?: boolean
  reducedMotion?: boolean
  touchControls?: TouchControlMode
}

function detectReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Global, persisted user settings.
 */
export const useSettingsStore = defineStore('settings', () => {
  const stored = loadJson<PersistedSettings>(STORAGE_KEY, {})

  const soundEnabled = ref<boolean>(stored.soundEnabled ?? true)
  const ambienceEnabled = ref<boolean>(stored.ambienceEnabled ?? true)
  const reducedMotion = ref<boolean>(stored.reducedMotion ?? detectReducedMotion())
  const touchControls = ref<TouchControlMode>(stored.touchControls ?? 'auto')

  function persist(): void {
    saveJson<PersistedSettings>(STORAGE_KEY, {
      soundEnabled: soundEnabled.value,
      ambienceEnabled: ambienceEnabled.value,
      reducedMotion: reducedMotion.value,
      touchControls: touchControls.value,
    })
  }

  function toggleSound(): void {
    soundEnabled.value = !soundEnabled.value
    persist()
  }

  function setSoundEnabled(value: boolean): void {
    soundEnabled.value = value
    persist()
  }

  function toggleAmbience(): void {
    ambienceEnabled.value = !ambienceEnabled.value
    persist()
  }

  function setReducedMotion(value: boolean): void {
    reducedMotion.value = value
    persist()
  }

  function setTouchControls(mode: TouchControlMode): void {
    touchControls.value = mode
    persist()
  }

  return {
    soundEnabled,
    ambienceEnabled,
    reducedMotion,
    touchControls,
    toggleSound,
    setSoundEnabled,
    toggleAmbience,
    setReducedMotion,
    setTouchControls,
  }
})
