import Phaser from 'phaser'
import { FONT_BENGALI, GAME_HEIGHT, GAME_WIDTH } from '../config/constants'
import { GAME_EVENTS } from '../events'
import { audioSystem } from '../systems/AudioSystem'
import {
  createCutChallengeState,
  registerCutHit,
  scoreCutChallenge,
  updateCutChallenge,
  type CutChallengeState,
} from '../systems/CutChallenge'
import type { CutResult } from '../../types'
import { SCENE_KEYS } from './BootScene'

const PANEL = { x: 170, y: 56, width: 620, height: 428 }
const BAR = { x: 250, width: 460 }

interface CutSceneData {
  playerName: string
}

/**
 * The "সিঁধ কাটা" prototype challenge.
 *
 * A fictional arcade timing game: a marker sweeps across a gauge and the
 * player has to press while it sits in the calm zone. Calm presses advance the
 * cut, sloppy presses raise the noise meter, and a full meter wakes the
 * village up. No real-world instruction is modelled or implied.
 */
export default class CutScene extends Phaser.Scene {
  private state: CutChallengeState = createCutChallengeState()
  private playerName = 'রফিক'
  private finished = false
  private closing = false

  private progressFill!: Phaser.GameObjects.Rectangle
  private noiseFill!: Phaser.GameObjects.Rectangle
  private progressLabel!: Phaser.GameObjects.Text
  private noiseLabel!: Phaser.GameObjects.Text
  private marker!: Phaser.GameObjects.Rectangle
  private feedback!: Phaser.GameObjects.Text
  private pressButton!: Phaser.GameObjects.Container
  private resultGroup!: Phaser.GameObjects.Container
  private resultTitle!: Phaser.GameObjects.Text
  private resultDetail!: Phaser.GameObjects.Text
  private panel!: Phaser.GameObjects.Graphics

  constructor() {
    super(SCENE_KEYS.cut)
  }

  init(data: CutSceneData): void {
    this.playerName = data.playerName ?? 'রফিক'
    this.state = createCutChallengeState()
    this.finished = false
    this.closing = false
  }

  create(): void {
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x050b08, 0.78).setOrigin(0, 0)

    this.panel = this.add.graphics()
    this.panel.fillStyle(0x121f19, 0.97)
    this.panel.fillRoundedRect(PANEL.x, PANEL.y, PANEL.width, PANEL.height, 26)
    this.panel.lineStyle(3, 0xe8b85c, 0.55)
    this.panel.strokeRoundedRect(PANEL.x, PANEL.y, PANEL.width, PANEL.height, 26)
    this.panel.fillStyle(0xe8b85c, 0.1)
    this.panel.fillRoundedRect(PANEL.x + 8, PANEL.y + 8, PANEL.width - 16, 56, 18)

    const centre = GAME_WIDTH / 2

    this.add
      .text(centre, PANEL.y + 36, 'সিঁধ কাটবে?', {
        fontFamily: FONT_BENGALI,
        fontSize: '40px',
        color: '#F3E8CF',
        fontStyle: '700',
      })
      .setOrigin(0.5)

    this.add
      .text(
        centre,
        PANEL.y + 84,
        `${this.playerName} (চোর) — মার্কার সবুজ জায়গায় থাকলেই চাপ দাও`,
        { fontFamily: FONT_BENGALI, fontSize: '19px', color: '#E8B85C' },
      )
      .setOrigin(0.5)

    // --- progress ------------------------------------------------------
    this.add
      .text(BAR.x, PANEL.y + 124, 'সিঁধ কাটা', {
        fontFamily: FONT_BENGALI,
        fontSize: '20px',
        color: '#F3E8CF',
      })
      .setOrigin(0, 0)

    this.progressLabel = this.add
      .text(BAR.x + BAR.width, PANEL.y + 124, '০%', {
        fontFamily: FONT_BENGALI,
        fontSize: '19px',
        color: '#E8B85C',
      })
      .setOrigin(1, 0)

    this.progressFill = this.makeBar(BAR.x, PANEL.y + 156, BAR.width, 22, 0xe8b85c)

