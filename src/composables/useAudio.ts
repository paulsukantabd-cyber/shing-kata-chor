import { watch } from 'vue'
import { audioSystem, type SoundName } from '../game/systems/AudioSystem'
import { useSettingsStore } from '../stores/settings'

let syncInitialised = false

/**
 * Bridges the settings store with the procedural audio engine and exposes a
 * tiny API for UI feedback sounds.
 */
export function useAudio() {
  const settings = useSettingsStore()

  if (!syncInitialised) {
    syncInitialised = true
    audioSystem.setEnabled(settings.soundEnabled)
    audioSystem.setAmbienceEnabled(settings.ambienceEnabled)

    watch(
      () => settings.soundEnabled,
      (value) => {
        audioSystem.setEnabled(value)
        if (value) {
          audioSystem.unlock()
        }
      },
    )

    watch(
      () => settings.ambienceEnabled,
      (value) => {
        audioSystem.setAmbienceEnabled(value)
      },
    )
  }

  /** Must be called from a user gesture (click / touch) to unlock the context. */
  function unlock(): void {
    audioSystem.unlock()
  }

  function play(name: SoundName, intensity = 1): void {
    audioSystem.play(name, intensity)
  }

  function startAmbience(): void {
    audioSystem.unlock()
    audioSystem.startAmbience()
  }

  function stopAmbience(): void {
    audioSystem.stopAmbience()
  }

  return { unlock, play, startAmbience, stopAmbience }
}
