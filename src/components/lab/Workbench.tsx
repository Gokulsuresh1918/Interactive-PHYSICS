import { useCallback, useEffect, useRef, useState } from 'react'
import type { Ref } from 'react'
import { motion, useAnimate, useReducedMotion } from 'framer-motion'
import type { Conductivity, Sample } from '../../data/samples'
import { LITMUS_COLORS, litmusTest, phColor } from '../../lib/chemistry'
import type { LitmusOutcome } from '../../lib/chemistry'
import { sfx } from '../../lib/sound'
import { ToolTray } from './ToolTray'
import type { ToolId } from './ToolTray'
import './workbench.css'

export interface BenchTests {
  red?: LitmusOutcome
  blue?: LitmusOutcome
  indicator?: boolean
  conductivity?: Conductivity
}

interface WorkbenchProps {
  sample: Sample
  /** Mystery mode: hide the sample's natural look. */
  masked?: boolean
  label: string
  /** Changing this key pours a fresh sample into the beaker. */
  pourKey: string
  tests: BenchTests
  onTestComplete: (patch: BenchTests) => void
  /** Which tools this step offers (keeps each screen focused). */
  tools: ToolId[]
  /** Called when an animation starts/stops so parents can lock navigation. */
  onBusyChange?: (busy: boolean) => void
}

