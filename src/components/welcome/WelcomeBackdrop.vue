<script setup lang="ts">
import { computed } from 'vue'
import { buildCharacterParts, RIG_PLACEMENT } from '../../game/assets/characterSvg'
import type { CharacterAppearance } from '../../types'

const props = withDefaults(
  defineProps<{
    appearance: CharacterAppearance
    /** Renders the peeking thief (skipped for reduced motion builds). */
    showThief?: boolean
  }>(),
  { showThief: true },
)

const parts = buildCharacterParts(props.appearance)

/**
 * The peeking thief: only the head is visible, peeking around the tree trunk.
 * It reuses the very same artwork as the in-game character.
 */
const peekingHead = computed(() => {
  if (!props.showThief) {
    return ''
  }

  const head = parts.head
  const eyes = parts.eyesOpen
  const moustache = parts.moustache

  const place = RIG_PLACEMENT
  const headX = 258
  const headY = 336
  const scale = 1.5

  const offsetY = place.head.y - place.headNeck.y

  const moustacheMarkup = props.appearance.moustache
    ? `<g transform="translate(${(place.moustache.x - place.headNeck.x - moustache.width / 2).toFixed(2)} ${(place.moustache.y - place.headNeck.y - moustache.height / 2).toFixed(2)})">${moustache.content}</g>`
    : ''

  return `
    <g transform="translate(${headX} ${headY}) scale(${scale})">
      <g transform="translate(${(-head.width / 2).toFixed(2)} ${(offsetY - head.height / 2).toFixed(2)})">${head.content}</g>
      <g transform="translate(${(place.eyes.x - place.headNeck.x - eyes.width / 2).toFixed(2)} ${(place.eyes.y - place.headNeck.y - eyes.height / 2).toFixed(2)})">${eyes.content}</g>
      ${moustacheMarkup}
    </g>
  `
})

const fireflies = [
  { x: 12, y: 62, delay: 0, size: 5 },
  { x: 27, y: 38, delay: 1.4, size: 4 },
  { x: 44, y: 71, delay: 2.8, size: 6 },
  { x: 63, y: 46, delay: 4.1, size: 4 },
  { x: 78, y: 66, delay: 0.9, size: 5 },
  { x: 89, y: 34, delay: 3.6, size: 4 },
  { x: 6, y: 44, delay: 5.2, size: 4 },
  { x: 55, y: 22, delay: 2.1, size: 5 },
]
</script>

