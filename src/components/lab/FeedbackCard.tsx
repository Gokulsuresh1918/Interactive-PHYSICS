import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { CheckCircle2, Lightbulb, Sparkles } from 'lucide-react'
import type { Outcome } from '../../lib/scoring'
import { sfx } from '../../lib/sound'
import './feedback.css'

interface FeedbackCardProps {
  outcome: Outcome
  points: number
  title: string
  children: ReactNode
  /** Play sound + celebration (only right after answering, not on revisit). */
  fresh?: boolean
}

const ICON = { correct: CheckCircle2, close: Sparkles, wrong: Lightbulb }

export function FeedbackCard({ outcome, points, title, children, fresh }: FeedbackCardProps) {
  const Icon = ICON[outcome]
  const reduce = useReducedMotion()
  const played = useRef(false)

  useEffect(() => {
    if (!fresh || played.current) return
    played.current = true
    if (outcome === 'correct') sfx.correct()
    else if (outcome === 'close') sfx.close()
    else sfx.wrong()
  }, [fresh, outcome])

  return (
    <motion.div
      className={`feedback feedback-${outcome}`}
      initial={fresh ? { opacity: 0, y: 12, scale: 0.98 } : false}
      animate={
        fresh && outcome === 'wrong' && !reduce
          ? { opacity: 1, y: 0, scale: 1, x: [0, -5, 5, -3, 0] }
          : { opacity: 1, y: 0, scale: 1 }
      }
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      role="status"
    >
      {fresh && outcome !== 'wrong' && !reduce && <Burst tone={outcome} />}
      <div className="feedback-head">
        <span className="feedback-icon">
          <Icon size={20} />
        </span>
        <h4>{title}</h4>
        <motion.span
          className="feedback-points"
          initial={fresh ? { scale: 0.4, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 14 }}
        >
          {points > 0 ? `+${points}` : '+0'}
        </motion.span>
      </div>
      <div className="feedback-body">{children}</div>
      {fresh && points > 0 && !reduce && (
        <motion.span
          className="feedback-float"
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: [0, 1, 0], y: -46 }}
          transition={{ duration: 1.3, ease: 'easeOut' }}
          aria-hidden="true"
        >
          +{points}
        </motion.span>
      )}
    </motion.div>
  )
}

function Burst({ tone }: { tone: 'correct' | 'close' }) {
  const n = 14
  return (
    <div className="burst" aria-hidden="true">
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2
        const d = 50 + (i % 3) * 18
        return (
          <motion.i
            key={i}
            className={`burst-dot burst-${tone}`}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: Math.cos(a) * d, y: Math.sin(a) * d * 0.6, opacity: 0, scale: 0.3 }}
            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.05 }}
          />
        )
      })}
    </div>
  )
}
