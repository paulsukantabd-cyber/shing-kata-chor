<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type Phaser from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH } from '../../game/config/constants'
import { GAME_EVENTS } from '../../game/events'
import { inputSystem } from '../../game/systems/InputSystem'
import { ensureFontsLoaded } from '../../utils/fonts'
import type { CharacterConfig } from '../../game/config/character'
import type { OilDefinition } from '../../game/config/oils'

const props = defineProps<{
  config: CharacterConfig
  oil: OilDefinition
}>()

const emit = defineEmits<{ (event: 'ready', game: Phaser.Game): void }>()

const container = ref<HTMLElement | null>(null)
const loading = ref(true)
let game: Phaser.Game | null = null
let mounted = true

onMounted(async () => {
  const parent = container.value
  if (!parent) {
    return
  }

  await ensureFontsLoaded()

  if (!mounted || !container.value) {
    return
  }

  // The engine is loaded on demand so the menu screens stay instant on
  // low-end phones.
  const [phaserModule, bootModule, villageModule, cutModule] = await Promise.all([
    import('phaser'),
    import('../../game/scenes/BootScene'),
    import('../../game/scenes/VillageScene'),
    import('../../game/scenes/CutScene'),
  ])

  if (!mounted || !container.value) {
    return
  }

  const PhaserRuntime = phaserModule.default

  game = new PhaserRuntime.Game({
    type: PhaserRuntime.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: container.value,
    backgroundColor: '#0b120f',
    scale: {
      mode: PhaserRuntime.Scale.FIT,
      autoCenter: PhaserRuntime.Scale.CENTER_BOTH,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
    },
    render: {
      antialias: true,
      powerPreference: 'high-performance',
      roundPixels: true,
    },
    audio: { noAudio: true },
    banner: false,
    scene: [bootModule.default, villageModule.default, cutModule.default],
  })

  game.registry.set('playerConfig', props.config)
  game.registry.set('oil', props.oil)

  // Exposed for diagnostics and the automated smoke test.
  ;(window as unknown as { __SHING_GAME__?: Phaser.Game }).__SHING_GAME__ = game

  game.events.on(GAME_EVENTS.ready, () => {
    loading.value = false
    if (game) {
      emit('ready', game)
    }
  })
})

onBeforeUnmount(() => {
  mounted = false
  inputSystem.detach()

  const globalScope = window as unknown as { __SHING_GAME__?: Phaser.Game }
  delete globalScope.__SHING_GAME__

  if (game) {
    game.events.removeAllListeners()
    game.destroy(true)
    game = null
  }
})
</script>

<template>
  <div class="relative h-full w-full">
    <div
      ref="container"
      class="h-full w-full"
      role="application"
      aria-label="রাতের গ্রাম — চোরের খেলার ময়দান"
    />

    <div
      v-if="loading"
      class="pointer-events-none absolute inset-0 grid place-items-center bg-night-900/80"
    >
      <div class="flex flex-col items-center gap-3">
        <span class="h-8 w-8 animate-spin rounded-full border-2 border-gold/25 border-t-gold" />
        <p class="font-bengali text-sm text-cream/60">গ্রাম তৈরি হচ্ছে…</p>
      </div>
    </div>
  </div>
</template>
