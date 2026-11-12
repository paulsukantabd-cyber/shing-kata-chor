/**
 * Procedural village artwork.
 *
 * The whole night scene is painted at boot time onto 2D canvases: mud walls,
 * corrugated tin roofs, bamboo, ponds, haystacks and a moonlit sky. Nothing
 * here is a downloaded asset, so the game boots fast on slow connections and
 * every later phase can swap in illustrated sprites by replacing a texture key.
 */
import Phaser from 'phaser'
import { SCENE_COLORS, withAlpha } from '../config/palette'
import { createRng, randomRange } from '../../utils/random'

export const VILLAGE_TEXTURE_KEYS = {
  sky: 'village-sky',
  far: 'village-far',
  mid: 'village-mid',
  ground: 'village-ground',
  houseMain: 'village-house-main',
  houseSmall: 'village-house-small',
  bamboo: 'village-bamboo',
  banana: 'village-banana',
  bush: 'village-bush',
  grass: 'village-grass',
  haystack: 'village-haystack',
  fence: 'village-fence',
  lantern: 'village-lantern',
  pond: 'village-pond',
  pot: 'village-pot',
  firefly: 'village-firefly',
  cutHole: 'village-cut-hole',
  prompt: 'village-prompt',
} as const

type Draw = (ctx: CanvasRenderingContext2D) => void

function makeTexture(
  scene: Phaser.Scene,
  key: string,
  width: number,
  height: number,
  draw: Draw,
): void {
  if (scene.textures.exists(key)) {
    return
  }

  const texture = scene.textures.createCanvas(key, width, height)
  if (!texture) {
    return
  }

  const ctx = texture.getContext()
  draw(ctx)
  texture.refresh()
}

