import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react'
import type { ReactNode } from 'react'
import { SAMPLES } from '../data/samples'
import { MYSTERIES } from '../data/mysteries'
import type { QuestionResult } from '../lib/scoring'

/**
 * Classroom store (frontend only, one shared browser/device).
 *
 * - Every student has a profile, saved in localStorage.
 * - Entering the same name again continues that profile.
 * - A "run" holds the current attempt: score, streak and answered challenges.
 *   Each challenge can be scored once per run (no farming).
 * - "Play again" starts a new run; the leaderboard keeps each student's best run.
 */

/** litmus | ph | mystery for Acids & Bases, or a physics topic id. */
export type ChallengeCategory = string

export interface AnswerRecord {
  category: ChallengeCategory
  results: QuestionResult[]
  points: number
  given: Record<string, string | number>
}

export interface Run {
  score: number
  correct: number
  attempted: number
  streak: number
  bestStreak: number
  answered: Record<string, AnswerRecord>
  hints: Record<string, number>
}

export interface Profile {
  id: string
  name: string
  /** Avatar seed — stable for this student. */
  seed: string
  run: Run
  /** Best finished run so far. */
  best: number
  /** Leaderboard score = max(best, current run). */
  boardScore: number
  /** When boardScore last went up — earlier wins ties. */
  boardAt: number
  createdAt: number
}

interface Store {
  profiles: Record<string, Profile>
  activeId: string | null
  /** Bumped whenever a new run/student starts, to remount the lab. */
  sessionId: number
}

/** Shape the existing lab components already use. */
export interface SessionState extends Run {
  name: string
  sessionId: number
}

export interface LeaderboardEntry {
  id: string
  name: string
  seed: string
  score: number
  rank: number
}

type Action =
  | { type: 'start'; name: string }
  | { type: 'answer'; id: string; record: Omit<AnswerRecord, 'points'> }
  | { type: 'hint'; mysteryId: string; max: number }
  | { type: 'replay' }
  | { type: 'signOut' }
  | { type: 'clearAll' }
  | { type: 'sync'; store: Store }

const STORAGE_KEY = 'science-playground/classroom/v1'

const blankRun = (): Run => ({
  score: 0,
  correct: 0,
  attempted: 0,
  streak: 0,
  bestStreak: 0,
  answered: {},
  hints: {},
})

export const profileKey = (name: string) => name.trim().replace(/\s+/g, ' ').toLowerCase()

function updateActive(store: Store, fn: (p: Profile) => Profile): Store {
  const p = store.activeId ? store.profiles[store.activeId] : null
  if (!p) return store
  return { ...store, profiles: { ...store.profiles, [p.id]: fn(p) } }
}

function withBoard(p: Profile, now: number): Profile {
  const score = Math.max(p.best, p.run.score)
  return score > p.boardScore ? { ...p, boardScore: score, boardAt: now } : p
}

function reducer(store: Store, action: Action): Store {
  const now = Date.now()
  switch (action.type) {
    case 'sync':
      return action.store
    case 'start': {
      const name = action.name.trim().replace(/\s+/g, ' ')
      const id = profileKey(name)
      const existing = store.profiles[id]
      const profile: Profile = existing ?? {
        id,
        name,
        seed: id, // same name → same avatar
        run: blankRun(),
        best: 0,
        boardScore: 0,
        boardAt: now,
        createdAt: now,
      }
      return {
        profiles: { ...store.profiles, [id]: profile },
        activeId: id,
        sessionId: store.sessionId + 1,
      }
    }
    case 'replay':
      return {
        ...updateActive(store, (p) => ({ ...p, best: Math.max(p.best, p.run.score), run: blankRun() })),
        sessionId: store.sessionId + 1,
      }
    case 'signOut':
      return { ...store, activeId: null, sessionId: store.sessionId + 1 }
    case 'clearAll':
      return { profiles: {}, activeId: null, sessionId: store.sessionId + 1 }
    case 'hint':
      return updateActive(store, (p) => {
        if (p.run.answered[`mystery:${action.mysteryId}`]) return p
        const used = p.run.hints[action.mysteryId] ?? 0
        if (used >= action.max) return p
        return { ...p, run: { ...p.run, hints: { ...p.run.hints, [action.mysteryId]: used + 1 } } }
      })
    case 'answer':
      return updateActive(store, (p) => {
        // A challenge can only ever be scored once per run — no farming.
        if (p.run.answered[action.id]) return p
        let { score, correct, attempted, streak, bestStreak } = p.run
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
        const run: Run = {
          ...p.run,
          score,
          correct,
          attempted,
          streak,
          bestStreak,
          answered: { ...p.run.answered, [action.id]: { ...action.record, points } },
        }
        return withBoard({ ...p, run }, now)
      })
  }
}

