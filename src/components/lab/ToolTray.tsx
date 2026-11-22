import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Check, Hand } from 'lucide-react'
import { LITMUS_COLORS, PH_COLORS } from '../../lib/chemistry'

export type ToolId = 'red' | 'blue' | 'indicator' | 'conductivity'

const TOOLS: { id: ToolId; name: string; action: string }[] = [
  { id: 'red', name: 'Red litmus', action: 'Dip a strip' },
  { id: 'blue', name: 'Blue litmus', action: 'Dip a strip' },
  { id: 'indicator', name: 'Universal indicator', action: 'Add 3 drops' },
  { id: 'conductivity', name: 'Conductivity tester', action: 'Test for ions' },
]

interface ToolTrayProps {
  busy: boolean
  activeTool: ToolId | null
  done: Record<ToolId, boolean>
  onUse: (tool: ToolId) => void
  isOverTarget: (x: number, y: number) => boolean
  onHoverTarget: (over: boolean) => void
}

/** Physical-feeling tool cards: click to use, or drag onto the beaker. */
export function ToolTray({ busy, activeTool, done, onUse, isOverTarget, onHoverTarget }: ToolTrayProps) {
  const dragged = useRef(false)

  return (
    <div className="tray">
      <p className="tray-hint">
        <Hand size={14} />
        {busy ? 'Experiment in progress — watch the beaker…' : 'Click a tool, or drag it onto the beaker'}
      </p>
      <div className="tray-tools">
        {TOOLS.map((tool) => (
          <motion.button
            key={tool.id}
            type="button"
            className={`tool${activeTool === tool.id ? ' is-active' : ''}${done[tool.id] ? ' is-done' : ''}`}
            disabled={busy}
            drag={!busy}
            dragSnapToOrigin
            dragElastic={0.6}
            dragMomentum={false}
            whileDrag={{ scale: 1.08, zIndex: 20, rotate: -4 }}
            whileHover={busy ? undefined : { y: -3 }}
            onDragStart={() => {
              dragged.current = true
            }}
            onDrag={(e) => {
              const p = e as PointerEvent
              onHoverTarget(isOverTarget(p.clientX, p.clientY))
            }}
            onDragEnd={(e) => {
              const p = e as PointerEvent
              onHoverTarget(false)
              if (isOverTarget(p.clientX, p.clientY)) onUse(tool.id)
              setTimeout(() => (dragged.current = false), 0)
            }}
            onClick={() => {
              if (dragged.current) return
              onUse(tool.id)
            }}
            aria-label={`${tool.name}: ${tool.action}`}
          >
            <span className="tool-art" aria-hidden="true">
              <ToolArt id={tool.id} />
            </span>
            <span className="tool-text">
              <span className="tool-name">{tool.name}</span>
              <span className="tool-action">{tool.action}</span>
            </span>
            {done[tool.id] && (
              <span className="tool-done" title="Used on this sample">
                <Check size={12} strokeWidth={3} />
              </span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

function ToolArt({ id }: { id: ToolId }) {
  if (id === 'red' || id === 'blue') {
    const c = LITMUS_COLORS[id]
    return (
      <svg viewBox="0 0 40 48" width="34" height="40">
        <rect x="13" y="4" width="14" height="40" rx="2.5" fill={c.dry} transform="rotate(12 20 24)" />
        <rect x="11" y="1" width="18" height="8" rx="2" fill="#24324d" transform="rotate(12 20 24)" />
      </svg>
    )
  }
  if (id === 'indicator') {
    return (
      <svg viewBox="0 0 40 48" width="34" height="40">
        <defs>
          <linearGradient id="tray-rainbow" x1="0" x2="1">
            {[1, 4, 6, 7, 9, 11, 13].map((p, i) => (
              <stop key={p} offset={i / 6} stopColor={PH_COLORS[p]} />
            ))}
          </linearGradient>
        </defs>
        <rect x="15" y="2" width="10" height="12" rx="4" fill="#3b4f7a" />
        <path d="M10 16 h20 v24 a4 4 0 0 1 -4 4 h-12 a4 4 0 0 1 -4 -4z" fill="rgba(200,235,255,0.15)" stroke="#cdeeff" strokeOpacity="0.7" strokeWidth="1.5" />
        <rect x="12" y="26" width="16" height="16" rx="2" fill="#59c06b" opacity="0.85" />
        <rect x="10" y="20" width="20" height="4" fill="url(#tray-rainbow)" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 40 48" width="34" height="40">
      <circle cx="20" cy="9" r="6" fill="#fff3b0" opacity="0.8" stroke="#cdeeff" strokeWidth="1.2" />
      <rect x="8" y="16" width="24" height="12" rx="3" fill="#22355c" stroke="#9fb8d8" strokeOpacity="0.6" />
      <rect x="12" y="19" width="10" height="6" rx="1" fill="#ffc857" />
      <rect x="12" y="28" width="3" height="17" fill="#b8c4d6" />
      <rect x="25" y="28" width="3" height="17" fill="#b8c4d6" />
    </svg>
  )
}