/* Scene geometry (SVG user units) */
const CX = 200 // beaker centre x
const SURFACE = 176 // liquid surface y
const BOTTOM = 300
const SLOT_X: Record<'red' | 'blue', number> = { red: 356, blue: 406 }
const SLOT_Y = 100
const BULB = { x: 492, y: 150 }
const MASK_COLOR = '#d9e6f2'
const CONDUCT_LEVEL: Record<Conductivity, number> = { none: 0, weak: 0.45, strong: 1 }

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function Workbench({ sample, masked, label, pourKey, tests, onTestComplete, tools, onBusyChange }: WorkbenchProps) {
  const [scope, animate] = useAnimate<SVGSVGElement>()
  const reduce = useReducedMotion()
  const speed = reduce ? 0.15 : 1
  const [active, setActive] = useState<ToolId | null>(null)
  const [tint, setTint] = useState<string | null>(null)
  const [ripple, setRipple] = useState(0)
  const [bloom, setBloom] = useState(0)
  const [bulbLevel, setBulbLevel] = useState(0)
  const [dropHover, setDropHover] = useState(false)
  const runId = useRef(0)
  const beakerHit = useRef<SVGRectElement>(null)

  const toolRef = useRef<SVGGElement>(null)
  const wetRef = useRef<SVGRectElement>(null)
  const bulbRef = useRef<SVGGElement>(null)
  const dropRef = useRef<SVGGElement>(null)
  const glowRef = useRef<SVGCircleElement>(null)

  // Fresh pour whenever the sample (or a rinse) changes.
  useEffect(() => {
    runId.current++
    setActive(null)
    setTint(null)
    setBulbLevel(0)
    sfx.pour()
  }, [pourKey])

  useEffect(() => {
    onBusyChange?.(!!active)
  }, [active, onBusyChange])

  const baseColor = masked ? MASK_COLOR : sample.liquidColor
  const indicatorColor = phColor(sample.ph)
  const liquidColor = tint ?? (tests.indicator ? indicatorColor : baseColor)
  const liquidOpacity = tint || tests.indicator ? 0.9 : masked ? 0.5 : Math.max(0.4, sample.liquidOpacity)
  const showFizz = !masked && sample.fizzy

  const run = useCallback(
    (tool: ToolId) => {
      if (active) return
      sfx.select()
      setActive(tool)
    },
    [active],
  )

  // Play the animation sequence for the active tool.
  useEffect(() => {
    if (!active) return
    const id = ++runId.current
    const alive = () => runId.current === id
    const t = (s: number) => s * speed
    const tool = toolRef.current
    if (!tool) return

    const litmus = async (paper: 'red' | 'blue') => {
      const outcome = litmusTest(paper, sample.nature)
      const wet = wetRef.current!
      const col = LITMUS_COLORS
      await animate(tool, { x: 470, y: 330, opacity: 0 }, { duration: 0 })
      await animate(wet, { scaleY: 0, fill: col[paper].wet }, { duration: 0 })
      await animate(tool, { x: CX - 11, y: -30, opacity: 1 }, { duration: t(0.7), ease: [0.22, 1, 0.36, 1] })
      if (!alive()) return
      sfx.dip()
      setRipple((r) => r + 1)
      await animate(tool, { y: 100 }, { duration: t(0.55), ease: 'easeInOut' })
      if (!alive()) return
      await animate(wet, { scaleY: 1 }, { duration: t(0.8), ease: 'easeOut' })
      if (!alive()) return
      if (outcome.changed) sfx.reaction()
      await animate(wet, { fill: col[outcome.resultPaper].wet }, { duration: t(outcome.changed ? 1.1 : 0.4) })
      if (!alive()) return
      await animate(tool, { y: -30 }, { duration: t(0.5), ease: 'easeInOut' })
      if (!alive()) return
      await animate(tool, { x: SLOT_X[paper], y: SLOT_Y }, { duration: t(0.75), ease: [0.22, 1, 0.36, 1] })
      if (!alive()) return
      onTestComplete({ [paper]: outcome })
    }

    const indicator = async () => {
      const bulb = bulbRef.current!
      const drop = dropRef.current!
      await animate(tool, { x: 480, y: -60, opacity: 0 }, { duration: 0 })
      await animate(drop, { opacity: 0, y: 0 }, { duration: 0 })
      await animate(tool, { x: CX - 12, y: -40, opacity: 1 }, { duration: t(0.7), ease: [0.22, 1, 0.36, 1] })
      for (let i = 0; i < 3; i++) {
        if (!alive()) return
        animate(bulb, { scaleY: [1, 0.68, 1] }, { duration: t(0.35) })
        await wait(t(150))
        await animate(drop, { opacity: [0, 1, 1], y: [0, 96] }, { duration: t(0.32), ease: 'easeIn' })
        await animate(drop, { opacity: 0 }, { duration: 0 })
        await animate(drop, { y: 0 }, { duration: 0 })
        if (!alive()) return
        sfx.drop()
        setRipple((r) => r + 1)
        if (i === 0) {
          setBloom((b) => b + 1)
          setTint(indicatorColor)
          sfx.reaction()
        }
        await wait(t(220))
      }
      if (!alive()) return
      await animate(tool, { x: 480, y: -60, opacity: 0 }, { duration: t(0.6), ease: 'easeIn' })
      await wait(t(500))
      if (!alive()) return
      onTestComplete({ indicator: true })
    }

    const conductivity = async () => {
      const glow = glowRef.current!
      const level = CONDUCT_LEVEL[sample.conductivity]
      await animate(tool, { x: 470, y: -100, opacity: 0 }, { duration: 0 })
      await animate(glow, { opacity: 0 }, { duration: 0 })
      await animate(tool, { x: CX - 35, y: -60, opacity: 1 }, { duration: t(0.7), ease: [0.22, 1, 0.36, 1] })
      if (!alive()) return
      await animate(tool, { y: 74 }, { duration: t(0.6), ease: 'easeInOut' })
      if (!alive()) return
      sfx.dip()
      setRipple((r) => r + 1)
      await wait(t(250))
      sfx.buzz(level)
      setBulbLevel(level)
      if (level > 0) {
        await animate(glow, { opacity: [0, level, level * 0.5, level] }, { duration: t(0.6) })
      }
      await wait(t(1100))
      if (!alive()) return
      await animate(tool, { y: -60 }, { duration: t(0.5), ease: 'easeInOut' })
      await animate(tool, { x: 470, opacity: 0 }, { duration: t(0.6), ease: 'easeIn' })
      if (!alive()) return
      onTestComplete({ conductivity: sample.conductivity })
    }

    const sequence =
      active === 'indicator' ? indicator() : active === 'conductivity' ? conductivity() : litmus(active)

    sequence
      .catch(() => undefined)
      .finally(() => {
        if (alive()) setActive(null)
      })

    return () => {
      // runId is a plain counter (not a DOM ref): bumping it cancels this run.
      // oxlint-disable-next-line react-hooks/exhaustive-deps
      runId.current++
    }
    // The sequence must start exactly once per tool use, so it only depends on `active`.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  // If StrictMode / cleanup cancelled a run, make sure we don't stay stuck "busy".
  useEffect(() => {
    if (!active) return
    const guard = setTimeout(() => setActive((a) => (a === active ? null : a)), 12000)
    return () => clearTimeout(guard)
  }, [active])

  const isOverBeaker = (x: number, y: number) => {
    const r = beakerHit.current?.getBoundingClientRect()
    return !!r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom
  }

  const rackBulb = tests.conductivity ? CONDUCT_LEVEL[tests.conductivity] : 0
  const showStrips = tools.includes('red') || tools.includes('blue')
  const showBulb = tools.includes('conductivity')
  const showRack = showStrips || showBulb
  // Centre the beaker when there is no results rack to show.
  const viewBox = showRack ? '0 -40 560 380' : '20 -40 360 380'

  return (
    <div className="bench">
      <div className={`bench-stage${dropHover ? ' is-drop-target' : ''}`}>
        <svg ref={scope} className="bench-svg" viewBox={viewBox} role="img" aria-label={`Beaker containing ${label}`}>
          <defs>
            <clipPath id="liquid-only">
              <path d={`M122 ${SURFACE} V${BOTTOM - 14} Q122 ${BOTTOM} 136 ${BOTTOM} H264 Q278 ${BOTTOM} 278 ${BOTTOM - 14} V${SURFACE} Z`} />
            </clipPath>
            <clipPath id="beaker-inner">
              <path d={`M122 96 V${BOTTOM - 14} Q122 ${BOTTOM} 136 ${BOTTOM} H264 Q278 ${BOTTOM} 278 ${BOTTOM - 14} V96 Z`} />
            </clipPath>
            <linearGradient id="glass-front" x1="0" x2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.75" />
              <stop offset="0.18" stopColor="#ffffff" stopOpacity="0.12" />
              <stop offset="0.8" stopColor="#ffffff" stopOpacity="0.05" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0.55" />
            </linearGradient>
            <linearGradient id="bench-top" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e4eef8" />
              <stop offset="1" stopColor="#d2e1f0" />
            </linearGradient>
            <linearGradient id="liquid-shade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.18" />
              <stop offset="1" stopColor="#000000" stopOpacity="0.22" />
            </linearGradient>
            <radialGradient id="bulb-glow">
              <stop offset="0" stopColor="#fff6c2" stopOpacity="1" />
              <stop offset="0.4" stopColor="#ffd25a" stopOpacity="0.7" />
              <stop offset="1" stopColor="#ffb020" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* bench surface */}
          <rect x="-1000" y={BOTTOM + 4} width="2600" height="60" fill="url(#bench-top)" />
          <rect x="-1000" y={BOTTOM + 4} width="2600" height="2" fill="#ffffff" />
          <ellipse cx={CX} cy={BOTTOM + 6} rx="96" ry="7" fill="#5c7ea3" opacity="0.18" />

          {/* beaker back wall */}
          <path
            d={`M122 96 V${BOTTOM - 14} Q122 ${BOTTOM} 136 ${BOTTOM} H264 Q278 ${BOTTOM} 278 ${BOTTOM - 14} V96 Z`}
            fill="rgba(210,230,248,0.35)"
          />

          {/* active tool (behind liquid so it looks submerged) */}
          {active && (
            <g ref={toolRef} style={{ opacity: 0 }}>
              {(active === 'red' || active === 'blue') && <LitmusStrip paper={active} wetRef={wetRef} />}
              {active === 'indicator' && <Dropper bulbRef={bulbRef} dropRef={dropRef} />}
              {active === 'conductivity' && <Tester glowRef={glowRef} level={bulbLevel} />}
            </g>
          )}

          {/* liquid */}
          <g clipPath="url(#beaker-inner)">
            <motion.g
              key={pourKey}
              initial={{ y: 140 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2 * speed, duration: 1.1 * speed, ease: [0.22, 1, 0.36, 1] }}
            >
              <rect
                x="110"
                y={SURFACE}
                width="180"
                height={BOTTOM - SURFACE + 10}
                className="liquid-body"
                style={{ fill: liquidColor, fillOpacity: liquidOpacity }}
              />
              <rect x="110" y={SURFACE} width="180" height={BOTTOM - SURFACE + 10} fill="url(#liquid-shade)" />
              <path
                className="liquid-wave"
                d={`M80 ${SURFACE + 2} ${Array.from({ length: 9 }, () => 'q10 -6 20 0 t20 0').join(' ')} V${SURFACE + 14} H80 Z`}
                style={{ fill: liquidColor, fillOpacity: Math.min(1, liquidOpacity + 0.1) }}
              />
              <line x1="110" x2="290" y1={SURFACE + 1} y2={SURFACE + 1} stroke="#fff" strokeOpacity="0.35" strokeWidth="1.5" />
              {(sample.cloudy && !masked) && (
                <rect x="110" y={SURFACE} width="180" height={BOTTOM - SURFACE} fill="#ffffff" opacity="0.08" />
              )}
              {Array.from({ length: showFizz ? 12 : 5 }, (_, i) => (
                <circle
                  key={i}
                  className="liquid-bubble"
                  cx={136 + ((i * 37) % 128)}
                  cy={BOTTOM - 6}
                  r={showFizz ? 1.6 + (i % 3) * 0.6 : 2 + (i % 2)}
                  style={{
                    animationDelay: `${(i * 0.53) % 3}s`,
                    animationDuration: `${showFizz ? 1.6 + (i % 4) * 0.3 : 3.5 + (i % 3)}s`,
                  }}
                />
              ))}
            </motion.g>

            {/* indicator bloom spreading from the drop point */}
            {bloom > 0 && (
              <motion.circle
                clipPath="url(#liquid-only)"
                key={`bloom-${bloom}`}
                cx={CX}
                cy={SURFACE + 4}
                fill={indicatorColor}
                initial={{ r: 4, opacity: 0.95 }}
                animate={{ r: 150, opacity: 0 }}
                transition={{ duration: 1.8 * speed, ease: 'easeOut' }}
              />
            )}
          </g>

          {/* pour stream */}
          <motion.rect
            key={`stream-${pourKey}`}
            x={CX - 4}
            y={-50}
            width="8"
            rx="4"
            height={BOTTOM + 40}
            style={{ fill: baseColor }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.85, 0.85, 0] }}
            transition={{ duration: 1.3 * speed, times: [0, 0.1, 0.7, 1] }}
            pointerEvents="none"
          />

          {/* ripple on the surface */}
          {ripple > 0 && (
            <motion.ellipse
              key={`ripple-${ripple}`}
              cx={CX}
              cy={SURFACE + 1}
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.5"
              initial={{ rx: 4, ry: 1.5, opacity: 0.9 }}
              animate={{ rx: 70, ry: 6, opacity: 0 }}
              transition={{ duration: 0.9 * speed, ease: 'easeOut' }}
            />
          )}

          {/* beaker glass front */}
          <path
            d={`M114 90 Q122 92 122 100 V${BOTTOM - 14} Q122 ${BOTTOM} 136 ${BOTTOM} H264 Q278 ${BOTTOM} 278 ${BOTTOM - 14} V100 Q278 92 286 90`}
            fill="url(#glass-front)"
            stroke={dropHover ? 'var(--sky)' : '#93aecb'}
            strokeOpacity={dropHover ? 1 : 0.9}
            strokeWidth="3"
            strokeLinecap="round"
            className="beaker-glass"
          />
          <path d={`M134 112 V${BOTTOM - 24}`} stroke="#fff" strokeOpacity="0.8" strokeWidth="6" strokeLinecap="round" />
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <line x1="252" x2="268" y1={130 + i * 40} y2={130 + i * 40} stroke="#7f9bba" strokeOpacity="0.7" strokeWidth="1.5" />
              <text x="248" y={134 + i * 40} textAnchor="end" className="beaker-mark">
                {200 - i * 50}
              </text>
            </g>
          ))}

          {/* label plate */}
          <g className="beaker-label">
            <rect x={CX - 72} y={BOTTOM - 62} width="144" height="26" rx="6" />
            <text x={CX} y={BOTTOM - 45} textAnchor="middle" style={{ fontSize: label.length > 16 ? 10 : undefined }}>
              {label.length > 24 ? label.slice(0, 23) + '…' : label}
            </text>
          </g>

          {/* drop-target hit area */}
          <rect ref={beakerHit} x="100" y="60" width="200" height="250" fill="transparent" />

          {/* results rack */}
          {showRack && (
          <g className="rack">
            <text x="430" y="-14" textAnchor="middle" className="rack-title">
              RESULTS RACK
            </text>
            <rect x="338" y="84" width="200" height="8" rx="4" className="rack-bar" />
            {showStrips && (['red', 'blue'] as const).map((paper) => {
              const outcome = tests[paper]
              const showStatic = outcome && active !== paper
              return (
                <g key={paper}>
                  {showStatic ? (
                    <g transform={`translate(${SLOT_X[paper]} ${SLOT_Y})`}>
                      <LitmusStrip paper={paper} wetColor={LITMUS_COLORS[outcome.resultPaper].wet} />
                    </g>
                  ) : (
                    <rect
                      x={SLOT_X[paper]}
                      y={SLOT_Y}
                      width="22"
                      height="110"
                      rx="4"
                      className="rack-slot"
                    />
                  )}
                  <text x={SLOT_X[paper] + 11} y="236" textAnchor="middle" className="rack-label">
                    {paper.toUpperCase()}
                  </text>
                </g>
              )
            })}

            {showBulb && (
            <g className="rack-bulb">
              <circle cx={BULB.x} cy={BULB.y} r="34" fill="url(#bulb-glow)" opacity={rackBulb} className="bulb-halo" />
              <circle cx={BULB.x} cy={BULB.y} r="15" fill={rackBulb ? '#fff3b0' : '#f4f8fc'} fillOpacity={rackBulb ? 0.4 + rackBulb * 0.6 : 1} stroke="#93aecb" strokeWidth="2" />
              <path d={`M${BULB.x - 5} ${BULB.y + 3} l3 -6 l4 6 l3 -6`} stroke={rackBulb ? '#ff9a1a' : '#93aecb'} strokeWidth="1.5" fill="none" />
              <rect x={BULB.x - 8} y={BULB.y + 14} width="16" height="12" rx="2" fill="#9fb3c9" />
              <text x={BULB.x} y="236" textAnchor="middle" className="rack-label">
                BULB
              </text>
            </g>
            )}
          </g>
          )}
        </svg>
      </div>

      <ToolTray
        tools={tools}
        busy={!!active}
        activeTool={active}
        done={{
          red: !!tests.red,
          blue: !!tests.blue,
          indicator: !!tests.indicator,
          conductivity: !!tests.conductivity,
        }}
        onUse={run}
        isOverTarget={isOverBeaker}
        onHoverTarget={setDropHover}
      />
    </div>
  )
}

