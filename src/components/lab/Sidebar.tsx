import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { CheckCircle2, Flame, LogOut, Trophy } from 'lucide-react'
import { AnimatedNumber } from '../common/AnimatedNumber'
import { Avatar } from '../common/Avatar'
import { Modal } from '../common/Modal'
import { Tip } from '../common/Tip'
import { Leaderboard } from '../classroom/Leaderboard'
import { RankToasts } from '../classroom/RankToasts'
import { useRankEvents } from '../classroom/useRankEvents'
import { useSession } from '../../state/session'
import { rankFor } from '../../lib/scoring'
import { TOPIC_BY_ID } from '../../topics/registry'
import type { TopicId } from '../../topics/types'
import './sidebar.css'

/** Persistent scoreboard + class leaderboard: always visible while experimenting. */
export function Sidebar({ topic, onSwitchStudent }: { topic: TopicId; onSwitchStudent: () => void }) {
  const { state, profile, leaderboard } = useSession()
  const reduce = useReducedMotion()
  const [gains, setGains] = useState<{ id: number; pts: number }[]>([])
  const prevScore = useRef(state.score)
  const prevStreak = useRef(state.streak)
  const [streakPulse, setStreakPulse] = useState(0)
  const [boardOpen, setBoardOpen] = useState(false)
  const { toasts, boost } = useRankEvents(leaderboard, profile?.id ?? null)

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

  const meta = TOPIC_BY_ID[topic]
  const done = meta.countDone(state.answered)
  const pct = Math.round((done / meta.total) * 100)
  const me = leaderboard.find((e) => e.id === profile?.id)

  return (
    <aside className="sidebar" aria-label="Scoreboard">
      <div className="sb-profile">
        <motion.span
          key={profile?.seed}
          initial={{ scale: 0.6, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 14 }}
        >
          <Avatar seed={profile?.seed ?? state.name} name={state.name} size={48} ring />
        </motion.span>
        <div className="sb-who">
          <span className="sb-name">{state.name}</span>
          <motion.span key={rankFor(state.score)} className="sb-rank" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
            {rankFor(state.score)}
          </motion.span>
        </div>
        <Tip label="Switch student">
          <button className="btn btn-icon btn-ghost sb-switch" onClick={onSwitchStudent} aria-label="Switch student">
            <LogOut size={17} />
          </button>
        </Tip>
      </div>

      <div className="sb-score">
        {!reduce && gains.length > 0 && (
          <motion.span
            key={gains[gains.length - 1].id}
            className="sb-flash"
            initial={{ opacity: 0.9, scale: 0.96 }}
            animate={{ opacity: 0, scale: 1.08 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            aria-hidden="true"
          />
        )}
        <span className="sb-score-label">
          <Trophy size={15} /> Score
          {me && <span className="sb-place">#{me.rank} in class</span>}
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
        <button className="sb-stat sb-board-btn" onClick={() => setBoardOpen(true)} aria-label="Open class leaderboard">
          <span className="sb-stat-icon sb-icon-gold">
            <Trophy size={18} />
          </span>
          <span className="sb-stat-value">#{me?.rank ?? '–'}</span>
          <span className="sb-stat-label">Rank</span>
        </button>
      </div>

      <div className="sb-progress" style={{ ['--topic' as string]: meta.color }}>
        <div className="sb-progress-head">
          <span>
            <meta.icon size={14} /> {meta.short} progress
          </span>
          <span>
            {done}/{meta.total}
          </span>
        </div>
        <div className="sb-progress-track">
          <motion.div className="sb-progress-fill" animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} />
        </div>
      </div>

      <div className="sb-board">
        <Leaderboard entries={leaderboard} activeId={profile?.id ?? null} boostId={boost?.id} boostKey={boost?.key} />
      </div>

      <Modal open={boardOpen} title="Class leaderboard" eyebrow="Top 10 on this computer" onClose={() => setBoardOpen(false)}>
        <Leaderboard entries={leaderboard} activeId={profile?.id ?? null} expanded />
        <p className="fine">Scores are saved in this browser only — everyone in the class plays on this device.</p>
      </Modal>
      <RankToasts toasts={toasts} />
    </aside>
  )
}
