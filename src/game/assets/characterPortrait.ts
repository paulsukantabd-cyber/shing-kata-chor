/**
 * Portrait composition.
 *
 * The preview is built as a stack of absolutely positioned SVG parts so the UI
 * layer can animate each limb with plain CSS transforms. The same parts are
 * baked into Phaser textures, which keeps the menu portrait and the in-game
 * thief identical.
 */
import { buildCharacterParts, RIG_PLACEMENT, type SvgPart } from './characterSvg'
import type { CharacterAppearance } from '../../types'

export interface PortraitOptions {
  /** Width of the composed box. */
  boxWidth?: number
  /** Height of the composed box. */
  boxHeight?: number
  /** Y coordinate of the feet inside the box. */
  footY?: number
  /** Draw the soft ground shadow. */
  shadow?: boolean
}

export interface PortraitPart {
  /** Stable identifier / css class suffix. */
  key: string
  /** Standalone SVG document. */
  svg: string
  /** Position inside the composition box. */
  left: number
  top: number
  width: number
  height: number
  zIndex: number
  /** CSS transform origin, e.g. "50% 0%". */
  transformOrigin: string
}

const DEFAULT_OPTIONS: Required<PortraitOptions> = {
  boxWidth: 140,
  boxHeight: 215,
  footY: 210,
  shadow: true,
}

function toSvgDocument(part: SvgPart): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${part.width} ${part.height}" preserveAspectRatio="none">${part.content}</svg>`
}

interface Placement {
  x: number
  y: number
  pivot: 'center' | 'top'
}

/**
 * Returns every part of the portrait with its position inside the box.
 */
export function buildPortraitParts(
  appearance: CharacterAppearance,
  options: PortraitOptions = {},
): PortraitPart[] {
  const config = { ...DEFAULT_OPTIONS, ...options }
  const parts = buildCharacterParts(appearance)
  const place = RIG_PLACEMENT

  const centreX = config.boxWidth / 2
  const toBox = (placement: Placement): { cx: number; cy: number } => ({
    cx: centreX + placement.x,
    cy: config.footY + placement.y,
  })

  const make = (
    key: string,
    svg: SvgPart,
    placement: Placement,
    zIndex: number,
    transformOrigin: string,
  ): PortraitPart => {
    const { cx, cy } = toBox(placement)
    const left = placement.pivot === 'top' ? cx - svg.width / 2 : cx - svg.width / 2
    const top = placement.pivot === 'top' ? cy : cy - svg.height / 2

    return {
      key,
      svg: toSvgDocument(svg),
      left,
      top,
      width: svg.width,
      height: svg.height,
      zIndex,
      transformOrigin,
    }
  }

  const result: PortraitPart[] = []

  if (config.shadow) {
    result.push(make('shadow', parts.shadow, place.shadow, 0, '50% 50%'))
  }

  result.push(make('arm-back', parts.backArm, place.backArm, 10, '50% 0%'))
  result.push(make('leg-back', parts.backLeg, place.backLeg, 20, '50% 0%'))
  result.push(make('foot-back', parts.backFoot, place.backFoot, 21, '50% 50%'))

  if (appearance.gamcha) {
    result.push(make('gamcha', parts.gamcha, place.gamcha, 25, '50% 15%'))
  }

  result.push(make('lungi', parts.lungi, place.lungi, 30, '50% 20%'))
  result.push(make('leg-front', parts.frontLeg, place.frontLeg, 40, '50% 0%'))
  result.push(make('foot-front', parts.frontFoot, place.frontFoot, 41, '50% 50%'))
  result.push(make('torso', parts.torso, place.torso, 50, '50% 82%'))
  result.push(make('head', parts.head, place.head, 60, '50% 90%'))
  result.push(make('eyes', parts.eyesOpen, place.eyes, 62, '50% 50%'))

  if (appearance.moustache) {
    result.push(make('moustache', parts.moustache, place.moustache, 64, '50% 50%'))
  }

  result.push(make('arm-front', parts.frontArm, place.frontArm, 70, '50% 0%'))

  return result
}
