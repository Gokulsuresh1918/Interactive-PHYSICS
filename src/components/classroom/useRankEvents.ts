import { useEffect, useRef, useState } from 'react'
import type { LeaderboardEntry } from '../../state/session'
import { celebrate } from '../../lib/celebrate'
import { sfx } from '../../lib/sound'

export interface RankToast {
  id: number
  emoji: string
  text: string
}

/**
 * Watches the leaderboard and reports friendly events when the active student
 * climbs: overtaking someone, a new rank, or entering the top 3.
 */
export function useRankEvents(entries: LeaderboardEntry[], activeId: string | null) {
  const prev = useRef<Map<string, number> | null>(null)
  const prevActive = useRef(activeId)
  const [toasts, setToasts] = useState<RankToast[]>([])
  const [boost, setBoost] = useState<{ id: string; key: number } | null>(null)

  useEffect(() => {
    const now = new Map(entries.map((e) => [e.id, e.rank]))
    const before = prev.current
    prev.current = now
    // Ignore the first render and student switches.
    if (!before || prevActive.current !== activeId || !activeId) {
      prevActive.current = activeId
      return
    }
    const me = entries.find((e) => e.id === activeId)
    const oldRank = before.get(activeId)
    if (!me || oldRank === undefined || me.rank >= oldRank) return

    const overtaken = entries.filter((e) => e.id !== activeId && (before.get(e.id) ?? 99) < oldRank && e.rank > me.rank)
    const add = (t: Omit<RankToast, 'id'>) => {
      const id = Date.now() + Math.random()
      setToasts((ts) => [...ts, { ...t, id }].slice(-3))
      setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 3600)
    }

    setBoost({ id: activeId, key: Date.now() })
    sfx.fanfare()
    if (overtaken.length === 1) add({ emoji: '🚀', text: `${me.name} just overtook ${overtaken[0].name} — now #${me.rank}!` })
    else if (overtaken.length > 1) add({ emoji: '🚀', text: `${me.name} zoomed past ${overtaken.length} classmates to #${me.rank}!` })
    if (me.rank <= 3 && oldRank > 3) {
      add({ emoji: '🏆', text: `${me.name} entered the top 3!` })
      celebrate(null, 'big')
    } else if (overtaken.length === 0) {
      add({ emoji: '🔥', text: `${me.name} moved up to rank #${me.rank}!` })
    }
  }, [entries, activeId])

  return { toasts, boost }
}