/* ---------- SVG tool drawings ---------- */

function LitmusStrip({
  paper,
  wetRef,
  wetColor,
}: {
  paper: 'red' | 'blue'
  wetRef?: Ref<SVGRectElement>
  wetColor?: string
}) {
  const c = LITMUS_COLORS[paper]
  return (
    <g>
      <rect x="0" y="0" width="22" height="110" rx="3" fill={c.dry} />
      <rect x="0" y="0" width="22" height="110" rx="3" fill="url(#liquid-shade)" opacity="0.4" />
      <rect
        ref={wetRef}
        x="0"
        y="56"
        width="22"
        height="54"
        rx="3"
        style={{ fill: wetColor ?? c.wet, transformBox: 'fill-box', transformOrigin: '50% 100%' }}
      />
      <rect x="-2" y="-4" width="26" height="14" rx="3" fill="#5b6f8c" />
    </g>
  )
}

function Dropper({
  bulbRef,
  dropRef,
}: {
  bulbRef: Ref<SVGGElement>
  dropRef: Ref<SVGGElement>
}) {
  return (
    <g>
      <g ref={bulbRef} style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}>
        <rect x="0" y="0" width="24" height="32" rx="11" fill="#8b7cf6" />
        <rect x="4" y="4" width="6" height="18" rx="3" fill="#fff" opacity="0.18" />
      </g>
      <rect x="1" y="30" width="22" height="8" rx="2" fill="#2a3a5c" />
      <path d="M5 38 H19 V104 L13 116 H11 L5 104 Z" fill="rgba(235,245,255,0.7)" stroke="#7f9bba" strokeWidth="1.5" />
      <path d="M7 60 H17 V104 L12.5 113 H11.5 L7 104 Z" fill="#59c06b" opacity="0.85" />
      <g ref={dropRef} style={{ opacity: 0 }}>
        <path d="M12 116 q5 8 0 12 q-5 -4 0 -12z" fill="#59c06b" />
      </g>
    </g>
  )
}

