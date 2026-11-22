/**
 * Tiny generated sound effects (Web Audio API) — no audio files needed.
 * Nothing plays until the student interacts, and everything is quiet.
 */

let ctx: AudioContext | null = null
let enabled = true
const MASTER = 0.5

const listeners = new Set<(on: boolean) => void>()

export function setSoundEnabled(on: boolean) {
  enabled = on
  listeners.forEach((l) => l(on))
}

export function soundEnabled() {
  return enabled
}

/** Subscribe to the global sound toggle (used to stop continuous tones when muted). */
export function onSoundToggle(fn: (on: boolean) => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

function audio(): AudioContext | null {
  if (!enabled) return null
  try {
    if (!ctx) ctx = new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

interface ToneOpts {
  freq: number
  to?: number
  dur: number
  type?: OscillatorType
  gain?: number
  delay?: number
}

function tone({ freq, to, dur, type = 'sine', gain = 0.08, delay = 0 }: ToneOpts) {
  const a = audio()
  if (!a) return
  const t = a.currentTime + delay
  const osc = a.createOscillator()
  const g = a.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(gain * MASTER, t + 0.015)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(g).connect(a.destination)
  osc.start(t)
  osc.stop(t + dur + 0.05)
}

function noise(dur: number, from: number, to: number, gain = 0.05, delay = 0) {
  const a = audio()
  if (!a) return
  const t = a.currentTime + delay
  const len = Math.floor(a.sampleRate * dur)
  const buf = a.createBuffer(1, len, a.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  const src = a.createBufferSource()
  src.buffer = buf
  const filter = a.createBiquadFilter()
  filter.type = 'bandpass'
  filter.Q.value = 1.2
  filter.frequency.setValueAtTime(from, t)
  filter.frequency.exponentialRampToValueAtTime(to, t + dur)
  const g = a.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(gain * MASTER, t + dur * 0.2)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(filter).connect(g).connect(a.destination)
  src.start(t)
}

export const sfx = {
  click: () => tone({ freq: 660, to: 880, dur: 0.06, type: 'triangle', gain: 0.05 }),
  select: () => {
    tone({ freq: 520, to: 780, dur: 0.12, type: 'sine', gain: 0.07 })
    tone({ freq: 1040, dur: 0.08, type: 'sine', gain: 0.03, delay: 0.05 })
  },
  pour: () => noise(0.9, 400, 1600, 0.06),
  dip: () => {
    noise(0.25, 900, 300, 0.05)
    tone({ freq: 300, to: 180, dur: 0.18, gain: 0.04 })
  },
  drop: (delay = 0) => tone({ freq: 1200, to: 380, dur: 0.14, type: 'sine', gain: 0.08, delay }),
  reaction: () => {
    ;[523, 659, 784, 1047].forEach((f, i) =>
      tone({ freq: f, dur: 0.5, type: 'sine', gain: 0.03, delay: i * 0.07 }),
    )
  },
  buzz: (strength: number) => {
    if (strength <= 0) return tone({ freq: 90, dur: 0.15, type: 'square', gain: 0.01 })
    tone({ freq: 120, dur: 0.5, type: 'sawtooth', gain: 0.015 * strength })
    tone({ freq: 880, to: 1320, dur: 0.25, gain: 0.03 * strength, delay: 0.05 })
  },
  correct: () => {
    tone({ freq: 660, dur: 0.14, type: 'triangle', gain: 0.08 })
    tone({ freq: 880, dur: 0.14, type: 'triangle', gain: 0.08, delay: 0.1 })
    tone({ freq: 1320, dur: 0.3, type: 'triangle', gain: 0.07, delay: 0.2 })
  },
  close: () => {
    tone({ freq: 587, dur: 0.15, type: 'triangle', gain: 0.07 })
    tone({ freq: 740, dur: 0.25, type: 'triangle', gain: 0.06, delay: 0.12 })
  },
  wrong: () => {
    tone({ freq: 392, to: 330, dur: 0.25, type: 'sine', gain: 0.06 })
    tone({ freq: 294, dur: 0.3, type: 'sine', gain: 0.05, delay: 0.15 })
  },
  tick: () => tone({ freq: 1600, dur: 0.03, type: 'square', gain: 0.012 }),
  hint: () => tone({ freq: 440, to: 660, dur: 0.25, type: 'sine', gain: 0.05 }),
  fanfare: () => {
    ;[523, 659, 784, 1047, 1319].forEach((f, i) =>
      tone({ freq: f, dur: 0.35, type: 'triangle', gain: 0.06, delay: i * 0.11 }),
    )
  },
}

/** A continuous, adjustable tone for the sound lab. Quiet by design. */
export function createTone(freq: number, volume: number) {
  const a = audio()
  if (!a) return null
  const osc = a.createOscillator()
  const g = a.createGain()
  osc.type = 'sine'
  osc.frequency.value = freq
  g.gain.setValueAtTime(0.0001, a.currentTime)
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume * 0.12 * MASTER), a.currentTime + 0.08)
  osc.connect(g).connect(a.destination)
  osc.start()
  return {
    set(f: number, v: number) {
      osc.frequency.setTargetAtTime(f, a.currentTime, 0.03)
      g.gain.setTargetAtTime(Math.max(0.0002, v * 0.12 * MASTER), a.currentTime, 0.03)
    },
    stop() {
      g.gain.setTargetAtTime(0.0001, a.currentTime, 0.04)
      osc.stop(a.currentTime + 0.2)
    },
  }
}
