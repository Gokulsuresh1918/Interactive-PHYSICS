import { useRef } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'
import { motion } from 'framer-motion'
import { PH_COLORS, formatPhRange } from '../../lib/chemistry'
import './phscale.css'

interface PhScaleProps {
  value: number | null
  onChange?: (v: number) => void
  /** Interactive when an onChange is supplied and not disabled. */
  disabled?: boolean
  /** Reveal the accepted pH range. */
  actual?: [number, number] | null
  /** Colour observed in the beaker, for side-by-side comparison. */
  observedColor?: string | null
}

const CELLS = 15

export function PhScale({ value, onChange, disabled, actual, observedColor }: PhScaleProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const interactive = !!onChange && !disabled

  const valueAt = (clientX: number) => {
    const r = trackRef.current!.getBoundingClientRect()
    const f = (clientX - r.left) / r.width
    return Math.max(0, Math.min(14, Math.floor(f * CELLS)))
  }

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!interactive) return
    e.currentTarget.setPointerCapture(e.pointerId)
    onChange!(valueAt(e.clientX))
  }
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!interactive || !e.currentTarget.hasPointerCapture(e.pointerId)) return
    const v = valueAt(e.clientX)
    if (v !== value) onChange!(v)
  }
  const onKey = (e: KeyboardEvent) => {
    if (!interactive) return
    const v = value ?? 7
    const next =
      e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? v - 1
      : e.key === 'ArrowRight' || e.key === 'ArrowUp' ? v + 1
      : e.key === 'Home' ? 0
      : e.key === 'End' ? 14
      : null
    if (next === null) return
    e.preventDefault()
    onChange!(Math.max(0, Math.min(14, next)))
  }

  const pct = (v: number) => `${((v + 0.5) / CELLS) * 100}%`

  return (
    <div className={`ph${interactive ? ' is-interactive' : ''}`}>
      <div className="ph-regions" aria-hidden="true">
        <span className="ph-region ph-region-acid">◀ Acidic</span>
        <span className="ph-region ph-region-neutral">Neutral</span>
        <span className="ph-region ph-region-base">Basic / alkaline ▶</span>
      </div>

      <div className="ph-marker-lane">
        {value !== null && (
          <motion.div
            className="ph-marker"
            initial={false}
            animate={{ left: pct(value) }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          >
            <span className="ph-marker-bubble" style={{ ['--swatch' as string]: PH_COLORS[value] }}>
              <i />
              pH {value}
            </span>
            <span className="ph-marker-arrow" />
          </motion.div>
        )}
      </div>

      <div
        ref={trackRef}
        className="ph-track"
        role="slider"
        tabIndex={interactive ? 0 : -1}
        aria-label="pH estimate"
        aria-valuemin={0}
        aria-valuemax={14}
        aria-valuenow={value ?? undefined}
        aria-valuetext={value === null ? 'not set' : `pH ${value}`}
        aria-disabled={!interactive}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onKeyDown={onKey}
      >
        {PH_COLORS.map((c, i) => (
          <div
            key={i}
            className={`ph-cell${value === i ? ' is-selected' : ''}${actual && i >= actual[0] && i <= actual[1] ? ' is-actual' : ''}`}
            style={{ background: c }}
          >
            <span>{i}</span>
          </div>
        ))}
      </div>

      <div className="ph-under">
        {actual && (
          <motion.div
            className="ph-actual"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              left: `${(actual[0] / CELLS) * 100}%`,
              width: `${((actual[1] - actual[0] + 1) / CELLS) * 100}%`,
            }}
          >
            <span className="ph-actual-bracket" />
            <span className="ph-actual-label">Actual pH {formatPhRange(actual)}</span>
          </motion.div>
        )}
      </div>

      {observedColor && (
        <div className="ph-compare">
          <span className="ph-compare-item">
            <i style={{ background: observedColor }} /> Your sample
          </span>
          {value !== null && (
            <span className="ph-compare-item">
              <i style={{ background: PH_COLORS[value] }} /> Scale at pH {value}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
