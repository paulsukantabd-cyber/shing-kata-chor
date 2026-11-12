import Phaser from 'phaser'
import { CharacterRig, type RigCue } from '../animations/CharacterRig'
import { CHARACTER_TEXTURE_KEYS } from '../assets/characterTextures'
import { VILLAGE_TEXTURE_KEYS } from '../assets/villageTextures'
import {
  CAMERA_TUNING,
  FONT_BENGALI,
  GAME_HEIGHT,
  GROUND_Y,
  HOUSE_X,
  INTERACT_RANGE,
  PLAYER_START_X,
  PLAYER_TUNING,
  WORLD_WIDTH,
} from '../config/constants'
import type { CharacterConfig } from '../config/character'
import { buildVillageLayout, type PropPlacement, type VillageLayout } from '../config/layout'
import type { OilDefinition } from '../config/oils'
import { OIL_BY_ID } from '../config/oils'
import { GAME_EVENTS, type PromptPayload } from '../events'
import { audioSystem } from '../systems/AudioSystem'
import { inputSystem } from '../systems/InputSystem'
import type { CutResult } from '../../types'
import { SCENE_KEYS } from './BootScene'

/** World position of the stylised "সিঁধ" opening in the mud house wall base. */
const CUT_HOUSE_X = HOUSE_X + 103
const PROMPT_TEXT = 'সিঁধ কাটবে?'

interface VillageSceneData {
  config: CharacterConfig
  oil: OilDefinition
}

interface FloatingText {
  text: Phaser.GameObjects.Text
  life: number
}

/**
 * The playable night village.
 *
 * Owns the world, the player rig, the camera and the interaction with the
 * house. Real-time state lives here; the Vue layer only listens to events.
 */
export default class VillageScene extends Phaser.Scene {
  private rig!: CharacterRig
  private layout!: VillageLayout
  private oil!: OilDefinition
  private characterConfig!: CharacterConfig

  private playerX = PLAYER_START_X
  private velocity = 0
  private facing: 1 | -1 = 1

  private promptGroup!: Phaser.GameObjects.Container
  private promptSparkle!: Phaser.GameObjects.Image
  private promptVisible = false

  private villager!: Phaser.GameObjects.Image
  private dog!: Phaser.GameObjects.Image
  private dogTimer = 4
  private dogDirection: 1 | -1 = 1
  private lanternGlow!: Phaser.GameObjects.Image

  private fireflies: Array<{ sprite: Phaser.GameObjects.Image; phase: number; speed: number }> = []
  private floaters: FloatingText[] = []

  private sneezeTimer = 2
  private slipHold = 0
  private cutActive = false
  private caught = false

  constructor() {
    super(SCENE_KEYS.village)
  }

  init(data?: VillageSceneData): void {
    this.characterConfig = data?.config ?? {
      name: 'রফিক',
      lungi: 'blueCheck',
      moustache: true,
      gamcha: true,
    }
    this.oil = data?.oil ?? OIL_BY_ID.soybean
    this.playerX = PLAYER_START_X
    this.velocity = 0
    this.caught = false
    this.cutActive = false
  }

  create(): void {
    this.layout = buildVillageLayout(WORLD_WIDTH)

    this.buildBackdrop()
    this.buildGround()
    this.buildProps()
    this.buildHouse()
    this.buildActors()
    this.buildPrompt()
    this.buildCamera()
    this.buildAtmosphere()

    inputSystem.attach()

    this.game.events.on(GAME_EVENTS.cutFinished, this.handleCutFinished, this)
    this.game.events.on(GAME_EVENTS.cutClosed, this.handleCutClosed, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this)

    this.game.events.emit(GAME_EVENTS.ready)
    this.game.events.emit(GAME_EVENTS.prompt, { visible: false, text: PROMPT_TEXT } satisfies PromptPayload)
  }

  /* ------------------------------------------------------------- builders */

