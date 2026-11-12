<script setup lang="ts">
import { ArrowLeft, Pause, RotateCw, Trophy, Volume2, VolumeX } from 'lucide-vue-next'
import type Phaser from 'phaser'
import { computed, onBeforeUnmount, ref } from 'vue'
import GameButton from '../ui/GameButton.vue'
import PhaserGame from './PhaserGame.vue'
import VirtualControls from './VirtualControls.vue'
import { GAME_EVENTS } from '../../game/events'
import { audioSystem } from '../../game/systems/AudioSystem'
import { inputSystem } from '../../game/systems/InputSystem'
import { OIL_BY_ID } from '../../game/config/oils'
import { usePlayerStore } from '../../stores/player'
import { useSessionStore } from '../../stores/session'
import { useSettingsStore } from '../../stores/settings'
import { useViewport } from '../../composables/useViewport'
import type { CutResult, ToastTone } from '../../types'

const emit = defineEmits<{ (event: 'back'): void }>()

const player = usePlayerStore()
const session = useSessionStore()
const settings = useSettingsStore()
const { isTouch, isNarrow, needsRotation } = useViewport()

const gameRef = ref<Phaser.Game | null>(null)
const promptVisible = ref(false)
const promptText = ref('সিঁধ কাটবে?')
const paused = ref(false)
const phaseTwo = ref<CutResult | null>(null)
const toast = ref<{ text: string; tone: ToastTone } | null>(null)
const orientationHint = ref(true)

let toastTimer: number | null = null
let unsubscribePause: (() => void) | null = null

const oil = computed(() => OIL_BY_ID[session.oilId])
const playerLabel = computed(() => `${player.name || 'রফিক'} (চোর)`)

const showTouchControls = computed(() => {
  if (settings.touchControls === 'on') {
    return true
  }
  if (settings.touchControls === 'off') {
    return false
  }
  return isTouch.value || isNarrow.value
})

function onPrompt(payload: { visible: boolean; text: string }): void {
  promptVisible.value = payload.visible
  promptText.value = payload.text
}

function onToast(payload: { text: string; tone: ToastTone }): void {
  toast.value = payload
  if (toastTimer !== null) {
    window.clearTimeout(toastTimer)
  }
  toastTimer = window.setTimeout(() => {
    toast.value = null
    toastTimer = null
  }, 3200)
}

function onCutFinished(result: CutResult): void {
  session.recordResult(result)
  if (result.success) {
    phaseTwo.value = result
  }
}

function onGameReady(game: Phaser.Game): void {
  gameRef.value = game
  game.events.on(GAME_EVENTS.prompt, onPrompt)
  game.events.on(GAME_EVENTS.toast, onToast)
  game.events.on(GAME_EVENTS.cutFinished, onCutFinished)

  audioSystem.unlock()
  audioSystem.startAmbience()
}

function togglePause(): void {
  const game = gameRef.value
  if (!game) {
    return
  }

  paused.value = !paused.value

  if (paused.value) {
    game.scene.pause('VillageScene')
    game.scene.pause('CutScene')
  } else {
    game.scene.resume('VillageScene')
    game.scene.resume('CutScene')
  }
}

function closePhaseTwo(): void {
  phaseTwo.value = null
}

function leave(): void {
  paused.value = false
  audioSystem.stopAmbience()
  emit('back')
}

unsubscribePause = inputSystem.onPause(() => {
  if (phaseTwo.value) {
    phaseTwo.value = null
    return
  }
  togglePause()
})

onBeforeUnmount(() => {
  unsubscribePause?.()
  unsubscribePause = null
  if (toastTimer !== null) {
    window.clearTimeout(toastTimer)
    toastTimer = null
  }
  audioSystem.stopAmbience()
})
</script>

