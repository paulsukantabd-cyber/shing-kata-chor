<script setup lang="ts">
import { computed } from 'vue'
import { useAudio } from '../../composables/useAudio'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'ghost' | 'wood' | 'danger'
    size?: 'lg' | 'md' | 'sm'
    disabled?: boolean
    block?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    disabled: false,
    block: false,
  },
)

const emit = defineEmits<{ (event: 'click', payload: MouseEvent): void }>()

const { play } = useAudio()

const VARIANTS: Record<string, string> = {
  primary:
    'bg-gradient-to-b from-[#F0C878] to-[#D89B3C] text-[#2A1A10] font-semibold shadow-ember hover:from-[#F7D894] hover:to-[#E0A745] border border-[#7A5620]/60',
  ghost:
    'bg-white/[0.06] text-cream/90 border border-cream/15 hover:bg-white/[0.12] hover:border-cream/30',
  wood: 'bg-wood-grain text-[#F3E8CF] border border-[#2A1A10]/70 shadow-plank hover:brightness-110',
  danger:
    'bg-gradient-to-b from-[#D2685A] to-[#B24334] text-[#FFF3E6] font-semibold border border-[#6E241B]/70 hover:from-[#DE7466]',
}

const SIZES: Record<string, string> = {
  lg: 'px-7 py-3.5 text-lg gap-2.5 min-h-[52px]',
  md: 'px-5 py-2.5 text-base gap-2 min-h-[44px]',
  sm: 'px-3.5 py-1.5 text-sm gap-1.5 min-h-[36px]',
}

const classes = computed(() => [
  'inline-flex items-center justify-center rounded-2xl transition-all duration-150',
  'active:scale-[0.97] disabled:opacity-45 disabled:pointer-events-none select-none',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-night-800',
  VARIANTS[props.variant],
  SIZES[props.size],
  props.block ? 'w-full' : '',
])

function onClick(event: MouseEvent): void {
  if (props.disabled) {
    return
  }
  play(props.variant === 'danger' ? 'fail' : 'ui')
  emit('click', event)
}
</script>

<template>
  <button type="button" :class="classes" :disabled="disabled" @click="onClick">
    <slot name="icon" />
    <slot />
  </button>
</template>
