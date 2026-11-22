import { useCallback, useEffect, useRef, useState } from 'react'
import type { MutableRefObject, ReactNode } from 'react'
import { useReducedMotion } from 'framer-motion'
import { ArrowLeftRight, Hand, Play, RotateCcw } from 'lucide-react'
import { Slider } from '../../components/common/Slider'
import { sfx } from '../../lib/sound'
import type { SimProps } from '../types'
import './motion.css'

const PX_PER_M = 40

/** Portion of this time step that falls inside the force window [0, end]. */
const inWindow = (t: number, dt: number, end: number) => Math.max(0, Math.min(t, end) - Math.max(0, t - dt))
const GROUND = 300
const W = 800

/**
 * requestAnimationFrame loop with real elapsed time (seconds).
 * The simulation mutates `simRef`; each frame a snapshot is published as state for rendering.
 */
function useLoop<T extends object>(simRef: MutableRefObject<T>, step: (dt: number) => boolean) {
  const raf = useRef(0)
  // Initial snapshot is taken once from the starting simulation state.
  // oxlint-disable-next-line react/refs
  const [snap, setSnap] = useState<T>(() => ({ ...simRef.current }))
  const [running, setRunning] = useState(false)
  const stepRef = useRef(step)
  useEffect(() => {
    stepRef.current = step
  })
  const reduce = useReducedMotion()

  const start = useCallback(() => {
    cancelAnimationFrame(raf.current)
    setRunning(true)
    let prev = 0
    const tick = (t: number) => {
      // Reduced motion: jump through the simulation faster.
      const dt = prev ? Math.min(0.05, (t - prev) / 1000) * (reduce ? 4 : 1) : 0
      prev = t
      const keep = stepRef.current(dt)
      setSnap({ ...simRef.current })
      if (keep) raf.current = requestAnimationFrame(tick)
      else setRunning(false)
    }
    raf.current = requestAnimationFrame(tick)
  }, [reduce, simRef])

  /** Publish the current simulation state without running (after a reset). */
  const sync = useCallback(() => setSnap({ ...simRef.current }), [simRef])

  useEffect(() => () => cancelAnimationFrame(raf.current), [])
  return { start, running, snap, sync }
}

/* ---------------- Scene pieces ---------------- */

function Scene({ camX, surface = 'track', children }: { camX: number; surface?: 'track' | 'ice' | 'grass'; children: ReactNode }) {
  const first = Math.floor(camX / PX_PER_M) - 1
  const marks = Array.from({ length: Math.ceil(W / PX_PER_M) + 3 }, (_, i) => first + i)
  const ground = surface === 'ice' ? '#dff3ff' : surface === 'grass' ? '#bfe7a8' : '#e9eef6'
  const edge = surface === 'ice' ? '#9fd6f5' : surface === 'grass' ? '#7cc45e' : '#c3cfdf'
  return (
    <svg viewBox={`0 0 ${W} 380`} role="img" aria-label="Motion simulation">
      <defs>
        <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#e8f4ff" />
          <stop offset="1" stopColor="#fdfdff" />
        </linearGradient>
      </defs>
      <rect x={-1000} y={-200} width={W + 2000} height={GROUND + 200} fill="url(#sky)" />
      {/* parallax hills */}
      <g transform={`translate(${-(camX * 0.2) % 400} 0)`} opacity="0.5">
        {[0, 400, 800].map((x) => (
          <path key={x} d={`M${x} ${GROUND} q100 -90 200 0 q100 -60 200 0 Z`} fill="#d6e9fb" />
        ))}
      </g>
      <rect x={-1000} y={GROUND} width={W + 2000} height={280} fill={ground} />
      <rect x={-1000} y={GROUND} width={W + 2000} height={4} fill={edge} />
      {surface === 'grass' &&
        Array.from({ length: 40 }, (_, i) => {
          const x = ((i * 23 - camX) % W + W) % W
          return <path key={i} d={`M${x} ${GROUND + 4} l3 -9 l3 9`} fill="#7cc45e" />
        })}
      {surface === 'ice' &&
        Array.from({ length: 10 }, (_, i) => {
          const x = ((i * 97 - camX) % W + W) % W
          return <line key={i} x1={x} y1={GROUND + 16} x2={x + 40} y2={GROUND + 16} stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        })}
      {marks.map((m) => {
        const x = m * PX_PER_M - camX
        return (
          <g key={m}>
            <line x1={x} y1={GROUND + 4} x2={x} y2={GROUND + (m % 5 === 0 ? 22 : 12)} stroke="#8195ad" strokeWidth="1.5" />
            {m % 5 === 0 && (
              <text x={x} y={GROUND + 38} textAnchor="middle" className="mark-text">
                {m} m
              </text>
            )}
          </g>
        )
      })}
      {children}
    </svg>
  )
}

