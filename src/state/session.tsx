import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react'
import type { ReactNode } from 'react'
import { SAMPLES } from '../data/samples'
import { MYSTERIES } from '../data/mysteries'
import type { QuestionResult } from '../lib/scoring'

export type ChallengeCategory = 'litmus' | 'ph' | 'mystery'

export interface AnswerRecord {
  category: ChallengeCategory
  results: QuestionResult[]
  points: number
  /** What the student submitted, for showing the outcome again later. */
  given: Record<string, string | number>
}

export interface SessionState {
  name: string
  sessionId: number
  score: number
  correct: number
  attempted: number
  streak: number
  bestStreak: number
  answered: Record<string, AnswerRecord>
  hints: Record<string, number>
}

type Action =
  | { type: 'start'; name: string }
  | { type: 'answer'; id: string; record: Omit<AnswerRecord, 'points'> }
  | { type: 'hint'; mysteryId: string; max: number }
  | { type: 'reset'; keepName: boolean }

const STORAGE_KEY = 'science-playground/session'

const blank = (name: string, sessionId: number): SessionState => ({
  name,
  sessionId,
  score: 0,
  correct: 0,
  attempted: 0,
  streak: 0,
  bestStreak: 0,
  answered: {},
  hints: {},
})

function reducer(state: SessionState, action: Action): SessionState {
  switch (action.type) {
    case 'start':
      return blank(action.name, state.sessionId + 1)
    case 'reset':
      return blank(action.keepName ? state.name : '', state.sessionId + 1)
    case 'hint': {
      if (state.answered[`mystery:${action.mysteryId}`]) return state
      const used = state.hints[action.mysteryId] ?? 0
      if (used >= action.max) return state
      return { ...state, hints: { ...state.hints, [action.mysteryId]: used + 1 } }
    }
    case 'answer': {
      // A challenge can only ever be scored once — no farming.
      if (state.answered[action.id]) return state
      let { score, correct, attempted, streak, bestStreak } = state
      let points = 0
      for (const r of action.record.results) {
        points += r.points
        if (r.kind === 'bonus') continue
        attempted += 1
        if (r.outcome === 'correct') {
          correct += 1
          streak += 1
          bestStreak = Math.max(bestStreak, streak)
        } else if (r.outcome === 'wrong') {
          streak = 0
        }
      }
      score += points
      return {
        ...state,
        score,
        correct,
        attempted,
        streak,
        bestStreak,
        answered: { ...state.answered, [action.id]: { ...action.record, points } },
      }
    }
  }
}

function load(): SessionState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) return { ...blank('', 0), ...JSON.parse(raw) }
  } catch {
    /* storage unavailable — start fresh */
  }
  return blank('', 0)
}

export const TOTAL_EXPERIMENTS = SAMPLES.length + MYSTERIES.length

export function countCompleted(answered: Record<string, AnswerRecord>) {
  const known = SAMPLES.filter((s) => answered[`litmus:${s.id}`] && answered[`ph:${s.id}`]).length
  const mystery = MYSTERIES.filter((m) => answered[`mystery:${m.id}`]).length
  return known + mystery
}

interface SessionApi {
  state: SessionState
  completed: number
  start: (name: string) => void
  answer: (id: string, record: Omit<AnswerRecord, 'points'>) => void
  takeHint: (mysteryId: string, max: number) => void
  reset: (keepName: boolean) => void
}

const SessionContext = createContext<SessionApi | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* ignore */
    }
  }, [state])

  const start = useCallback((name: string) => dispatch({ type: 'start', name }), [])
  const answer = useCallback(
    (id: string, record: Omit<AnswerRecord, 'points'>) => dispatch({ type: 'answer', id, record }),
    [],
  )
  const takeHint = useCallback(
    (mysteryId: string, max: number) => dispatch({ type: 'hint', mysteryId, max }),
    [],
  )
  const reset = useCallback((keepName: boolean) => dispatch({ type: 'reset', keepName }), [])

  const api = useMemo(
    () => ({ state, completed: countCompleted(state.answered), start, answer, takeHint, reset }),
    [state, start, answer, takeHint, reset],
  )
  return <SessionContext.Provider value={api}>{children}</SessionContext.Provider>
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used inside SessionProvider')
  return ctx
}
