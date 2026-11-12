<script setup lang="ts">
import { Clock, Trophy } from 'lucide-vue-next'
import { computed } from 'vue'
import ModalShell from '../ui/ModalShell.vue'
import { useSessionStore } from '../../stores/session'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ (event: 'close'): void }>()

const session = useSessionStore()
const bestScore = computed(() => session.bestScore)
</script>

<template>
  <ModalShell
    :open="open"
    title="সেরা চোরেরা"
    subtitle="দলীয় লিডারবোর্ড এখনো আসেনি — তবে তোমার নিজের রেকর্ড তো আছেই!"
    @close="emit('close')"
  >
    <div class="space-y-4">
      <div
        class="flex items-center gap-4 rounded-2xl border border-gold/25 bg-gold/8 px-4 py-4"
      >
        <span class="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gold/20">
          <Trophy class="h-6 w-6 text-gold" />
        </span>
        <div>
          <p class="font-bengali text-sm text-cream/65">তোমার সেরা স্কোর</p>
          <p class="font-display text-3xl font-bold text-gold">{{ bestScore }}</p>
        </div>
      </div>

      <div
        class="flex items-start gap-3 rounded-2xl border border-cream/10 bg-night-800/60 px-4 py-4 font-bengali text-sm text-cream/65"
      >
        <Clock class="mt-0.5 h-5 w-5 shrink-0 text-gold/70" />
        <p>
          অনলাইন লিডারবোর্ড আর অ্যাকাউন্ট সিস্টেম পরের ধাপে যোগ হবে। ততক্ষণ স্কোর
          এই ডিভাইসেই সেভ থাকে।
        </p>
      </div>
    </div>
  </ModalShell>
</template>