function Arrow({ x, y, length, color, label, up = 0 }: { x: number; y: number; length: number; color: string; label?: string; up?: number }) {
  if (Math.abs(length) < 2) return null
  const dir = Math.sign(length)
  const tip = x + length
  return (
    <g className="force-arrow">
      <line x1={x} y1={y} x2={tip - dir * 12} y2={y} stroke={color} strokeWidth="8" strokeLinecap="round" />
      <path d={`M${tip} ${y} l${-dir * 18} -12 v24 z`} fill={color} />
      {label && (
        <text x={x + length / 2} y={y - 14 - up} textAnchor="middle" className="arrow-text" fill={color}>
          {label}
        </text>
      )}
    </g>
  )
}

type Thing = 'skateboard' | 'trolley' | 'crate'
const THINGS: Record<Thing, { name: string; mass: number }> = {
  skateboard: { name: 'Skateboard', mass: 2 },
  trolley: { name: 'Shopping trolley', mass: 8 },
  crate: { name: 'Wooden crate', mass: 20 },
}

function Body({ thing, x }: { thing: Thing; x: number }) {
  const y = GROUND
  if (thing === 'skateboard')
    return (
      <g transform={`translate(${x} ${y})`}>
        <rect x="-36" y="-16" width="72" height="8" rx="4" fill="#e8590c" />
        <circle cx="-22" cy="-5" r="6" fill="#2f3b52" />
        <circle cx="22" cy="-5" r="6" fill="#2f3b52" />
      </g>
    )
  if (thing === 'trolley')
    return (
      <g transform={`translate(${x} ${y})`}>
        <path d="M-40 -66 h76 l-8 40 h-60 z" fill="#cfe3f5" stroke="#4b6487" strokeWidth="3" />
        {[-28, -12, 4, 20].map((gx) => (
          <line key={gx} x1={gx} y1="-62" x2={gx} y2="-30" stroke="#4b6487" strokeWidth="1.5" />
        ))}
        <path d="M36 -66 l14 -14" stroke="#4b6487" strokeWidth="4" strokeLinecap="round" />
        <circle cx="-26" cy="-8" r="8" fill="#2f3b52" />
        <circle cx="22" cy="-8" r="8" fill="#2f3b52" />
      </g>
    )
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-42" y="-80" width="84" height="80" rx="4" fill="#d9a066" stroke="#8a5a2b" strokeWidth="3" />
      <path d="M-42 -80 L42 0 M42 -80 L-42 0" stroke="#8a5a2b" strokeWidth="3" />
      <rect x="-42" y="-80" width="84" height="80" rx="4" fill="none" stroke="#8a5a2b" strokeWidth="6" />
    </g>
  )
}

/* ---------------- Activity 1: F = m a ---------------- */

