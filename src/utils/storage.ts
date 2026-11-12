import { STORAGE_NAMESPACE } from '../game/config/constants'

/**
 * Namespaced, failure-safe localStorage helpers.
 * Private-mode browsers can throw on access, so every call is guarded.
 */
export function storageKey(key: string): string {
  return `${STORAGE_NAMESPACE}:${key}`
}

export function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback
  }

  try {
    const raw = window.localStorage.getItem(storageKey(key))
    if (!raw) {
      return fallback
    }
    const parsed: unknown = JSON.parse(raw)
    if (parsed === null || parsed === undefined) {
      return fallback
    }
    return parsed as T
  } catch {
    return fallback
  }
}

export function saveJson<T>(key: string, value: T): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(storageKey(key), JSON.stringify(value))
  } catch {
    /* Storage is unavailable (private mode / quota). The game keeps running. */
  }
}

export function removeStored(key: string): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.removeItem(storageKey(key))
  } catch {
    /* ignore */
  }
}
