<script setup lang="ts">
import { Gamepad2, Hand, Keyboard, MoveRight, Volume2 } from 'lucide-vue-next'
import ModalShell from '../ui/ModalShell.vue'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ (event: 'close'): void }>()
</script>

<template>
  <ModalShell
    :open="open"
    title="কীভাবে খেলবে"
    subtitle="একটা সহজ নিয়ম — কিন্তু চুরির জন্য সাহস লাগবে!"
    @close="emit('close')"
  >
    <ol class="space-y-3 font-bengali">
      <li
        class="flex gap-3 rounded-2xl border border-cream/10 bg-night-800/50 px-4 py-3.5 text-cream/80"
      >
        <MoveRight class="mt-0.5 h-5 w-5 shrink-0 text-gold" />
        <span>
          ঘরের কাছে গিয়ে <strong class="text-gold-soft">সিঁধের গর্ত</strong> খুঁজে বের করো।
          কাছে গেলেই <strong class="text-gold-soft">“সিঁধ কাটবে?”</strong> লেখাটা আসবে।
        </span>
      </li>

      <li
        class="flex gap-3 rounded-2xl border border-cream/10 bg-night-800/50 px-4 py-3.5 text-cream/80"
      >
        <Hand class="mt-0.5 h-5 w-5 shrink-0 text-gold" />
        <span>
          সবুজ জায়গায় থাকা মার্কার দেখে <strong class="text-gold-soft">চাপ দাও</strong>।
          ভুল সময়ে চাপলে গ্রামের শব্দ বেড়ে যাবে, আর শব্দ পূর্ণ হলেই ধরা পড়বে!
        </span>
      </li>

      <li
        class="flex gap-3 rounded-2xl border border-cream/10 bg-night-800/50 px-4 py-3.5 text-cream/80"
      >
        <Keyboard class="mt-0.5 h-5 w-5 shrink-0 text-gold" />
        <span>
          কীবোর্ডে <kbd class="rounded bg-white/10 px-1.5 py-0.5">A</kbd>
          <kbd class="rounded bg-white/10 px-1.5 py-0.5">D</kbd> দিয়ে হাঁটো,
          <kbd class="rounded bg-white/10 px-1.5 py-0.5">Shift</kbd> ধরে দৌড়াও,
          <kbd class="rounded bg-white/10 px-1.5 py-0.5">E</kbd> দিয়ে কাজ করো।
        </span>
      </li>

      <li
        class="flex gap-3 rounded-2xl border border-cream/10 bg-night-800/50 px-4 py-3.5 text-cream/80"
      >
        <Gamepad2 class="mt-0.5 h-5 w-5 shrink-0 text-gold" />
        <span>
          মোবাইলে নিচের বাটনগুলোতে আঙুল রাখো — একসাথে একাধিক বাটনও চাপা যায়।
        </span>
      </li>

      <li
        class="flex gap-3 rounded-2xl border border-cream/10 bg-night-800/50 px-4 py-3.5 text-cream/80"
      >
        <Volume2 class="mt-0.5 h-5 w-5 shrink-0 text-gold" />
        <span>
          শব্দ বন্ধ রাখতে চাইলে উপরের সেটিংস বাটনে ট্যাপ করো। সব নিয়ম সেটিংসেই সেভ হয়।
        </span>
      </li>
    </ol>
  </ModalShell>
</template>
