/**
 * Character artwork.
 *
 * Every part of the thief is described once, as SVG markup, in this file.
 * The Vue portrait composes the parts as inline SVG, and the Phaser rig
 * rasterises the very same parts into textures. One source of truth means the
 * player always sees exactly the character they built on the setup screen.
 *
 * Proportions are intentionally cartoonish: a big expressive head on a small,
 * wiry, barefoot body — the classic Bangladeshi "chhoto chhoto" village rogue.
 */
import { resolveLungi, SKIN } from '../config/character'
import type { CharacterAppearance } from '../../types'

export interface SvgPart {
  width: number
  height: number
  /** Markup drawn inside a 0,0 → width,height box. */
  content: string
}

export interface CharacterParts {
  shadow: SvgPart
  backArm: SvgPart
  backLeg: SvgPart
  backFoot: SvgPart
  gamcha: SvgPart
  lungi: SvgPart
  frontLeg: SvgPart
  frontFoot: SvgPart
  torso: SvgPart
  head: SvgPart
  eyesOpen: SvgPart
  eyesShut: SvgPart
  moustache: SvgPart
  frontArm: SvgPart
}

const SKIN_BASE = SKIN.base
const SKIN_SHADE = SKIN.shade
const SKIN_LIGHT = SKIN.light
const SKIN_DEEP = SKIN.deep
const INK = SKIN.ink
const HAIR = SKIN.hair

/* ------------------------------------------------------------------ parts */

function buildShadow(): SvgPart {
  return {
    width: 70,
    height: 20,
    content: `
      <defs>
        <radialGradient id="shadowFade" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#050a08" stop-opacity="0.55"/>
          <stop offset="62%" stop-color="#050a08" stop-opacity="0.28"/>
          <stop offset="100%" stop-color="#050a08" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="35" cy="10" rx="34" ry="9.5" fill="url(#shadowFade)"/>
    `,
  }
}

/** Bare chest with a short neck: narrow waist, visible ribs, a soft belly. */
function buildTorso(): SvgPart {
  return {
    width: 36,
    height: 80,
    content: `
      <path d="M14 2c0-1.4 1.8-2 4-2s4 .6 4 2v12H14Z" fill="${SKIN_SHADE}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M1 23C1 15.6 7 12 18 12s17 3.6 17 11l-1.5 34C33 68 29 76 18 76S4 68 3.5 57Z" fill="${SKIN_BASE}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M18 12c11 0 17 3.6 17 11l-1.5 34C33 68 29 76 18 76v-8.5c6.4 0 9.6-8 10.2-17.4l.6-9.6C29 34 25.4 30.4 18 30.4Z" fill="${SKIN_SHADE}" opacity="0.36"/>
      <path d="M9 19.5c2.8-2.6 5.4-3.4 7.6-3.6" stroke="${SKIN_LIGHT}" stroke-width="2.4" fill="none" stroke-linecap="round" opacity="0.85"/>
      <path d="M7.5 29c3.2 2.4 6.2 3.4 9 3.4" stroke="${SKIN_DEEP}" stroke-width="1.3" fill="none" stroke-linecap="round" opacity="0.55"/>
      <path d="M19.5 29c3 2.4 6 3.4 8.8 3.4" stroke="${SKIN_DEEP}" stroke-width="1.3" fill="none" stroke-linecap="round" opacity="0.55"/>
      <path d="M9.5 38c2.4 1.6 5 2.4 8 2.4" stroke="${SKIN_DEEP}" stroke-width="1.1" fill="none" stroke-linecap="round" opacity="0.36"/>
      <ellipse cx="18" cy="47" rx="1.7" ry="2.3" fill="${SKIN_DEEP}" opacity="0.6"/>
    `,
  }
}

