import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { inputSystem } from './InputSystem'

describe('InputSystem', () => {
  beforeEach(() => {
    inputSystem.attach()
  })

  afterEach(() => {
    inputSystem.detach()
  })

  it('reports virtual buttons as pressed', () => {
    expect(inputSystem.isDown('left')).toBe(false)
    inputSystem.setVirtual('left', true)
    expect(inputSystem.isDown('left')).toBe(true)
    inputSystem.setVirtual('left', false)
    expect(inputSystem.isDown('left')).toBe(false)
  })

  it('supports several simultaneous buttons', () => {
    inputSystem.setVirtual('right', true)
    inputSystem.setVirtual('run', true)

    expect(inputSystem.isDown('right')).toBe(true)
    expect(inputSystem.isDown('run')).toBe(true)
    expect(inputSystem.isDown('left')).toBe(false)
  })

  it('reacts to keyboard events', () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD' }))
    expect(inputSystem.isDown('right')).toBe(true)

    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyD' }))
    expect(inputSystem.isDown('right')).toBe(false)
  })

  it('notifies pause listeners on escape', () => {
    let paused = 0
    const off = inputSystem.onPause(() => {
      paused += 1
    })

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape' }))
    expect(paused).toBe(1)

    off()
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape' }))
    expect(paused).toBe(1)
  })

  it('clears every state on detach', () => {
    inputSystem.setVirtual('left', true)
    inputSystem.detach()
    expect(inputSystem.isDown('left')).toBe(false)
  })
})
