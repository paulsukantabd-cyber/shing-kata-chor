import { describe, expect, it } from 'vitest'
import { buildCharacterParts } from '../assets/characterSvg'
import { buildPortraitParts } from '../assets/characterPortrait'
import { buildVillageLayout } from '../config/layout'
import { DEFAULT_APPEARANCE } from '../config/character'

describe('character artwork', () => {
  it('always renders the core parts', () => {
    const parts = buildCharacterParts(DEFAULT_APPEARANCE)
    expect(parts.head.content.length).toBeGreaterThan(0)
    expect(parts.torso.content.length).toBeGreaterThan(0)
    expect(parts.lungi.content.length).toBeGreaterThan(0)
    expect(parts.eyesOpen.content.length).toBeGreaterThan(0)
  })

  it('changes the lungi artwork with the selected colour', () => {
    const blue = buildCharacterParts({ ...DEFAULT_APPEARANCE, lungi: 'blueCheck' })
    const red = buildCharacterParts({ ...DEFAULT_APPEARANCE, lungi: 'redCheck' })

    expect(blue.lungi.content).not.toBe(red.lungi.content)
  })

  it('lays the portrait parts out inside the composition box', () => {
    const parts = buildPortraitParts(DEFAULT_APPEARANCE)

    expect(parts.length).toBeGreaterThan(5)
    for (const part of parts) {
      expect(part.left).toBeGreaterThanOrEqual(0)
      expect(part.left + part.width).toBeLessThanOrEqual(120)
      expect(part.svg).toContain('<svg')
    }
  })

  it('omits the gamcha when the player does not want it', () => {
    const withGamcha = buildPortraitParts({ ...DEFAULT_APPEARANCE, gamcha: true })
    const withoutGamcha = buildPortraitParts({ ...DEFAULT_APPEARANCE, gamcha: false })

    expect(withGamcha.some((part) => part.key === 'gamcha')).toBe(true)
    expect(withoutGamcha.some((part) => part.key === 'gamcha')).toBe(false)
  })

  it('omits the moustache when the player does not want it', () => {
    const withMoustache = buildPortraitParts({ ...DEFAULT_APPEARANCE, moustache: true })
    const withoutMoustache = buildPortraitParts({ ...DEFAULT_APPEARANCE, moustache: false })

    expect(withMoustache.some((part) => part.key === 'moustache')).toBe(true)
    expect(withoutMoustache.some((part) => part.key === 'moustache')).toBe(false)
  })
})

describe('village layout', () => {
  it('is deterministic', () => {
    const a = buildVillageLayout(3400)
    const b = buildVillageLayout(3400)

    expect(a.bamboo.map((item) => item.x)).toEqual(b.bamboo.map((item) => item.x))
    expect(a.haystack).toEqual(b.haystack)
  })

  it('keeps every prop inside the world bounds', () => {
    const layout = buildVillageLayout(3400)
    const all = [
      ...layout.bamboo,
      ...layout.banana,
      ...layout.bush,
      ...layout.grass,
      ...layout.haystack,
    ]

    for (const item of all) {
      expect(item.x).toBeGreaterThan(0)
      expect(item.x).toBeLessThan(3400)
    }
  })
})
