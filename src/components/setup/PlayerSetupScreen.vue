<script setup lang="ts">
import { ArrowLeft, Check, Scissors, UserRound } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import CharacterPortrait from '../character/CharacterPortrait.vue'
import GameButton from '../ui/GameButton.vue'
import { LUNGI_STYLES } from '../../game/config/character'
import { usePlayerStore } from '../../stores/player'
import { useSessionStore } from '../../stores/session'
import { validatePlayerName } from '../../utils/validation'
import type { LungiId } from '../../types'

const emit = defineEmits<{ (event: 'start'): void; (event: 'back'): void }>()

const player = usePlayerStore()
const session = useSessionStore()

const draftName = ref(player.name)
const touched = ref(false)

watch(
  () => player.name,
  (value) => {
    if (value !== draftName.value) {
      draftName.value = value
    }
  },
)

const validation = computed(() => validatePlayerName(draftName.value))
const showError = computed(() => touched.value && !validation.value.valid)
const displayName = computed(() => validation.value.valid ? draftName.value.trim() : '')

function onInput(event: Event): void {
  const input = event.target as HTMLInputElement
  draftName.value = input.value
  player.setName(input.value)
}

function onBlur(): void {
  touched.value = true
}

function chooseLungi(id: LungiId): void {
  player.setLungi(id)
}

function start(): void {
  touched.value = true
  if (!validation.value.valid) {
    return
  }
  player.setName(draftName.value)
  session.goTo('preparation')
  emit('start')
}
</script>

