import { useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { ChevronDown, Crown, Medal, Rocket, Trophy } from 'lucide-react'
import type { LeaderboardEntry } from '../../state/session'
import { Avatar } from '../common/Avatar'
import './leaderboard.css'

interface LeaderboardProps {
  entries: LeaderboardEntry[]
  activeId: string | null
  /** id of a student who just moved up (shows the rocket boost). */
  boostId?: string | null
  boostKey?: number
  /** Show all 10 rows without the collapse toggle. */
  expanded?: boolean
}

const MEDAL = ['#f2a20c', '#8fa9c6', '#d9864b']

/** Top-10 class leaderboard with animated re-ordering. */
export function Leaderboard({ entries, activeId, boostId, boostKey, expanded }: LeaderboardProps) {
  const [open, setOpen] = useState(false)
  const top = entries.slice(0, 10)
  const showAll = expanded || open
  const visible = showAll ? top : top.slice(0, 5)
  const me = entries.find((e) => e.id === activeId)
  const pinMe = !!me && !visible.some((e) => e.id === me.id)

  return (
    <div className="board">
      <div className="board-head">
        <Trophy size={16} />
        <span>Class leaderboard</span>
        <small>{entries.length === 1 ? '1 student' : `${entries.length} students`}</small>
      </div>
      {entries.length === 0 ? (
        <p className="board-empty">Earn points to appear here!</p>
      ) : (
        <LayoutGroup id={expanded ? "board-modal" : "board-side"}>
          <ol className="board-list">
            <AnimatePresence initial={false}>
              {visible.map((e) => (
                <Row key={e.id} entry={e} active={e.id === activeId} boost={e.id === boostId ? boostKey : undefined} />
              ))}
            </AnimatePresence>
          </ol>
          {pinMe && me && (
            <>
              <div className="board-gap" aria-hidden="true">
                ···
              </div>
              <ol className="board-list" start={me.rank}>
                <Row entry={me} active boost={me.id === boostId ? boostKey : undefined} />
              </ol>
            </>
          )}
        </LayoutGroup>
      )}
      {!expanded && top.length > 5 && (
        <button className="board-toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          {open ? 'Show top 5' : `Show top ${top.length}`}
          <ChevronDown size={14} style={{ transform: open ? 'rotate(180deg)' : undefined }} />
        </button>
      )}
    </div>
  )
}

function Row({ entry, active, boost }: { entry: LeaderboardEntry; active: boolean; boost?: number }) {
  return (
    <motion.li
      layout="position"
      layoutId={`row-${entry.id}`}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      className={`board-row${active ? ' is-me' : ''}${entry.rank <= 3 ? ` is-top is-top-${entry.rank}` : ''}`}
    >
      <span className="board-rank">
        {entry.rank === 1 ? (
          <Crown size={16} color={MEDAL[0]} fill={MEDAL[0]} />
        ) : entry.rank <= 3 ? (
          <Medal size={16} color={MEDAL[entry.rank - 1]} />
        ) : (
          entry.rank
        )}
      </span>
      <Avatar seed={entry.seed} name={entry.name} size={28} />
      <span className="board-name">{entry.name}</span>
      <motion.span key={entry.score} className="board-score" initial={{ scale: 1.4, color: '#18a058' }} animate={{ scale: 1, color: '#11263f' }} transition={{ duration: 0.6 }}>
        {entry.score}
      </motion.span>
      {boost !== undefined && (
        <motion.span
          key={boost}
          className="board-rocket"
          initial={{ y: 30, x: 0, opacity: 0, rotate: -45 }}
          animate={{ y: -40, x: 18, opacity: [0, 1, 1, 0], rotate: -45 }}
          transition={{ duration: 1.3, ease: 'easeOut' }}
          aria-hidden="true"
        >
          <Rocket size={18} />
        </motion.span>
      )}
    </motion.li>
  )
}
