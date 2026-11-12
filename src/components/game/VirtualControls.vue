<script setup lang="ts">
import { ChevronLeft, ChevronRight, Hand, Zap } from 'lucide-vue-next'
import { reactive } from 'vue'
import { inputSystem, type InputAction } from '../../game/systems/InputSystem'

interface ButtonState {
  [key: string]: boolean
}

defineProps<{
  /** Shows the highlighted state when the interaction prompt is visible. */
  actionActive?: boolean
  actionLabel?: string
}>()

const state = reactive<ButtonState>({})

function setPressed(action: InputAction, value: boolean): void {
  state[action] = value
  inputSystem.setVirtual(action, value)
}

function onDown(action: InputAction, event: PointerEvent): void {
  event.preventDefault()
  ;(event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId)
  setPressed(action, true)
}

function onUp(action: InputAction, event: PointerEvent): void {
  event.preventDefault()
  setPressed(action, false)
}
</script>

<template>
  <div
    class="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between px-3 pb-3 sm:px-6 sm:pb-5"
  >
    <!-- Movement cluster -->
    <div class="pointer-events-auto flex items-end gap-2.5">
      <button
        type="button"
        class="grid h-16 w-16 touch-none place-items-center rounded-2xl border border-cream/20 bg-night-800/75 text-cream/90 backdrop-blur transition active:scale-95 sm:h-[72px] sm:w-[72px]"
        :class="state.left ? 'bg-gold/25 border-gold/60' : ''"
        aria-label="বামে যাও"
        @pointerdown="onDown('left', $event)"
        @pointerup="onUp('left', $event)"
        @pointercancel="onUp('left', $event)"
        @lostpointercapture="onUp('left', $event)"
        @contextmenu.prevent
      >
        <ChevronLeft class="h-7 w-7" />
      </button>

      <button
        type="button"
        class="grid h-16 w-16 touch-none place-items-center rounded-2xl border border-cream/20 bg-night-800/75 text-cream/90 backdrop-blur transition active:scale-95 sm:h-[72px] sm:w-[72px]"
        :class="state.right ? 'bg-gold/25 border-gold/60' : ''"
        aria-label="ডানে যাও"
        @pointerdown="onDown('right', $event)"
        @pointerup="onUp('right', $event)"
        @pointercancel="onUp('right', $event)"
        @lostpointercapture="onUp('right', $event)"
        @contextmenu.prevent
      >
        <ChevronRight class="h-7 w-7" />
      </button>

      <button
        type="button"
        class="grid h-14 w-14 touch-none place-items-center rounded-2xl border border-cream/20 bg-night-800/75 text-cream/90 backdrop-blur transition active:scale-95 sm:h-16 sm:w-16"
        :class="state.run ? 'bg-moss/40 border-moss' : ''"
        aria-label="দৌড়াও"
        @pointerdown="onDown('run', $event)"
        @pointerup="onUp('run', $event)"
        @pointercancel="onUp('run', $event)"
        @lostpointercapture="onUp('run', $event)"
        @contextmenu.prevent
      >
        <Zap class="h-6 w-6" />
      </button>
    </div>

    <!-- Action button -->
    <button
      type="button"
      class="pointer-events-auto flex touch-none items-center gap-2 rounded-2xl border px-5 py-4 font-bengali text-base font-semibold backdrop-blur transition active:scale-95"
      :class="
        actionActive
          ? 'border-gold bg-gold/90 text-night-900 shadow-ember'
          : 'border-cream/20 bg-night-800/75 text-cream/85'
      "
      :aria-label="actionLabel ?? 'কাজ করো'"
      @pointerdown="onDown('action', $event)"
      @pointerup="onUp('action', $event)"
      @pointercancel="onUp('action', $event)"
      @lostpointercapture="onUp('action', $event)"
      @contextmenu.prevent
    >
      <Hand class="h-5 w-5" />
      {{ actionLabel ?? 'চাপ দাও' }}
    </button>
  </div>
</template>
