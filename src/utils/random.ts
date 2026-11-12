/**
 * Tiny deterministic pseudo random generator (mulberry32).
 * Used by the texture factory so village decoration stays reproducible.
 */
export function createRng(seed: number): () => number {
  let state = seed >>> 0

  return function next(): number {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function randomRange(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min)
}

export function randomInt(rng: () => number, min: number, max: number): number {
  return Math.floor(randomRange(rng, min, max + 1))
}
