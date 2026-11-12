<script setup lang="ts">
import { BookOpen, Play, Settings, Trophy, Volume2, VolumeX } from 'lucide-vue-next'
import { computed } from 'vue'
import GameButton from '../ui/GameButton.vue'
import WelcomeBackdrop from './WelcomeBackdrop.vue'
import { usePlayerStore } from '../../stores/player'
import { useSessionStore } from '../../stores/session'
import { useSettingsStore } from '../../stores/settings'

const emit = defineEmits<{
  (event: 'play'): void
  (event: 'settings'): void
  (event: 'leaderboard'): void
  (event: 'howto'): void
}>()

const player = usePlayerStore()
const session = useSessionStore()
const settings = useSettingsStore()

const thiefName = computed(() => player.name || 'রফিক')
const bestScore = computed(() => session.bestScore)
</script>

<template>
  <div class="relative isolate flex min-h-screen flex-col overflow-hidden text-cream">
    <WelcomeBackdrop :appearance="player.appearance" />

    <div class="pointer-events-none absolute inset-0 bg-vignette" />
    <div class="pointer-events-none absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-[#060B09]/95 to-transparent" />

    <!-- Top bar -->
    <header
      class="relative z-20 flex items-center justify-between gap-3 px-4 pt-4 sm:px-8 sm:pt-6"
    >
      <span
        class="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-night-800/70 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-gold-soft backdrop-blur"
      >
        <span class="h-1.5 w-1.5 animate-flicker rounded-full bg-gold" />
        Phase 1 · Prototype
      </span>

      <button
        type="button"
        class="grid h-11 w-11 place-items-center rounded-full border border-cream/12 bg-night-800/70 text-cream/80 backdrop-blur transition hover:border-gold/40 hover:text-gold"
        :aria-label="settings.soundEnabled ? 'শব্দ বন্ধ করো' : 'শব্দ চালু করো'"
        @click="settings.toggleSound()"
      >
        <Volume2 v-if="settings.soundEnabled" class="h-5 w-5" />
        <VolumeX v-else class="h-5 w-5" />
      </button>
    </header>

    <!-- Title block -->
    <main class="relative z-20 flex flex-1 flex-col items-center justify-center px-5 pb-6 pt-4 text-center">
      <p
        class="font-bengali animate-floatUp text-sm font-medium uppercase tracking-[0.35em] text-gold/70 sm:text-base"
      >
        শিংকাটা কাহিনি
      </p>

      <h1
        class="title-glow mt-3 font-bengali text-[clamp(2.9rem,13vw,6.5rem)] font-bold leading-[1.05] tracking-tight text-cream"
      >
        সিঁধেল চোর
      </h1>

      <p class="mt-4 max-w-xl font-bengali text-lg text-cream/80 sm:text-2xl">
        “সিঁধ কাটবি, না ধরা খাবি?”
      </p>

      <p class="mt-3 max-w-lg font-bengali text-sm text-cream/55 sm:text-base">
        গ্রামের ভেতর একটা মজার রাত। লুঙ্গি গোছাও, তেল মাখো, আর ধরা পড়ো না।
      </p>

      <div class="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
        <GameButton variant="primary" size="lg" class="min-w-[220px]" @click="emit('play')">
          <template #icon>
            <Play class="h-5 w-5" />
          </template>
          খেলা শুরু করো
        </GameButton>

        <GameButton variant="ghost" size="lg" @click="emit('howto')">
          <template #icon>
            <BookOpen class="h-5 w-5" />
          </template>
          কীভাবে খেলবে
        </GameButton>
      </div>

      <div class="mt-4 flex flex-wrap items-center justify-center gap-3">
        <GameButton variant="ghost" size="sm" @click="emit('settings')">
          <template #icon>
            <Settings class="h-4 w-4" />
          </template>
          সেটিংস
        </GameButton>

        <GameButton variant="ghost" size="sm" @click="emit('leaderboard')">
          <template #icon>
            <Trophy class="h-4 w-4" />
          </template>
          সেরা চোরেরা
        </GameButton>
      </div>
    </main>

    <!-- Footer -->
    <footer
      class="relative z-20 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 px-4 pb-5 font-bengali text-xs text-cream/45 sm:text-sm"
    >
      <span>আজকের চোর: <strong class="font-semibold text-gold/85">{{ thiefName }}</strong></span>
      <span class="hidden h-1 w-1 rounded-full bg-cream/25 sm:inline-block" />
      <span>সেরা স্কোর: <strong class="font-semibold text-gold/85">{{ bestScore }}</strong></span>
    </footer>
  </div>
</template>
