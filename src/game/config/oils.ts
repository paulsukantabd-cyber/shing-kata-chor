/**
 * Preparation oils.
 *
 * These are intentionally fictional arcade "power-ups" with a comedic Bangladeshi
 * flavour. They are game mechanics only and carry no real-world meaning.
 */
export type OilId = 'mustard' | 'soybean' | 'kerosene' | 'mobile'
export type OilMechanic = 'boost' | 'balanced' | 'sneeze' | 'slip'

export interface OilDefinition {
  id: OilId
  /** Bengali name of the oil. */
  name: string
  /** Comedic effect name. */
  effect: string
  /** One line Bengali description. */
  description: string
  /** Label of the modified stat. */
  statLabel: string
  /** Formatted stat value. */
  statValue: string
  mechanic: OilMechanic
  /** Multiplier applied to walking speed. */
  speedMultiplier: number
  /** Multiplier applied to running speed. */
  runMultiplier: number
  /** Probability per second of a sneeze event (kerosene). */
  sneezeChance: number
  /** Extra slide distance factor (mobile oil). */
  slipFactor: number
  /** Accent colour used for the card artwork. */
  accent: string
  /** Secondary colour used for the card artwork. */
  accentSoft: string
}

export const OIL_DEFINITIONS: readonly OilDefinition[] = [
  {
    id: 'mustard',
    name: 'সরিষার তেল',
    effect: 'শক্তি বুস্ট',
    description: 'এক ছোঁয়ায় ভরী হয়ে যাও — পা যেন শক্ত হয়ে যায়।',
    statLabel: 'গতি',
    statValue: '+২৫%',
    mechanic: 'boost',
    speedMultiplier: 1.1,
    runMultiplier: 1.25,
    sneezeChance: 0,
    slipFactor: 0,
    accent: '#E8B85C',
    accentSoft: '#8a6a22',
  },
  {
    id: 'soybean',
    name: 'সয়াবিন তেল',
    effect: 'সুষম মোড',
    description: 'ঠিকঠাক সব। ভারসাম্য, কোনো না কোনো অদ্ভুত ঝাঁপ নেই।',
    statLabel: 'ভারসাম্য',
    statValue: 'স্থিতিশীল',
    mechanic: 'balanced',
    speedMultiplier: 1,
    runMultiplier: 1,
    sneezeChance: 0,
    slipFactor: 0,
    accent: '#A8C06A',
    accentSoft: '#5f7333',
  },
  {
    id: 'kerosene',
    name: 'কেরোসিন',
    effect: 'হাঁচির চক্র',
    description: 'হঠাৎ হাঁচি ধরে যায় — কখনো কখনো সব গুলিয়ে যায়।',
    statLabel: 'হাঁচির ঝুঁকি',
    statValue: 'বেশি',
    mechanic: 'sneeze',
    speedMultiplier: 1,
    runMultiplier: 1.02,
    sneezeChance: 0.14,
    slipFactor: 0,
    accent: '#C95745',
    accentSoft: '#7a2f24',
  },
  {
    id: 'mobile',
    name: 'মবিল',
    effect: 'পিছলে যাওয়া',
    description: 'মেঝেতে পা ফসকে যায়, দৌড়ালে দেড়ে যায়।',
    statLabel: 'পিছল',
    statValue: 'অনেক',
    mechanic: 'slip',
    speedMultiplier: 1.04,
    runMultiplier: 1.06,
    sneezeChance: 0,
    slipFactor: 1.9,
    accent: '#6FA8C7',
    accentSoft: '#2f5f78',
  },
] as const

export const OIL_BY_ID: Record<OilId, OilDefinition> = OIL_DEFINITIONS.reduce(
  (map, oil) => {
    map[oil.id] = oil
    return map
  },
  {} as Record<OilId, OilDefinition>,
)

export const DEFAULT_OIL_ID: OilId = 'soybean'

/** Funny lines the thief mutters while preparing. */
export const PREP_LINES: readonly string[] = [
  'আইজকা কপালে কী আছে কে জানে!',
  'এইবার কিন্তু সাবধানে!',
  'লুঙ্গিটা ঠিকমতো বাঁধছি তো?',
  'মোম, দরজাটা কি বন্ধ করে গেছ?',
  'চাঁদটা ভালো না উঠলে চুপিচুপি হবে না!',
  'আজকে পাড়ার সবাই ঘুমাচ্ছে না দেখি।',
  'একটু হালকা ভাবছি, ভারী ভাবলেই ধরা পড়ব।',
] as const