    // --- noise ----------------------------------------------------------
    this.add
      .text(BAR.x, PANEL.y + 186, 'গ্রামের শব্দ', {
        fontFamily: FONT_BENGALI,
        fontSize: '20px',
        color: '#F3E8CF',
      })
      .setOrigin(0, 0)

    this.noiseLabel = this.add
      .text(BAR.x + BAR.width, PANEL.y + 186, '০%', {
        fontFamily: FONT_BENGALI,
        fontSize: '19px',
        color: '#F3E8CF',
      })
      .setOrigin(1, 0)

    this.noiseFill = this.makeBar(BAR.x, PANEL.y + 218, BAR.width, 22, 0xc95745)

    // --- gauge ----------------------------------------------------------
    this.add
      .text(BAR.x, PANEL.y + 248, 'চাপ দাও', {
        fontFamily: FONT_BENGALI,
        fontSize: '20px',
        color: '#F3E8CF',
      })
      .setOrigin(0, 0)

    this.add.rectangle(BAR.x + BAR.width / 2, PANEL.y + 288, BAR.width, 30, 0x0b1410).setOrigin(0.5, 0.5)
    this.add
      .rectangle(BAR.x + BAR.width / 2, PANEL.y + 288, BAR.width * 0.4, 30, 0x6fa85c, 0.55)
      .setOrigin(0.5, 0.5)
    this.add
      .rectangle(BAR.x + BAR.width / 2, PANEL.y + 288, BAR.width * 0.14, 30, 0xc9e89a, 0.8)
      .setOrigin(0.5, 0.5)

    this.marker = this.add.rectangle(BAR.x, PANEL.y + 288, 8, 42, 0xf3e8cf).setOrigin(0.5, 0.5)

    this.feedback = this.add
      .text(centre, PANEL.y + 322, 'মার্কারটা মাঝখানে থাকলে চাপ দাও!', {
        fontFamily: FONT_BENGALI,
        fontSize: '22px',
        color: '#F3E8CF',
      })
      .setOrigin(0.5)

    this.pressButton = this.makeButton(centre, PANEL.y + 372, 260, 60, 'হালকা চাপ দাও', () =>
      this.handlePress(),
    )

    this.resultGroup = this.add.container(0, 0).setVisible(false)
    this.resultTitle = this.add
      .text(centre, PANEL.y + 190, '', {
        fontFamily: FONT_BENGALI,
        fontSize: '46px',
        color: '#F3E8CF',
        fontStyle: '700',
      })
      .setOrigin(0.5)
    this.resultDetail = this.add
      .text(centre, PANEL.y + 246, '', {
        fontFamily: FONT_BENGALI,
        fontSize: '22px',
        color: '#E8B85C',
        align: 'center',
        wordWrap: { width: 460 },
      })
      .setOrigin(0.5)
    this.resultGroup.add([this.resultTitle, this.resultDetail])