  private buildBackdrop(): void {
    this.add
      .image(0, 0, VILLAGE_TEXTURE_KEYS.sky)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(-100)

    this.add
      .image(0, 318, VILLAGE_TEXTURE_KEYS.far)
      .setOrigin(0, 1)
      .setScrollFactor(0.18)
      .setDepth(-90)

    this.add
      .image(0, 392, VILLAGE_TEXTURE_KEYS.mid)
      .setOrigin(0, 1)
      .setScrollFactor(0.35)
      .setDepth(-80)
  }

  private buildGround(): void {
    this.add
      .tileSprite(0, GROUND_Y, WORLD_WIDTH, 150, VILLAGE_TEXTURE_KEYS.ground)
      .setOrigin(0, 0)
      .setDepth(-60)
  }

  private buildProps(): void {
    for (const item of this.layout.bamboo) {
      this.addProp(VILLAGE_TEXTURE_KEYS.bamboo, item, -40, 0.5, 1)
    }

    for (const item of this.layout.banana) {
      this.addProp(VILLAGE_TEXTURE_KEYS.banana, item, -42, 0.5, 1)
    }

    for (const item of this.layout.haystack) {
      this.addProp(VILLAGE_TEXTURE_KEYS.haystack, item, -38, 0.5, 1)
    }

    for (const item of this.layout.bush) {
      this.addProp(VILLAGE_TEXTURE_KEYS.bush, item, -34, 0.5, 1)
    }

    for (const item of this.layout.smallHouses) {
      this.addProp(VILLAGE_TEXTURE_KEYS.houseSmall, item, -30, 0.5, 1)
    }

    // Pond sits in the ground plane, just below the path.
    this.add
      .image(this.layout.pond.x, GROUND_Y + 26, VILLAGE_TEXTURE_KEYS.pond)
      .setScale(this.layout.pond.scale)
      .setDepth(-50)

    // Grass tufts hugging the path.
    for (const item of this.layout.grass) {
      this.addProp(VILLAGE_TEXTURE_KEYS.grass, item, 62, 0.5, 1)
    }

    // Bamboo fence in front of the path.
    this.add
      .tileSprite(this.layout.fenceStart, GROUND_Y + 14, 150 * this.layout.fenceCount, 78, VILLAGE_TEXTURE_KEYS.fence)
      .setOrigin(0, 1)
      .setDepth(58)
  }

  private addProp(
    key: string,
    item: PropPlacement,
    depth: number,
    originX: number,
    originY: number,
  ): Phaser.GameObjects.Image {
    const image = this.add.image(item.x, GROUND_Y + item.offsetY, key)
    image.setOrigin(originX, originY)
    image.setScale(item.scale)
    image.setDepth(depth)
    return image
  }

