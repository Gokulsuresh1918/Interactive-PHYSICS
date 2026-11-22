import { motion, useReducedMotion } from 'framer-motion'
import { Plus, X } from 'lucide-react'
import type { Ref } from 'react'
import { MATERIALS, isMaterial } from './circuit'
import type { CircuitState, PartId, SlotId, Slots } from './circuit'

/* Loop geometry (SVG units). Every slot is a 140-unit gap in the wire. */
const L = 140
const R = 660
const T = 80
const B = 360
export const SLOT_POS: Record<SlotId, { x: number; y: number; rot: number }> = {
  top: { x: 400, y: T, rot: 0 },
  right: { x: R, y: 220, rot: 90 },
  bottom: { x: 400, y: B, rot: 180 },
  left: { x: L, y: 220, rot: 270 },
}
const WIRES = [
  `M${L} 150 V${T} H330`,
  `M470 ${T} H${R} V150`,
  `M${R} 290 V${B} H470`,
  `M330 ${B} H${L} V290`,
]
const LOOP = `M${L} ${T} H${R} V${B} H${L} Z`

interface BoardProps {
  slots: Slots
  state: CircuitState
  switchClosed: boolean
  locked: SlotId[]
  armed: boolean
  hover: SlotId | null
  onSlot: (slot: SlotId) => void
  onRemove: (slot: SlotId) => void
  slotRefs: Record<SlotId, Ref<SVGRectElement>>
}