<template>
  <div class="relative min-h-screen overflow-hidden text-cream">
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(232,184,92,0.14),transparent_42%),linear-gradient(180deg,#0d1714_0%,#080e0c_100%)]"
    />
    <div class="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#070d0b] to-transparent" />

    <div class="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 sm:py-8">
      <header class="mb-5 flex items-center justify-between gap-3">
        <GameButton variant="ghost" size="sm" @click="emit('back')">
          <template #icon>
            <ArrowLeft class="h-4 w-4" />
          </template>
          ফিরে যাও
        </GameButton>

        <span
          class="rounded-full border border-gold/20 bg-night-800/60 px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] text-gold/80"
        >
          চোরের পরিচয়
        </span>
      </header>

      <div class="grid flex-1 items-center gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <!-- Identity -->
        <section class="order-2 lg:order-1">
          <h1 class="font-bengali text-3xl font-bold text-gold-soft sm:text-4xl">চোরের নাম ঠিক করো</h1>
          <p class="mt-2 font-bengali text-cream/65">
            গ্রামের সবাই তোমাকে চেনবে — নামটা মজার রাখ!
          </p>

          <label class="mt-6 block">
            <span class="mb-2 flex items-center gap-2 font-bengali text-sm text-cream/75">
              <UserRound class="h-4 w-4 text-gold/70" />
              তোমার নাম
            </span>
            <input
              :value="draftName"
              type="text"
              maxlength="24"
              autocomplete="off"
              placeholder="রফিক"
              class="w-full rounded-2xl border bg-night-900/80 px-4 py-3.5 font-bengali text-lg text-cream outline-none transition placeholder:text-cream/25 focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
              :class="showError ? 'border-danger/70' : 'border-cream/12'"
              @input="onInput"
              @blur="onBlur"
            />
          </label>

          <p
            class="mt-2 min-h-[1.25rem] font-bengali text-sm"
            :class="showError ? 'text-danger' : 'text-cream/40'"
          >
            {{
              showError
                ? validation.error
                : 'বাংলা বা ইংরেজি — যা খুশি লিখতে পারো (সর্বোচ্চ ২০ অক্ষর)।'
            }}
          </p>

          <!-- Identity card -->
          <div
            class="mt-5 flex items-center gap-4 rounded-3xl border border-gold/20 bg-night-800/60 p-4 backdrop-blur"
          >
            <div
              class="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#E8B85C] to-[#A9702F] font-bengali text-2xl font-bold text-night-900"
            >
              {{ displayName.slice(0, 1) || 'র' }}
            </div>
            <div class="min-w-0">
              <p class="truncate font-bengali text-2xl font-bold text-cream">
                {{ displayName || 'রফিক' }} <span class="text-gold/80">(চোর)</span>
              </p>
              <p class="mt-0.5 font-bengali text-sm text-cream/55">
                বেড়ার কথা বলে লোড়াই, সবার আগে দৌড় দাও।
              </p>
            </div>
          </div>

          <!-- Appearance -->
          <div class="mt-6">
            <p class="mb-3 font-bengali text-sm uppercase tracking-[0.2em] text-gold/70">পোশাক</p>

            <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <button
                v-for="style in LUNGI_STYLES"
                :key="style.id"
                type="button"
                class="group relative overflow-hidden rounded-2xl border p-3 text-left transition"
                :class="
                  player.appearance.lungi === style.id
                    ? 'border-gold/70 bg-gold/10 shadow-ember-sm'
                    : 'border-cream/10 bg-night-800/40 hover:border-cream/25'
                "
                @click="chooseLungi(style.id)"
              >
                <span
                  class="block h-9 w-full rounded-lg"
                  :style="{
                    backgroundColor: style.base,
                    backgroundImage: `repeating-linear-gradient(45deg, ${style.pattern} 0 6px, transparent 6px 12px)`,
                  }"
                />
                <span class="mt-2 block font-bengali text-sm text-cream/85">{{ style.label }}</span>
                <Check
                  v-if="player.appearance.lungi === style.id"
                  class="absolute right-2 top-2 h-4 w-4 text-gold"
                />
              </button>
            </div>

            <div class="mt-4 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                class="flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition"
                :class="
                  player.appearance.moustache
                    ? 'border-gold/60 bg-gold/10'
                    : 'border-cream/10 bg-night-800/40 hover:border-cream/25'
                "
                @click="player.setMoustache(!player.appearance.moustache)"
              >
                <span class="font-bengali text-cream/85">মুড়ো রাখবে?</span>
                <span
                  class="rounded-full px-2.5 py-1 text-xs font-semibold"
                  :class="player.appearance.moustache ? 'bg-gold text-night-900' : 'bg-white/10 text-cream/60'"
                >
                  {{ player.appearance.moustache ? 'হ্যাঁ' : 'না' }}
                </span>
              </button>

              <button
                type="button"
                class="flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition"
                :class="
                  player.appearance.gamcha
                    ? 'border-gold/60 bg-gold/10'
                    : 'border-cream/10 bg-night-800/40 hover:border-cream/25'
                "
                @click="player.setGamcha(!player.appearance.gamcha)"
              >
                <span class="font-bengali text-cream/85">গামছা নেবে?</span>
                <span
                  class="rounded-full px-2.5 py-1 text-xs font-semibold"
                  :class="player.appearance.gamcha ? 'bg-gold text-night-900' : 'bg-white/10 text-cream/60'"
                >
                  {{ player.appearance.gamcha ? 'হ্যাঁ' : 'না' }}
                </span>
              </button>
            </div>
          </div>
        </section>

        <!-- Preview -->
        <section
          class="panel-parchment grain relative order-1 flex flex-col items-center justify-center overflow-hidden rounded-[30px] px-5 py-7 lg:order-2"
        >
          <div
            class="pointer-events-none absolute inset-x-10 top-4 h-32 rounded-full bg-gold/10 blur-3xl"
          />

          <p
            class="relative font-bengali text-sm uppercase tracking-[0.25em] text-gold/70"
          >
            এই তুমি
          </p>

          <div class="relative mt-3">
            <CharacterPortrait :appearance="player.appearance" :scale="2.1" />
          </div>

          <p class="relative mt-2 font-bengali text-2xl font-bold text-cream">
            {{ displayName || 'রফিক' }} <span class="text-gold/75">(চোর)</span>
          </p>
          <p class="relative mt-1 max-w-xs text-center font-bengali text-sm text-cream/55">
            {{ LUNGI_STYLES.find((s) => s.id === player.appearance.lungi)?.description }}
          </p>

          <GameButton
            variant="primary"
            size="lg"
            class="relative mt-6 w-full max-w-xs"
            :disabled="!validation.valid"
            @click="start"
          >
            <template #icon>
              <Scissors class="h-5 w-5" />
            </template>
            প্রস্তুতি নাও
          </GameButton>
        </section>
      </div>
    </div>
  </div>
</template>
