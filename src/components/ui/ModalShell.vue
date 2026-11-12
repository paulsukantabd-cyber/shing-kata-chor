<script setup lang="ts">
import { X } from 'lucide-vue-next'

withDefaults(
  defineProps<{
    open: boolean
    title: string
    subtitle?: string
    /** Extra css classes for the modal frame. */
    panelClass?: string
  }>(),
  {
    subtitle: '',
    panelClass: '',
  },
)

const emit = defineEmits<{ (event: 'close'): void }>()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-end justify-center bg-[#050b08]/85 p-3 backdrop-blur-sm sm:items-center sm:p-6"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        @click.self="emit('close')"
      >
        <div
          class="panel-parchment grain relative w-full max-w-lg overflow-hidden rounded-[26px] px-5 pb-6 pt-6 sm:px-8 sm:pb-8"
          :class="panelClass"
        >
          <div
            class="pointer-events-none absolute inset-x-8 top-0 h-24 bg-[radial-gradient(ellipse_at_top,rgba(232,184,92,0.14),transparent_70%)]"
          />

          <header class="relative mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 class="font-bengali text-2xl font-bold text-gold-soft sm:text-3xl">{{ title }}</h2>
              <p v-if="subtitle" class="mt-1 font-bengali text-sm text-cream/65">{{ subtitle }}</p>
            </div>
            <button
              type="button"
              class="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-cream/12 bg-white/5 text-cream/70 transition hover:bg-white/12 hover:text-cream"
              aria-label="বন্ধ করো"
              @click="emit('close')"
            >
              <X class="h-4 w-4" />
            </button>
          </header>

          <div class="relative">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