    this.input.keyboard?.on('keydown-SPACE', () => this.handlePress())
    this.input.keyboard?.on('keydown-ENTER', () => this.handlePress())

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.removeAllListeners()
    })
  }

  private makeBar(
    x: number,
    y: number,
    width: number,
    height: number,
    color: number,
  ): Phaser.GameObjects.Rectangle {
    this.add.rectangle(x + width / 2, y, width, height, 0x0b1410).setOrigin(0.5, 0.5)
    this.add
      .rectangle(x + width / 2, y, width, height, 0x000000, 0)
      .setStrokeStyle(2, 0xffffff, 0.12)
      .setOrigin(0.5, 0.5)
    return this.add.rectangle(x, y, 0, height - 6, color).setOrigin(0, 0.5)
  }

  private makeButton(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    onClick: () => void,
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y)
    const background = this.add.graphics()
    background.fillStyle(0xe8b85c, 1)
    background.fillRoundedRect(-width / 2, -height / 2, width, height, 18)
    const text = this.add
      .text(0, 0, label, {
        fontFamily: FONT_BENGALI,
        fontSize: '24px',
        color: '#101B17',
        fontStyle: '700',
      })
      .setOrigin(0.5)

    container.add([background, text])

    const zone = this.add
      .zone(0, 0, width, height)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
    container.add(zone)

    zone.on('pointerover', () => {
      container.setScale(1.05)
    })
    zone.on('pointerout', () => {
      container.setScale(1)
    })
    zone.on('pointerdown', () => {
      container.setScale(0.96)
      onClick()
      this.time.delayedCall(90, () => container.setScale(1))
    })

    return container
  }

  /* --------------------------------------------------------------- logic */

  private handlePress(): void {
    if (this.finished || this.closing) {
      return
    }

    const outcome = registerCutHit(this.state)
    this.feedback.setText(outcome.message)
    this.feedback.setColor(outcome.kind === 'bad' ? '#C95745' : outcome.kind === 'perfect' ? '#9BE07A' : '#F3E8CF')

    if (outcome.kind === 'bad') {
      audioSystem.play('fail', 0.5)
      this.tweens.add({
        targets: this.panel,
        x: { from: -8, to: 8 },
        duration: 55,
        yoyo: true,
        repeat: 3,
      })
    } else {
      audioSystem.play('cut')
    }

    if (outcome.finished) {
      this.resolve(outcome.success)
    }
  }

  private resolve(success: boolean): void {
    this.finished = true
    const score = scoreCutChallenge(this.state)

    if (success) {
      audioSystem.play('success')
      this.feedback.setText('সিঁধ কাটা সফল!')
      this.feedback.setColor('#9BE07A')
      this.pressButton.setVisible(false)

      this.tweens.add({
        targets: this.progressFill,
        displayWidth: BAR.width,
        duration: 260,
        ease: 'Quad.easeOut',
      })

      this.time.delayedCall(1300, () => this.close('success', success, score))
      return
    }

    audioSystem.play('alert')
    this.cameras.main.shake(320, 0.008)
    this.feedback.setText('')
    this.pressButton.setVisible(false)

    this.resultTitle.setText('চোর! চোর! ধর!')
    this.resultTitle.setColor('#C95745')
    this.resultDetail.setText('ঘরের ভেতর থেকে ডাক উঠল! চোর ধরা পড়েছে।')
    this.resultGroup.setVisible(true)

    this.makeResultButton(PANEL.y + 300, 'আরেকবার চেষ্টা করি', () => {
      this.retry()
    })
    this.makeResultButton(PANEL.y + 364, 'পালিয়ে যাই', () => {
      this.close('failed', false, score)
    })
  }

  private makeResultButton(y: number, label: string, onClick: () => void): void {
    const button = this.makeButton(GAME_WIDTH / 2, y, 240, 52, label, onClick)
    this.resultGroup.add(button)
  }

  private retry(): void {
    this.state = createCutChallengeState()
    this.finished = false
    this.resultGroup.setVisible(false)
    this.pressButton.setVisible(true)
    this.feedback.setText('মার্কারটা মাঝখানে থাকলে চাপ দাও!')
    this.feedback.setColor('#F3E8CF')
    this.progressFill.setDisplaySize(0, 16)
    this.noiseFill.setDisplaySize(0, 16)
  }

  private close(outcome: 'success' | 'failed', success: boolean, score: number): void {
    if (this.closing) {
      return
    }
    this.closing = true

    const result: CutResult = {
      success,
      headline: success ? 'সিঁধ কাটা সফল!' : 'চোর! চোর! ধর!',
      detail: success
        ? 'এবার পরের ধাপ — ঘরের ভেতর অভিযান।'
        : 'গ্রাম জেগে উঠেছে। একটু পরে আবার চেষ্টা করো।',
      score,
      hits: this.state.hits,
    }

    this.game.events.emit(GAME_EVENTS.cutFinished, result)
    this.game.events.emit(GAME_EVENTS.cutClosed, { outcome })
    this.scene.stop()
    this.scene.resume(SCENE_KEYS.village)
  }

  update(_time: number, delta: number): void {
    if (this.finished) {
      return
    }

    updateCutChallenge(this.state, delta / 1000)

    this.progressFill.setDisplaySize((this.state.progress / 100) * BAR.width, 16)
    this.noiseFill.setDisplaySize((this.state.noise / 100) * BAR.width, 16)
    this.progressLabel.setText(`${Math.round(this.state.progress)}%`)
    this.noiseLabel.setText(`${Math.round(this.state.noise)}%`)
    this.marker.x = BAR.x + this.state.marker * BAR.width

    if (this.state.finished) {
      this.resolve(this.state.success)
    }
  }
}
