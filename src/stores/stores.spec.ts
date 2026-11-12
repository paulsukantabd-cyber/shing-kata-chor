import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { usePlayerStore } from '../stores/player'
import { useSessionStore } from '../stores/session'
import { useSettingsStore } from '../stores/settings'

describe('player store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('keeps a trimmed name', () => {
    const player = usePlayerStore()
    player.setName('  রফিক  ')
    expect(player.name).toBe('রফিক')
  })

  it('persists the name and appearance to local storage', () => {
    const player = usePlayerStore()
    player.setName('কালু')
    player.setLungi('green')
    player.setMoustache(false)
    player.setGamcha(false)

    const raw = localStorage.getItem('shing-kata-chor:player')
    expect(raw).toBeTruthy()

    const stored = JSON.parse(raw as string)
    expect(stored.name).toBe('কালু')
    expect(stored.appearance.lungi).toBe('green')
    expect(stored.appearance.moustache).toBe(false)
    expect(stored.appearance.gamcha).toBe(false)
  })

  it('exposes a character config for the engine', () => {
    const player = usePlayerStore()
    player.setName('জামাল')
    player.setLungi('redCheck')

    expect(player.characterConfig).toEqual({
      name: 'জামাল',
      lungi: 'redCheck',
      moustache: true,
      gamcha: true,
    })
  })
})

describe('session store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('navigates between screens and clears the overlay', () => {
    const session = useSessionStore()
    session.openOverlay('settings')
    expect(session.overlay).toBe('settings')

    session.goTo('setup')
    expect(session.screen).toBe('setup')
    expect(session.overlay).toBeNull()
  })

  it('remembers the selected oil', () => {
    const session = useSessionStore()
    session.setOil('kerosene')
    expect(session.oilId).toBe('kerosene')
  })

  it('keeps the best score only when it improves', () => {
    const session = useSessionStore()
    session.recordResult({ success: true, headline: '', detail: '', score: 42, hits: 3 })
    expect(session.bestScore).toBe(42)

    session.recordResult({ success: false, headline: '', detail: '', score: 10, hits: 1 })
    expect(session.bestScore).toBe(42)
  })

  it('pushes and dismisses toasts', () => {
    const session = useSessionStore()
    session.pushToast('চোর! চোর! ধর!', 'danger')
    expect(session.toasts).toHaveLength(1)
    expect(session.toasts[0].tone).toBe('danger')

    session.dismissToast(session.toasts[0].id)
    expect(session.toasts).toHaveLength(0)
  })
})

describe('settings store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('persists the sound preference', () => {
    const settings = useSettingsStore()
    settings.toggleSound()
    expect(settings.soundEnabled).toBe(false)

    const raw = localStorage.getItem('shing-kata-chor:settings')
    expect(JSON.parse(raw as string).soundEnabled).toBe(false)
  })
})