export function CircuitBoard({ slots, state, switchClosed, locked, armed, hover, onSlot, onRemove, slotRefs }: BoardProps) {
  const reduce = useReducedMotion()
  return (
    <svg viewBox="0 0 800 440" className="circuit-svg" role="img" aria-label={state.message}>
      <defs>
        <radialGradient id="bulb-light">
          <stop offset="0" stopColor="#fff9c4" />
          <stop offset="0.45" stopColor="#ffe066" stopOpacity="0.85" />
          <stop offset="1" stopColor="#ffd43b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="battery-body" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#3b4a6b" />
          <stop offset="0.45" stopColor="#24304a" />
          <stop offset="1" stopColor="#141c2e" />
        </linearGradient>
        <linearGradient id="battery-cap" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ffb347" />
          <stop offset="1" stopColor="#e8590c" />
        </linearGradient>
        <pattern id="board-dots" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.4" fill="#c9d6ea" />
        </pattern>
      </defs>
      <rect width="800" height="440" fill="url(#board-dots)" />

      {/* copper wires */}
      {WIRES.map((d) => (
        <g key={d}>
          <path d={d} fill="none" stroke="#9a5a26" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
          <path d={d} fill="none" stroke="#e8955a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ))}

      {/* animated current */}
      {state.current && (
        <path
          d={LOOP}
          fill="none"
          stroke={state.short ? '#ff3b30' : '#ffd43b'}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="1 18"
          className={reduce ? '' : state.short ? 'current-flow current-fast' : 'current-flow'}
        />
      )}
      {state.short && (
        <path d={LOOP} fill="none" stroke="#ff3b30" strokeWidth="14" strokeOpacity="0.18" className="short-glow" />
      )}

      {/* slots */}
      {(Object.keys(SLOT_POS) as SlotId[]).map((slot) => {
        const pos = SLOT_POS[slot]
        const part = slots[slot]
        const isLocked = locked.includes(slot)
        return (
          <g key={slot} transform={`translate(${pos.x} ${pos.y}) rotate(${pos.rot})`}>
            <rect
              ref={slotRefs[slot]}
              x="-80"
              y="-56"
              width="160"
              height="112"
              rx="18"
              className={`slot-hit${!part && armed ? ' is-armed' : ''}${hover === slot ? ' is-hover' : ''}`}
              onClick={() => onSlot(slot)}
            />
            {part ? (
              <g className="part" onClick={() => onSlot(slot)}>
                <Part id={part} switchClosed={switchClosed} brightness={state.brightness} rot={pos.rot} />
              </g>
            ) : (
              <g className="slot-empty" onClick={() => onSlot(slot)}>
                <circle cx="-70" cy="0" r="7" fill="#fff" stroke="#9a5a26" strokeWidth="3" />
                <circle cx="70" cy="0" r="7" fill="#fff" stroke="#9a5a26" strokeWidth="3" />
                <rect x="-46" y="-22" width="92" height="44" rx="12" fill="#fff" stroke="#9fb3c9" strokeWidth="2" strokeDasharray="6 5" />
                <g transform={`rotate(${-pos.rot})`}>
                  <Plus x={-10} y={-10} width={20} height={20} color="#7f9bba" strokeWidth={2.5} />
                </g>
              </g>
            )}
            {part && !isLocked && (
              <g transform={`translate(62 -44) rotate(${-pos.rot})`} className="part-remove" onClick={(e) => { e.stopPropagation(); onRemove(slot) }}>
                <circle r="11" fill="#fff" stroke="#c8d7e7" />
                <X x={-7} y={-7} width={14} height={14} color="#e5484d" strokeWidth={3} />
              </g>
            )}
          </g>
        )
      })}

      <g transform="translate(400 222)">
        <motion.g key={state.message} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <rect x="-190" y="-22" width="380" height="44" rx="22" fill="#fff" stroke={state.short ? '#ff3b30' : state.current ? '#ffd43b' : '#c8d7e7'} strokeWidth="2" />
          <text textAnchor="middle" y="6" className={`circuit-msg${state.short ? ' is-short' : state.current ? ' is-on' : ''}`}>
            {state.message}
          </text>
        </motion.g>
      </g>
    </svg>
  )
}

/** Drawing of each component, horizontal, with terminals at x = ±70. */
export function Part({ id, switchClosed, brightness = 0, rot = 0, labels = true }: { id: PartId; switchClosed?: boolean; brightness?: number; rot?: number; labels?: boolean }) {
  const lead = (x1: number, x2: number) => <line x1={x1} y1="0" x2={x2} y2="0" stroke="#9a5a26" strokeWidth="5" strokeLinecap="round" />
  if (id === 'battery') {
    return (
      <g>
        {lead(-70, -50)}
        {lead(50, 70)}
        <rect x="-50" y="-22" width="88" height="44" rx="8" fill="url(#battery-body)" />
        <rect x="30" y="-22" width="22" height="44" rx="6" fill="url(#battery-cap)" />
        <rect x="52" y="-8" width="6" height="16" rx="2" fill="#adb5bd" />
        <rect x="-44" y="-16" width="70" height="6" rx="3" fill="#fff" opacity="0.15" />
        <g transform={`rotate(${-rot})`}>
          <text textAnchor="middle" y="5" className="part-text-light">
            1.5 V
          </text>
        </g>
        <text x="42" y="-28" textAnchor="middle" className="part-sign">
          +
        </text>
        <text x="-40" y="-28" textAnchor="middle" className="part-sign">
          −
        </text>
      </g>
    )
  }
  if (id === 'bulb') {
    const on = brightness > 0
    return (
      <g>
        {lead(-70, -14)}
        {lead(14, 70)}
        <g transform={`rotate(${-rot})`}>
          {on && (
            <>
              <circle r={48 + brightness * 30} fill="url(#bulb-light)" opacity={0.5 + brightness * 0.5} className="bulb-glow" />
              <g className="bulb-rays" opacity={brightness}>
                {Array.from({ length: 10 }, (_, i) => (
                  <line key={i} x1="0" y1="-48" x2="0" y2="-60" stroke="#ffc107" strokeWidth="3" strokeLinecap="round" transform={`rotate(${i * 36})`} />
                ))}
              </g>
            </>
          )}
          <circle r="28" fill={on ? '#fff3bf' : '#f1f6fb'} stroke={on ? '#f2a20c' : '#9fb3c9'} strokeWidth="2.5" />
          <path d="M-9 4 L-5 -8 L0 2 L5 -8 L9 4" fill="none" stroke={on ? '#e8590c' : '#7f9bba'} strokeWidth="2.5" strokeLinejoin="round" />
          <rect x="-12" y="22" width="24" height="16" rx="3" fill="#9aa5b1" />
          <rect x="-12" y="26" width="24" height="3" fill="#6b7785" />
          <rect x="-12" y="32" width="24" height="3" fill="#6b7785" />
          {on && <circle r="28" fill="#fff" opacity={0.15 * brightness} />}
        </g>
      </g>
    )
  }
  if (id === 'switch') {
    return (
      <g className="switch">
        {lead(-70, -42)}
        {lead(42, 70)}
        <rect x="-56" y="-14" width="112" height="28" rx="14" fill="#fff" stroke="#c8d7e7" />
        <circle cx="-40" cy="0" r="6" fill="#4b6487" />
        <circle cx="40" cy="0" r="6" fill="#4b6487" />
        <motion.line
          x1="-40"
          y1="0"
          x2="40"
          y2="0"
          stroke={switchClosed ? '#12b3a2' : '#e5484d'}
          strokeWidth="6"
          strokeLinecap="round"
          initial={false}
          animate={switchClosed ? { x2: 40, y2: 0 } : { x2: 28, y2: -42 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
        />
        <g transform={`rotate(${-rot})`} opacity={labels ? 1 : 0}>
          <text y="34" textAnchor="middle" className={`part-text${switchClosed ? ' is-on' : ' is-off'}`}>
            {switchClosed ? 'ON' : 'OFF'}
          </text>
        </g>
      </g>
    )
  }
  if (id === 'wire') {
    return (
      <g>
        <line x1="-70" y1="0" x2="70" y2="0" stroke="#9a5a26" strokeWidth="9" strokeLinecap="round" />
        <line x1="-70" y1="0" x2="70" y2="0" stroke="#e8955a" strokeWidth="5" strokeLinecap="round" />
      </g>
    )
  }
  if (isMaterial(id)) {
    const m = MATERIALS[id]
    return (
      <g>
        {lead(-70, -54)}
        {lead(54, 70)}
        <rect x="-58" y="-8" width="10" height="16" rx="2" fill="#e5484d" />
        <rect x="48" y="-8" width="10" height="16" rx="2" fill="#1f2937" />
        <rect x="-46" y="-11" width="92" height="22" rx={id === 'rubber' ? 11 : 4} fill={m.color} stroke={m.edge} strokeWidth="2" />
        {id === 'plastic' && Array.from({ length: 9 }, (_, i) => <line key={i} x1={-40 + i * 10} y1="-11" x2={-40 + i * 10} y2="-4" stroke="#fff" strokeWidth="1.5" />)}
        {id === 'wood' && <path d="M-44 -2 q20 -6 44 0 t44 0" stroke={m.edge} fill="none" opacity="0.6" />}
        {id === 'graphite' && <rect x="-46" y="-4" width="92" height="8" fill="#2c3036" />}
        {labels && (
          <g transform={`rotate(${-rot})`}>
            <text y="32" textAnchor="middle" className="part-text">
              {m.name}
            </text>
          </g>
        )}
      </g>
    )
  }
  return null
}
