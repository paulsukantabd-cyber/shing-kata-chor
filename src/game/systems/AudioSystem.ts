/**
 * Procedural audio engine.
 *
 * Every sound in the game is synthesised with the Web Audio API, so the build
 * stays asset-free and loads instantly on slow mobile connections.
 * The system is intentionally framework agnostic: both the Vue UI and the
 * Phaser scenes talk to the same singleton.
 *
 * Audio only starts after a real user gesture (browser autoplay policy).
 */

export type SoundName =
  | 'ui'
  | 'uiBack'
  | 'uiToggle'
  | 'footstep'
  | 'sneeze'
  | 'slip'
  | 'cut'
  | 'success'
  | 'fail'
  | 'alert'
  | 'bark'

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext }

class AudioSystem {
  private context: AudioContext | null = null
  private master: GainNode | null = null
  private noiseBuffer: AudioBuffer | null = null
  private ambienceNodes: AudioNode[] = []
  private ambienceTimer: number | null = null
  private enabled = true
  private ambienceEnabled = true
  private unlocked = false

  /** Creates (or resumes) the audio context. Must be called from a user gesture. */
  unlock(): void {
    if (typeof window === 'undefined') {
      return
    }

    if (!this.context) {
      const Ctor = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext
      if (!Ctor) {
        return
      }

      try {
        this.context = new Ctor()
      } catch {
        this.context = null
        return
      }

      this.master = this.context.createGain()
      this.master.gain.value = this.enabled ? 0.55 : 0
      this.master.connect(this.context.destination)
      this.noiseBuffer = this.createNoiseBuffer(this.context)
    }

    if (this.context.state === 'suspended') {
      void this.context.resume()
    }

    this.unlocked = true
  }

  setEnabled(value: boolean): void {
    this.enabled = value
    if (this.master && this.context) {
      this.master.gain.setTargetAtTime(value ? 0.55 : 0, this.context.currentTime, 0.05)
    }
    if (!value) {
      this.stopAmbience()
    }
  }

  setAmbienceEnabled(value: boolean): void {
    this.ambienceEnabled = value
    if (!value) {
      this.stopAmbience()
    }
  }

  get isEnabled(): boolean {
    return this.enabled
  }

  get isReady(): boolean {
    return this.unlocked && this.context !== null
  }

  play(name: SoundName, intensity = 1): void {
    if (!this.enabled || !this.context || !this.master) {
      return
    }

    const ctx = this.context
    if (ctx.state === 'suspended') {
      void ctx.resume()
    }

    switch (name) {
      case 'ui':
        this.blip(ctx, 660, 880, 0.09, 'triangle', 0.22 * intensity)
        break
      case 'uiBack':
        this.blip(ctx, 520, 340, 0.11, 'triangle', 0.2 * intensity)
        break
      case 'uiToggle':
        this.blip(ctx, 480, 720, 0.08, 'square', 0.12 * intensity)
        break
      case 'footstep':
        this.footstep(intensity)
        break
      case 'sneeze':
        this.sneeze()
        break
      case 'slip':
        this.slip()
        break
      case 'cut':
        this.scrape()
        break
      case 'success':
        this.successChime()
        break
      case 'fail':
        this.failureSting()
        break
      case 'alert':
        this.villageAlarm()
        break
      case 'bark':
        this.dogBark()
        break
    }
  }

  startAmbience(): void {
    if (!this.enabled || !this.ambienceEnabled || !this.context || !this.master) {
      return
    }
    if (this.ambienceNodes.length > 0) {
      return
    }

    const ctx = this.context
    const wind = ctx.createBufferSource()
    wind.buffer = this.noiseBuffer
    wind.loop = true

    const windFilter = ctx.createBiquadFilter()
    windFilter.type = 'lowpass'
    windFilter.frequency.value = 380
    windFilter.Q.value = 0.6

    const windGain = ctx.createGain()
    windGain.gain.value = 0.055

    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.09
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 0.02
    lfo.connect(lfoGain)
    lfoGain.connect(windGain.gain)
    lfo.start()

    wind.connect(windFilter)
    windFilter.connect(windGain)
    windGain.connect(this.master)
    wind.start()

    this.ambienceNodes.push(wind, windFilter, windGain, lfo, lfoGain)

    // Crickets + the occasional distant dog. Scheduled with a 1s heartbeat.
    this.ambienceTimer = window.setInterval(() => {
      if (!this.enabled || !this.ambienceEnabled) {
        return
      }
      if (Math.random() < 0.55) {
        this.cricket()
      }
      if (Math.random() < 0.05) {
        this.dogBark()
      }
    }, 1000)
  }