function Tester({ glowRef, level }: { glowRef: Ref<SVGCircleElement>; level: number }) {
  return (
    <g>
      <circle ref={glowRef} cx="35" cy="-20" r="34" fill="url(#bulb-glow)" style={{ opacity: 0 }} />
      <circle cx="35" cy="-20" r="13" fill={level ? '#fff3b0' : '#f4f8fc'} fillOpacity={level ? 0.4 + level * 0.6 : 1} stroke="#7f9bba" strokeWidth="2" />
      <path d="M30 -17 l3 -6 l4 6 l3 -6" stroke={level ? '#ff9a1a' : '#9fb8d8'} strokeWidth="1.5" fill="none" />
      <rect x="27" y="-8" width="16" height="10" rx="2" fill="#7d93b5" />
      <rect x="0" y="2" width="70" height="34" rx="8" fill="#4b6487" />
      <rect x="8" y="12" width="30" height="14" rx="3" fill="#ffc857" opacity="0.85" />
      <text x="52" y="24" fontSize="10" fill="#cdeeff" fontFamily="var(--font-mono)">
        +−
      </text>
      <rect x="14" y="36" width="6" height="120" rx="2" fill="#b8c4d6" />
      <rect x="50" y="36" width="6" height="120" rx="2" fill="#b8c4d6" />
    </g>
  )
}
