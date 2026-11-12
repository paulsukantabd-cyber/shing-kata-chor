import { describe, expect, it } from 'vitest'
import {
  DEFAULT_CUT_CONFIG,
  createCutChallengeState,
  registerCutHit,
  scoreCutChallenge,
  updateCutChallenge,
} from './CutChallenge'

describe('CutChallenge', () => {
  it('starts empty and unfinished', () => {
    const state = createCutChallengeState()
    expect(state.progress).toBe(0)
    expect(state.noise).toBe(0)
    expect(state.finished).toBe(false)
    expect(state.success).toBe(false)
  })

  it('keeps the marker inside the gauge', () => {
    const state = createCutChallengeState()
    for (let i = 0; i < 400; i += 1) {
      updateCutChallenge(state, 1 / 60)
      expect(state.marker).toBeGreaterThanOrEqual(0)
      expect(state.marker).toBeLessThanOrEqual(1)
    }
  })

  it('grows the noise meter over time', () => {
    const state = createCutChallengeState()
    for (let i = 0; i < 60; i += 1) {
      updateCutChallenge(state, 1 / 60)
    }
    expect(state.noise).toBeGreaterThan(0)
    expect(state.noise).toBeCloseTo(DEFAULT_CUT_CONFIG.passiveNoisePerSecond, 1)
  })

  it('clamps huge frame deltas so a stalled tab cannot fill the meter', () => {
    const state = createCutChallengeState()
    updateCutChallenge(state, 30)
    expect(state.noise).toBeLessThan(DEFAULT_CUT_CONFIG.noiseMax)
  })

  it('rewards a press in the calm zone and lowers the noise', () => {
    const state = createCutChallengeState()
    state.marker = 0.5
    const outcome = registerCutHit(state)

    expect(outcome.kind).toBe('perfect')
    expect(state.progress).toBe(DEFAULT_CUT_CONFIG.progressPerPerfectHit)
    expect(state.noise).toBe(0)
    expect(state.hits).toBe(1)
  })

  it('punishes a press far from the calm zone', () => {
    const state = createCutChallengeState()
    state.marker = 0.95
    const outcome = registerCutHit(state)

    expect(outcome.kind).toBe('bad')
    expect(state.noise).toBe(DEFAULT_CUT_CONFIG.noiseOnBadHit)
    expect(state.misses).toBe(1)
  })

  it('fails when the noise meter fills up', () => {
    const state = createCutChallengeState()
    state.noise = 95
    state.marker = 0.95
    registerCutHit(state)

    expect(state.finished).toBe(true)
    expect(state.success).toBe(false)
  })

  it('completes when the cut progress reaches the target', () => {
    const state = createCutChallengeState()
    state.progress = 95
    state.marker = 0.5

    const outcome = registerCutHit(state)
    expect(outcome.finished).toBe(true)
    expect(state.success).toBe(true)
    expect(state.progress).toBe(100)
  })

  it('scores a clean run higher than a noisy one', () => {
    const clean = createCutChallengeState()
    clean.hits = 8
    clean.perfectHits = 8
    clean.success = true

    const noisy = createCutChallengeState()
    noisy.hits = 2
    noisy.misses = 8
    noisy.noise = 90

    expect(scoreCutChallenge(clean)).toBeGreaterThan(scoreCutChallenge(noisy))
    expect(scoreCutChallenge(clean)).toBeLessThanOrEqual(100)
  })
})
