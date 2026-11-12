import Phaser from 'phaser'
import { buildCharacterParts, partToSvgDocument, type SvgPart } from './characterSvg'
import { buildDog, buildVillager } from './npcSvg'
import type { CharacterAppearance } from '../../types'

export const CHARACTER_TEXTURE_KEYS = {
  shadow: 'ch-shadow',
  torso: 'ch-torso',
  head: 'ch-head',
  eyesOpen: 'ch-eyes-open',
  eyesShut: 'ch-eyes-shut',
  moustache: 'ch-moustache',
  arm: 'ch-arm',
  leg: 'ch-leg',
  foot: 'ch-foot',
  lungi: 'ch-lungi',
  gamcha: 'ch-gamcha',
  villager: 'npc-villager',
  dog: 'npc-dog',
} as const

/** Rasterisation scale — 2 keeps the cartoon edges crisp on high-DPI screens. */
const RASTER_SCALE = 2

function rasterizeSvg(part: SvgPart, scale: number): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined' || typeof Blob === 'undefined') {
      reject(new Error('SVG rasterisation requires a browser environment'))
      return
    }

    const svg = partToSvgDocument(part)
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const image = new Image()

    const cleanup = (): void => {
      URL.revokeObjectURL(url)
    }

    image.onload = (): void => {
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.ceil(part.width * scale))
      canvas.height = Math.max(1, Math.ceil(part.height * scale))
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        cleanup()
        reject(new Error('2D canvas context unavailable'))
        return
      }

      ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
      cleanup()
      resolve(canvas)
    }

    image.onerror = (): void => {
      cleanup()
      reject(new Error('Failed to rasterise SVG part'))
    }

    image.src = url
  })
}

async function addPartTexture(
  scene: Phaser.Scene,
  key: string,
  part: SvgPart,
  scale = RASTER_SCALE,
): Promise<void> {
  const canvas = await rasterizeSvg(part, scale)

  if (scene.textures.exists(key)) {
    scene.textures.remove(key)
  }

  scene.textures.addCanvas(key, canvas)
}

/**
 * Bakes the player character (matching the current appearance) and the
 * supporting cast into textures.
 */
export async function createCharacterTextures(
  scene: Phaser.Scene,
  appearance: CharacterAppearance,
): Promise<void> {
  const parts = buildCharacterParts(appearance)

  await Promise.all([
    addPartTexture(scene, CHARACTER_TEXTURE_KEYS.shadow, parts.shadow, 1.5),
    addPartTexture(scene, CHARACTER_TEXTURE_KEYS.torso, parts.torso),
    addPartTexture(scene, CHARACTER_TEXTURE_KEYS.head, parts.head),
    addPartTexture(scene, CHARACTER_TEXTURE_KEYS.eyesOpen, parts.eyesOpen),
    addPartTexture(scene, CHARACTER_TEXTURE_KEYS.eyesShut, parts.eyesShut),
    addPartTexture(scene, CHARACTER_TEXTURE_KEYS.moustache, parts.moustache),
    addPartTexture(scene, CHARACTER_TEXTURE_KEYS.arm, parts.backArm),
    addPartTexture(scene, CHARACTER_TEXTURE_KEYS.leg, parts.backLeg),
    addPartTexture(scene, CHARACTER_TEXTURE_KEYS.foot, parts.backFoot),
    addPartTexture(scene, CHARACTER_TEXTURE_KEYS.lungi, parts.lungi),
    addPartTexture(scene, CHARACTER_TEXTURE_KEYS.gamcha, parts.gamcha),
    addPartTexture(scene, CHARACTER_TEXTURE_KEYS.villager, buildVillager()),
    addPartTexture(scene, CHARACTER_TEXTURE_KEYS.dog, buildDog()),
  ])
}