function buildHead(): SvgPart {
  return {
    width: 52,
    height: 58,
    content: `
      <ellipse cx="5" cy="33" rx="4.2" ry="5.6" fill="${SKIN_SHADE}"/>
      <ellipse cx="47" cy="33" rx="4.2" ry="5.6" fill="${SKIN_SHADE}"/>
      <path d="M26 3C39 3 47 13.5 47 28.5 47 44.5 38 56 26 56S5 44.5 5 28.5C5 13.5 13 3 26 3Z" fill="${SKIN_BASE}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M26 3c13 0 21 10.5 21 25.5C47 44.5 38 56 26 56v-9c7 0 12-9.5 13-18.5 1-9.5-4-15.5-13-15.5Z" fill="${SKIN_SHADE}" opacity="0.32"/>
      <path d="M5.6 27C5.6 11 14 1.5 26 1.5S46.4 11 46.4 27c-3.2-11.5-9.5-17.5-20.4-17.5S8.8 15.5 5.6 27Z" fill="${HAIR}"/>
      <path d="M26 2.5c1.8-6.5 8-8.5 12-5-4.6.6-7.6 2.6-9 6.2Z" fill="${HAIR}"/>
      <path d="M5.6 27c0 6 .8 10.5 1.8 13.6l4.2-2.4C9.8 33.6 8.8 30 8.8 26Z" fill="${HAIR}"/>
      <path d="M13 21.5c3-2.4 7-2.4 10 .2" stroke="${HAIR}" stroke-width="2.8" fill="none" stroke-linecap="round"/>
      <path d="M29 21.8c3-2.4 7-2.4 10 .2" stroke="${HAIR}" stroke-width="2.8" fill="none" stroke-linecap="round"/>
      <path d="M25 32c1.8 1 2.6 2.8.6 4.2" stroke="${SKIN_DEEP}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <path d="M16.5 42.5c3 5.4 10.5 5.4 13.5 0-4 2.6-9.5 2.6-13.5 0Z" fill="${INK}"/>
      <path d="M18 42.8c2.6 1.6 7.4 1.6 10 0-1.4 2.6-8.6 2.6-10 0Z" fill="#f6efe0"/>
    `,
  }
}

function buildEyesOpen(): SvgPart {
  return {
    width: 36,
    height: 20,
    content: `
      <ellipse cx="11" cy="10" rx="6.4" ry="7.4" fill="#f7f2e4"/>
      <ellipse cx="26" cy="10" rx="6.4" ry="7.4" fill="#f7f2e4"/>
      <circle cx="12.4" cy="10.6" r="3.4" fill="${INK}"/>
      <circle cx="27.4" cy="10.6" r="3.4" fill="${INK}"/>
      <circle cx="13.6" cy="8.6" r="1.3" fill="#ffffff"/>
      <circle cx="28.6" cy="8.6" r="1.3" fill="#ffffff"/>
      <path d="M4.6 6.4c2-2.6 5-3.6 8-3" stroke="${SKIN_DEEP}" stroke-width="1.4" fill="none" stroke-linecap="round" opacity="0.7"/>
      <path d="M31.6 6.4c-2-2.6-5-3.6-8-3" stroke="${SKIN_DEEP}" stroke-width="1.4" fill="none" stroke-linecap="round" opacity="0.7"/>
    `,
  }
}

function buildEyesShut(): SvgPart {
  return {
    width: 36,
    height: 20,
    content: `
      <path d="M4.8 10c2.6 4.4 9 4.4 12.4 0" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <path d="M20 10c2.6 4.4 9 4.4 12.4 0" stroke="${INK}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    `,
  }
}

function buildMoustache(): SvgPart {
  return {
    width: 30,
    height: 14,
    content: `
      <path d="M15 4.4c-3.4-3.4-9-3-12.6.4 3.4.6 5.4 1.6 7 3-3.4.6-6.4 0-8.4-1.2 3 4.6 8 5.8 11.6 2.6L15 12l2.4-2.8C21 12.4 26 11.2 29 6.6 27 7.8 24 8.4 20.6 7.8c1.6-1.4 3.6-2.4 7-3C24 1.4 18.4 1 15 4.4Z" fill="${HAIR}"/>
    `,
  }
}

