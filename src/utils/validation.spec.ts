import { describe, expect, it } from 'vitest'
import { validatePlayerName, normalizePlayerName } from '../utils/validation'

describe('validatePlayerName', () => {
  it('accepts a Bengali name', () => {
    const result = validatePlayerName('রফিক')
    expect(result.valid).toBe(true)
    expect(result.error).toBeNull()
  })

  it('accepts an English name', () => {
    expect(validatePlayerName('Rafik').valid).toBe(true)
  })

  it('rejects an empty name', () => {
    const result = validatePlayerName('   ')
    expect(result.valid).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('trims surrounding whitespace before validating', () => {
    expect(normalizePlayerName('  রফিক  ')).toBe('রফিক')
    expect(validatePlayerName('  রফিক  ').valid).toBe(true)
  })

  it('rejects names longer than 20 characters', () => {
    expect(validatePlayerName('আ'.repeat(21)).valid).toBe(false)
    expect(validatePlayerName('আ'.repeat(20)).valid).toBe(true)
  })

  it('rejects names without any letters', () => {
    expect(validatePlayerName('1234').valid).toBe(false)
  })
})
