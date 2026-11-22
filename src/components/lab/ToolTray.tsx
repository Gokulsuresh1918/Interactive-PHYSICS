import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Check, Hand } from 'lucide-react'
import { LITMUS_COLORS, PH_COLORS } from '../../lib/chemistry'

export type ToolId = 'red' | 'blue' | 'indicator' | 'conductivity'

const TOOLS: Record<ToolId, { name: string; action: string; tint: string }> = {
  red: { name: 'Red litmus', action: 'Dip a strip', tint: '#fdecef' },
  blue: { name: 'Blue litmus', action: 'Dip a strip', tint: '#eaf1fe' },
  indicator: { name: 'Universal indicator', action: 'Add 3 drops', tint: '#f0edff' },
  conductivity: { name: 'Conductivity tester', action: 'Test for ions', tint: '#fff6dd' },
}

interface ToolTrayProps {
  tools: ToolId[]
  busy: boolean
  activeTool: ToolId | null
  done: Record<ToolId, boolean>
  onUse: (tool: ToolId) => void
  isOverTarget: (x: number, y: number) => boolean
  onHoverTarget: (over: boolean) => void
}

/** Tool cards: click to use, or drag onto the beaker. */
export function ToolTray({ tools, busy, activeTool, done, onUse, isOverTarget, onHoverTarget }: ToolTrayProps) {
  const dragged = useRef(false)

  return (
    <div className="tray">
      <p className="tray-hint">
        <Hand size={14} />
        {busy ? 'Watch the beaker…' : 'Click a tool, or drag it onto the beaker'}
      </p>
      <div className="tray-tools" style={{ ['--cols' as string]: tools.length }}>
        {tools.map((id) => {
          const tool = TOOLS[id]
          return (
            <motion.button
              key={id}
              type="button"
              className={`tool${activeTool === id ? ' is-active' : ''}${done[id] ? ' is-done' : ''}`}
              style={{ ['--tool-tint' as string]: tool.tint }}
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
                if (isOverTarget(p.clientX, p.clientY)) onUse(id)
                setTimeout(() => (dragged.current = false), 0)
              }}
              onClick={() => {
                if (dragged.current) return
                onUse(id)
              }}
              aria-label={`${tool.name}: ${tool.action}`}
            >
              <span className="tool-art" aria-hidden="true">
                <ToolArt id={id} />
              </span>
              <span className="tool-text">
                <span className="tool-name">{tool.name}</span>
                <span className="tool-action">{done[id] ? 'Used — try again any time' : tool.action}</span>
              </span>
              {done[id] && (
                <span className="tool-done" title="Used on this sample">
                  <Check size={12} strokeWidth={3} />
                </span>
              )}
            </motion.button>
          )
        })}
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
        <rect x="11" y="1" width="18" height="8" rx="2" fill="#5b6f8c" transform="rotate(12 20 24)" />
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
        <rect x="15" y="2" width="10" height="12" rx="4" fill="#8b7cf6" />
        <path d="M10 16 h20 v24 a4 4 0 0 1 -4 4 h-12 a4 4 0 0 1 -4 -4z" fill="#ffffff" stroke="#7f9bba" strokeWidth="1.5" />
        <rect x="12" y="26" width="16" height="16" rx="2" fill="#59c06b" opacity="0.9" />
        <rect x="10" y="20" width="20" height="4" fill="url(#tray-rainbow)" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 40 48" width="34" height="40">
      <circle cx="20" cy="9" r="6" fill="#fff3b0" stroke="#d9a400" strokeWidth="1.2" />
      <rect x="8" y="16" width="24" height="12" rx="3" fill="#4b6487" />
      <rect x="12" y="19" width="10" height="6" rx="1" fill="#ffc857" />
      <rect x="12" y="28" width="3" height="17" fill="#9fb3c9" />
      <rect x="25" y="28" width="3" height="17" fill="#9fb3c9" />
    </svg>
  )
}
