<script setup lang="ts">
import { Gamepad2, Music, Volume2, VolumeX, Waves } from 'lucide-vue-next'
import { computed } from 'vue'
import ModalShell from '../ui/ModalShell.vue'
import { useSessionStore } from '../../stores/session'
import { useSettingsStore } from '../../stores/settings'
import type { TouchControlMode } from '../../stores/settings'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (event: 'close'): void }>()

const settings = useSettingsStore()
const session = useSessionStore()

const touchModes: Array<{ id: TouchControlMode; label: string }> = [
  { id: 'auto', label: 'স্বয়ংক্রিয়' },
  { id: 'on', label: 'সবসময়' },
  { id: 'off', label: 'বন্ধ' },
]

const bestScore = computed(() => session.bestScore)
</script>

<template>
  <ModalShell
    :open="props.open"
    title="সেটিংস"
    subtitle="লাইট, শব্দ আর নিয়ন্ত্রণ ঠিক করে নাও।"
    @close="emit('close')"
  >
    <div class="space-y-3">
      <button
        type="button"
        class="flex w-full items-center justify-between gap-4 rounded-2xl border border-cream/10 bg-night-800/60 px-4 py-3.5 transition hover:border-cream/25"
        @click="settings.toggleSound()"
      >
        <span class="flex items-center gap-3">
          <Volume2 v-if="settings.soundEnabled" class="h-5 w-5 text-gold" />
          <VolumeX v-else class="h-5 w-5 text-cream/40" />
          <span class="font-bengali text-cream/90">শব্দ</span>
        </span>
        <span
          class="rounded-full px-3 py-1 text-xs font-semibold"
          :class="settings.soundEnabled ? 'bg-gold text-night-900' : 'bg-white/10 text-cream/55'"
        >
          {{ settings.soundEnabled ? 'চালু' : 'বন্ধ' }}
        </span>
      </button>

      <button
        type="button"
        class="flex w-full items-center justify-between gap-4 rounded-2xl border border-cream/10 bg-night-800/60 px-4 py-3.5 transition hover:border-cream/25"
        @click="settings.toggleAmbience()"
      >
        <span class="flex items-center gap-3">
          <Waves class="h-5 w-5 text-gold" />
          <span class="font-bengali text-cream/90">রাতের আওয়াজ</span>
        </span>
        <span
          class="rounded-full px-3 py-1 text-xs font-semibold"
          :class="settings.ambienceEnabled ? 'bg-gold text-night-900' : 'bg-white/10 text-cream/55'"
        >
          {{ settings.ambienceEnabled ? 'চালু' : 'বন্ধ' }}
        </span>
      </button>

      <button
        type="button"
        class="flex w-full items-center justify-between gap-4 rounded-2xl border border-cream/10 bg-night-800/60 px-4 py-3.5 transition hover:border-cream/25"
        @click="settings.setReducedMotion(!settings.reducedMotion)"
      >
        <span class="flex items-center gap-3">
          <Music class="h-5 w-5 text-gold" />
          <span class="font-bengali text-cream/90">কম অ্যানিমেশন</span>
        </span>
        <span
          class="rounded-full px-3 py-1 text-xs font-semibold"
          :class="settings.reducedMotion ? 'bg-gold text-night-900' : 'bg-white/10 text-cream/55'"
        >
          {{ settings.reducedMotion ? 'চালু' : 'বন্ধ' }}
        </span>
      </button>

      <div class="rounded-2xl border border-cream/10 bg-night-800/60 px-4 py-3.5">
        <p class="mb-2 flex items-center gap-2 font-bengali text-cream/90">
          <Gamepad2 class="h-5 w-5 text-gold" />
          টাচ কন্ট্রোল
        </p>
        <div class="flex gap-2">
          <button
            v-for="mode in touchModes"
            :key="mode.id"
            type="button"
            class="flex-1 rounded-xl border px-3 py-2 font-bengali text-sm transition"
            :class="
              settings.touchControls === mode.id
                ? 'border-gold/70 bg-gold/15 text-gold-soft'
                : 'border-cream/10 bg-night-900/50 text-cream/60 hover:border-cream/25'
            "
            @click="settings.setTouchControls(mode.id)"
          >
            {{ mode.label }}
          </button>
        </div>
      </div>

      <div class="flex items-center justify-between gap-4 rounded-2xl border border-gold/20 bg-gold/8 px-4 py-3.5">
        <span class="font-bengali text-cream/85">তোমার সেরা স্কোর</span>
        <span class="font-display text-2xl font-bold text-gold">{{ bestScore }}</span>
      </div>
    </div>
  </ModalShell>
</template>