<template>
  <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
    <!-- Far layers: sky, moon, hills, the house. -->
    <svg
      class="absolute inset-0 h-full w-full"
      viewBox="0 0 960 600"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="wb-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#060B09" />
          <stop offset="38%" stop-color="#0E1C17" />
          <stop offset="72%" stop-color="#1B2B20" />
          <stop offset="100%" stop-color="#2E3A26" />
        </linearGradient>
        <radialGradient id="wb-moon-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FDF7E4" stop-opacity="0.28" />
          <stop offset="55%" stop-color="#FDF7E4" stop-opacity="0.07" />
          <stop offset="100%" stop-color="#FDF7E4" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="wb-moon" cx="42%" cy="38%" r="62%">
          <stop offset="0%" stop-color="#FFFDF4" />
          <stop offset="70%" stop-color="#F3EDD6" />
          <stop offset="100%" stop-color="#D6CDAE" />
        </radialGradient>
        <linearGradient id="wb-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#8A6240" />
          <stop offset="55%" stop-color="#6E4C2F" />
          <stop offset="100%" stop-color="#4C3520" />
        </linearGradient>
        <linearGradient id="wb-roof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#8E9086" />
          <stop offset="100%" stop-color="#585C54" />
        </linearGradient>
        <linearGradient id="wb-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#6B5136" />
          <stop offset="45%" stop-color="#45331F" />
          <stop offset="100%" stop-color="#1B2418" />
        </linearGradient>
        <linearGradient id="wb-path" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#7C5C3C" stop-opacity="0.9" />
          <stop offset="100%" stop-color="#5A4228" stop-opacity="0.2" />
        </linearGradient>
        <radialGradient id="wb-lamp" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FFD89B" stop-opacity="0.55" />
          <stop offset="45%" stop-color="#FFD89B" stop-opacity="0.16" />
          <stop offset="100%" stop-color="#FFD89B" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="wb-trunk" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#3A2A1B" />
          <stop offset="45%" stop-color="#553D26" />
          <stop offset="100%" stop-color="#2A1E13" />
        </linearGradient>
      </defs>

      <rect width="960" height="600" fill="url(#wb-sky)" />

      <g fill="#DDE9D6">
        <circle cx="88" cy="42" r="1.6" opacity="0.8" />
        <circle cx="152" cy="96" r="1.1" opacity="0.6" />
        <circle cx="238" cy="28" r="1.4" opacity="0.7" />
        <circle cx="312" cy="74" r="1" opacity="0.5" />
        <circle cx="402" cy="38" r="1.7" opacity="0.75" />
        <circle cx="486" cy="90" r="1.1" opacity="0.55" />
        <circle cx="556" cy="46" r="1.3" opacity="0.65" />
        <circle cx="640" cy="102" r="1.5" opacity="0.7" />
        <circle cx="712" cy="30" r="1" opacity="0.5" />
        <circle cx="836" cy="72" r="1.4" opacity="0.65" />
        <circle cx="906" cy="36" r="1.2" opacity="0.6" />
        <circle cx="196" cy="150" r="1.1" opacity="0.4" />
        <circle cx="428" cy="128" r="1.2" opacity="0.4" />
        <circle cx="872" cy="140" r="1" opacity="0.35" />
      </g>

      <circle cx="762" cy="112" r="120" fill="url(#wb-moon-glow)" />
      <circle cx="762" cy="112" r="42" fill="url(#wb-moon)" />
      <g fill="#CFC6A6" opacity="0.35">
        <circle cx="772" cy="102" r="8" />
        <circle cx="750" cy="122" r="5.5" />
        <circle cx="768" cy="130" r="4" />
      </g>

      <!-- Hills -->
      <path
        d="M0 402 C120 366 210 392 300 372 C400 350 470 386 560 366 C650 346 740 382 830 362 C890 350 930 366 960 358 L960 600 L0 600 Z"
        fill="#16241D"
      />
      <path
        d="M0 452 C140 424 240 448 350 430 C470 410 560 444 680 424 C790 406 880 436 960 422 L960 600 L0 600 Z"
        fill="#1C2D23"
      />

      <!-- Distant tree line -->
      <g fill="#14211A">
        <path d="M40 452 q14-46 28 0z" />
        <path d="M96 452 q18-58 36 0z" />
        <path d="M840 448 q16-52 32 0z" />
        <path d="M896 448 q18-62 36 0z" />
        <rect x="18" y="430" width="4" height="26" />
        <rect x="108" y="428" width="4" height="28" />
      </g>

      <!-- The mud house -->
      <g>
        <rect x="432" y="332" width="286" height="176" fill="url(#wb-wall)" />
        <path d="M432 332 H718 L742 344 H408 Z" fill="#3B2A19" opacity="0.7" />
        <path d="M410 340 L575 254 L740 340 Z" fill="url(#wb-roof)" />
        <g stroke="#3E423B" stroke-width="2" opacity="0.5">
          <path d="M446 336 L588 262" />
          <path d="M482 336 L612 264" />
          <path d="M518 336 L636 266" />
          <path d="M554 336 L660 268" />
          <path d="M590 336 L684 270" />
          <path d="M626 336 L708 272" />
        </g>
        <ellipse cx="575" cy="252" rx="16" ry="6" fill="#4B4F48" />

        <!-- lit window -->
        <rect x="592" y="368" width="70" height="56" fill="#2A1D12" />
        <rect x="598" y="374" width="58" height="44" fill="#FFD89B" />
        <ellipse cx="626" cy="396" rx="86" ry="64" fill="url(#wb-lamp)" opacity="0.5" />
        <path d="M626 374 V418 M598 396 H656" stroke="#5C3F24" stroke-width="5" />

        <!-- door -->
        <rect x="468" y="404" width="66" height="104" fill="#412D1B" />
        <rect x="474" y="410" width="54" height="98" fill="#6B4A2E" />
        <circle cx="518" cy="460" r="3.5" fill="#E8B85C" />

        <!-- clay wall base -->
        <rect x="432" y="486" width="286" height="22" fill="#4A3520" />
        <ellipse cx="470" cy="497" rx="16" ry="5" fill="#3A2A18" opacity="0.5" />
        <ellipse cx="690" cy="497" rx="20" ry="6" fill="#3A2A18" opacity="0.45" />
      </g>

      <!-- Bamboo -->
      <g stroke-linecap="round" fill="none">
        <path d="M846 520 Q852 420 846 320" stroke="#3E5429" stroke-width="9" />
        <path d="M878 524 Q884 430 880 344" stroke="#4E6634" stroke-width="7" />
        <path d="M912 528 Q916 440 914 360" stroke="#3E5429" stroke-width="6" />
        <path d="M842 300 q22-16 42-4" stroke="#3E5429" stroke-width="5" />
        <path d="M876 322 q24-14 44-2" stroke="#456036" stroke-width="4" />
        <path d="M910 340 q20-12 38-2" stroke="#3E5429" stroke-width="4" />
      </g>

      <!-- Ground -->
      <rect x="0" y="508" width="960" height="92" fill="url(#wb-ground)" />
      <path
        d="M120 600 C210 556 340 528 470 520 C560 514 640 512 700 508 L700 508 C560 520 430 544 320 600 Z"
        fill="url(#wb-path)"
      />
      <g stroke="#16211A" stroke-width="3" stroke-linecap="round" opacity="0.9">
        <path d="M40 600 q6-26 14-34" />
        <path d="M66 600 q-4-22 2-30" />
        <path d="M92 600 q8-24 4-32" />
        <path d="M300 600 q4-22 12-30" />
        <path d="M330 600 q-6-20 0-28" />
        <path d="M860 600 q6-24 14-32" />
        <path d="M900 600 q-4-20 2-28" />
      </g>

      <!-- Lantern on a pole -->
      <g>
        <rect x="782" y="392" width="6" height="118" fill="#3B5127" />
        <path d="M785 398 v-28" stroke="#2A1E13" stroke-width="2" />
        <rect x="774" y="366" width="22" height="30" rx="4" fill="#F6E2AC" />
        <rect x="770" y="360" width="30" height="8" rx="3" fill="#4B4F48" />
        <circle cx="785" cy="380" r="62" fill="url(#wb-lamp)" class="wb-lantern-glow" />
      </g>
    </svg>

    <!-- The thief peeking from behind the tree -->
    <svg
      class="absolute inset-0 h-full w-full"
      viewBox="0 0 960 600"
      preserveAspectRatio="xMidYMid slice"
    >
      <g class="wb-peek" v-html="peekingHead" />
    </svg>

    <!-- Foreground: the tree the thief hides behind + mist -->
    <svg
      class="absolute inset-0 h-full w-full"
      viewBox="0 0 960 600"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="wb-fog" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#CFE3D8" stop-opacity="0.16" />
          <stop offset="100%" stop-color="#CFE3D8" stop-opacity="0" />
        </radialGradient>
      </defs>

      <g class="wb-tree">
        <path d="M132 600 q10-180 26-300 q10-74 30-118 q-26 30-40 78 q-24 84-28 340 Z" fill="url(#wb-trunk)" />
        <path d="M176 600 q6-170 26-280 q14-78 38-118 q-30 26-46 76 q-28 82-32 322 Z" fill="#2A1E13" />
        <g fill="#22391F">
          <ellipse cx="150" cy="196" rx="96" ry="62" />
          <ellipse cx="226" cy="164" rx="78" ry="52" />
          <ellipse cx="104" cy="248" rx="74" ry="48" />
          <ellipse cx="204" cy="246" rx="88" ry="54" />
        </g>
        <g fill="#2C4726" opacity="0.9">
          <ellipse cx="176" cy="212" rx="88" ry="50" />
          <ellipse cx="122" cy="268" rx="60" ry="38" />
          <ellipse cx="236" cy="236" rx="62" ry="40" />
        </g>
      </g>

      <g class="wb-fog" opacity="0.75">
        <ellipse cx="250" cy="470" rx="300" ry="46" fill="url(#wb-fog)" />
        <ellipse cx="690" cy="512" rx="340" ry="40" fill="url(#wb-fog)" />
      </g>
    </svg>

    <!-- Fireflies -->
    <span
      v-for="(fly, index) in fireflies"
      :key="index"
      class="absolute rounded-full bg-[#DFF5A0] shadow-[0_0_12px_4px_rgba(223,245,160,0.45)]"
      :style="{
        left: `${fly.x}%`,
        top: `${fly.y}%`,
        width: `${fly.size}px`,
        height: `${fly.size}px`,
        animation: `firefly 9s ${fly.delay}s linear infinite`,
      }"
    />
  </div>