export function SecondLawSim({ onReady }: SimProps) {
  const [thing, setThing] = useState<Thing>('trolley')
  const [mass, setMass] = useState(8)
  const [force, setForce] = useState(20)
  const [dir, setDir] = useState(1)
  const sim = useRef({ x: 0, v: 0, t: 0, pushing: false })
  const [runs, setRuns] = useState<{ m: number; f: number; a: number }[]>([])
  const { start, running, snap } = useLoop(sim, (dt) => {
    const s = sim.current
    s.t += dt
    const pushDt = inWindow(s.t, dt, 1)
    s.pushing = s.t <= 1
    s.v += ((dir * force) / mass) * pushDt
    s.x += s.v * dt
    return s.t < 3
  })

  useEffect(() => {
    const masses = new Set(runs.map((r) => r.m)).size
    onReady(runs.length >= 3 && masses >= 2, `Pushes: ${Math.min(runs.length, 3)}/3 · masses tried: ${Math.min(masses, 2)}/2`)
  }, [runs, onReady])

  const push = () => {
    if (running) return
    sfx.select()
    Object.assign(sim.current, { x: 0, v: 0, t: 0, pushing: true })
    setRuns((r) => [{ m: mass, f: force, a: force / mass }, ...r].slice(0, 6))
    start()
  }

  const s = snap
  const xPx = s.x * PX_PER_M
  const camX = xPx - (dir > 0 ? 260 : 540)
  const accel = force / mass

  return (
    <div className="sim">
      <div className="sim-stage motion-stage">
        <Scene camX={camX}>
          <Body thing={thing} x={xPx - camX} />
          {s.pushing && (
            <Arrow x={xPx - camX - dir * 60} y={GROUND - 110} length={dir * (20 + force * 2.4)} color="#e8590c" label={`F = ${force} N`} />
          )}
          {!s.pushing && Math.abs(s.v) > 0.01 && (
            <Arrow x={xPx - camX} y={GROUND - 110} length={dir * Math.min(220, Math.abs(s.v) * 6 + 20)} color="#2a8cf0" label={`v = ${Math.abs(s.v).toFixed(1)} m/s`} />
          )}
        </Scene>
        <span className="sim-hint">
          <Hand size={13} /> Frictionless track · a = F ÷ m = {accel.toFixed(1)} m/s²
        </span>
      </div>
      <div className="sim-controls">
        <div className="full">
          <p className="control-label">Object</p>
          <div className="chip-row">
            {(Object.keys(THINGS) as Thing[]).map((t) => (
              <button
                key={t}
                type="button"
                className={`chip${thing === t ? ' is-active' : ''}`}
                onClick={() => {
                  sfx.click()
                  setThing(t)
                  setMass(THINGS[t].mass)
                }}
              >
                {THINGS[t].name}
              </button>
            ))}
          </div>
        </div>
        <Slider label="Mass" value={mass} min={1} max={30} unit=" kg" color="#5b6f8c" onChange={setMass} />
        <Slider label="Force" value={force} min={5} max={60} step={5} unit=" N" color="#e8590c" onChange={setForce} />
        <div className="motion-actions">
          <button className="btn" onClick={() => setDir((d) => -d)} aria-label="Change push direction">
            <ArrowLeftRight size={16} /> {dir > 0 ? 'Push right' : 'Push left'}
          </button>
          <button className="btn btn-primary" onClick={push}>
            <Play size={16} /> Push!
          </button>
        </div>
      </div>
      <div className="sim-readouts">
        <span className="readout">
          <small>Force</small>
          <strong>{force} N</strong>
        </span>
        <span className="readout">
          <small>Mass</small>
          <strong>{mass} kg</strong>
        </span>
        <span className="readout is-key">
          <small>Acceleration</small>
          <strong>{accel.toFixed(2)} m/s²</strong>
        </span>
        {runs.length > 0 && (
          <span className="readout runs">
            <small>Your pushes</small>
            <strong>
              {runs
                .slice(0, 3)
                .map((r) => `${r.f} N ÷ ${r.m} kg = ${r.a.toFixed(1)}`)
                .join('  ·  ')}
            </strong>
          </span>
        )}
      </div>
    </div>
  )
}

/* ---------------- Activity 2: inertia ---------------- */

const SURFACES = { ice: { name: 'Ice (no friction)', mu: 0 }, grass: { name: 'Grass (friction)', mu: 0.35 } } as const
type SurfaceId = keyof typeof SURFACES

