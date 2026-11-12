<script setup lang="ts">
import type { OilId } from '../../game/config/oils'

defineProps<{ id: OilId }>()
</script>

<template>
  <svg viewBox="0 0 64 64" class="h-full w-full" aria-hidden="true">
    <!-- Mustard oil: golden drop with a mustard flower. -->
    <g v-if="id === 'mustard'">
      <circle cx="32" cy="33" r="19" fill="#3A2A12" opacity="0.35" />
      <path
        d="M32 10c9 11 14 17 14 24a14 14 0 1 1-28 0c0-7 5-13 14-24Z"
        fill="#E8B85C"
      />
      <path
        d="M27 22c-4 6-6 10-6 13a11 11 0 0 0 5 9c-1-9 1-16 1-22Z"
        fill="#F7DC9B"
        opacity="0.85"
      />
      <g fill="#F3E8CF">
        <circle cx="44" cy="18" r="4.5" />
        <circle cx="52" cy="24" r="3.4" />
        <circle cx="44" cy="29" r="3" />
        <circle cx="39" cy="22" r="2.6" />
      </g>
      <circle cx="45" cy="21" r="2.4" fill="#C69A32" />
    </g>

    <!-- Soybean oil: soft green drop with beans. -->
    <g v-else-if="id === 'soybean'">
      <circle cx="32" cy="33" r="19" fill="#22300F" opacity="0.35" />
      <path
        d="M32 10c9 11 14 17 14 24a14 14 0 1 1-28 0c0-7 5-13 14-24Z"
        fill="#A8C06A"
      />
      <path
        d="M27 22c-4 6-6 10-6 13a11 11 0 0 0 5 9c-1-9 1-16 1-22Z"
        fill="#D3E3A6"
        opacity="0.85"
      />
      <ellipse cx="46" cy="20" rx="6" ry="4.6" fill="#8FAE52" transform="rotate(-24 46 20)" />
      <path d="M41 19c3-1 7 0 10 2" stroke="#5F7333" stroke-width="1.4" fill="none" />
    </g>

    <!-- Kerosene: sharp red drop with sparks. -->
    <g v-else-if="id === 'kerosene'">
      <circle cx="32" cy="33" r="19" fill="#3A140E" opacity="0.4" />
      <path
        d="M32 8c10 12 15 18 15 25a15 15 0 1 1-30 0c0-7 5-13 15-25Z"
        fill="#C95745"
      />
      <path
        d="M27 21c-4 7-6 11-6 14a11 11 0 0 0 6 9c-2-9 0-17 0-23Z"
        fill="#E98470"
        opacity="0.85"
      />
      <path
        d="M32 26c4 4 6 7 6 10a6 6 0 1 1-12 0c0-3 2-6 6-10Z"
        fill="#FFD89B"
      />
      <g stroke="#FFD89B" stroke-width="2.4" stroke-linecap="round">
        <path d="M15 14 19 9" />
        <path d="M49 14 45 9" />
        <path d="M32 6V1" />
      </g>
    </g>

    <!-- Mobile oil: slick blue drop with a slide arrow. -->
    <g v-else>
      <circle cx="32" cy="33" r="19" fill="#0E2733" opacity="0.4" />
      <path
        d="M32 10c9 11 14 17 14 24a14 14 0 1 1-28 0c0-7 5-13 14-24Z"
        fill="#6FA8C7"
      />
      <path
        d="M27 22c-4 6-6 10-6 13a11 11 0 0 0 5 9c-1-9 1-16 1-22Z"
        fill="#B6DCEF"
        opacity="0.85"
      />
      <path
        d="M18 46c6-5 12-7 18-7"
        stroke="#E8F4FB"
        stroke-width="3"
        stroke-linecap="round"
        fill="none"
        opacity="0.9"
      />
      <path d="M40 33l6 6-6 6" stroke="#E8F4FB" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" />
    </g>
  </svg>
</template>