</template>

<style scoped>
.wb-lantern-glow {
  animation: wb-flicker 3.2s ease-in-out infinite;
  transform-box: fill-box;
  transform-origin: center;
}

.wb-tree {
  animation: wb-sway 9s ease-in-out infinite;
  transform-box: fill-box;
  transform-origin: bottom center;
}

.wb-peek {
  animation: wb-peek 7s ease-in-out infinite;
  transform-box: fill-box;
  transform-origin: 10% 95%;
}

@keyframes wb-peek {
  0%,
  100% {
    transform: rotate(-2.5deg) translateX(0);
  }
  38% {
    transform: rotate(4deg) translateX(5px);
  }
  62% {
    transform: rotate(-1deg) translateX(-2px);
  }
  80% {
    transform: rotate(2deg) translateX(2px);
  }
}

.wb-fog {
  animation: wb-drift 24s ease-in-out infinite alternate;
}

@keyframes wb-flicker {
  0%,
  100% {
    opacity: 0.85;
  }
  42% {
    opacity: 1;
  }
  64% {
    opacity: 0.72;
  }
}

@keyframes wb-sway {
  0%,
  100% {
    transform: rotate(-0.5deg);
  }
  50% {
    transform: rotate(0.5deg);
  }
}

@keyframes wb-drift {
  0% {
    transform: translateX(-26px);
  }
  100% {
    transform: translateX(26px);
  }
}
</style>
