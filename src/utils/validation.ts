import { MAX_NAME_LENGTH } from '../game/config/character'

export interface NameValidation {
  valid: boolean
  /** Bengali error message, `null` when the name is acceptable. */
  error: string | null
}

/** Trims and collapses surrounding whitespace. */
export function normalizePlayerName(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim()
}

/**
 * Validates a player name.
 * Bengali and English names are both accepted; length is measured in
 * characters (Bengali glyphs are single code points).
 */
export function validatePlayerName(raw: string): NameValidation {
  const value = normalizePlayerName(raw)

  if (value.length === 0) {
    return { valid: false, error: 'নামটা লিখতেই হবে, চোর!' }
  }

  if (value.length > MAX_NAME_LENGTH) {
    return { valid: false, error: `নাম সর্বোচ্চ ${MAX_NAME_LENGTH} অক্ষরের হতে পারে।` }
  }

  if (!/\p{L}/u.test(value)) {
    return { valid: false, error: 'নামে অন্তত একটা অক্ষর লাগবে।' }
  }

  return { valid: true, error: null }
}
