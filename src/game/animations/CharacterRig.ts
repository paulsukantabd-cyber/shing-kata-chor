import Phaser from 'phaser'
import { CHARACTER_TEXTURE_KEYS } from '../assets/characterTextures'
import { RIG_PLACEMENT, buildCharacterParts } from '../assets/characterSvg'
import type { CharacterAppearance } from '../../types'

export type RigState = 'idle' | 'walk' | 'run' | 'interact' | 'slip' | 'sneeze' | 'caught'

export type RigCue = 'sneeze' | 'slip' | 'caught' | 'step'

interface PartBox {
  width: number
  height: number
}

/**
 * The articulated thief.
 *
 * Every limb is its own sprite inside a small container hierarchy, which makes
 * idle breathing, walk cycles, slipping and panic reactions possible without
 * a sprite sheet. The parts are baked from the same SVG source as the Vue
 * portrait, so the in-game thief always matches the chosen appearance.
 */
export class CharacterRig {
  readonly root: Phaser.GameObjects.Container

  private readonly body: Phaser.GameObjects.Container
  private readonly headPivot: Phaser.GameObjects.Container
  private readonly armFront: Phaser.GameObjects.Container
  private readonly armBack: Phaser.GameObjects.Container
  private readonly legFront: Phaser.GameObjects.Container
  private readonly legBack: Phaser.GameObjects.Container
  private readonly torso: Phaser.GameObjects.Image
  private readonly lungi: Phaser.GameObjects.Image
  private readonly eyesOpen: Phaser.GameObjects.Image
  private readonly eyesShut: Phaser.GameObjects.Image
  private readonly moustache: Phaser.GameObjects.Image | null
  private readonly gamcha: Phaser.GameObjects.Image | null
  private readonly footFront: Phaser.GameObjects.Image
  private readonly footBack: Phaser.GameObjects.Image

  private phase = 0
  private state: RigState = 'idle'
  private stateTimer = 0
  private blinkTimer = 2.4
  private blinkProgress = 0
  private facing: 1 | -1 = 1
  private stepTimer = 0

  private readonly scene: Phaser.Scene
  private readonly onCue: (cue: RigCue) => void

  constructor(
    scene: Phaser.Scene,
    appearance: CharacterAppearance,
    x: number,
    y: number,
    onCue: (cue: RigCue) => void = () => undefined,
  ) {
    this.scene = scene
    this.onCue = onCue

    const parts = buildCharacterParts(appearance)
    const placement = RIG_PLACEMENT

    this.root = scene.add.container(x, y)
    this.root.setDepth(40)

    const shadow = scene.add.image(placement.shadow.x, placement.shadow.y, CHARACTER_TEXTURE_KEYS.shadow)
    shadow.setDisplaySize(parts.shadow.width, parts.shadow.height)
    shadow.setAlpha(0.85)
    this.root.add(shadow)

    this.body = scene.add.container(0, 0)
    this.root.add(this.body)

    // --- back arm (behind the body) ------------------------------------
    this.armBack = this.createPivot(this.body, placement.backArm.x, placement.backArm.y)
    const backArm = this.makeImage(CHARACTER_TEXTURE_KEYS.arm, parts.backArm, 0, 0, 0.5, 0)
    backArm.setTint(0x9c8878)
    this.armBack.add(backArm)

    // --- back leg -------------------------------------------------------
    this.legBack = this.createPivot(this.body, placement.backLeg.x, placement.backLeg.y)
    const backLeg = this.makeImage(CHARACTER_TEXTURE_KEYS.leg, parts.backLeg, 0, 0, 0.5, 0)
    backLeg.setTint(0x9c8878)
    this.legBack.add(backLeg)

    const footBack = this.makeImage(CHARACTER_TEXTURE_KEYS.foot, parts.backFoot, placement.backFoot.x, placement.backFoot.y)
    footBack.setTint(0x9c8878)
    this.body.add(footBack)
    this.footBack = footBack

    // --- gamcha ---------------------------------------------------------
    if (appearance.gamcha) {
      const gamcha = this.makeImage(CHARACTER_TEXTURE_KEYS.gamcha, parts.gamcha, placement.gamcha.x, placement.gamcha.y)
      this.body.add(gamcha)
      this.gamcha = gamcha
    } else {
      this.gamcha = null
    }

    // --- torso ----------------------------------------------------------
    this.torso = this.makeImage(CHARACTER_TEXTURE_KEYS.torso, parts.torso, placement.torso.x, placement.torso.y)
    this.body.add(this.torso)

    // --- lungi (drawn over the waist so the wrap reads clearly) --------
    this.lungi = this.makeImage(CHARACTER_TEXTURE_KEYS.lungi, parts.lungi, placement.lungi.x, placement.lungi.y)
    this.body.add(this.lungi)

    // --- front leg ------------------------------------------------------
    this.legFront = this.createPivot(this.body, placement.frontLeg.x, placement.frontLeg.y)
    this.legFront.add(this.makeImage(CHARACTER_TEXTURE_KEYS.leg, parts.frontLeg, 0, 0, 0.5, 0))

    const footFront = this.makeImage(CHARACTER_TEXTURE_KEYS.foot, parts.frontFoot, placement.frontFoot.x, placement.frontFoot.y)
    this.body.add(footFront)
    this.footFront = footFront

    // --- head -----------------------------------------------------------
    this.headPivot = this.createPivot(this.body, placement.headNeck.x, placement.headNeck.y)
    const head = this.makeImage(
      CHARACTER_TEXTURE_KEYS.head,
      parts.head,
      placement.head.x - placement.headNeck.x,
      placement.head.y - placement.headNeck.y,
    )
    this.headPivot.add(head)

    this.eyesOpen = this.makeImage(
      CHARACTER_TEXTURE_KEYS.eyesOpen,
      parts.eyesOpen,
      placement.eyes.x - placement.headNeck.x,
      placement.eyes.y - placement.headNeck.y,
    )
    this.headPivot.add(this.eyesOpen)

    this.eyesShut = this.makeImage(
      CHARACTER_TEXTURE_KEYS.eyesShut,
      parts.eyesShut,
      placement.eyes.x - placement.headNeck.x,
      placement.eyes.y - placement.headNeck.y,
    )
    this.eyesShut.setVisible(false)
    this.headPivot.add(this.eyesShut)

    if (appearance.moustache) {
      const moustache = this.makeImage(
        CHARACTER_TEXTURE_KEYS.moustache,
        parts.moustache,
        placement.moustache.x - placement.headNeck.x,
        placement.moustache.y - placement.headNeck.y,
      )
      this.headPivot.add(moustache)
      this.moustache = moustache
    } else {
      this.moustache = null
    }

    // --- front arm ------------------------------------------------------
    this.armFront = this.createPivot(this.body, placement.frontArm.x, placement.frontArm.y)
    this.armFront.add(this.makeImage(CHARACTER_TEXTURE_KEYS.arm, parts.frontArm, 0, 0, 0.5, 0))

    this.resetPose()
  }

