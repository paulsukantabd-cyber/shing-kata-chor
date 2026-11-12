<script setup lang="ts">
import { Check } from 'lucide-vue-next'
import { computed } from 'vue'
import OilIcon from './OilIcon.vue'
import type { OilDefinition } from '../../game/config/oils'

const props = defineProps<{
  oil: OilDefinition
  selected: boolean
}>()

const emit = defineEmits<{ (event: 'select', id: string): void }>()

const accentStyle = computed(() => ({
  background: `linear-gradient(145deg, ${props.oil.accent}22, ${props.oil.accentSoft}33)`,
  borderColor: props.selected ? `${props.oil.accent}88` : 'rgba(243,232,207,0.1)',
}))
</script>

<template>
  <button
    type="button"
    class="group relative flex w-full flex-col gap-2.5 rounded-3xl border p-3 text-left transition duration-200 hover:-translate-y-0.5"
    :class="selected ? 'shadow-ember-sm' : 'hover:border-cream/25'"
    :style="accentStyle"
    @click="emit('select', oil.id)"
  >
    <div class="flex items-start justify-between gap-2">
      <span
        class="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-night-900/50 p-1.5"
      >
        <OilIcon :id="oil.id" />
      </span>

      <span
        v-if="selected"
        class="grid h-6 w-6 place-items-center rounded-full"
        :style="{ backgroundColor: oil.accent }"
      >
        <Check class="h-3.5 w-3.5 text-night-900" />
      </span>
    </div>

    <span class="font-bengali text-base font-bold leading-tight text-cream">{{ oil.name }}</span>
    <span class="font-bengali text-sm font-medium" :style="{ color: oil.accent }">
      {{ oil.effect }}
    </span>
    <span class="font-bengali text-xs leading-relaxed text-cream/55">{{ oil.description }}</span>

    <span
      class="mt-auto inline-flex w-fit items-center gap-1.5 rounded-full bg-night-900/60 px-2.5 py-1 text-[11px] font-semibold text-cream/75"
    >
      {{ oil.statLabel }}
      <span :style="{ color: oil.accent }">{{ oil.statValue }}</span>
    </span>
  </button>
</template>
