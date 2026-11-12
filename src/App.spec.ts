import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App.vue'
import { usePlayerStore } from './stores/player'
import { useSessionStore } from './stores/session'

function mountApp() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return mount(App, { global: { plugins: [pinia] } })
}

describe('application flow', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows the welcome screen first', () => {
    const wrapper = mountApp()
    expect(wrapper.text()).toContain('সিঁধেল চোর')
    expect(wrapper.text()).toContain('খেলা শুরু করো')
  })

  it('moves from the welcome screen to the player setup', async () => {
    const wrapper = mountApp()

    const playButton = wrapper.findAll('button').find((button) => button.text().includes('খেলা শুরু করো'))
    expect(playButton).toBeTruthy()
    await playButton?.trigger('click')

    expect(wrapper.text()).toContain('চোরের নাম ঠিক করো')
    expect(useSessionStore().screen).toBe('setup')
  })

  it('blocks the setup screen while the name is empty', async () => {
    const wrapper = mountApp()
    const session = useSessionStore()
    session.goTo('setup')
    await wrapper.vm.$nextTick()

    const input = wrapper.find('input[type="text"]')
    await input.setValue('   ')

    const prepareButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('প্রস্তুতি নাও'))

    expect(prepareButton?.attributes('disabled')).toBeDefined()
  })

  it('stores the name and the chosen appearance', async () => {
    const wrapper = mountApp()
    const session = useSessionStore()
    session.goTo('setup')
    await wrapper.vm.$nextTick()

    const input = wrapper.find('input[type="text"]')
    await input.setValue('জামাল')

    const player = usePlayerStore()
    expect(player.name).toBe('জামাল')

    player.setLungi('yellow')
    expect(player.appearance.lungi).toBe('yellow')
  })

  it('reaches the preparation screen and keeps the oil choice', async () => {
    const wrapper = mountApp()
    const session = useSessionStore()
    session.goTo('setup')
    await wrapper.vm.$nextTick()

    const input = wrapper.find('input[type="text"]')
    await input.setValue('কালু')

    const prepareButton = wrapper
      .findAll('button')
      .find((button) => button.text().includes('প্রস্তুতি নাও'))
    await prepareButton?.trigger('click')

    expect(session.screen).toBe('preparation')
    expect(wrapper.text()).toContain('রাতের প্রস্তুতি')

    session.setOil('mobile')
    await wrapper.vm.$nextTick()
    expect(session.oilId).toBe('mobile')
    expect(wrapper.text()).toContain('মবিল')
  })

  it('opens and closes the settings overlay', async () => {
    const wrapper = mountApp()
    const session = useSessionStore()

    session.openOverlay('settings')
    await wrapper.vm.$nextTick()
    await new Promise((resolve) => setTimeout(resolve, 0))

    // The modal is teleported to <body>, so it lives outside the wrapper.
    expect(document.body.textContent).toContain('রাতের আওয়াজ')

    session.closeOverlay()
    await wrapper.vm.$nextTick()
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(document.querySelector('[role="dialog"]')).toBeNull()
  })

  it('labels the leaderboard as an upcoming feature', async () => {
    const wrapper = mountApp()
    const session = useSessionStore()

    session.openOverlay('leaderboard')
    await wrapper.vm.$nextTick()
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(document.body.textContent).toContain('সেরা চোরেরা')
    expect(document.body.textContent).toContain('পরের ধাপে যোগ হবে')
  })
})