  /* ------------------------------------------------------------- helpers */

  private makeImage(
    key: string,
    box: PartBox,
    x: number,
    y: number,
    originX = 0.5,
    originY = 0.5,
  ): Phaser.GameObjects.Image {
    const image = this.scene.add.image(x, y, key)
    image.setDisplaySize(box.width, box.height)
    image.setOrigin(originX, originY)
    return image
  }

  private createPivot(
    parent: Phaser.GameObjects.Container,
    x: number,
    y: number,
  ): Phaser.GameObjects.Container {
    const pivot = this.scene.add.container(x, y)
    parent.add(pivot)
    return pivot
  }

  private resetPose(): void {
    this.body.setPosition(0, 0)
    this.body.setRotation(0)
    this.body.setScale(1, 1)
    this.torso.setScale(1, 1)
    this.lungi.setScale(1, 1)
    this.headPivot.setRotation(0)
    this.armFront.setRotation(0)
    this.armBack.setRotation(0)
    this.legFront.setRotation(0)
    this.legBack.setRotation(0)
  }

  /* -------------------------------------------------------------- public */

  setPosition(x: number, y: number): void {
    this.root.setPosition(x, y)
  }

  setFacing(direction: 1 | -1): void {
    if (this.facing === direction) {
      return
    }
    this.facing = direction
    this.root.setScale(direction, 1)
  }

  getState(): RigState {
    return this.state
  }

  setState(state: RigState): void {
    if (this.state === state) {
      return
    }
    this.state = state
    this.stateTimer = 0
    if (state === 'sneeze' || state === 'slip' || state === 'caught') {
      this.onCue(state)
    }
  }

  /** Advances the animation. `delta` is in milliseconds. */
  update(delta: number): void {
    const dt = Math.min(delta, 50) / 1000
    this.stateTimer += dt

    this.updateBlink(dt)

    switch (this.state) {
      case 'idle':
        this.poseIdle(dt)
        break
      case 'walk':
        this.poseWalk(dt, 9.5, 0.55)
        break
      case 'run':
        this.poseWalk(dt, 15, 0.95)
        break
      case 'interact':
        this.poseInteract(dt)
        break
      case 'slip':
        this.poseSlip(dt)
        break
      case 'sneeze':
        this.poseSneeze(dt)
        break
      case 'caught':
        this.poseCaught(dt)
        break
    }
  }

  destroy(): void {
    this.root.destroy(true)
  }

  /* -------------------------------------------------------------- poses */

  private updateBlink(dt: number): void {
    if (this.blinkProgress > 0) {
      this.blinkProgress -= dt
      if (this.blinkProgress <= 0) {
        this.eyesOpen.setVisible(true)
        this.eyesShut.setVisible(false)
      }
      return
    }

    this.blinkTimer -= dt
    if (this.blinkTimer <= 0) {
      this.blinkTimer = 2.2 + Math.random() * 3.4
      this.blinkProgress = 0.13
      this.eyesOpen.setVisible(false)
      this.eyesShut.setVisible(true)
    }
  }

