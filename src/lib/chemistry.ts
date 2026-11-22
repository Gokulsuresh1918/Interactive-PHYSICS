import type { Conductivity, Nature } from '../data/samples'

/**
 * Approximate universal indicator colours for pH 0–14.
 * Real indicator shades vary between brands and concentrations.
 */
export const PH_COLORS = [
  '#d0122d', // 0
  '#e3241c', // 1
  '#ef3e22', // 2  red
  '#f46a1f', // 3  orange-red
  '#f8951d', // 4  orange
  '#fbbf16', // 5  yellow-orange
  '#efe01f', // 6  yellow
  '#4cbb47', // 7  green
  '#12a08f', // 8  blue-green
  '#1f7ccc', // 9  blue
  '#2f52b0', // 10 deep blue
  '#5a3aa3', // 11 violet
  '#6b2b95', // 12 purple
  '#5c2186', // 13
  '#4b1773', // 14
]

const COLOR_NAMES = [
  'deep red', 'red', 'red', 'orange-red', 'orange', 'yellow-orange', 'yellow',
  'green', 'blue-green', 'blue', 'deep blue', 'violet', 'purple', 'purple', 'deep purple',
]

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgbToHex([r, g, b]: [number, number, number]) {
  return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
}

export function mixColors(a: string, b: string, t: number) {
  const ca = hexToRgb(a)
  const cb = hexToRgb(b)
  return rgbToHex([0, 1, 2].map((i) => ca[i] + (cb[i] - ca[i]) * t) as [number, number, number])
}

/** Universal indicator colour for a (possibly fractional) pH. */
export function phColor(ph: number) {
  const p = Math.max(0, Math.min(14, ph))
  const lo = Math.floor(p)
  const hi = Math.min(14, lo + 1)
  return mixColors(PH_COLORS[lo], PH_COLORS[hi], p - lo)
}

export function phColorName(ph: number) {
  return COLOR_NAMES[Math.max(0, Math.min(14, Math.round(ph)))]
}

export function natureLabel(n: Nature) {
  return n === 'acid' ? 'Acid' : n === 'base' ? 'Base' : 'Neutral'
}

export function formatPhRange([a, b]: [number, number]) {
  return a === b ? `≈ ${a}` : `≈ ${a}–${b}`
}

/** How far a guess is from the accepted range (0 = inside). */
export function phDistance(guess: number, [a, b]: [number, number]) {
  if (guess < a) return a - guess
  if (guess > b) return guess - b
  return 0
}

/* ---------------- Litmus ---------------- */

export type LitmusPaper = 'red' | 'blue'

export const LITMUS_COLORS: Record<LitmusPaper, { dry: string; wet: string }> = {
  red: { dry: '#e05a6e', wet: '#c43a52' },
  blue: { dry: '#5b8def', wet: '#3462c9' },
}

export interface LitmusOutcome {
  paper: LitmusPaper
  /** Colour of the wet end after the reaction. */
  resultPaper: LitmusPaper
  changed: boolean
}

/**
 * Acid: blue → red, red stays red.
 * Base: red → blue, blue stays blue.
 * Neutral: no change.
 */
export function litmusTest(paper: LitmusPaper, nature: Nature): LitmusOutcome {
  let resultPaper: LitmusPaper = paper
  if (nature === 'acid') resultPaper = 'red'
  if (nature === 'base') resultPaper = 'blue'
  return { paper, resultPaper, changed: resultPaper !== paper }
}

export function describeLitmus(o: LitmusOutcome) {
  const name = o.paper === 'red' ? 'Red litmus' : 'Blue litmus'
  return o.changed ? `${name} turned ${o.resultPaper}` : `${name} stayed ${o.paper} (no change)`
}

export function describeConductivity(c: Conductivity) {
  if (c === 'strong') return 'Bulb glowed brightly — conducts well'
  if (c === 'weak') return 'Bulb glowed dimly — conducts weakly'
  return 'Bulb stayed off — barely conducts'
}