  private buildHouse(): void {
    this.add.image(HOUSE_X, GROUND_Y, VILLAGE_TEXTURE_KEYS.houseMain).setOrigin(0.5, 1).setDepth(0)

    // The stylised opening the thief is after.
    this.add
      .image(CUT_HOUSE_X, GROUND_Y - 46, VILLAGE_TEXTURE_KEYS.cutHole)
      .setDepth(2)

    // Lantern on a bamboo pole next to the house.
    const pole = this.add.graphics()
    pole.fillStyle(0x3b5127, 1)
    pole.fillRect(this.layout.lantern.x - 4, GROUND_Y - 250, 8, 250)
    pole.fillStyle(0x87a455, 0.6)
    pole.fillRect(this.layout.lantern.x - 3, GROUND_Y - 250, 3, 250)
    pole.setDepth(-20)

    this.add
      .image(this.layout.lantern.x, GROUND_Y - 244, VILLAGE_TEXTURE_KEYS.lantern)
      .setOrigin(0.5, 0)
      .setDepth(-18)

    this.lanternGlow = this.add
      .image(this.layout.lantern.x, GROUND_Y - 190, VILLAGE_TEXTURE_KEYS.firefly)
      .setScale(9)
      .setTint(0xffd89b)
      .setAlpha(0.28)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(-16)

    this.tweens.add({
      targets: this.lanternGlow,
      alpha: { from: 0.34, to: 0.16 },
      scale: { from: 8.4, to: 9.6 },
      duration: 1500 + Math.random() * 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    this.add
      .image(this.layout.pot.x, GROUND_Y, VILLAGE_TEXTURE_KEYS.pot)
      .setOrigin(0.5, 1)
      .setDepth(-10)
  }

  private buildActors(): void {
    this.rig = new CharacterRig(this, this.characterConfig, this.playerX, GROUND_Y, (cue) =>
      this.handleCue(cue),
    )
    this.rig.root.setDepth(40)

    this.villager = this.add
      .image(CUT_HOUSE_X + 420, GROUND_Y, CHARACTER_TEXTURE_KEYS.villager)
      .setOrigin(0.5, 1)
      .setDepth(45)
      .setVisible(false)

    this.dog = this.add
      .image(this.layout.dogStart, GROUND_Y, CHARACTER_TEXTURE_KEYS.dog)
      .setOrigin(0.5, 1)
      .setDepth(-20)
  }

  private buildPrompt(): void {
    this.promptGroup = this.add.container(this.playerX, GROUND_Y - 282).setDepth(70).setVisible(false)

    const panel = this.add.graphics()
    panel.fillStyle(0x0f1d18, 0.9)
    panel.fillRoundedRect(-118, -30, 236, 60, 16)
    panel.lineStyle(2, 0xe8b85c, 0.75)
    panel.strokeRoundedRect(-118, -30, 236, 60, 16)
    this.promptGroup.add(panel)

    const label = this.add
      .text(0, -4, PROMPT_TEXT, {
        fontFamily: FONT_BENGALI,
        fontSize: '26px',
        color: '#F3E8CF',
        fontStyle: '700',
      })
      .setOrigin(0.5)
    this.promptGroup.add(label)

    const hint = this.add
      .text(0, 48, 'E চাপ দাও', {
        fontFamily: FONT_BENGALI,
        fontSize: '18px',
        color: '#E8B85C',
      })
      .setOrigin(0.5)
    this.promptGroup.add(hint)

    this.promptSparkle = this.add
      .image(CUT_HOUSE_X, GROUND_Y - 76, VILLAGE_TEXTURE_KEYS.prompt)
      .setScale(0.42)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(69)
      .setVisible(false)

    this.tweens.add({
      targets: this.promptSparkle,
      alpha: { from: 0.35, to: 1 },
      scale: { from: 0.36, to: 0.5 },
      duration: 780,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })
  }

  private buildCamera(): void {
    const camera = this.cameras.main
    camera.setBounds(0, 0, WORLD_WIDTH, GAME_HEIGHT)
    camera.startFollow(this.rig.root, true, CAMERA_TUNING.lerp, CAMERA_TUNING.lerp)
    camera.setFollowOffset(CAMERA_TUNING.offsetX, CAMERA_TUNING.offsetY)
    camera.setDeadzone(CAMERA_TUNING.deadZoneWidth, CAMERA_TUNING.deadZoneHeight)
    camera.setRoundPixels(true)
  }

  private buildAtmosphere(): void {
    for (const item of this.layout.fireflies) {
      const sprite = this.add
        .image(item.x, GROUND_Y - randomBetween(30, 210), VILLAGE_TEXTURE_KEYS.firefly)
        .setScale(item.scale * 0.85)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(70)

      this.fireflies.push({
        sprite,
        phase: Math.random() * Math.PI * 2,
        speed: 0.35 + Math.random() * 0.5,
      })
    }

    // Slow drifting fog patches.
    for (let i = 0; i < 4; i += 1) {
      const fog = this.add
        .image(300 + i * 780, GROUND_Y - 90 - i * 18, VILLAGE_TEXTURE_KEYS.firefly)
        .setScale(16 + i * 3)
        .setAlpha(0.05)
        .setTint(0xbcd7c8)
        .setDepth(72)

      this.tweens.add({
        targets: fog,
        x: fog.x + 220,
        alpha: { from: 0.03, to: 0.08 },
        duration: 16000 + i * 2200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      })
    }
  }

  /* -------------------------------------------------------------- runtime */

  update(_time: number, delta: number): void {
    if (this.cutActive) {
      return
    }

    this.updateMovement(delta)
    this.rig.update(delta)
    this.updatePrompt(delta)
    this.updateAtmosphere(delta)
    this.updateDog(delta)
    this.updateFloaters(delta)
  }

  private updateMovement(delta: number): void {
    const dt = Math.min(delta, 50) / 1000
    const left = inputSystem.isDown('left')
    const right = inputSystem.isDown('right')
    const run = inputSystem.isDown('run')
    const direction = (right ? 1 : 0) - (left ? 1 : 0)
    const slippery = this.oil.slipFactor > 0

    const walkSpeed = PLAYER_TUNING.walkSpeed * this.oil.speedMultiplier
    const runSpeed = PLAYER_TUNING.runSpeed * this.oil.runMultiplier

    if (direction !== 0) {
      if (this.velocity !== 0 && Math.sign(this.velocity) !== direction) {
        this.velocity = 0
        if (slippery) {
          this.slipHold = 0.5
        }
      }

      const target = run ? runSpeed : walkSpeed
      this.velocity += direction * PLAYER_TUNING.acceleration * dt
      this.velocity = Phaser.Math.Clamp(this.velocity, -target, target)
      this.facing = direction > 0 ? 1 : -1
      this.rig.setFacing(this.facing)
    } else {
      const friction = PLAYER_TUNING.friction / (slippery ? this.oil.slipFactor : 1)
      const drop = friction * dt
      if (Math.abs(this.velocity) <= drop) {
        this.velocity = 0
      } else {
        this.velocity -= Math.sign(this.velocity) * drop
      }
    }

    this.playerX += this.velocity * dt
    const clamped = Phaser.Math.Clamp(this.playerX, PLAYER_TUNING.minX, PLAYER_TUNING.maxX)
    if (clamped !== this.playerX) {
      this.velocity = 0
    }
    this.playerX = clamped
    this.rig.setPosition(this.playerX, GROUND_Y)

    if (this.slipHold > 0) {
      this.slipHold -= dt
      this.rig.setState('slip')
    } else if (this.rig.getState() === 'slip') {
      this.rig.setState('idle')
    }

    const rigState = this.rig.getState()
    if (rigState !== 'sneeze' && rigState !== 'caught' && rigState !== 'interact' && rigState !== 'slip') {
      if (Math.abs(this.velocity) > 12) {
        this.rig.setState(run && Math.abs(this.velocity) > walkSpeed * 1.05 ? 'run' : 'walk')
      } else {
        this.rig.setState('idle')
      }
    }
  }

  private updatePrompt(_delta: number): void {
    const near = Math.abs(this.playerX - CUT_HOUSE_X) <= INTERACT_RANGE

    if (near !== this.promptVisible) {
      this.promptVisible = near
      this.promptGroup.setVisible(near)
      this.promptSparkle.setVisible(near)
      this.game.events.emit(
        GAME_EVENTS.prompt,
        { visible: near, text: PROMPT_TEXT } satisfies PromptPayload,
      )
    }

    if (near) {
      this.promptGroup.setPosition(this.playerX, GROUND_Y - 282)
    }

    if (inputSystem.isPressed('action')) {
      this.startCut()
    }
  }

  private updateAtmosphere(delta: number): void {
    const dt = delta / 1000
    const time = this.time.now / 1000

    for (const firefly of this.fireflies) {
      firefly.phase += dt * firefly.speed
      const sprite = firefly.sprite
      sprite.x += Math.cos(firefly.phase * 0.7) * 0.35
      sprite.y += Math.sin(firefly.phase) * 0.22
      sprite.setAlpha(0.35 + Math.sin(time * 2.4 + firefly.phase) * 0.3)
    }

    if (this.oil.sneezeChance > 0) {
      this.sneezeTimer -= dt
      if (this.sneezeTimer <= 0) {
        this.sneezeTimer = 1.4
        if (Math.random() < this.oil.sneezeChance && !this.cutActive) {
          this.rig.setState('sneeze')
        }
      }
    }
  }

  private updateDog(delta: number): void {
    const dt = delta / 1000
    this.dogTimer -= dt

    if (this.dogTimer <= 0) {
      this.dogTimer = 5 + Math.random() * 7
      this.dogDirection = this.dogDirection === 1 ? -1 : 1
      if (Math.random() < 0.5) {
        audioSystem.play('bark')
      }
    }

    this.dog.x += this.dogDirection * 26 * dt
    this.dog.setScale(this.dogDirection === 1 ? 1 : -1, 1)
    if (this.dog.x < 120 || this.dog.x > WORLD_WIDTH - 120) {
      this.dogDirection = this.dogDirection === 1 ? -1 : 1
    }
  }

  private updateFloaters(delta: number): void {
    for (let i = this.floaters.length - 1; i >= 0; i -= 1) {
      const floater = this.floaters[i]
      floater.life -= delta
      floater.text.y -= delta * 0.045
      floater.text.setAlpha(Math.max(0, floater.life / 900))
      if (floater.life <= 0) {
        floater.text.destroy()
        this.floaters.splice(i, 1)
      }
    }
  }

  private handleCue(cue: RigCue): void {
    switch (cue) {
      case 'step':
        audioSystem.play('footstep', 0.55)
        break
      case 'sneeze':
        audioSystem.play('sneeze')
        this.showFloater('হাঁচি!', '#F3E8CF')
        break
      case 'slip':
        audioSystem.play('slip')
        break
      case 'caught':
        audioSystem.play('alert')
        break
    }
  }

  private showFloater(message: string, color: string): void {
    const text = this.add
      .text(this.playerX, GROUND_Y - 190, message, {
        fontFamily: FONT_BENGALI,
        fontSize: '30px',
        color,
        fontStyle: '700',
        stroke: '#101B17',
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(80)

    this.floaters.push({ text, life: 900 })
  }

  /* --------------------------------------------------------- interaction */

  private startCut(): void {
    if (this.cutActive || this.caught) {
      return
    }

    this.cutActive = true
    this.rig.setState('interact')
    audioSystem.play('cut')

    this.game.events.emit(GAME_EVENTS.cutStarted, { playerName: this.characterConfig.name })

    this.scene.launch(SCENE_KEYS.cut, { playerName: this.characterConfig.name })
    this.scene.pause()
  }

  private handleCutFinished(result: CutResult): void {
    if (result.success) {
      this.rig.setState('idle')
      this.game.events.emit(GAME_EVENTS.toast, { text: 'সিঁধ কাটা সফল!', tone: 'success' })
      return
    }

    this.caught = true
    this.rig.setState('caught')
    this.villager.setVisible(true).setPosition(this.playerX + 320, GROUND_Y)
    this.tweens.add({
      targets: this.villager,
      x: this.playerX + 130,
      duration: 950,
      ease: 'Quad.easeOut',
    })
    this.tweens.add({
      targets: this.villager,
      y: GROUND_Y - 6,
      duration: 260,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    this.cameras.main.shake(260, 0.006)
    this.game.events.emit(GAME_EVENTS.toast, { text: 'চোর! চোর! ধর!', tone: 'danger' })
  }

  private handleCutClosed(payload: { outcome: 'success' | 'failed' }): void {
    this.cutActive = false

    if (payload.outcome === 'failed') {
      this.caught = false
      this.rig.setState('idle')
      this.villager.setVisible(false)
      this.villager.setPosition(CUT_HOUSE_X + 420, GROUND_Y)
    }
  }

  private handleShutdown(): void {
    this.game.events.off(GAME_EVENTS.cutFinished, this.handleCutFinished, this)
    this.game.events.off(GAME_EVENTS.cutClosed, this.handleCutClosed, this)
    inputSystem.detach()
    this.floaters.forEach((floater) => floater.text.destroy())
    this.floaters = []
  }
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}
