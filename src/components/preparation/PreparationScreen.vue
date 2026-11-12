<script setup lang="ts">
import { ArrowLeft, Moon, Zap } from 'lucide-vue-next'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import CharacterPortrait from '../character/CharacterPortrait.vue'
import GameButton from '../ui/GameButton.vue'
import OilCard from './OilCard.vue'
import { OIL_DEFINITIONS, PREP_LINES } from '../../game/config/oils'
import { usePlayerStore } from '../../stores/player'
import { useSessionStore } from '../../stores/session'
import type { OilId } from '../../game/config/oils'

const emit = defineEmits<{ (event: 'start'): void; (event: 'back'): void }>()

const player = usePlayerStore()
const session = useSessionStore()

const lineIndex = ref(0)
let lineTimer: number | null = null

const currentLine = computed(() => PREP_LINES[lineIndex.value % PREP_LINES.length])
const selectedOil = computed(
  () => OIL_DEFINITIONS.find((oil) => oil.id === session.oilId) ?? OIL_DEFINITIONS[1],
)

function rotateLine(): void {
  lineIndex.value = (lineIndex.value + 1) % PREP_LINES.length
}

onMounted(() => {
  lineTimer = window.setInterval(rotateLine, 4200)
})

onBeforeUnmount(() => {
  if (lineTimer !== null) {
    window.clearInterval(lineTimer)
    lineTimer = null
  }
})

function selectOil(id: string): void {
  session.setOil(id as OilId)
}

function start(): void {
  session.goTo('game')
  emit('start')
}
</script>

<template>
  <div class="relative min-h-screen overflow-hidden text-cream">
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(232,184,92,0.12),transparent_45%),linear-gradient(180deg,#0c1613_0%,#080e0c_100%)]"
    />

    <div class="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 sm:py-8">
      <header class="mb-4 flex items-center justify-between gap-3">
        <GameButton variant="ghost" size="sm" @click="emit('back')">
          <template #icon>
            <ArrowLeft class="h-4 w-4" />
          </template>
          ফিরে যাও
        </GameButton>

        <span
          class="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-night-800/60 px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] text-gold/80"
        >
          <Moon class="h-3.5 w-3.5" />
          রাত নামল
        </span>
      </header>

      <div class="grid flex-1 items-start gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-8">
        <!-- Courtyard stage -->
        <section
          class="panel-parchment grain relative overflow-hidden rounded-[30px] px-5 pb-6 pt-5"
        >
          <svg
            class="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 420 420"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="pre-yard" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#1C2C22" />
                <stop offset="100%" stop-color="#0A120E" />
              </linearGradient>
              <radialGradient id="pre-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#FFD89B" stop-opacity="0.35" />
                <stop offset="100%" stop-color="#FFD89B" stop-opacity="0" />
              </radialGradient>
            </defs>
            <rect width="420" height="420" fill="url(#pre-yard)" />
            <!-- Mud wall + tin roof -->
            <rect x="36" y="66" width="180" height="150" fill="#5E4429" />
            <rect x="36" y="66" width="180" height="12" fill="#7A5A38" />
            <path d="M20 70 L126 18 L232 70 Z" fill="#5E615A" />
            <path d="M20 70 L232 70" stroke="#3E423B" stroke-width="5" />
            <rect x="60" y="98" width="58" height="46" fill="#2A1D12" />
            <rect x="65" y="103" width="48" height="36" fill="#FFD89B" opacity="0.85" />
            <circle cx="88" cy="120" r="60" fill="url(#pre-glow)" />
            <!-- Lantern -->
            <path d="M330 40 v34" stroke="#2A1E13" stroke-width="3" />
            <rect x="318" y="74" width="24" height="30" rx="5" fill="#F6E2AC" />
            <circle cx="330" cy="90" r="70" fill="url(#pre-glow)" class="pre-lantern" />
            <!-- Courtyard floor -->
            <rect x="0" y="216" width="420" height="204" fill="#2A2115" />
            <ellipse cx="210" cy="330" rx="180" ry="70" fill="#3A2E1D" />
            <!-- Mat + pot + stool -->
            <ellipse cx="120" cy="332" rx="58" ry="16" fill="#8A6A3C" opacity="0.75" />
            <ellipse cx="318" cy="330" rx="34" ry="16" fill="#6B4A2E" />
            <rect x="308" y="286" width="22" height="44" rx="9" fill="#8A4F30" />
            <rect x="300" y="278" width="38" height="12" rx="5" fill="#6F3D25" />
          </svg>

          <div class="relative flex min-h-[420px] flex-col items-center justify-end">
            <div class="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2">
              <p
                class="max-w-[16rem] rounded-2xl border border-gold/20 bg-night-900/85 px-4 py-2 text-center font-bengali text-sm text-gold-soft backdrop-blur"
              >
                “{{ currentLine }}”
              </p>
            </div>

            <div class="relative mb-2">
              <CharacterPortrait :appearance="player.appearance" mode="prep" :scale="1.85" />
            </div>

            <div class="relative w-full max-w-sm">
              <div class="mb-3 flex items-center justify-center gap-2">
                <Zap class="h-4 w-4 text-gold/70" />
                <p class="font-bengali text-sm text-cream/70">
                  তেল মাখা হয়েছে:
                  <span class="font-semibold text-gold">{{ selectedOil.name }}</span>
                </p>
              </div>
              <GameButton variant="primary" size="lg" block @click="start">
                চলো, গ্রামে যাই!
              </GameButton>
            </div>
          </div>
        </section>

        <!-- Oil selection -->
        <section>
          <h1 class="font-bengali text-3xl font-bold text-gold-soft sm:text-4xl">রাতের প্রস্তুতি</h1>
          <p class="mt-2 font-bengali text-cream/65">
            কোন তেল মাখবে? সবগুলো মজার — কোনোটাই আসল সম্পর্কিত পরামর্শ নয়।
          </p>

          <div class="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <OilCard
              v-for="oil in OIL_DEFINITIONS"
              :key="oil.id"
              :oil="oil"
              :selected="session.oilId === oil.id"
              @select="selectOil"
            />
          </div>

          <div
            class="mt-5 rounded-2xl border border-cream/10 bg-night-800/50 p-4 font-bengali text-sm leading-relaxed text-cream/60"
          >
            <p class="mb-1 font-semibold text-cream/85">তোমার অস্ত্র</p>
            <p>
              {{ player.name || 'রফিক' }} (চোর) — {{ selectedOil.effect }}।
              {{ selectedOil.description }}
            </p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pre-lantern {
  animation: pre-flicker 3.4s ease-in-out infinite;
  transform-box: fill-box;
  transform-origin: center;
}

@keyframes pre-flicker {
  0%,
  100% {
    opacity: 0.85;
  }
  45% {
    opacity: 1;
  }
  70% {
    opacity: 0.7;
  }
}
</style>
