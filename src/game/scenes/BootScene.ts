import Phaser from 'phaser'
import { createCharacterTextures } from '../assets/characterTextures'
import { createVillageTextures } from '../assets/villageTextures'
import type { CharacterConfig } from '../config/character'
import type { OilDefinition } from '../config/oils'
import { ensureFontsLoaded } from '../../utils/fonts'

export const SCENE_KEYS = {
  boot: 'BootScene',
  village: 'VillageScene',
  cut: 'CutScene',
} as const

const FALLBACK_CONFIG: CharacterConfig = {
  name: 'রফিক',
  lungi: 'blueCheck',
  moustache: true,
  gamcha: true,
}

/**
 * Generates every texture the game needs (painted village + baked character)
 * before handing over to the village scene.
 */
export default class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENE_KEYS.boot)
  }

  async create(): Promise<void> {
    await ensureFontsLoaded()

    createVillageTextures(this)

    const config = (this.registry.get('playerConfig') as CharacterConfig | undefined) ?? FALLBACK_CONFIG
    const oil = this.registry.get('oil') as OilDefinition | undefined

    await createCharacterTextures(this, config)

    this.scene.start(SCENE_KEYS.village, { config, oil })
  }
}
