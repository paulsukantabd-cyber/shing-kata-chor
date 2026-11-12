<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch } from 'vue'
import GameView from './components/game/GameView.vue'
import HowToPlayOverlay from './components/overlays/HowToPlayOverlay.vue'
import LeaderboardOverlay from './components/overlays/LeaderboardOverlay.vue'
import PlayerSetupScreen from './components/setup/PlayerSetupScreen.vue'
import PreparationScreen from './components/preparation/PreparationScreen.vue'
import SettingsOverlay from './components/overlays/SettingsOverlay.vue'
import WelcomeScreen from './components/welcome/WelcomeScreen.vue'
import { useAudio } from './composables/useAudio'
import { useSessionStore } from './stores/session'
import { useSettingsStore } from './stores/settings'

const session = useSessionStore()
const settings = useSettingsStore()
const { unlock } = useAudio()

const screen = computed(() => session.screen)
const overlay = computed(() => session.overlay)

const transitionProps = {
  enterActiveClass: 'transition duration-300 ease-out',
  enterFromClass: 'opacity-0 translate-y-3',
  leaveActiveClass: 'transition duration-200 ease-in',
  leaveToClass: 'opacity-0 -translate-y-2',
}

function onFirstGesture(): void {
  unlock()
  window.removeEventListener('pointerdown', onFirstGesture)
  window.removeEventListener('keydown', onFirstGesture)
}

onMounted(() => {
  window.addEventListener('pointerdown', onFirstGesture)
  window.addEventListener('keydown', onFirstGesture)
})

onBeforeUnmount(() => {
  window.removeEventListener('pointerdown', onFirstGesture)
  window.removeEventListener('keydown', onFirstGesture)
})

watch(
  () => settings.reducedMotion,
  (value) => {
    document.documentElement.dataset.reducedMotion = String(value)
  },
  { immediate: true },
)
</script>

<template>
  <div class="min-h-screen bg-[#080e0c] text-cream">
    <Transition mode="out-in" v-bind="transitionProps">
      <WelcomeScreen
        v-if="screen === 'welcome'"
        key="welcome"
        @play="session.goTo('setup')"
        @settings="session.openOverlay('settings')"
        @leaderboard="session.openOverlay('leaderboard')"
        @howto="session.openOverlay('howto')"
      />

      <PlayerSetupScreen
        v-else-if="screen === 'setup'"
        key="setup"
        @back="session.goTo('welcome')"
        @start="session.goTo('preparation')"
      />

      <PreparationScreen
        v-else-if="screen === 'preparation'"
        key="preparation"
        @back="session.goTo('setup')"
        @start="session.goTo('game')"
      />

      <GameView v-else-if="screen === 'game'" key="game" @back="session.goTo('welcome')" />
    </Transition>

    <SettingsOverlay :open="overlay === 'settings'" @close="session.closeOverlay()" />
    <HowToPlayOverlay :open="overlay === 'howto'" @close="session.closeOverlay()" />
    <LeaderboardOverlay :open="overlay === 'leaderboard'" @close="session.closeOverlay()" />
  </div>
</template>