/** Thin arm hanging from the shoulder pivot. */
function buildArm(): SvgPart {
  return {
    width: 18,
    height: 60,
    content: `
      <path d="M5 3c3-2.2 8-2.2 10 .4l-1.4 38c-.3 6.4-1.8 10.4-4 10.4-2.6 0-4-4-4.4-10.4Z" fill="${SKIN_BASE}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M12 4.6c1.6 1 2.2 2.4 2.4 4l-1.6 36.4c-.3 5.8-1.2 9.4-2.6 10.6 2.4 0 3.6-4 4-10.4l1.4-38c.1-1.2-.6-2.2-1.8-2.8Z" fill="${SKIN_SHADE}" opacity="0.45"/>
      <ellipse cx="8.4" cy="53" rx="6" ry="5.6" fill="${SKIN_SHADE}"/>
      <path d="M4.8 53c1.1-2.2 4.4-3.2 7-1.8" stroke="${SKIN_DEEP}" stroke-width="1.2" fill="none" stroke-linecap="round" opacity="0.5"/>
    `,
  }
}

/** Bare leg: hip at the top, ankle at the bottom. */
function buildLeg(): SvgPart {
  return {
    width: 18,
    height: 72,
    content: `
      <path d="M4 1C7.6-0.6 12.6-0.2 14.1 2.4L13 62c-.2 5.8-1.9 9.2-4.5 9.2-2.8 0-4.2-3.4-4.4-9.2Z" fill="${SKIN_BASE}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M12.3 3c1.2 1.4 1.6 3 1.6 5L13 62c-.2 5-1 8.2-2.5 9.2 2.6-.4 3.8-3.6 4-9.2l1.1-56c0-1.6-.7-2.6-1.5-3.4Z" fill="${SKIN_SHADE}" opacity="0.4"/>
      <path d="M5.5 24c2.4 1.4 5 2 7.6 2" stroke="${SKIN_DEEP}" stroke-width="1.2" fill="none" stroke-linecap="round" opacity="0.35"/>
    `,
  }
}

/** Bare foot pointing to the right. */
function buildFoot(): SvgPart {
  return {
    width: 30,
    height: 16,
    content: `
      <path d="M3 5.4C7 2 17 1.4 23 4.6c3.8 2 4.8 5.8 1.8 7.8-2 1.4-4.8 1.8-8 1.8H7.8C3 14.2 1.2 11 1.8 7.6c.2-1 .6-1.8 1.2-2.2Z" fill="${SKIN_BASE}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M19.6 6c2.8 1.2 4.6 3.4 4.8 5.2.2 1.3-.6 2-1.8 2.2" stroke="${SKIN_DEEP}" stroke-width="1.3" fill="none" stroke-linecap="round" opacity="0.65"/>
      <path d="M3.6 6C7.4 3.2 15.6 2.8 20.8 5.2" stroke="${SKIN_LIGHT}" stroke-width="1.6" fill="none" stroke-linecap="round" opacity="0.6"/>
    `,
  }
}

/** The lungi: a wrap around the waist reaching mid-thigh, knotted on the side. */
function buildLungi(appearance: CharacterAppearance): SvgPart {
  const style = resolveLungi(appearance)
  const isCheck = appearance.lungi === 'blueCheck' || appearance.lungi === 'redCheck'

  let pattern = ''
  if (isCheck) {
    const squares: string[] = []
    const size = 9
    for (let row = 0; row < 4; row += 1) {
      for (let col = 0; col < 5; col += 1) {
        if ((row + col) % 2 !== 0) {
          continue
        }
        squares.push(
          `<rect x="${4 + col * size}" y="${12 + row * size}" width="${size}" height="${size}" fill="${style.pattern}" opacity="0.92"/>`,
        )
      }
    }
    pattern = squares.join('')
  } else {
    const lines: string[] = []
    for (let i = -2; i < 8; i += 1) {
      lines.push(
        `<path d="M${3 + i * 8} 46 L${15 + i * 8} 12" stroke="${style.pattern}" stroke-width="2" opacity="0.32"/>`,
      )
    }
    pattern = lines.join('')
  }

  return {
    width: 50,
    height: 50,
    content: `
      <path d="M2 10C2 5 5.4 2 10 2h30C44.6 2 48 5 48 10v24c0 7.4-4.4 11.4-10.4 11.4H12.4C6.4 45.4 2 41.4 2 34Z" fill="${style.base}" stroke="${style.accent}" stroke-width="1.8" stroke-linejoin="round"/>
      ${pattern}
      <path d="M2 16c13-4 33-4 46 1.2v8.6C33 21 15 21 2 24.6Z" fill="${style.accent}" opacity="0.85"/>
      <path d="M2 10C2 5 5.4 2 10 2h30C44.6 2 48 5 48 10v4.2C33 9.8 15 9.8 2 14.2Z" fill="${style.pattern}" opacity="0.2"/>
      <path d="M42 6.6c5.6 1.2 8.8 4.8 7.4 9.2-1.2 3.7-4.8 5.4-8.2 3.4-2.6-1.6-3.4-4.2-2.4-7 .9-2.2 2-4 3.2-5.6Z" fill="${style.accent}"/>
      <path d="M11.6 45.4c8.8 1.8 19.6 1.8 27.8-1.4v4.4C30 52 18 52 11.6 49Z" fill="${style.accent}" opacity="0.55"/>
    `,
  }
}

