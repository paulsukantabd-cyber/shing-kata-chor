<script setup lang="ts">
import { computed } from 'vue'
import { buildPortraitParts } from '../../game/assets/characterPortrait'
import { RIG } from '../../game/config/character'
import type { CharacterAppearance } from '../../types'

const props = withDefaults(
  defineProps<{
    appearance: CharacterAppearance
    /** `idle` breathes, `prep` runs the funny preparation routine. */
    mode?: 'idle' | 'prep'
    showShadow?: boolean
    /** Scale factor applied to the composition box. */
    scale?: number
  }>(),
  {
    mode: 'idle',
    showShadow: true,
    scale: 1,
  },
)

const parts = computed(() => buildPortraitParts(props.appearance, { shadow: props.showShadow }))

const boxStyle = computed(() => ({
  width: `${RIG.boxWidth * props.scale}px`,
  height: `${RIG.boxHeight * props.scale}px`,
}))
</script>

<template>
  <div
    class="character-portrait relative select-none"
    :class="`character-portrait--${mode}`"
    :style="boxStyle"
    aria-hidden="true"
  >
    <div
      v-for="part in parts"
      :key="part.key"
      class="character-part absolute"
      :class="`ch-${part.key}`"
      :style="{
        left: `${part.left * props.scale}px`,
        top: `${part.top * props.scale}px`,
        width: `${part.width * props.scale}px`,
        height: `${part.height * props.scale}px`,
        zIndex: part.zIndex,
        transformOrigin: part.transformOrigin,
      }"      v-html="part.svg"
    />
  </div>
</template>

<style scoped>
.character-part {
  will-change: transform;
}

.character-part :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}

/* ------------------------------------------------------------ idle loop */

.character-portrait--idle .ch-torso {
  animation: portrait-breathe 3.4s ease-in-out infinite;
}

.character-portrait--idle .ch-lungi {
  animation: portrait-lungi 3.4s ease-in-out infinite;
}

.character-portrait--idle .ch-head {
  animation: portrait-head-idle 5.6s ease-in-out infinite;
}

.character-portrait--idle .ch-arm-front {
  animation: portrait-arm-front 3.4s ease-in-out infinite;
}

.character-portrait--idle .ch-arm-back {
  animation: portrait-arm-back 3.4s ease-in-out infinite;
}

.character-portrait--idle .ch-eyes {
  animation: portrait-blink 6.2s infinite;
}

/* ------------------------------------------------------- preparation act */

.character-portrait--prep .ch-torso {
  animation: prep-torso 12s ease-in-out infinite;
}

.character-portrait--prep .ch-lungi {
  animation: prep-lungi 12s ease-in-out infinite;
}

.character-portrait--prep .ch-head {
  animation: prep-head 12s ease-in-out infinite;
}

.character-portrait--prep .ch-arm-front {
  animation: prep-arm 12s ease-in-out infinite;
}

.character-portrait--prep .ch-arm-back {
  animation: prep-arm-back 12s ease-in-out infinite;
}

.character-portrait--prep .ch-leg-front {
  animation: prep-leg 12s ease-in-out infinite;
}

@keyframes portrait-breathe {
  0%,
  100% {
    transform: scaleY(1) scaleX(1);
  }
  50% {
    transform: scaleY(1.035) scaleX(1.012);
  }
}

@keyframes portrait-lungi {
  0%,
  100% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(1.02);
  }
}

@keyframes portrait-head-idle {
  0%,
  62%,
  100% {
    transform: rotate(0deg);
  }
  70% {
    transform: rotate(-3deg);
  }
  78% {
    transform: rotate(3deg);
  }
  86% {
    transform: rotate(-1deg);
  }
}

@keyframes portrait-arm-front {
  0%,
  100% {
    transform: rotate(3deg);
  }
  50% {
    transform: rotate(-4deg);
  }
}

@keyframes portrait-arm-back {
  0%,
  100% {
    transform: rotate(-3deg);
  }
  50% {
    transform: rotate(4deg);
  }
}

@keyframes portrait-blink {
  0%,
  92%,
  100% {
    transform: scaleY(1);
  }
  94%,
  97% {
    transform: scaleY(0.08);
  }
}

@keyframes prep-torso {
  0%,
  8% {
    transform: scaleY(1) translateY(0);
  }
  16% {
    transform: scaleY(0.96) translateY(3px);
  }
  30%,
  42% {
    transform: scaleY(1.07) translateY(-4px);
  }
  50%,
  70% {
    transform: scaleY(1) translateY(0);
  }
  86% {
    transform: scaleY(1.05) translateY(-2px);
  }
  100% {
    transform: scaleY(1) translateY(0);
  }
}

@keyframes prep-lungi {
  0%,
  8% {
    transform: rotate(0deg) translateY(0);
  }
  14% {
    transform: rotate(-3deg) translateY(2px);
  }
  19% {
    transform: rotate(2deg) translateY(-1px);
  }
  24% {
    transform: rotate(0deg) translateY(0);
  }
  40% {
    transform: rotate(1deg) translateY(-1px);
  }
  52%,
  100% {
    transform: rotate(0deg) translateY(0);
  }
}

@keyframes prep-head {
  0%,
  26% {
    transform: rotate(0deg);
  }
  32% {
    transform: rotate(-14deg);
  }
  38% {
    transform: rotate(13deg);
  }
  44% {
    transform: rotate(-8deg);
  }
  50% {
    transform: rotate(0deg);
  }
  58% {
    transform: rotate(16deg);
  }
  66% {
    transform: rotate(-16deg);
  }
  74% {
    transform: rotate(0deg);
  }
  82% {
    transform: rotate(6deg);
  }
  90% {
    transform: rotate(-4deg);
  }
  100% {
    transform: rotate(0deg);
  }
}

@keyframes prep-arm {
  0%,
  10% {
    transform: rotate(4deg);
  }
  17% {
    transform: rotate(34deg);
  }
  24% {
    transform: rotate(20deg);
  }
  32% {
    transform: rotate(-52deg);
  }
  42% {
    transform: rotate(-64deg);
  }
  52% {
    transform: rotate(4deg);
  }
  58% {
    transform: rotate(38deg);
  }
  68% {
    transform: rotate(24deg);
  }
  86% {
    transform: rotate(-12deg);
  }
  100% {
    transform: rotate(4deg);
  }
}

@keyframes prep-arm-back {
  0%,
  12% {
    transform: rotate(-4deg);
  }
  18% {
    transform: rotate(24deg);
  }
  26% {
    transform: rotate(8deg);
  }
  34% {
    transform: rotate(34deg);
  }
  44% {
    transform: rotate(40deg);
  }
  54% {
    transform: rotate(-4deg);
  }
  60% {
    transform: rotate(28deg);
  }
  70% {
    transform: rotate(14deg);
  }
  88% {
    transform: rotate(10deg);
  }
  100% {
    transform: rotate(-4deg);
  }
}

@keyframes prep-leg {
  0%,
  10% {
    transform: rotate(0deg);
  }
  16% {
    transform: rotate(4deg);
  }
  30%,
  44% {
    transform: rotate(-3deg);
  }
  54%,
  100% {
    transform: rotate(0deg);
  }
}
</style>