  private poseIdle(dt: number): void {
    this.phase += dt * 2.2
    const breathe = Math.sin(this.phase)

    this.body.setPosition(0, breathe * 1.4)
    this.body.setRotation(0)
    this.torso.setScale(1, 1 + breathe * 0.022)
    this.lungi.setScale(1, 1 + breathe * 0.012)
    this.headPivot.setRotation(Math.sin(this.phase * 0.55) * 0.06)
    this.armFront.setRotation(0.12 + Math.sin(this.phase * 0.9) * 0.1)
    this.armBack.setRotation(-0.1 - Math.sin(this.phase * 0.9) * 0.09)
    this.legFront.setRotation(0)
    this.legBack.setRotation(0)
  }

  private poseWalk(dt: number, speed: number, stride: number): void {
    this.phase += dt * speed
    const swing = Math.sin(this.phase)
    const bob = Math.abs(Math.sin(this.phase))

    this.body.setPosition(0, -bob * 3.2)
    this.body.setRotation(0.03 + swing * 0.02)
    this.torso.setScale(1, 1 - bob * 0.03)
    this.lungi.setScale(1, 1 - bob * 0.02)
    this.headPivot.setRotation(-0.04 + Math.sin(this.phase * 2) * 0.03)
    this.legFront.setRotation(swing * stride)
    this.legBack.setRotation(-swing * stride)
    this.armFront.setRotation(-swing * stride * 0.85)
    this.armBack.setRotation(swing * stride * 0.85)
    this.footFront.setPosition(
      RIG_PLACEMENT.frontFoot.x,
      RIG_PLACEMENT.frontFoot.y + Math.max(0, swing) * 2,
    )
    this.footBack.setPosition(
      RIG_PLACEMENT.backFoot.x,
      RIG_PLACEMENT.backFoot.y + Math.max(0, -swing) * 2,
    )

    this.stepTimer -= dt
    if (this.stepTimer <= 0) {
      this.stepTimer = stride > 0.7 ? 0.22 : 0.34
      this.onCue('step')
    }
  }

  private poseInteract(dt: number): void {
    this.phase += dt * 9
    const cut = Math.sin(this.phase)

    this.body.setPosition(0, 9 + cut * 1.5)
    this.body.setRotation(0.12)
    this.torso.setScale(1.04, 0.94)
    this.lungi.setScale(1.03, 0.95)
    this.headPivot.setRotation(0.3 + cut * 0.06)
    this.armFront.setRotation(1.05 + cut * 0.55)
    this.armBack.setRotation(0.75 + cut * 0.45)
    this.legFront.setRotation(0.22)
    this.legBack.setRotation(-0.14)
  }

  private poseSlip(dt: number): void {
    this.phase += dt * 13
    const wobble = Math.sin(this.phase)

    this.body.setPosition(0, -2 + wobble * 2)
    this.body.setRotation(wobble * 0.22)
    this.torso.setScale(1.05, 0.93)
    this.headPivot.setRotation(wobble * 0.22 - 0.1)
    this.armFront.setRotation(-1.1 + wobble * 1.5)
    this.armBack.setRotation(1.1 - wobble * 1.5)
    this.legFront.setRotation(wobble * 0.5)
    this.legBack.setRotation(-wobble * 0.5)
    this.gamcha?.setRotation(wobble * 0.22)
  }

  private poseSneeze(dt: number): void {
    this.phase += dt * 18
    const kick = Math.sin(this.phase)

    this.body.setPosition(0, -3 - Math.abs(kick) * 2)
    this.body.setRotation(-kick * 0.16)
    this.body.setScale(1 + kick * 0.05, 1 - kick * 0.05)
    this.headPivot.setRotation(-0.45 - kick * 0.2)
    this.armFront.setRotation(-1.5)
    this.armBack.setRotation(-1.3)
    this.legFront.setRotation(0.2)
    this.legBack.setRotation(-0.2)

    if (this.stateTimer > 0.85) {
      this.setState('idle')
    }
  }

  private poseCaught(dt: number): void {
    this.phase += dt * 11
    const shake = Math.sin(this.phase)

    this.body.setPosition(shake * 2.4, 0)
    this.body.setRotation(shake * 0.06)
    this.torso.setScale(1, 1)
    this.headPivot.setRotation(shake * 0.16)
    this.armFront.setRotation(-2.3 + shake * 0.2)
    this.armBack.setRotation(-2.1 - shake * 0.2)
    this.legFront.setRotation(0.16)
    this.legBack.setRotation(-0.16)
    this.eyesOpen.setVisible(true)
    this.eyesShut.setVisible(false)
    this.moustache?.setRotation(shake * 0.3)
  }
}
