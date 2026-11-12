/**
 * Village layout.
 *
 * Prop positions are generated deterministically so the village always looks
 * the same, while still feeling hand-placed rather than random.
 */
import { createRng, randomRange } from '../../utils/random'

export interface PropPlacement {
  x: number
  scale: number
  /** Slight vertical jitter so props do not sit on a perfect line. */
  offsetY: number
}

export interface VillageLayout {
  bamboo: PropPlacement[]
  banana: PropPlacement[]
  bush: PropPlacement[]
  grass: PropPlacement[]
  haystack: PropPlacement[]
  fenceStart: number
  fenceCount: number
  pond: PropPlacement
  lantern: PropPlacement
  pot: PropPlacement
  smallHouses: PropPlacement[]
  fireflies: PropPlacement[]
  dogStart: number
}

export function buildVillageLayout(worldWidth: number): VillageLayout {
  const rng = createRng(20241103)

  const scatter = (count: number, from: number, to: number, minScale: number, maxScale: number): PropPlacement[] => {
    const items: PropPlacement[] = []
    for (let i = 0; i < count; i += 1) {
      items.push({
        x: Math.round(randomRange(rng, from, to)),
        scale: Number(randomRange(rng, minScale, maxScale).toFixed(2)),
        offsetY: Math.round(randomRange(rng, -4, 4)),
      })
    }
    return items.sort((a, b) => a.x - b.x)
  }

  return {
    bamboo: scatter(7, 160, worldWidth - 200, 0.75, 1.15),
    banana: scatter(6, 320, worldWidth - 260, 0.8, 1.1),
    bush: scatter(16, 120, worldWidth - 120, 0.7, 1.2),
    grass: scatter(46, 80, worldWidth - 80, 0.6, 1.25),
    haystack: [
      { x: 640, scale: 1, offsetY: 0 },
      { x: 2480, scale: 0.92, offsetY: 0 },
      { x: 3180, scale: 0.85, offsetY: 0 },
    ],
    fenceStart: 1620,
    fenceCount: 9,
    pond: { x: 2180, scale: 1, offsetY: 0 },
    lantern: { x: 1080, scale: 1, offsetY: 0 },
    pot: { x: 1420, scale: 1, offsetY: 0 },
    smallHouses: [
      { x: 470, scale: 0.82, offsetY: 0 },
      { x: 1980, scale: 0.92, offsetY: 0 },
      { x: 2960, scale: 0.78, offsetY: 0 },
    ],
    fireflies: scatter(26, 60, worldWidth - 60, 0.7, 1.3),
    dogStart: 520,
  }
}
