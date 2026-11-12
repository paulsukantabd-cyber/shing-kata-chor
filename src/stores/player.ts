import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  DEFAULT_APPEARANCE,
  DEFAULT_PLAYER_NAME,
  type CharacterConfig,
} from '../game/config/character'
import { loadJson, saveJson } from '../utils/storage'
import { normalizePlayerName } from '../utils/validation'
import type { CharacterAppearance, LungiId } from '../types'

const STORAGE_KEY = 'player'

interface PersistedPlayer {
  name?: string
  appearance?: Partial<CharacterAppearance>
}

/**
 * Owns the persistent player profile: name and character appearance.
 * Both the Vue preview and the Phaser rig read from this store.
 */
export const usePlayerStore = defineStore('player', () => {
  const stored = loadJson<PersistedPlayer>(STORAGE_KEY, {})

  const name = ref<string>(normalizePlayerName(stored.name ?? DEFAULT_PLAYER_NAME) || DEFAULT_PLAYER_NAME)
  const appearance = ref<CharacterAppearance>({
    lungi: stored.appearance?.lungi ?? DEFAULT_APPEARANCE.lungi,
    moustache: stored.appearance?.moustache ?? DEFAULT_APPEARANCE.moustache,
    gamcha: stored.appearance?.gamcha ?? DEFAULT_APPEARANCE.gamcha,
  })

  function persist(): void {
    saveJson<PersistedPlayer>(STORAGE_KEY, {
      name: name.value,
      appearance: { ...appearance.value },
    })
  }

  function setName(value: string): void {
    name.value = normalizePlayerName(value)
    persist()
  }

  function setLungi(lungi: LungiId): void {
    appearance.value = { ...appearance.value, lungi }
    persist()
  }

  function setMoustache(enabled: boolean): void {
    appearance.value = { ...appearance.value, moustache: enabled }
    persist()
  }

  function setGamcha(enabled: boolean): void {
    appearance.value = { ...appearance.value, gamcha: enabled }
    persist()
  }

  /** Snapshot handed to the Phaser scene when a night starts. */
  const characterConfig = computed<CharacterConfig>(() => ({
    name: name.value,
    lungi: appearance.value.lungi,
    moustache: appearance.value.moustache,
    gamcha: appearance.value.gamcha,
  }))

  return {
    name,
    appearance,
    characterConfig,
    setName,
    setLungi,
    setMoustache,
    setGamcha,
  }
})