  stopAmbience(): void {
    if (this.ambienceTimer !== null) {
      window.clearInterval(this.ambienceTimer)
      this.ambienceTimer = null
    }

    for (const node of this.ambienceNodes) {
      try {
        if ('stop' in node && typeof node.stop === 'function') {
          node.stop()
        }
        node.disconnect()
      } catch {
        /* ignore */
      }
    }
    this.ambienceNodes = []
  }

  dispose(): void {
    this.stopAmbience()
    if (this.context) {
      void this.context.close().catch(() => undefined)
    }
    this.context = null
    this.master = null
    this.noiseBuffer = null
    this.unlocked = false
  }

  // ---------------------------------------------------------------- helpers

  private createNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const length = Math.floor(ctx.sampleRate * 2)
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < length; i += 1) {
      data[i] = Math.random() * 2 - 1
    }
    return buffer
  }

  private blip(
    ctx: AudioContext,
    from: number,
    to: number,
    duration: number,
    type: OscillatorType,
    peak: number,
    delay = 0,
  ): void {
    const start = ctx.currentTime + delay
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = type
    osc.frequency.setValueAtTime(from, start)
    osc.frequency.exponentialRampToValueAtTime(Math.max(to, 1), start + duration)

    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), start + duration * 0.25)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)

    osc.connect(gain)
    gain.connect(this.master as GainNode)
    osc.start(start)
    osc.stop(start + duration + 0.02)
  }

  private noiseBurst(
    duration: number,
    filterType: BiquadFilterType,
    from: number,
    to: number,
    peak: number,
    delay = 0,
  ): void {
    if (!this.context || !this.master || !this.noiseBuffer) {
      return
    }
    const ctx = this.context
    const start = ctx.currentTime + delay

    const source = ctx.createBufferSource()
    source.buffer = this.noiseBuffer

    const filter = ctx.createBiquadFilter()
    filter.type = filterType
    filter.frequency.setValueAtTime(from, start)
    filter.frequency.exponentialRampToValueAtTime(Math.max(to, 40), start + duration)
    filter.Q.value = 1.1

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), start + duration * 0.2)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)

    source.connect(filter)
    filter.connect(gain)
    gain.connect(this.master)
    source.start(start)
    source.stop(start + duration + 0.02)
  }

  private footstep(intensity: number): void {
    this.noiseBurst(0.07, 'bandpass', 520 + Math.random() * 220, 240, 0.16 * intensity)
  }

  private sneeze(): void {
    this.noiseBurst(0.22, 'bandpass', 900, 2800, 0.3)
    this.blip(this.context as AudioContext, 180, 90, 0.18, 'sawtooth', 0.1)
  }

  private slip(): void {
    this.noiseBurst(0.3, 'highpass', 900, 2600, 0.12)
    this.blip(this.context as AudioContext, 420, 260, 0.26, 'triangle', 0.09)
  }

  private scrape(): void {
    this.noiseBurst(0.12, 'bandpass', 2400, 1400, 0.14)
  }

  private successChime(): void {
    const ctx = this.context as AudioContext
    this.blip(ctx, 523, 523, 0.16, 'triangle', 0.2, 0)
    this.blip(ctx, 659, 659, 0.16, 'triangle', 0.2, 0.1)
    this.blip(ctx, 784, 784, 0.3, 'triangle', 0.22, 0.2)
  }

  private failureSting(): void {
    const ctx = this.context as AudioContext
    this.blip(ctx, 320, 70, 0.55, 'sawtooth', 0.22, 0)
    this.noiseBurst(0.45, 'lowpass', 900, 200, 0.2, 0.02)
  }

  private villageAlarm(): void {
    const ctx = this.context as AudioContext
    this.blip(ctx, 880, 880, 0.12, 'square', 0.16, 0)
    this.blip(ctx, 660, 660, 0.12, 'square', 0.16, 0.16)
    this.blip(ctx, 880, 880, 0.12, 'square', 0.16, 0.34)
    this.blip(ctx, 660, 660, 0.22, 'square', 0.16, 0.52)
    this.failureSting()
  }

  private dogBark(): void {
    const ctx = this.context as AudioContext
    this.blip(ctx, 300, 150, 0.12, 'square', 0.1, 0)
    this.blip(ctx, 260, 120, 0.14, 'square', 0.09, 0.18)
  }

  private cricket(): void {
    const ctx = this.context as AudioContext
    const base = 3600 + Math.random() * 900
    for (let i = 0; i < 3; i += 1) {
      this.blip(ctx, base, base, 0.035, 'sine', 0.028, i * 0.075)
    }
  }
}

export const audioSystem = new AudioSystem()
