import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { CheckCircle2, Flag, Flame, FlaskConical, Trophy } from 'lucide-react'
import { AnimatedNumber } from '../common/AnimatedNumber'
import { TOTAL_EXPERIMENTS, useSession } from '../../state/session'
import { rankFor } from '../../lib/scoring'
import './sidebar.css'

/** Persistent scoreboard: always visible while experimenting. */
export function Sidebar({ onFinish }: { onFinish: () => void }) {
  const { state, completed } = useSession()
  const reduce = useReducedMotion()
  const [gains, setGains] = useState<{ id: number; pts: number }[]>([])
  const prevScore = useRef(state.score)
  const prevStreak = useRef(state.streak)
  const [streakPulse, setStreakPulse] = useState(0)

  useEffect(() => {
    const diff = state.score - prevScore.current
    prevScore.current = state.score
    if (diff > 0) {
      const id = Date.now()
      setGains((g) => [...g, { id, pts: diff }])
      setTimeout(() => setGains((g) => g.filter((x) => x.id !== id)), 1600)
    }
  }, [state.score])

  useEffect(() => {
    if (state.streak > prevStreak.current) setStreakPulse((p) => p + 1)
    prevStreak.current = state.streak
  }, [state.streak])

  const pct = Math.round((completed / TOTAL_EXPERIMENTS) * 100)
  const rank = rankFor(state.score)
  const initial = state.name.charAt(0).toUpperCase()

  return (
    <aside className="sidebar glass" aria-label="Scoreboard">
      <div className="sb-profile">
        <span className="sb-avatar">{initial}</span>
        <div className="sb-who">
          <span className="sb-name">{state.name.toUpperCase()}</span>
          <motion.span key={rank} className="sb-rank" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
            {rank}
          </motion.span>
        </div>
      </div>

      <div className="sb-score">
        <span className="sb-score-label">
          <Trophy size={15} /> Score
        </span>
        <span className="sb-score-value" aria-live="polite">
          <AnimatedNumber value={state.score} />
        </span>
        <AnimatePresence>
          {!reduce &&
            gains.map((g) => (
              <motion.span
                key={g.id}
                className="sb-gain"
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: -18, scale: 1 }}
                exit={{ opacity: 0, y: -36 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                +{g.pts}
              </motion.span>
            ))}
        </AnimatePresence>
      </div>

      <div className="sb-stats">
        <div className={`sb-stat sb-streak${state.streak > 0 ? ' is-hot' : ''}`}>
          <motion.span
            key={streakPulse}
            className="sb-stat-icon"
            animate={streakPulse && !reduce ? { scale: [1, 1.5, 1], rotate: [0, -12, 0] } : undefined}
            transition={{ duration: 0.5 }}
          >
            <Flame size={18} />
          </motion.span>
          <span className="sb-stat-value">{state.streak}</span>
          <span className="sb-stat-label">Streak</span>
        </div>
        <div className="sb-stat">
          <span className="sb-stat-icon sb-icon-good">
            <CheckCircle2 size={18} />
          </span>
          <span className="sb-stat-value">{state.correct}</span>
          <span className="sb-stat-label">Correct</span>
        </div>
        <div className="sb-stat">
          <span className="sb-stat-icon sb-icon-accent">
            <FlaskConical size={18} />
          </span>
          <span className="sb-stat-value">
            {completed}/{TOTAL_EXPERIMENTS}
          </span>
          <span className="sb-stat-label">Experiments</span>
        </div>
      </div>

      <div className="sb-progress">
        <div className="sb-progress-head">
          <span>Lab progress</span>
          <span>{pct}%</span>
        </div>
        <div className="sb-progress-track">
          <motion.div className="sb-progress-fill" animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} />
        </div>
        <p className="sb-best">Best streak: {state.bestStreak}</p>
      </div>

      <button className={`btn sb-finish${completed === TOTAL_EXPERIMENTS ? ' btn-primary' : ''}`} onClick={onFinish}>
        <Flag size={16} /> {completed === TOTAL_EXPERIMENTS ? 'See my results' : 'Finish session'}
      </button>
    </aside>
  )
}
