/**
 * Pure logic for the "সিঁধ কাটা" prototype challenge.
 *
 * The mechanic is intentionally arcade-fantasy, not a simulation of anything
 * real: a marker sweeps across a gauge and the player has to tap while it is
 * inside the calm zone. Calm taps advance the cut, sloppy taps raise the
 * noise meter, and a full noise meter wakes the whole village up.
 *
 * Kept free of Phaser so it can be unit tested headlessly.
 */

export interface CutChallengeConfig {
  /** Progress required to finish the cut (0-100). */
  targetProgress: number
  progressPerPerfectHit: number
  progressPerGoodHit: number
  progressPerBadHit: number
  /** Noise ceiling (0-100). Reaching it means failure. */
  noiseMax: number
  /** Noise gained per second while the cut is running. */
  passiveNoisePerSecond: number
  /** How fast the marker sweeps (units per second, 0-1 range). */
  markerSpeed: number
  /** Half width of the perfect zone around the centre of the gauge. */
  perfectZone: number
  /** Half width of the acceptable zone. */
  goodZone: number
  noiseOnPerfectHit: number
  noiseOnGoodHit: number
  noiseOnBadHit: number
}

export const DEFAULT_CUT_CONFIG: CutChallengeConfig = {
  targetProgress: 100,
  progressPerPerfectHit: 14,
  progressPerGoodHit: 9,
  progressPerBadHit: 1,
  noiseMax: 100,
  passiveNoisePerSecond: 1.7,
  markerSpeed: 0.62,
  perfectZone: 0.07,
  goodZone: 0.2,
  noiseOnPerfectHit: -12,
  noiseOnGoodHit: -5,
  noiseOnBadHit: 26,
}

export interface CutChallengeState {
  /** How much of the cut is done (0-100). */
  progress: number
  /** How much noise the village has heard (0-100). */
  noise: number
  /** Marker position on the gauge (0-1). */
  marker: number
  /** Sweep direction of the marker. */
  markerDirection: 1 | -1
  /** Successful taps. */
  hits: number
  /** Taps inside the perfect zone. */
  perfectHits: number
  /** Taps outside the acceptable zone. */
  misses: number
  /** Set once the challenge resolves. */
  finished: boolean
  success: boolean
}

export type CutHitKind = 'perfect' | 'good' | 'bad'

export interface CutHitOutcome {
  kind: CutHitKind
  progressDelta: number
  noiseDelta: number
  /** Bengali feedback line for the current tap. */
  message: string
  finished: boolean
  success: boolean
}

export function createCutChallengeState(): CutChallengeState {
  return {
    progress: 0,
    noise: 0,
    marker: 0.5,
    markerDirection: 1,
    hits: 0,
    perfectHits: 0,
    misses: 0,
    finished: false,
    success: false,
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** Advances the marker and the passive noise growth. */
export function updateCutChallenge(
  state: CutChallengeState,
  deltaSeconds: number,
  config: CutChallengeConfig = DEFAULT_CUT_CONFIG,
): void {
  if (state.finished) {
    return
  }

  const dt = clamp(deltaSeconds, 0, 0.1)
  state.marker += state.markerDirection * config.markerSpeed * dt

  if (state.marker >= 1) {
    state.marker = 1
    state.markerDirection = -1
  } else if (state.marker <= 0) {
    state.marker = 0
    state.markerDirection = 1
  }

  state.noise = clamp(state.noise + config.passiveNoisePerSecond * dt, 0, config.noiseMax)

  if (state.noise >= config.noiseMax) {
    state.finished = true
    state.success = false
  }
}

/** Evaluates a tap on the gauge. */
export function registerCutHit(
  state: CutChallengeState,
  config: CutChallengeConfig = DEFAULT_CUT_CONFIG,
): CutHitOutcome {
  if (state.finished) {
    return {
      kind: 'good',
      progressDelta: 0,
      noiseDelta: 0,
      message: 'আর পারা যাবে না!',
      finished: true,
      success: state.success,
    }
  }

  const distance = Math.abs(state.marker - 0.5)
  let kind: CutHitKind = 'bad'
  let progressDelta = config.progressPerBadHit
  let noiseDelta = config.noiseOnBadHit
  let message = 'ওইচো! শব্দ হয়ে গেল!'

  if (distance <= config.perfectZone) {
    kind = 'perfect'
    progressDelta = config.progressPerPerfectHit
    noiseDelta = config.noiseOnPerfectHit
    message = 'একদম ঠিক! হাত স্থির!'
  } else if (distance <= config.goodZone) {
    kind = 'good'
    progressDelta = config.progressPerGoodHit
    noiseDelta = config.noiseOnGoodHit
    message = 'চলছে… ধরে রাখো!'
  }

  state.progress = clamp(state.progress + progressDelta, 0, config.targetProgress)
  state.noise = clamp(state.noise + noiseDelta, 0, config.noiseMax)

  if (kind === 'bad') {
    state.misses += 1
  } else {
    state.hits += 1
    if (kind === 'perfect') {
      state.perfectHits += 1
    }
  }

  if (state.progress >= config.targetProgress) {
    state.finished = true
    state.success = true
    state.progress = config.targetProgress
  } else if (state.noise >= config.noiseMax) {
    state.finished = true
    state.success = false
    state.noise = config.noiseMax
  }

  return {
    kind,
    progressDelta,
    noiseDelta,
    message,
    finished: state.finished,
    success: state.success,
  }
}

/** 0-100 accuracy score used for the local best-score record. */
export function scoreCutChallenge(
  state: CutChallengeState,
  config: CutChallengeConfig = DEFAULT_CUT_CONFIG,
): number {
  const totalTaps = state.hits + state.misses
  if (totalTaps === 0) {
    return 0
  }

  const accuracy = state.hits / totalTaps
  const precision = state.perfectHits / Math.max(state.hits, 1)
  const noisePenalty = state.noise / config.noiseMax

  const score = Math.round(
    (accuracy * 55 + precision * 30 + (1 - noisePenalty) * 15) * (state.success ? 1 : 0.45),
  )

  return clamp(score, 0, 100)
}