export function FirstLawSim({ onReady }: SimProps) {
  const [surface, setSurface] = useState<SurfaceId>('ice')
  const [tried, setTried] = useState<Set<SurfaceId>>(() => new Set())
  const sim = useRef({ x: 0, v: 0, t: 0 })
  const { start, running, snap, sync } = useLoop(sim, (dt) => {
    const s = sim.current
    s.t += dt
    const flick = inWindow(s.t, dt, 0.2)
    s.v += (6 / 0.2) * flick // short flick up to exactly 6 m/s
    const after = dt - flick
    if (after > 0 && s.v > 0) s.v = Math.max(0, s.v - SURFACES[surface].mu * 9.8 * after)
    s.x += s.v * dt
    return s.t < 5
  })

  useEffect(() => {
    onReady(tried.size >= 2, `Surfaces tried: ${tried.size}/2`)
  }, [tried, onReady])

  const flick = () => {
    if (running) return
    sfx.select()
    Object.assign(sim.current, { x: 0, v: 0, t: 0 })
    setTried((t) => new Set(t).add(surface))
    start()
  }

  const s = snap
  const xPx = s.x * PX_PER_M
  const camX = Math.max(0, xPx - 300)
  return (
    <div className="sim">
      <div className="sim-stage motion-stage">
        <Scene camX={camX} surface={surface}>
          <g transform={`translate(${xPx - camX + 80} ${GROUND})`}>
            <ellipse cx="0" cy="-8" rx="26" ry="9" fill="#1f2937" />
            <rect x="-26" y="-16" width="52" height="8" fill="#1f2937" />
            <ellipse cx="0" cy="-16" rx="26" ry="9" fill="#374151" />
          </g>
          {s.t > 0 && s.t < 0.2 && <Arrow x={xPx - camX + 20} y={GROUND - 60} length={90} color="#e8590c" label="push" />}
          {s.t >= 0.2 && s.v > 0.05 && surface === 'grass' && (
            <Arrow x={xPx - camX + 140} y={GROUND - 60} length={-70} color="#e5484d" label="friction" />
          )}
          {s.v > 0.05 && (
            <Arrow x={xPx - camX + 80} y={GROUND - 110} length={s.v * 18} color="#2a8cf0" label={`${s.v.toFixed(1)} m/s`} up={0} />
          )}
        </Scene>
        <span className="sim-hint">
          {s.t === 0 ? 'Press Flick to push the puck' : s.v > 0.05 ? `Still moving: ${s.v.toFixed(1)} m/s` : `Stopped after ${s.x.toFixed(1)} m`}
        </span>
      </div>
      <div className="sim-controls">
        <div className="full">
          <p className="control-label">Surface</p>
          <div className="chip-row">
            {(Object.keys(SURFACES) as SurfaceId[]).map((id) => (
              <button
                key={id}
                type="button"
                className={`chip${surface === id ? ' is-active' : ''}`}
                disabled={running}
                onClick={() => {
                  sfx.click()
                  setSurface(id)
                  Object.assign(sim.current, { x: 0, v: 0, t: 0 })
                  sync()
                }}
              >
                {SURFACES[id].name}
              </button>
            ))}
          </div>
        </div>
        <div className="motion-actions">
          <button className="btn btn-primary" onClick={flick}>
            <Play size={16} /> Flick the puck
          </button>
        </div>
      </div>
      <div className="sim-readouts">
        <span className="readout">
          <small>Time</small>
          <strong>{s.t.toFixed(1)} s</strong>
        </span>
        <span className="readout is-key">
          <small>Speed</small>
          <strong>{s.v.toFixed(2)} m/s</strong>
        </span>
        <span className="readout">
          <small>Distance</small>
          <strong>{s.x.toFixed(1)} m</strong>
        </span>
      </div>
    </div>
  )
}

/* ---------------- Activity 3: action & reaction ---------------- */

const PUSH_FORCE = 150
const PUSH_TIME = 0.4

