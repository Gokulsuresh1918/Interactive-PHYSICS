import confetti from 'canvas-confetti'

const COLORS = ['#2a8cf0', '#12b3a2', '#8b7cf6', '#f2a20c', '#f97316', '#f2557a']

function reduced() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

/** Small confetti burst from an element (or the screen centre). */
export function celebrate(from?: Element | null, power: 'small' | 'big' = 'small') {
  if (reduced()) return
  const r = from?.getBoundingClientRect()
  const origin = r
    ? { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 3) / window.innerHeight }
    : { x: 0.5, y: 0.4 }
  confetti({
    particleCount: power === 'big' ? 140 : 46,
    spread: power === 'big' ? 100 : 60,
    startVelocity: power === 'big' ? 42 : 28,
    scalar: 0.85,
    ticks: 160,
    origin,
    colors: COLORS,
    disableForReducedMotion: true,
    zIndex: 90,
  })
}