/* ------------------------------------------------------------- primitives */

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + w - radius, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius)
  ctx.lineTo(x + w, y + h - radius)
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
  ctx.lineTo(x + radius, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

/** Warm speckled grain used to break up flat painted surfaces. */
function grain(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  count: number,
  seed: number,
  maxRadius = 1.6,
): void {
  const rng = createRng(seed)
  for (let i = 0; i < count; i += 1) {
    ctx.fillStyle = color
    ctx.globalAlpha = randomRange(rng, 0.05, 0.22)
    ctx.beginPath()
    ctx.arc(x + rng() * w, y + rng() * h, randomRange(rng, 0.4, maxRadius), 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

function softGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  strength = 0.5,
): void {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
  gradient.addColorStop(0, withAlpha(color, strength))
  gradient.addColorStop(0.45, withAlpha(color, strength * 0.35))
  gradient.addColorStop(1, withAlpha(color, 0))
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()
}

/* ------------------------------------------------------------------- sky */

function drawSky(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const gradient = ctx.createLinearGradient(0, 0, 0, h)
  gradient.addColorStop(0, SCENE_COLORS.skyTop)
  gradient.addColorStop(0.34, SCENE_COLORS.skyMid)
  gradient.addColorStop(0.62, '#1b2a20')
  gradient.addColorStop(0.82, SCENE_COLORS.skyHorizon)
  gradient.addColorStop(1, '#39452b')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, w, h)

  const rng = createRng(1337)
  for (let i = 0; i < 130; i += 1) {
    const x = rng() * w
    const y = rng() * h * 0.66
    const radius = randomRange(rng, 0.5, 1.7)
    ctx.fillStyle = SCENE_COLORS.star
    ctx.globalAlpha = randomRange(rng, 0.15, 0.85) * (1 - y / (h * 0.8))
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  // A few brighter stars with a tiny cross flare.
  for (let i = 0; i < 7; i += 1) {
    const x = randomRange(rng, 40, w - 40)
    const y = randomRange(rng, 30, h * 0.4)
    softGlow(ctx, x, y, 9, '#e9f2df', 0.55)
    ctx.strokeStyle = withAlpha('#e9f2df', 0.5)
    ctx.lineWidth = 0.8
    ctx.beginPath()
    ctx.moveTo(x - 4, y)
    ctx.lineTo(x + 4, y)
    ctx.moveTo(x, y - 4)
    ctx.lineTo(x, y + 4)
    ctx.stroke()
  }

  // Moon.
  const moonX = 762
  const moonY = 104
  softGlow(ctx, moonX, moonY, 132, SCENE_COLORS.moon, 0.16)
  const moonGradient = ctx.createRadialGradient(moonX - 12, moonY - 14, 4, moonX, moonY, 40)
  moonGradient.addColorStop(0, '#fffdf2')
  moonGradient.addColorStop(0.7, SCENE_COLORS.moon)
  moonGradient.addColorStop(1, '#dcd3b6')
  ctx.fillStyle = moonGradient
  ctx.beginPath()
  ctx.arc(moonX, moonY, 38, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = withAlpha('#c9bfa1', 0.35)
  ctx.beginPath()
  ctx.arc(moonX + 10, moonY - 8, 8, 0, Math.PI * 2)
  ctx.arc(moonX - 13, moonY + 11, 5.5, 0, Math.PI * 2)
  ctx.arc(moonX + 6, moonY + 18, 4, 0, Math.PI * 2)
  ctx.fill()

  // Soft cloud bands.
  for (let i = 0; i < 6; i += 1) {
    const y = randomRange(rng, 130, 250)
    const x = randomRange(rng, -100, w)
    const width = randomRange(rng, 180, 420)
    const height = randomRange(rng, 12, 26)
    const cloudGradient = ctx.createLinearGradient(x, y, x + width, y)
    cloudGradient.addColorStop(0, withAlpha(SCENE_COLORS.cloud, 0))
    cloudGradient.addColorStop(0.5, withAlpha(SCENE_COLORS.cloudLit, 0.5))
    cloudGradient.addColorStop(1, withAlpha(SCENE_COLORS.cloud, 0))
    ctx.fillStyle = cloudGradient
    ctx.beginPath()
    ctx.ellipse(x + width / 2, y, width / 2, height, 0, 0, Math.PI * 2)
    ctx.fill()
  }
}

/* ------------------------------------------------------- parallax layers */

function drawFarLayer(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.clearRect(0, 0, w, h)
  const rng = createRng(90210)

  // Rolling hill.
  ctx.fillStyle = SCENE_COLORS.hillFar
  ctx.beginPath()
  ctx.moveTo(0, h)
  ctx.lineTo(0, h - 58)
  for (let x = 0; x <= w; x += 40) {
    const y = h - 58 - Math.sin(x / 210) * 26 - Math.sin(x / 83 + 1.4) * 9
    ctx.lineTo(x, y)
  }
  ctx.lineTo(w, h)
  ctx.closePath()
  ctx.fill()

  const silhouette = '#12201a'
  ctx.fillStyle = silhouette

  // Distant huts with tin roofs.
  for (let i = 0; i < 16; i += 1) {
    const x = 40 + i * 98 + randomRange(rng, -18, 18)
    const base = h - 62 + Math.sin(x / 210) * 26
    const houseW = randomRange(rng, 42, 74)
    const houseH = randomRange(rng, 26, 44)
    ctx.fillRect(x, base - houseH, houseW, houseH)
    ctx.beginPath()
    ctx.moveTo(x - 6, base - houseH)
    ctx.lineTo(x + houseW / 2, base - houseH - randomRange(rng, 12, 22))
    ctx.lineTo(x + houseW + 6, base - houseH)
    ctx.closePath()
    ctx.fill()
  }

  // A minaret for a bit of village silhouette variety.
  ctx.fillRect(w * 0.72, h - 150, 12, 92)
  ctx.beginPath()
  ctx.moveTo(w * 0.72 - 5, h - 150)
  ctx.lineTo(w * 0.72 + 6, h - 172)
  ctx.lineTo(w * 0.72 + 17, h - 150)
  ctx.closePath()
  ctx.fill()

  // Bamboo / palm silhouettes.
  for (let i = 0; i < 26; i += 1) {
    const x = randomRange(rng, 0, w)
    const base = h - 58 + Math.sin(x / 210) * 26
    const height = randomRange(rng, 40, 90)
    ctx.strokeStyle = silhouette
    ctx.lineWidth = randomRange(rng, 2, 4)
    ctx.beginPath()
    ctx.moveTo(x, base)
    ctx.quadraticCurveTo(x + 6, base - height * 0.6, x + 2, base - height)
    ctx.stroke()
  }
}

function drawMidLayer(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.clearRect(0, 0, w, h)
  const rng = createRng(5150)

  const wallDark = '#233123'
  const wallLight = '#2d3d28'
  const roofDark = '#333a33'
  const roofLight = '#414841'

  // Three mud houses in the middle distance.
  const houses = [
    { x: 90, w: 170, h: 120 },
    { x: 520, w: 210, h: 145 },
    { x: 1010, w: 150, h: 105 },
    { x: 1290, w: 190, h: 132 },
  ]

  for (const house of houses) {
    const base = h - 6
    const top = base - house.h

    const wallGradient = ctx.createLinearGradient(house.x, top, house.x, base)
    wallGradient.addColorStop(0, wallLight)
    wallGradient.addColorStop(1, wallDark)
    ctx.fillStyle = wallGradient
    ctx.fillRect(house.x, top, house.w, house.h)

    // Tin roof.
    ctx.fillStyle = roofDark
    ctx.beginPath()
    ctx.moveTo(house.x - 14, top)
    ctx.lineTo(house.x + house.w / 2, top - 52)
    ctx.lineTo(house.x + house.w + 14, top)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = roofLight
    ctx.lineWidth = 1.6
    for (let i = 0; i <= 8; i += 1) {
      const t = i / 8
      const rx = house.x - 14 + t * (house.w + 28)
      const ry = top - 52 * (1 - Math.abs(t - 0.5) * 2)
      ctx.beginPath()
      ctx.moveTo(rx, ry)
      ctx.lineTo(rx, top)
      ctx.stroke()
    }

    // Warm window.
    const winX = house.x + house.w * 0.62
    const winY = top + house.h * 0.3
    ctx.fillStyle = withAlpha(SCENE_COLORS.lantern, 0.85)
    ctx.fillRect(winX, winY, 22, 26)
    softGlow(ctx, winX + 11, winY + 13, 40, SCENE_COLORS.lantern, 0.22)
  }

  // Bamboo clumps.
  for (let i = 0; i < 22; i += 1) {
    const x = randomRange(rng, 0, w)
    const base = h - 4
    const height = randomRange(rng, 90, 210)
    ctx.strokeStyle = '#2c4426'
    ctx.lineWidth = randomRange(rng, 3, 6)
    for (let s = 0; s < 4; s += 1) {
      const offset = (s - 1.5) * 7
      ctx.beginPath()
      ctx.moveTo(x + offset, base)
      ctx.quadraticCurveTo(x + offset + 4, base - height * 0.6, x + offset + 1, base - height)
      ctx.stroke()
    }
    ctx.fillStyle = '#2f4a29'
    for (let s = 0; s < 5; s += 1) {
      const ly = base - randomRange(rng, height * 0.55, height)
      ctx.beginPath()
      ctx.ellipse(x + randomRange(rng, -14, 14), ly, randomRange(rng, 9, 17), 4, -0.5, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Banana leaves.
  for (let i = 0; i < 14; i += 1) {
    const x = randomRange(rng, 0, w)
    const base = h - 2
    const height = randomRange(rng, 80, 140)
    ctx.strokeStyle = '#2b4527'
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.moveTo(x, base)
    ctx.quadraticCurveTo(x + 5, base - height * 0.7, x, base - height)
    ctx.stroke()
    ctx.fillStyle = '#315029'
    for (let s = 0; s < 6; s += 1) {
      const angle = -Math.PI / 2 + (s - 2.5) * 0.45
      const length = randomRange(rng, 34, 52)
      ctx.save()
      ctx.translate(x, base - height * 0.9)
      ctx.rotate(angle)
      ctx.beginPath()
      ctx.ellipse(length / 2, 0, length / 2, 9, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
  }
}

/* ---------------------------------------------------------------- ground */

function drawGround(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.clearRect(0, 0, w, h)
  const rng = createRng(4242)

  // The walking surface: a worn dirt path.
  const surface = ctx.createLinearGradient(0, 0, 0, 56)
  surface.addColorStop(0, SCENE_COLORS.dirtLight)
  surface.addColorStop(0.4, SCENE_COLORS.dirt)
  surface.addColorStop(1, SCENE_COLORS.dirtDark)
  ctx.fillStyle = surface
  ctx.fillRect(0, 0, w, h)

  // Grass fringe along the top edge (periodic so the tile stays seamless).
  ctx.fillStyle = SCENE_COLORS.grassDark
  ctx.beginPath()
  ctx.moveTo(0, 0)
  for (let x = 0; x <= w; x += 4) {
    const y = 9 + Math.sin((x / w) * Math.PI * 2) * 4 + Math.sin((x / w) * Math.PI * 6) * 2
    ctx.lineTo(x, y)
  }
  ctx.lineTo(w, 0)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = SCENE_COLORS.grassMid
  ctx.beginPath()
  ctx.moveTo(0, 0)
  for (let x = 0; x <= w; x += 4) {
    const y = 4 + Math.sin((x / w) * Math.PI * 2 + 0.6) * 3
    ctx.lineTo(x, y)
  }
  ctx.lineTo(w, 0)
  ctx.closePath()
  ctx.fill()

  // Grass blades poking over the path.
  for (let i = 0; i < 90; i += 1) {
    const x = rng() * w
    const y = 8 + Math.sin((x / w) * Math.PI * 2) * 4
    ctx.strokeStyle = rng() > 0.5 ? SCENE_COLORS.grassTip : SCENE_COLORS.grassLight
    ctx.lineWidth = 1.4
    ctx.beginPath()
    ctx.moveTo(x, y + 3)
    ctx.quadraticCurveTo(x + randomRange(rng, -3, 3), y - 6, x + randomRange(rng, -7, 7), y - 12)
    ctx.stroke()
  }

  // Pebbles and roots in the path.
  for (let i = 0; i < 130; i += 1) {
    const x = rng() * w
    const y = randomRange(rng, 16, 62)
    ctx.fillStyle = rng() > 0.55 ? SCENE_COLORS.dirtPebble : SCENE_COLORS.dirtDark
    ctx.globalAlpha = randomRange(rng, 0.2, 0.55)
    ctx.beginPath()
    ctx.ellipse(x, y, randomRange(rng, 1.2, 3.4), randomRange(rng, 0.8, 2.2), rng(), 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  // Cracks.
  ctx.strokeStyle = withAlpha(SCENE_COLORS.dirtDark, 0.55)
  for (let i = 0; i < 14; i += 1) {
    const x = rng() * w
    const y = randomRange(rng, 22, 64)
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.quadraticCurveTo(x + 12, y + 4, x + randomRange(rng, 18, 34), y - 3)
    ctx.stroke()
  }

  // Lower band: darker earth fading into foreground grass.
  const lower = ctx.createLinearGradient(0, 62, 0, h)
  lower.addColorStop(0, withAlpha(SCENE_COLORS.dirtDark, 0.9))
  lower.addColorStop(0.55, '#221a13')
  lower.addColorStop(1, '#131a12')
  ctx.fillStyle = lower
  ctx.fillRect(0, 62, w, h - 62)

  // Foreground grass silhouettes.
  for (let i = 0; i < 120; i += 1) {
    const x = rng() * w
    const y = h - randomRange(rng, 0, 22)
    ctx.strokeStyle = withAlpha('#0d150f', 0.85)
    ctx.lineWidth = randomRange(rng, 1.5, 3)
    ctx.beginPath()
    ctx.moveTo(x, y + 10)
    ctx.quadraticCurveTo(x + randomRange(rng, -6, 6), y, x + randomRange(rng, -12, 12), y - randomRange(rng, 12, 26))
    ctx.stroke()
  }
}

/* ----------------------------------------------------------------- props */

function drawMudHouse(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  options: { wall: string; wallLight: string; roof: string; lit: boolean },
): void {
  const rng = createRng(options.lit ? 77 : 78)
  const wallTop = 96
  const wallBottom = h - 34

  // Cast shadow on the ground.
  ctx.fillStyle = withAlpha('#040806', 0.45)
  ctx.beginPath()
  ctx.ellipse(w / 2, h - 12, w * 0.56, 16, 0, 0, Math.PI * 2)
  ctx.fill()

  // Wall base (raised mud plinth).
  ctx.fillStyle = options.wall
  ctx.fillRect(26, wallBottom - 34, w - 52, 34)
  ctx.fillStyle = withAlpha('#000000', 0.22)
  ctx.fillRect(26, wallBottom - 34, w - 52, 6)
  for (let i = 0; i < 26; i += 1) {
    const x = randomRange(rng, 28, w - 30)
    const y = randomRange(rng, wallBottom - 30, wallBottom - 4)
    ctx.fillStyle = withAlpha(SCENE_COLORS.mudWallShadow, randomRange(rng, 0.1, 0.3))
    ctx.beginPath()
    ctx.ellipse(x, y, randomRange(rng, 2, 7), randomRange(rng, 1.5, 4), 0, 0, Math.PI * 2)
    ctx.fill()
  }

  // Main mud wall.
  const wallGradient = ctx.createLinearGradient(0, wallTop, 0, wallBottom)
  wallGradient.addColorStop(0, options.wallLight)
  wallGradient.addColorStop(0.55, options.wall)
  wallGradient.addColorStop(1, SCENE_COLORS.mudWallDark)
  ctx.fillStyle = wallGradient
  ctx.fillRect(14, wallTop, w - 28, wallBottom - wallTop)

  // Hand-smoothed clay strokes — big sweeps of plaster catching the moonlight.
  for (let i = 0; i < 26; i += 1) {
    const y = randomRange(rng, wallTop + 4, wallBottom - 10)
    const height = randomRange(rng, 10, 34)
    ctx.fillStyle = withAlpha(
      rng() > 0.5 ? options.wallLight : SCENE_COLORS.mudWallShadow,
      randomRange(rng, 0.06, 0.16),
    )
    ctx.beginPath()
    ctx.moveTo(14, y)
    ctx.quadraticCurveTo(w * 0.5, y + randomRange(rng, -8, 8), w - 14, y + randomRange(rng, -5, 5))
    ctx.quadraticCurveTo(w * 0.5, y + height, 14, y + height * 0.6)
    ctx.closePath()
    ctx.fill()
  }

  // Straw fibre poking out of the plaster.
  ctx.strokeStyle = withAlpha(SCENE_COLORS.straw, 0.35)
  ctx.lineWidth = 1
  for (let i = 0; i < 90; i += 1) {
    const x = randomRange(rng, 18, w - 18)
    const y = randomRange(rng, wallTop + 6, wallBottom - 6)
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + randomRange(rng, -7, 7), y + randomRange(rng, -4, 4))
    ctx.stroke()
  }

  grain(ctx, 14, wallTop, w - 28, wallBottom - wallTop, SCENE_COLORS.mudWallShadow, 520, 991, 2.1)
  grain(ctx, 14, wallTop, w - 28, wallBottom - wallTop, options.wallLight, 260, 4242, 1.6)

  // Shadow under the roof overhang.
  const eaves = ctx.createLinearGradient(0, wallTop, 0, wallTop + 46)
  eaves.addColorStop(0, withAlpha('#050906', 0.5))
  eaves.addColorStop(1, withAlpha('#050906', 0))
  ctx.fillStyle = eaves
  ctx.fillRect(14, wallTop, w - 28, 46)

  // Ambient occlusion along the wall base.
  const footShade = ctx.createLinearGradient(0, wallBottom - 40, 0, wallBottom)
  footShade.addColorStop(0, withAlpha('#050906', 0))
  footShade.addColorStop(1, withAlpha('#050906', 0.42))
  ctx.fillStyle = footShade
  ctx.fillRect(14, wallBottom - 40, w - 28, 40)

  // Cracks.
  ctx.strokeStyle = withAlpha(SCENE_COLORS.mudWallShadow, 0.5)
  ctx.lineWidth = 1.6
  for (let i = 0; i < 5; i += 1) {
    let x = randomRange(rng, 40, w - 60)
    let y = wallTop + randomRange(rng, 10, 60)
    ctx.beginPath()
    ctx.moveTo(x, y)
    for (let s = 0; s < 4; s += 1) {
      x += randomRange(rng, -8, 10)
      y += randomRange(rng, 12, 30)
      ctx.lineTo(x, y)
    }
    ctx.stroke()
  }

  // Bamboo frame posts.
  ctx.fillStyle = SCENE_COLORS.bambooDark
  ctx.fillRect(20, wallTop - 4, 9, wallBottom - wallTop + 4)
  ctx.fillRect(w - 29, wallTop - 4, 9, wallBottom - wallTop + 4)

  // Roof.
  const roofGradient = ctx.createLinearGradient(0, wallTop - 58, 0, wallTop + 6)
  roofGradient.addColorStop(0, SCENE_COLORS.tinRoofLight)
  roofGradient.addColorStop(1, SCENE_COLORS.tinRoof)
  ctx.fillStyle = roofGradient
  ctx.beginPath()
  ctx.moveTo(-6, wallTop + 8)
  ctx.lineTo(w / 2, wallTop - 62)
  ctx.lineTo(w + 6, wallTop + 8)
  ctx.closePath()
  ctx.fill()

  // Corrugation.
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(-6, wallTop + 8)
  ctx.lineTo(w / 2, wallTop - 62)
  ctx.lineTo(w + 6, wallTop + 8)
  ctx.closePath()
  ctx.clip()
  for (let i = -12; i < 26; i += 1) {
    ctx.strokeStyle = withAlpha(SCENE_COLORS.tinRoofDark, 0.55)
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(i * 18, wallTop + 12)
    ctx.lineTo(i * 18 + 46, wallTop - 66)
    ctx.stroke()
    ctx.strokeStyle = withAlpha(SCENE_COLORS.tinRoofLight, 0.35)
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(i * 18 + 4, wallTop + 12)
    ctx.lineTo(i * 18 + 50, wallTop - 66)
    ctx.stroke()
  }
  ctx.restore()

  // Roof ridge.
  ctx.fillStyle = SCENE_COLORS.tinRoofDark
  ctx.beginPath()
  ctx.ellipse(w / 2, wallTop - 62, 14, 6, 0, 0, Math.PI * 2)
  ctx.fill()

  // Door.
  const doorW = 74
  const doorH = 116
  const doorX = w * 0.22
  const doorY = wallBottom - doorH
  ctx.fillStyle = SCENE_COLORS.woodDark
  roundedRect(ctx, doorX - 5, doorY - 5, doorW + 10, doorH + 5, 6)
  ctx.fill()
  const doorGradient = ctx.createLinearGradient(doorX, doorY, doorX + doorW, doorY)
  doorGradient.addColorStop(0, SCENE_COLORS.wood)
  doorGradient.addColorStop(1, SCENE_COLORS.woodDark)
  ctx.fillStyle = doorGradient
  ctx.fillRect(doorX, doorY, doorW, doorH)
  ctx.strokeStyle = withAlpha(SCENE_COLORS.woodLight, 0.5)
  ctx.lineWidth = 1.4
  for (let i = 1; i < 4; i += 1) {
    ctx.beginPath()
    ctx.moveTo(doorX + (doorW / 4) * i, doorY + 4)
    ctx.lineTo(doorX + (doorW / 4) * i, doorY + doorH - 4)
    ctx.stroke()
  }
  ctx.fillStyle = SCENE_COLORS.lantern
  ctx.beginPath()
  ctx.arc(doorX + doorW - 13, doorY + doorH / 2, 3.4, 0, Math.PI * 2)
  ctx.fill()

  // Warm window.
  const winW = 78
  const winH = 60
  const winX = w * 0.58
  const winY = wallTop + 44
  ctx.fillStyle = SCENE_COLORS.woodDark
  ctx.fillRect(winX - 7, winY - 7, winW + 14, winH + 14)
  if (options.lit) {
    const glow = ctx.createLinearGradient(winX, winY, winX, winY + winH)
    glow.addColorStop(0, '#ffd89b')
    glow.addColorStop(1, '#e79b46')
    ctx.fillStyle = glow
    ctx.fillRect(winX, winY, winW, winH)
    softGlow(ctx, winX + winW / 2, winY + winH / 2, 130, SCENE_COLORS.lantern, 0.34)
    // Silhouette of someone moving inside.
    ctx.fillStyle = withAlpha('#3a2413', 0.55)
    ctx.beginPath()
    ctx.ellipse(winX + winW * 0.34, winY + winH * 0.82, 15, 22, 0, 0, Math.PI * 2)
    ctx.fill()
  } else {
    ctx.fillStyle = '#1b241b'
    ctx.fillRect(winX, winY, winW, winH)
  }
  ctx.strokeStyle = SCENE_COLORS.wood
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.moveTo(winX + winW / 2, winY)
  ctx.lineTo(winX + winW / 2, winY + winH)
  ctx.moveTo(winX, winY + winH / 2)
  ctx.lineTo(winX + winW, winY + winH / 2)
  ctx.stroke()
  ctx.strokeStyle = SCENE_COLORS.woodDark
  ctx.lineWidth = 3
  ctx.strokeRect(winX, winY, winW, winH)

  // The stylised "সিঁধ" opening in the wall base (purely a game prop).
  const holeX = w * 0.72
  const holeY = wallBottom - 22
  ctx.fillStyle = '#0b0d09'
  ctx.beginPath()
  ctx.moveTo(holeX - 26, holeY + 16)
  ctx.quadraticCurveTo(holeX - 24, holeY - 12, holeX, holeY - 14)
  ctx.quadraticCurveTo(holeX + 24, holeY - 12, holeX + 26, holeY + 16)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = withAlpha(SCENE_COLORS.mudWallShadow, 0.9)
  ctx.lineWidth = 3
  ctx.stroke()

  // Hanging lantern under the eave.
  ctx.strokeStyle = SCENE_COLORS.woodDark
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(w * 0.48, wallTop + 6)
  ctx.lineTo(w * 0.48, wallTop + 28)
  ctx.stroke()
  ctx.fillStyle = SCENE_COLORS.lampGlass
  roundedRect(ctx, w * 0.48 - 9, wallTop + 28, 18, 24, 5)
  ctx.fill()
  softGlow(ctx, w * 0.48, wallTop + 40, 70, SCENE_COLORS.lantern, 0.3)
}

function drawBambooCluster(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const rng = createRng(31337)
  for (let i = 0; i < 7; i += 1) {
    const x = 10 + i * 13 + randomRange(rng, -4, 4)
    const height = h * randomRange(rng, 0.62, 1)
    ctx.strokeStyle = i % 2 === 0 ? SCENE_COLORS.bamboo : SCENE_COLORS.bambooDark
    ctx.lineWidth = randomRange(rng, 4, 7)
    ctx.beginPath()
    ctx.moveTo(x, h)
    ctx.quadraticCurveTo(x + 5, h - height * 0.6, x + 1, h - height)
    ctx.stroke()

    ctx.strokeStyle = withAlpha(SCENE_COLORS.bambooLight, 0.5)
    ctx.lineWidth = 1.4
    for (let s = 0; s < 6; s += 1) {
      const y = h - (height / 6) * s - 6
      ctx.beginPath()
      ctx.moveTo(x - 3, y)
      ctx.lineTo(x + 4, y - 1)
      ctx.stroke()
    }
  }

  ctx.fillStyle = SCENE_COLORS.leaf
  for (let i = 0; i < 26; i += 1) {
    const x = randomRange(rng, 4, w - 4)
    const y = randomRange(rng, 10, h * 0.6)
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(randomRange(rng, -1, 1))
    ctx.beginPath()
    ctx.ellipse(0, 0, randomRange(rng, 9, 18), 4, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

function drawBananaTree(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const rng = createRng(24680)
  ctx.strokeStyle = '#3b5a2e'
  ctx.lineWidth = 7
  ctx.beginPath()
  ctx.moveTo(w / 2, h)
  ctx.quadraticCurveTo(w / 2 + 6, h - h * 0.55, w / 2 - 2, h - h * 0.85)
  ctx.stroke()

  for (let i = 0; i < 9; i += 1) {
    const angle = -Math.PI / 2 + (i - 4) * 0.42
    const length = randomRange(rng, 46, 82)
    ctx.save()
    ctx.translate(w / 2 - 2, h - h * 0.85)
    ctx.rotate(angle)
    ctx.fillStyle = i % 3 === 0 ? SCENE_COLORS.bananaLeafLight : SCENE_COLORS.bananaLeaf
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.quadraticCurveTo(length * 0.5, -13, length, -3)
    ctx.quadraticCurveTo(length * 0.5, 9, 0, 0)
    ctx.fill()
    ctx.strokeStyle = withAlpha('#20401d', 0.6)
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(length, -3)
    ctx.stroke()
    ctx.restore()
  }
}

function drawBush(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const rng = createRng(8080)
  for (let i = 0; i < 34; i += 1) {
    const x = randomRange(rng, 6, w - 6)
    const y = randomRange(rng, h * 0.25, h - 6)
    const radius = randomRange(rng, 12, 26)
    ctx.fillStyle = i % 4 === 0 ? SCENE_COLORS.leafLight : SCENE_COLORS.leaf
    ctx.beginPath()
    ctx.ellipse(x, y, radius, radius * 0.72, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = withAlpha('#050906', 0.35)
  ctx.beginPath()
  ctx.ellipse(w / 2, h - 4, w * 0.44, 7, 0, 0, Math.PI * 2)
  ctx.fill()
}

function drawGrassTuft(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const rng = createRng(1212)
  for (let i = 0; i < 16; i += 1) {
    const x = randomRange(rng, 4, w - 4)
    ctx.strokeStyle = i % 3 === 0 ? SCENE_COLORS.grassTip : SCENE_COLORS.grassLight
    ctx.lineWidth = randomRange(rng, 1.4, 2.6)
    ctx.beginPath()
    ctx.moveTo(x, h)
    ctx.quadraticCurveTo(x + randomRange(rng, -4, 4), h - h * 0.5, x + randomRange(rng, -10, 10), h - randomRange(rng, h * 0.6, h))
    ctx.stroke()
  }
}

function drawHaystack(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const rng = createRng(515151)
  const gradient = ctx.createLinearGradient(0, 0, 0, h)
  gradient.addColorStop(0, SCENE_COLORS.hayLight)
  gradient.addColorStop(1, SCENE_COLORS.hay)
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.ellipse(w / 2, h - 4, w * 0.46, h * 0.82, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = withAlpha(SCENE_COLORS.hayDark, 0.55)
  ctx.lineWidth = 1.6
  for (let i = 0; i < 46; i += 1) {
    const y = randomRange(rng, 6, h - 6)
    ctx.beginPath()
    ctx.moveTo(w * 0.08, y)
    ctx.quadraticCurveTo(w / 2, y + randomRange(rng, -6, 6), w * 0.92, y + randomRange(rng, -4, 4))
    ctx.stroke()
  }
  ctx.fillStyle = withAlpha('#050906', 0.4)
  ctx.beginPath()
  ctx.ellipse(w / 2, h - 3, w * 0.46, 6, 0, 0, Math.PI * 2)
  ctx.fill()
}

function drawFence(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const rng = createRng(64064)
  for (let i = 0; i < 3; i += 1) {
    const x = 6 + i * (w / 3)
    ctx.fillStyle = i % 2 === 0 ? SCENE_COLORS.wood : SCENE_COLORS.woodDark
    roundedRect(ctx, x, 6, 7, h - 10, 3)
    ctx.fill()
  }
  ctx.fillStyle = SCENE_COLORS.woodLight
  ctx.fillRect(0, h * 0.32, w, 6)
  ctx.fillStyle = SCENE_COLORS.woodDark
  ctx.fillRect(0, h * 0.32 + 6, w, 3)
  ctx.fillStyle = SCENE_COLORS.wood
  ctx.fillRect(0, h * 0.62, w, 6)
  ctx.fillStyle = SCENE_COLORS.woodDark
  ctx.fillRect(0, h * 0.62 + 6, w, 3)
  grain(ctx, 0, 0, w, h, SCENE_COLORS.woodDark, 90, 22, 1.2)
  void rng
}

function drawLantern(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.strokeStyle = SCENE_COLORS.woodDark
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(w / 2, 0)
  ctx.lineTo(w / 2, 18)
  ctx.stroke()

  ctx.fillStyle = SCENE_COLORS.tinRoofDark
  ctx.beginPath()
  ctx.moveTo(w / 2 - 16, 22)
  ctx.lineTo(w / 2, 14)
  ctx.lineTo(w / 2 + 16, 22)
  ctx.closePath()
  ctx.fill()

  const glow = ctx.createLinearGradient(0, 22, 0, h - 8)
  glow.addColorStop(0, '#fff0c4')
  glow.addColorStop(1, '#f0b45c')
  ctx.fillStyle = glow
  roundedRect(ctx, w / 2 - 12, 22, 24, h - 34, 5)
  ctx.fill()

  ctx.strokeStyle = SCENE_COLORS.tinRoofDark
  ctx.lineWidth = 2
  ctx.strokeRect(w / 2 - 12, 22, 24, h - 34)

  ctx.fillStyle = SCENE_COLORS.tinRoofDark
  ctx.fillRect(w / 2 - 14, h - 14, 28, 7)
  softGlow(ctx, w / 2, h * 0.55, 70, SCENE_COLORS.lantern, 0.42)
}

function drawPond(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  const gradient = ctx.createLinearGradient(0, 0, 0, h)
  gradient.addColorStop(0, SCENE_COLORS.waterLight)
  gradient.addColorStop(0.45, SCENE_COLORS.water)
  gradient.addColorStop(1, '#152629')
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.ellipse(w / 2, h * 0.55, w * 0.48, h * 0.42, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = withAlpha(SCENE_COLORS.waterFoam, 0.35)
  ctx.lineWidth = 1.4
  for (let i = 0; i < 7; i += 1) {
    const y = h * (0.3 + i * 0.09)
    const halfWidth = (w * 0.48) * (1 - Math.abs(i - 3) * 0.16)
    ctx.beginPath()
    ctx.moveTo(w / 2 - halfWidth * 0.6, y)
    ctx.quadraticCurveTo(w / 2, y + 3, w / 2 + halfWidth * 0.6, y)
    ctx.stroke()
  }
}

function drawPot(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.fillStyle = '#8a4f30'
  ctx.beginPath()
  ctx.ellipse(w / 2, h * 0.6, w * 0.36, h * 0.36, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#6f3d25'
  ctx.beginPath()
  ctx.ellipse(w / 2, h * 0.3, w * 0.22, h * 0.12, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = withAlpha('#c98a5c', 0.55)
  ctx.beginPath()
  ctx.ellipse(w * 0.4, h * 0.52, w * 0.12, h * 0.16, -0.4, 0, Math.PI * 2)
  ctx.fill()
}

function drawFirefly(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  softGlow(ctx, w / 2, h / 2, w / 2, '#dff5a0', 0.75)
  ctx.fillStyle = '#f4ffd0'
  ctx.beginPath()
  ctx.arc(w / 2, h / 2, 2.2, 0, Math.PI * 2)
  ctx.fill()
}

function drawCutHole(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.fillStyle = '#0a0c08'
  ctx.beginPath()
  ctx.moveTo(w * 0.08, h * 0.92)
  ctx.quadraticCurveTo(w * 0.06, h * 0.12, w * 0.5, h * 0.08)
  ctx.quadraticCurveTo(w * 0.94, h * 0.12, w * 0.92, h * 0.92)
  ctx.closePath()
  ctx.fill()

  ctx.strokeStyle = withAlpha(SCENE_COLORS.mudWallShadow, 0.95)
  ctx.lineWidth = 5
  ctx.stroke()

  ctx.strokeStyle = withAlpha(SCENE_COLORS.mudWallLight, 0.45)
  ctx.lineWidth = 2
  ctx.stroke()
}

function drawPrompt(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  // A soft bubble with a little hand/knife hint drawn as a warm spark.
  softGlow(ctx, w / 2, h / 2, w / 2, SCENE_COLORS.lantern, 0.55)
  ctx.fillStyle = withAlpha('#f7e6c4', 0.92)
  ctx.beginPath()
  ctx.arc(w / 2, h / 2, w * 0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = withAlpha('#8a5a22', 0.8)
  ctx.lineWidth = 3
  ctx.stroke()
}

/* --------------------------------------------------------------- factory */

export function createVillageTextures(scene: Phaser.Scene): void {
  makeTexture(scene, VILLAGE_TEXTURE_KEYS.sky, 960, 540, (ctx) => drawSky(ctx, 960, 540))
  makeTexture(scene, VILLAGE_TEXTURE_KEYS.far, 1600, 280, (ctx) => drawFarLayer(ctx, 1600, 280))
  makeTexture(scene, VILLAGE_TEXTURE_KEYS.mid, 1500, 320, (ctx) => drawMidLayer(ctx, 1500, 320))
  makeTexture(scene, VILLAGE_TEXTURE_KEYS.ground, 512, 150, (ctx) => drawGround(ctx, 512, 150))
  makeTexture(scene, VILLAGE_TEXTURE_KEYS.houseMain, 470, 400, (ctx) =>
    drawMudHouse(ctx, 470, 400, {
      wall: SCENE_COLORS.mudWall,
      wallLight: SCENE_COLORS.mudWallLight,
      roof: SCENE_COLORS.tinRoof,
      lit: true,
    }),
  )
  makeTexture(scene, VILLAGE_TEXTURE_KEYS.houseSmall, 300, 250, (ctx) =>
    drawMudHouse(ctx, 300, 250, {
      wall: '#4c3a25',
      wallLight: '#5d4830',
      roof: '#3d4039',
      lit: false,
    }),
  )
  makeTexture(scene, VILLAGE_TEXTURE_KEYS.bamboo, 120, 300, (ctx) => drawBambooCluster(ctx, 120, 300))
  makeTexture(scene, VILLAGE_TEXTURE_KEYS.banana, 190, 250, (ctx) => drawBananaTree(ctx, 190, 250))
  makeTexture(scene, VILLAGE_TEXTURE_KEYS.bush, 120, 74, (ctx) => drawBush(ctx, 120, 74))
  makeTexture(scene, VILLAGE_TEXTURE_KEYS.grass, 48, 32, (ctx) => drawGrassTuft(ctx, 48, 32))
  makeTexture(scene, VILLAGE_TEXTURE_KEYS.haystack, 170, 120, (ctx) => drawHaystack(ctx, 170, 120))
  makeTexture(scene, VILLAGE_TEXTURE_KEYS.fence, 150, 78, (ctx) => drawFence(ctx, 150, 78))
  makeTexture(scene, VILLAGE_TEXTURE_KEYS.lantern, 60, 96, (ctx) => drawLantern(ctx, 60, 96))
  makeTexture(scene, VILLAGE_TEXTURE_KEYS.pond, 280, 120, (ctx) => drawPond(ctx, 280, 120))
  makeTexture(scene, VILLAGE_TEXTURE_KEYS.pot, 64, 74, (ctx) => drawPot(ctx, 64, 74))
  makeTexture(scene, VILLAGE_TEXTURE_KEYS.firefly, 16, 16, (ctx) => drawFirefly(ctx, 16, 16))
  makeTexture(scene, VILLAGE_TEXTURE_KEYS.cutHole, 64, 46, (ctx) => drawCutHole(ctx, 64, 46))
  makeTexture(scene, VILLAGE_TEXTURE_KEYS.prompt, 64, 64, (ctx) => drawPrompt(ctx, 64, 64))
}