<template>
  <div class="relative flex min-h-screen flex-col bg-[#080e0c] text-cream">
    <!-- HUD -->
    <header
      class="relative z-30 flex flex-wrap items-center justify-between gap-2 border-b border-cream/8 bg-night-900/85 px-3 py-2.5 backdrop-blur sm:px-5"
    >
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="grid h-10 w-10 place-items-center rounded-xl border border-cream/12 bg-white/5 text-cream/80 transition hover:border-gold/40 hover:text-gold"
          aria-label="মূল মেনুতে ফিরে যাও"
          @click="leave"
        >
          <ArrowLeft class="h-5 w-5" />
        </button>

        <div class="leading-tight">
          <p class="font-bengali text-sm font-semibold text-cream">{{ playerLabel }}</p>
          <p class="font-bengali text-[11px] text-gold/75">{{ oil.name }} · {{ oil.effect }}</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <span
          class="hidden items-center gap-1.5 rounded-full border border-gold/20 bg-gold/10 px-3 py-1.5 font-bengali text-xs text-gold-soft sm:inline-flex"
        >
          <Trophy class="h-3.5 w-3.5" />
          সেরা: {{ session.bestScore }}
        </span>

        <button
          type="button"
          class="grid h-10 w-10 place-items-center rounded-xl border border-cream/12 bg-white/5 text-cream/80 transition hover:border-gold/40 hover:text-gold"
          :aria-label="settings.soundEnabled ? 'শব্দ বন্ধ করো' : 'শব্দ চালু করো'"
          @click="settings.toggleSound()"
        >
          <Volume2 v-if="settings.soundEnabled" class="h-5 w-5" />
          <VolumeX v-else class="h-5 w-5" />
        </button>

        <button
          type="button"
          class="grid h-10 w-10 place-items-center rounded-xl border border-cream/12 bg-white/5 text-cream/80 transition hover:border-gold/40 hover:text-gold"
          aria-label="খেলা থামাও"
          @click="togglePause"
        >
          <Pause class="h-5 w-5" />
        </button>
      </div>
    </header>

    <!-- Stage -->
    <main class="relative flex flex-1 items-center justify-center overflow-hidden">
      <div
        class="relative w-full max-w-[1280px] overflow-hidden rounded-none border-x border-cream/8 bg-night-900 shadow-village sm:rounded-[26px] sm:border"
      >
        <div class="relative aspect-[16/9] w-full">
          <PhaserGame :config="player.characterConfig" :oil="oil" @ready="onGameReady" />

          <!-- Touch controls -->
          <VirtualControls
            v-if="showTouchControls"
            :action-active="promptVisible"
            :action-label="promptVisible ? promptText : 'চাপ দাও'"
          />

          <!-- Toast -->
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="translate-y-2 opacity-0"
            leave-active-class="transition duration-150 ease-in"
            leave-to-class="opacity-0"
          >
            <p
              v-if="toast"
              class="pointer-events-none absolute left-1/2 top-3 z-20 -translate-x-1/2 rounded-full border px-4 py-2 font-bengali text-sm backdrop-blur"
              :class="
                toast.tone === 'danger'
                  ? 'border-danger/60 bg-danger/25 text-[#FFD8CF]'
                  : toast.tone === 'success'
                    ? 'border-moss/60 bg-moss/25 text-[#DFF3C8]'
                    : 'border-cream/20 bg-night-900/85 text-cream'
              "
            >
              {{ toast.text }}
            </p>
          </Transition>

          <!-- Orientation hint -->
          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="-translate-y-2 opacity-0"
            leave-active-class="transition duration-200 ease-in"
            leave-to-class="opacity-0"
          >
            <div
              v-if="needsRotation && orientationHint"
              class="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center p-3"
            >
              <div
                class="pointer-events-auto flex items-center gap-2 rounded-full border border-gold/25 bg-night-900/90 px-4 py-2 text-cream/85 backdrop-blur"
              >
                <RotateCw class="h-4 w-4 shrink-0 text-gold" />
                <span class="font-bengali text-xs sm:text-sm">
                  ফোনটা পাশে ঘুরিয়ে নাও — খেলাটা আরও ভালো লাগবে
                </span>
                <button
                  type="button"
                  class="ml-1 shrink-0 rounded-full bg-white/10 px-2 py-0.5 font-bengali text-[11px]"
                  @click="orientationHint = false"
                >
                  বন্ধ
                </button>
              </div>
            </div>
          </Transition>

          <!-- Pause overlay -->
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0"
            leave-active-class="transition duration-150 ease-in"
            leave-to-class="opacity-0"
          >
            <div
              v-if="paused"
              class="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-[#050b08]/85 backdrop-blur-sm"
            >
              <p class="font-bengali text-3xl font-bold text-gold-soft">খেলা থেমে গেছে</p>
              <p class="font-bengali text-sm text-cream/60">গ্রাম এখনও অপেক্ষা করছে…</p>
              <div class="mt-2 flex flex-wrap items-center justify-center gap-3">
                <GameButton variant="primary" size="lg" @click="togglePause">আবার খেলো</GameButton>
                <GameButton variant="ghost" size="lg" @click="leave">মূল মেনু</GameButton>
              </div>
            </div>
          </Transition>

          <!-- Phase 2 placeholder -->
          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0"
            leave-active-class="transition duration-200 ease-in"
            leave-to-class="opacity-0"
          >
            <div
              v-if="phaseTwo"
              class="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-[#050b08]/88 px-6 text-center backdrop-blur-sm"
            >
              <p class="font-bengali text-2xl font-bold text-gold-soft sm:text-3xl">
                সিঁধ কাটা সফল!
              </p>
              <p class="font-bengali text-base text-cream/70">পরবর্তী ধাপ: ঘরের ভেতর অভিযান</p>
              <p class="max-w-md font-bengali text-sm text-cream/45">
                ঘরের ভেতরের সিঁধ, জবদার লোড়া আর পালানো — এগুলো পরের ধাপে যোগ হবে।
              </p>
              <GameButton variant="primary" size="lg" @click="closePhaseTwo">ঠিক আছে, ফিরে যাই</GameButton>
            </div>
          </Transition>
        </div>
      </div>
    </main>

    <!-- Desktop control legend -->
    <footer
      class="relative z-10 hidden items-center justify-center gap-4 border-t border-cream/8 bg-night-900/70 px-4 py-2.5 font-bengali text-xs text-cream/45 md:flex"
    >
      <span><kbd class="rounded bg-white/10 px-1.5 py-0.5">A</kbd>/<kbd class="rounded bg-white/10 px-1.5 py-0.5">←</kbd> বাম</span>
      <span><kbd class="rounded bg-white/10 px-1.5 py-0.5">D</kbd>/<kbd class="rounded bg-white/10 px-1.5 py-0.5">→</kbd> ডান</span>
      <span><kbd class="rounded bg-white/10 px-1.5 py-0.5">Shift</kbd> দৌড়</span>
      <span><kbd class="rounded bg-white/10 px-1.5 py-0.5">E</kbd> কাজ</span>
      <span><kbd class="rounded bg-white/10 px-1.5 py-0.5">Esc</kbd> থামাও</span>
    </footer>
  </div>
</template>