/** Gamcha: a towel draped over the far shoulder. */
function buildGamcha(): SvgPart {
  return {
    width: 40,
    height: 66,
    content: `
      <path d="M10 3C16 .4 26 1 31.4 5.6l3.4 40c.6 6.6-3.6 11.4-9.8 11.4S13.4 52 13.4 45.4Z" fill="#c9413a"/>
      <path d="M12.6 18.6c6.2.8 12.4 1.6 18.8 1.8l.7 7c-6.6-.4-13.4-1-19.5-1.8Z" fill="#f0e2c2" opacity="0.92"/>
      <path d="M13.4 33.4c6.4.8 13 1.4 19.4 1.6l.7 7c-6.6-.4-13.4-1-19.5-1.8Z" fill="#f0e2c2" opacity="0.92"/>
      <path d="M10 3C16 .4 26 1 31.4 5.6l.8 10C25.6 11.4 17 11 10.6 13.4Z" fill="#a82f2c"/>
      <path d="M25 56.4c-1.8 1.6-2.6 3.4-2.6 5.4M29.4 55.8c-1.6 1.8-2.2 3.6-2.2 5.8M33.6 54.8c-1.4 1.8-1.8 3.6-1.6 5.4" stroke="#c9413a" stroke-width="2" fill="none" stroke-linecap="round"/>
    `,
  }
}

/* --------------------------------------------------------------- assembly */

export function buildCharacterParts(appearance: CharacterAppearance): CharacterParts {
  return {
    shadow: buildShadow(),
    backArm: buildArm(),
    backLeg: buildLeg(),
    backFoot: buildFoot(),
    gamcha: buildGamcha(),
    lungi: buildLungi(appearance),
    frontLeg: buildLeg(),
    frontFoot: buildFoot(),
    torso: buildTorso(),
    head: buildHead(),
    eyesOpen: buildEyesOpen(),
    eyesShut: buildEyesShut(),
    moustache: buildMoustache(),
    frontArm: buildArm(),
  }
}

/**
 * Placement of every part in rig-local coordinates.
 * Origin is the point between the feet; positive Y is up.
 */
export const RIG_PLACEMENT = {
  shadow: { x: 0, y: -7, pivot: 'center' },
  backLeg: { x: 8, y: -72, pivot: 'top' },
  backFoot: { x: 10, y: -9, pivot: 'center' },
  gamcha: { x: 14, y: -112, pivot: 'center' },
  torso: { x: 0, y: -107, pivot: 'center' },
  lungi: { x: 0, y: -62, pivot: 'center' },
  frontLeg: { x: -7, y: -72, pivot: 'top' },
  frontFoot: { x: -5, y: -9, pivot: 'center' },
  headNeck: { x: 0, y: -150, pivot: 'center' },
  head: { x: 0, y: -176, pivot: 'center' },
  eyes: { x: 0, y: -179, pivot: 'center' },
  moustache: { x: 0, y: -163, pivot: 'center' },
  frontArm: { x: -21, y: -132, pivot: 'top' },
  backArm: { x: 21, y: -132, pivot: 'top' },
} as const

export type RigPartName = keyof typeof RIG_PLACEMENT

/** Renders a part as a standalone SVG document (used for texture baking). */
export function partToSvgDocument(part: SvgPart): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${part.width}" height="${part.height}" viewBox="0 0 ${part.width} ${part.height}">${part.content}</svg>`
}
