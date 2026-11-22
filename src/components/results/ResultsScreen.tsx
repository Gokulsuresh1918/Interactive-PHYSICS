import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { FlaskConical, Home, RotateCcw, ArrowLeft } from 'lucide-react'
import { AnimatedNumber } from '../common/AnimatedNumber'
import { TOTAL_EXPERIMENTS, useSession } from '../../state/session'
import type { AnswerRecord, ChallengeCategory } from '../../state/session'
import { sfx } from '../../lib/sound'
import { rankFor } from '../../lib/scoring'
import './results.css'

type Tier = 'gold' | 'silver' | 'bronze' | 'start'

const TIER_INFO: Record<Tier, { badge: string; colors: [string, string] }> = {
  gold: { badge: 'Chemistry Detective', colors: ['#ffe27a', '#f0a81c'] },
  silver: { badge: 'Sharp Observer', colors: ['#eef4fb', '#8fa9c6'] },
  bronze: { badge: 'Curious Experimenter', colors: ['#ffc59a', '#c8763c'] },
  start: { badge: 'Lab Explorer', colors: ['#bfe9ff', '#2a8cf0'] },
}

const CATEGORY_NAME: Record<ChallengeCategory, string> = {
  litmus: 'Litmus reading',
  ph: 'pH estimation',
  mystery: 'Mystery solving',
}

const PRACTICE_TIP: Record<ChallengeCategory, string> = {
  litmus: 'test both red and blue strips, then check which one changed colour.',
  ph: 'compare the beaker colour with the pH scale cell by cell before placing your marker.',
  mystery: 'run every test (litmus, indicator and conductivity) before you decide.',
}

function categoryStats(answered: Record<string, AnswerRecord>) {
  const stats: Record<ChallengeCategory, { right: number; total: number }> = {
    litmus: { right: 0, total: 0 },
    ph: { right: 0, total: 0 },
    mystery: { right: 0, total: 0 },
  }
  for (const rec of Object.values(answered)) {
    for (const r of rec.results) {
      if (r.kind === 'bonus') continue
      stats[rec.category].total++
      if (r.outcome === 'correct') stats[rec.category].right++
    }
  }
  return stats
}

export function ResultsScreen({
  onReplay,
  onHome,
  onBack,
}: {
  onReplay: () => void
  onHome: () => void
  onBack: () => void
}) {
  const { state, completed } = useSession()
  const reduce = useReducedMotion()
  const played = useRef(false)
  const accuracy = state.attempted ? Math.round((state.correct / state.attempted) * 100) : 0
  const stats = categoryStats(state.answered)

  const tier: Tier =
    state.attempted === 0 ? 'start'
    : accuracy >= 85 && completed >= TOTAL_EXPERIMENTS * 0.6 ? 'gold'
    : accuracy >= 65 ? 'silver'
    : 'bronze'

  const headline =
    tier === 'start' ? 'Your lab is waiting!'
    : tier === 'gold' ? 'Excellent experimentation!'
    : tier === 'silver' ? 'Great observation skills!'
    : accuracy >= 45 ? "You're becoming a chemistry detective!"
    : 'Keep exploring — scientists learn from mistakes too!'

  const tried = (Object.keys(stats) as ChallengeCategory[]).filter((c) => stats[c].total > 0)
  const rate = (c: ChallengeCategory) => stats[c].right / stats[c].total
  // Highest success rate wins; ties go to the skill with more answers.
  const better = (a: ChallengeCategory, b: ChallengeCategory) =>
    rate(b) > rate(a) || (rate(b) === rate(a) && stats[b].total > stats[a].total) ? b : a
  const best = tried.length ? tried.reduce(better) : null
  const weakest = tried.length > 1 ? tried.reduce((a, b) => (rate(b) < rate(a) ? b : a)) : null

  const notes: string[] = []
  if (tier === 'start') notes.push('Every scientist starts with a first experiment. Head back into the lab and dip your first litmus strip.')
  if (best) notes.push(`Your strongest skill: ${CATEGORY_NAME[best]} (${stats[best].right}/${stats[best].total} correct).`)
  if (weakest && weakest !== best && rate(weakest) < 0.8)
    notes.push(`To level up, practise ${CATEGORY_NAME[weakest]} — ${PRACTICE_TIP[weakest]}`)
  if (state.bestStreak >= 5) notes.push(`A streak of ${state.bestStreak} in a row shows real consistency!`)
  if (completed < TOTAL_EXPERIMENTS && tier !== 'start')
    notes.push(`${TOTAL_EXPERIMENTS - completed} experiments are still waiting if you want to push your score higher.`)

  useEffect(() => {
    if (played.current) return
    played.current = true
    if (tier !== 'start') sfx.fanfare()
  }, [tier])

  const info = TIER_INFO[tier]
  const cards = [
    { label: 'Total score', value: state.score, suffix: '' },
    { label: 'Correct answers', value: state.correct, suffix: '' },
    { label: 'Questions attempted', value: state.attempted, suffix: '' },
    { label: 'Accuracy', value: accuracy, suffix: '%' },
    { label: 'Best streak', value: state.bestStreak, suffix: '' },
    { label: 'Experiments completed', value: completed, suffix: ` / ${TOTAL_EXPERIMENTS}` },
  ]

  return (
    <main className="results">
      <motion.section
        className="results-hero card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {!reduce && tier !== 'start' && <Confetti />}
        <motion.div
          className="badge"
          initial={reduce ? false : { scale: 0.3, rotate: -40, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ delay: 0.25, type: 'spring', stiffness: 160, damping: 12 }}
        >
          <Medal colors={info.colors} />
        </motion.div>
        <div className="results-copy">
          <p className="eyebrow">Session complete · {state.name}</p>
          <h1>{headline}</h1>
          <p className="results-badge-name">
            Badge earned: <strong>{info.badge}</strong> · Rank: <strong>{rankFor(state.score)}</strong>
          </p>
          <ul className="results-notes">
            {notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
      </motion.section>

      <section className="results-grid">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            className="result-card card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + i * 0.07 }}
          >
            <span className="result-value">
              <AnimatedNumber value={c.value} duration={1.4} />
              <small>{c.suffix}</small>
            </span>
            <span className="result-label">{c.label}</span>
          </motion.div>
        ))}
      </section>

      <section className="results-skills card">
        {(Object.keys(stats) as ChallengeCategory[]).map((c) => {
          const s = stats[c]
          const pct = s.total ? Math.round((s.right / s.total) * 100) : 0
          return (
            <div key={c} className="skill">
              <div className="skill-head">
                <span>{CATEGORY_NAME[c]}</span>
                <span>{s.total ? `${s.right}/${s.total}` : 'not tried'}</span>
              </div>
              <div className="skill-track">
                <motion.div className="skill-fill" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.6, duration: 1 }} />
              </div>
            </div>
          )
        })}
      </section>

      <div className="results-actions">
        <button className="btn btn-primary" onClick={onReplay}>
          <RotateCcw size={16} /> Play again (fresh session)
        </button>
        {completed < TOTAL_EXPERIMENTS && (
          <button className="btn" onClick={onBack}>
            <ArrowLeft size={16} /> <FlaskConical size={16} /> Back to the lab
          </button>
        )}
        <button className="btn btn-ghost" onClick={onHome}>
          <Home size={16} /> Return home
        </button>
      </div>
    </main>
  )
}