function load(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const s = JSON.parse(raw) as Store
      if (s && typeof s.profiles === 'object') return { profiles: s.profiles, activeId: s.activeId ?? null, sessionId: 0 }
    }
  } catch {
    /* storage unavailable or corrupt — start fresh */
  }
  return { profiles: {}, activeId: null, sessionId: 0 }
}

export function rankProfiles(profiles: Record<string, Profile>): LeaderboardEntry[] {
  return Object.values(profiles)
    .sort((a, b) => b.boardScore - a.boardScore || a.boardAt - b.boardAt || a.name.localeCompare(b.name))
    .map((p, i) => ({ id: p.id, name: p.name, seed: p.seed, score: p.boardScore, rank: i + 1 }))
}

/* ---------------- Acids, Bases & pH progress ---------------- */

export const TOTAL_EXPERIMENTS = SAMPLES.length + MYSTERIES.length

export function countCompleted(answered: Record<string, AnswerRecord>) {
  const known = SAMPLES.filter((s) => answered[`litmus:${s.id}`] && answered[`ph:${s.id}`]).length
  const mystery = MYSTERIES.filter((m) => answered[`mystery:${m.id}`]).length
  return known + mystery
}

/* ---------------- Context ---------------- */

interface SessionApi {
  state: SessionState
  profile: Profile | null
  leaderboard: LeaderboardEntry[]
  /** Acids, Bases & pH experiments completed in this run. */
  completed: number
  start: (name: string) => void
  answer: (id: string, record: Omit<AnswerRecord, 'points'>) => void
  takeHint: (mysteryId: string, max: number) => void
  /** keepName = true: play again (new run). false: sign out (profile kept). */
  reset: (keepName: boolean) => void
  clearAll: () => void
  findProfile: (name: string) => Profile | null
}

const SessionContext = createContext<SessionApi | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [store, dispatch] = useReducer(reducer, undefined, load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ profiles: store.profiles, activeId: store.activeId }))
    } catch {
      /* ignore */
    }
  }, [store])

  // Keep two open tabs on the same device in step.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return
      const next = load()
      dispatch({ type: 'sync', store: { ...next, sessionId: store.sessionId } })
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [store.sessionId])

  const start = useCallback((name: string) => dispatch({ type: 'start', name }), [])
  const answer = useCallback(
    (id: string, record: Omit<AnswerRecord, 'points'>) => dispatch({ type: 'answer', id, record }),
    [],
  )
  const takeHint = useCallback(
    (mysteryId: string, max: number) => dispatch({ type: 'hint', mysteryId, max }),
    [],
  )
  const reset = useCallback((keepName: boolean) => dispatch({ type: keepName ? 'replay' : 'signOut' }), [])
  const clearAll = useCallback(() => {
    dispatch({ type: 'clearAll' })
    try {
      sessionStorage.clear()
    } catch {
      /* ignore */
    }
  }, [])

  const api = useMemo<SessionApi>(() => {
    const profile = store.activeId ? store.profiles[store.activeId] ?? null : null
    const run = profile?.run ?? blankRun()
    return {
      state: { ...run, name: profile?.name ?? '', sessionId: store.sessionId },
      profile,
      leaderboard: rankProfiles(store.profiles),
      completed: countCompleted(run.answered),
      start,
      answer,
      takeHint,
      reset,
      clearAll,
      findProfile: (name: string) => store.profiles[profileKey(name)] ?? null,
    }
  }, [store, start, answer, takeHint, reset, clearAll])

  return <SessionContext.Provider value={api}>{children}</SessionContext.Provider>
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used inside SessionProvider')
  return ctx
}
