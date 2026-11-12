import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * Tracks viewport facts the game cares about: orientation, narrow screens and
 * whether the device primarily uses touch input.
 */
export function useViewport() {
  const width = ref(typeof window === 'undefined' ? 1280 : window.innerWidth)
  const height = ref(typeof window === 'undefined' ? 720 : window.innerHeight)
  const coarsePointer = ref(false)

  function measure(): void {
    width.value = window.innerWidth
    height.value = window.innerHeight
  }

  onMounted(() => {
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('orientationchange', measure)

    if (typeof window.matchMedia === 'function') {
      const query = window.matchMedia('(pointer: coarse)')
      coarsePointer.value = query.matches
      query.addEventListener?.('change', (event) => {
        coarsePointer.value = event.matches
      })
    }
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', measure)
    window.removeEventListener('orientationchange', measure)
  })

  const isPortrait = computed(() => height.value > width.value)
  const isNarrow = computed(() => width.value < 640)
  const isTouch = computed(() => coarsePointer.value)
  /** Landscape phones are cramped; ask the player to rotate. */
  const needsRotation = computed(() => isPortrait.value && width.value < 820)

  return { width, height, isPortrait, isNarrow, isTouch, needsRotation }
}
