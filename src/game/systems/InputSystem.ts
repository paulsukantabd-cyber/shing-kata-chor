import { KEY_BINDINGS } from '../config/constants'

/**
 * Unified input layer.
 *
 * Desktop keyboard and the on-screen touch pad both feed the same tiny state
 * object, so the gameplay code never needs to know where a command came from.
 */
export type InputAction = 'left' | 'right' | 'run' | 'action' | 'pause'

const CODE_TO_ACTION = new Map<string, InputAction>()

for (const [action, codes] of Object.entries(KEY_BINDINGS)) {
  for (const code of codes) {
    CODE_TO_ACTION.set(code, action as InputAction)
  }
}

/** Keys we swallow so the page never scrolls while playing. */
const SWALLOWED_CODES = new Set([
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Space',
])

class InputSystem {
  private virtual = new Set<InputAction>()
  private keyboard = new Set<InputAction>()
  /** Edge-triggered presses, consumed by the gameplay loop. */
  private pressedLatch = new Set<InputAction>()
  private detachHandlers: Array<() => void> = []
  private pauseHandlers = new Set<() => void>()

  /** Starts listening to the keyboard. Safe to call once per scene boot. */
  attach(): void {
    if (typeof window === 'undefined' || this.detachHandlers.length > 0) {
      return
    }

    const onKeyDown = (event: KeyboardEvent): void => {
      const action = CODE_TO_ACTION.get(event.code)
      if (!action) {
        return
      }

      if (SWALLOWED_CODES.has(event.code)) {
        event.preventDefault()
      }

      if (action === 'pause') {
        if (!event.repeat) {
          this.pauseHandlers.forEach((handler) => handler())
        }
        return
      }

      this.keyboard.add(action)
      this.pressedLatch.add(action)
    }

    const onKeyUp = (event: KeyboardEvent): void => {
      const action = CODE_TO_ACTION.get(event.code)
      if (action) {
        this.keyboard.delete(action)
      }
    }

    const onBlur = (): void => {
      this.keyboard.clear()
      this.virtual.clear()
      this.pressedLatch.clear()
    }

    window.addEventListener('keydown', onKeyDown, { passive: false })
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)

    this.detachHandlers = [
      () => window.removeEventListener('keydown', onKeyDown),
      () => window.removeEventListener('keyup', onKeyUp),
      () => window.removeEventListener('blur', onBlur),
    ]
  }

  /** Removes every listener registered by {@link attach}. */
  detach(): void {
    this.detachHandlers.forEach((off) => off())
    this.detachHandlers = []
    this.keyboard.clear()
    this.virtual.clear()
    this.pressedLatch.clear()
  }

  isDown(action: InputAction): boolean {
    return this.keyboard.has(action) || this.virtual.has(action)
  }

  /**
   * Edge-triggered check: returns `true` once for every fresh press of the
   * action, so a quick tap is never swallowed between two frames.
   */
  isPressed(action: InputAction): boolean {
    if (!this.pressedLatch.has(action)) {
      return false
    }
    this.pressedLatch.delete(action)
    return true
  }

  /** Called by the touch pad. */
  setVirtual(action: InputAction, pressed: boolean): void {
    if (pressed) {
      if (!this.virtual.has(action)) {
        this.pressedLatch.add(action)
      }
      this.virtual.add(action)
    } else {
      this.virtual.delete(action)
    }
  }

  releaseAll(): void {
    this.virtual.clear()
    this.keyboard.clear()
    this.pressedLatch.clear()
  }

  onPause(handler: () => void): () => void {
    this.pauseHandlers.add(handler)
    return () => this.pauseHandlers.delete(handler)
  }
}

export const inputSystem = new InputSystem()
