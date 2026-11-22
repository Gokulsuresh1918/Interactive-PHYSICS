import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import type { Nature } from '../../data/samples'
import { sfx } from '../../lib/sound'
import './nature.css'

const OPTIONS: { id: Nature; label: string; sub: string; tone: string; soft: string }[] = [
  { id: 'acid', label: 'Acid', sub: 'pH below 7 · sour', tone: '#f76707', soft: '#fff3e6' },
  { id: 'neutral', label: 'Neutral', sub: 'pH 7 · like pure water', tone: '#2f9e44', soft: '#ebfbee' },
  { id: 'base', label: 'Base', sub: 'pH above 7 · soapy', tone: '#5c5fdb', soft: '#eef0ff' },
]

/** Three illustrated, animated answer objects instead of plain text buttons. */
export function NaturePicker({
  value,
  onChange,
  disabled,
}: {
  value: Nature | null
  onChange: (n: Nature) => void
  disabled?: boolean
}) {
  return (
    <div className="nature" role="radiogroup" aria-label="Acid, neutral or base">
      {OPTIONS.map((o) => {
        const selected = value === o.id
        return (
          <motion.button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            className={`nature-opt nature-${o.id}${selected ? ' is-selected' : ''}`}
            style={{ ['--tone' as string]: o.tone, ['--soft' as string]: o.soft }}
            onClick={() => {
              sfx.click()
              onChange(o.id)
            }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.96 }}
            animate={selected ? { scale: [1, 1.04, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <span className="nature-art" aria-hidden="true">
              {o.id === 'acid' && <AcidArt />}
              {o.id === 'neutral' && <NeutralArt />}
              {o.id === 'base' && <BaseArt />}
            </span>
            <span className="nature-label">{o.label}</span>
            <span className="nature-sub">{o.sub}</span>
            <motion.span
              className="nature-check"
              initial={false}
              animate={{ scale: selected ? 1 : 0, opacity: selected ? 1 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 22 }}
            >
              <Check size={14} strokeWidth={3} />
            </motion.span>
          </motion.button>
        )
      })}
    </div>
  )
}

/** Lemon slice dripping sour drops. */
function AcidArt() {
  return (
    <svg viewBox="0 0 120 90">
      <circle cx="60" cy="40" r="30" fill="#ffd43b" />
      <circle cx="60" cy="40" r="25" fill="#fff3bf" />
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i} d="M60 40 L60 18" stroke="#ffd43b" strokeWidth="3" transform={`rotate(${i * 45} 60 40)`} />
      ))}
      <circle cx="60" cy="40" r="4" fill="#fab005" />
      <g className="art-drip">
        <path d="M60 72 q5 8 0 12 q-5 -4 0 -12z" fill="#ff922b" />
      </g>
      <g className="art-drip art-drip-2">
        <path d="M40 66 q4 7 0 10 q-4 -3 0 -10z" fill="#ff922b" />
      </g>
      <g className="art-drip art-drip-3">
        <path d="M82 66 q4 7 0 10 q-4 -3 0 -10z" fill="#ff922b" />
      </g>
    </svg>
  )
}

/** Calm water drop with ripples. */
function NeutralArt() {
  return (
    <svg viewBox="0 0 120 90">
      <ellipse cx="60" cy="76" rx="34" ry="7" fill="none" stroke="#69db7c" strokeWidth="2.5" className="art-ripple" />
      <ellipse cx="60" cy="76" rx="34" ry="7" fill="none" stroke="#69db7c" strokeWidth="2.5" className="art-ripple art-ripple-2" />
      <g className="art-float">
        <path d="M60 10 C60 10 36 40 36 54 a24 24 0 0 0 48 0 C84 40 60 10 60 10z" fill="#8ce99a" />
        <path d="M60 10 C60 10 36 40 36 54 a24 24 0 0 0 48 0 C84 40 60 10 60 10z" fill="url(#neutral-shine)" />
        <path d="M48 50 a12 12 0 0 0 8 14" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.8" />
      </g>
      <defs>
        <linearGradient id="neutral-shine" x1="0" x2="1">
          <stop offset="0" stopColor="#40c057" stopOpacity="0" />
          <stop offset="1" stopColor="#2f9e44" stopOpacity="0.5" />
        </linearGradient>
      </defs>
    </svg>
  )
}

/** Slippery soap bubbles rising. */
function BaseArt() {
  const bubbles = [
    { cx: 44, cy: 52, r: 18, d: 0 },
    { cx: 76, cy: 44, r: 14, d: 0.4 },
    { cx: 64, cy: 70, r: 10, d: 0.8 },
    { cx: 88, cy: 70, r: 7, d: 1.1 },
    { cx: 30, cy: 74, r: 6, d: 1.4 },
  ]
  return (
    <svg viewBox="0 0 120 90">
      {bubbles.map((b, i) => (
        <g key={i} className="art-bubble" style={{ animationDelay: `${b.d}s` }}>
          <circle cx={b.cx} cy={b.cy} r={b.r} fill="#dbe4ff" fillOpacity="0.7" stroke="#748ffc" strokeWidth="2.5" />
          <path d={`M${b.cx - b.r * 0.5} ${b.cy - b.r * 0.2} a${b.r * 0.6} ${b.r * 0.6} 0 0 1 ${b.r * 0.4} ${-b.r * 0.4}`} stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      ))}
    </svg>
  )
}