function Medal({ colors }: { colors: [string, string] }) {
  return (
    <svg viewBox="0 0 160 160" className="medal" aria-hidden="true">
      <defs>
        <linearGradient id="medal-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={colors[0]} />
          <stop offset="1" stopColor={colors[1]} />
        </linearGradient>
        <clipPath id="medal-clip">
          <polygon points="80,22 130,51 130,109 80,138 30,109 30,51" />
        </clipPath>
      </defs>
      <g className="medal-rays">
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x="78" y="0" width="4" height="22" rx="2" fill={colors[0]} opacity="0.35" transform={`rotate(${i * 30} 80 80)`} />
        ))}
      </g>
      <polygon points="80,22 130,51 130,109 80,138 30,109 30,51" fill="url(#medal-g)" />
      <polygon points="80,34 120,57 120,103 80,126 40,103 40,57" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="2" />
      {/* flask emblem */}
      <path d="M70 52 h20 v16 l16 30 q4 9 -6 9 h-40 q-10 0 -6 -9 l16 -30z" fill="rgba(0,0,0,0.22)" />
      <path d="M62 92 h36 l4 8 q2 6 -4 6 h-36 q-6 0 -4 -6z" fill="#fff" opacity="0.75" />
      <circle cx="76" cy="84" r="3" fill="#fff" opacity="0.8" />
      <circle cx="86" cy="76" r="2" fill="#fff" opacity="0.7" />
      <g clipPath="url(#medal-clip)">
        <rect className="medal-shine" x="20" y="10" width="18" height="140" fill="#fff" opacity="0.25" />
      </g>
    </svg>
  )
}

function Confetti() {
  const colors = ['#2a8cf0', '#f2a20c', '#18a058', '#f2557a', '#8b7cf6']
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: 36 }, (_, i) => (
        <motion.i
          key={i}
          style={{ left: `${(i * 37) % 100}%`, background: colors[i % colors.length] }}
          initial={{ y: -20, opacity: 0, rotate: 0 }}
          animate={{ y: 340, opacity: [0, 1, 1, 0], rotate: 360 + i * 20 }}
          transition={{ duration: 2.4 + (i % 5) * 0.3, delay: (i % 9) * 0.08, ease: 'easeIn' }}
        />
      ))}
    </div>
  )
}
