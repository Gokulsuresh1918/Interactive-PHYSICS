import type { Nature } from '../data/samples'
import { phDistance } from './chemistry'

/** All scoring values live here so they are easy to tune. */
export const POINTS = {
  nature: 10,
  ph: 10,
  phClose: 5,
  identity: 15,
  hintPenalty: 5,
  identityMin: 5,
  noHintBonus: 5,
}

export type Outcome = 'correct' | 'close' | 'wrong'
export type QuestionKind = 'nature' | 'ph' | 'identity' | 'bonus'

export interface QuestionResult {
  kind: QuestionKind
  outcome: Outcome
  points: number
}

export function scoreNature(guess: Nature, actual: Nature): QuestionResult {
  const ok = guess === actual
  return { kind: 'nature', outcome: ok ? 'correct' : 'wrong', points: ok ? POINTS.nature : 0 }
}

/** Within 1 pH unit of the accepted range = correct; within 2 = close. */
export function scorePh(guess: number, range: [number, number]): QuestionResult {
  const d = phDistance(guess, range)
  if (d <= 1) return { kind: 'ph', outcome: 'correct', points: POINTS.ph }
  if (d <= 2) return { kind: 'ph', outcome: 'close', points: POINTS.phClose }
  return { kind: 'ph', outcome: 'wrong', points: 0 }
}

export function identityValue(hintsUsed: number) {
  return Math.max(POINTS.identityMin, POINTS.identity - hintsUsed * POINTS.hintPenalty)
}

export function scoreIdentity(guess: string, actual: string, hintsUsed: number): QuestionResult[] {
  const ok = guess === actual
  const results: QuestionResult[] = [
    { kind: 'identity', outcome: ok ? 'correct' : 'wrong', points: ok ? identityValue(hintsUsed) : 0 },
  ]
  if (ok && hintsUsed === 0) {
    results.push({ kind: 'bonus', outcome: 'correct', points: POINTS.noHintBonus })
  }
  return results
}

const RANKS = [
  { min: 0, title: 'Lab Rookie' },
  { min: 40, title: 'Junior Chemist' },
  { min: 100, title: 'Indicator Expert' },
  { min: 180, title: 'pH Pro' },
  { min: 280, title: 'Chemistry Detective' },
]

/** Friendly rank title shown under the student's name. */
export function rankFor(score: number) {
  return [...RANKS].reverse().find((r) => score >= r.min)!.title
}