function Skater({ x, mass, color, flip }: { x: number; mass: number; color: string; flip?: boolean }) {
  const s = 0.75 + (mass - 30) / 160
  return (
    <g transform={`translate(${x} ${GROUND}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx="0" cy="-2" rx="26" ry="4" fill="#1f2937" opacity="0.15" />
      <path d="M-12 -4 h24" stroke="#4b6487" strokeWidth="4" strokeLinecap="round" />
      <path d="M-6 -6 l4 -40 M6 -6 l-2 -40" stroke="#2f3b52" strokeWidth="8" strokeLinecap="round" />
      <rect x="-16" y="-92" width="32" height="50" rx="14" fill={color} />
      <path d="M14 -80 l22 6" stroke={color} strokeWidth="9" strokeLinecap="round" />
      <circle cx="0" cy="-106" r="15" fill="#ffd8b8" />
      <path d="M-15 -110 a15 15 0 0 1 30 0 z" fill="#3b2f2a" />
    </g>
  )
}

export function ThirdLawSim({ onReady }: SimProps) {
  const [mA, setMA] = useState(40)
  const [mB, setMB] = useState(70)
  const [tried, setTried] = useState<Set<string>>(() => new Set())
  const sim = useRef({ xa: 0, xb: 0, va: 0, vb: 0, t: 0 })
  const { start, running, snap, sync } = useLoop(sim, (dt) => {
    const s = sim.current
    s.t += dt
    const push = inWindow(s.t, dt, PUSH_TIME)
    s.va -= (PUSH_FORCE / mA) * push
    s.vb += (PUSH_FORCE / mB) * push
    s.xa += s.va * dt
    s.xb += s.vb * dt
    return s.t < 3
  })

  useEffect(() => {
    onReady(tried.size >= 2, `Combinations tried: ${Math.min(tried.size, 2)}/2`)
  }, [tried, onReady])

  const push = () => {
    if (running) return
    sfx.select()
    Object.assign(sim.current, { xa: 0, xb: 0, va: 0, vb: 0, t: 0 })
    setTried((t) => new Set(t).add(`${mA}-${mB}`))
    start()
  }
  const reset = () => {
    if (running) return
    Object.assign(sim.current, { xa: 0, xb: 0, va: 0, vb: 0, t: 0 })
    sync()
  }

  const s = snap
  const scale = 60
  const ax = 360 + s.xa * scale
  const bx = 440 + s.xb * scale
  const pushing = s.t > 0 && s.t <= PUSH_TIME
  return (
    <div className="sim">
      <div className="sim-stage motion-stage">
        <Scene camX={0} surface="ice">
          <Skater x={ax} mass={mA} color="#e64980" />
          <Skater x={bx} mass={mB} color="#2a8cf0" flip />
          {pushing && (
            <>
              <Arrow x={ax - 10} y={GROUND - 150} length={-110} color="#e64980" label={`${PUSH_FORCE} N`} />
              <Arrow x={bx + 10} y={GROUND - 150} length={110} color="#2a8cf0" label={`${PUSH_FORCE} N`} />
            </>
          )}
          <text x={ax} y={GROUND + 60} textAnchor="middle" className="skater-label" fill="#e64980">
            A · {mA} kg
          </text>
          <text x={bx} y={GROUND + 60} textAnchor="middle" className="skater-label" fill="#2a8cf0">
            B · {mB} kg
          </text>
        </Scene>
        <span className="sim-hint">Equal forces, opposite directions</span>
      </div>
      <div className="sim-controls">
        <Slider label="Skater A mass" value={mA} min={30} max={90} step={5} unit=" kg" color="#e64980" onChange={setMA} />
        <Slider label="Skater B mass" value={mB} min={30} max={90} step={5} unit=" kg" color="#2a8cf0" onChange={setMB} />
        <div className="motion-actions">
          <button className="btn" onClick={reset} aria-label="Reset skaters">
            <RotateCcw size={16} /> Reset
          </button>
          <button className="btn btn-primary" onClick={push}>
            <Play size={16} /> Push off!
          </button>
        </div>
      </div>
      <div className="sim-readouts">
        <span className="readout is-key">
          <small>Force on each</small>
          <strong>{PUSH_FORCE} N</strong>
        </span>
        <span className="readout">
          <small>Speed of A</small>
          <strong>{Math.abs(s.va).toFixed(2)} m/s</strong>
        </span>
        <span className="readout">
          <small>Speed of B</small>
          <strong>{Math.abs(s.vb).toFixed(2)} m/s</strong>
        </span>
      </div>
    </div>
  )
}
