import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Play } from 'lucide-react'
import { Slider } from '../../components/common/Slider'
import { sfx } from '../../lib/sound'
import type { SimProps } from '../types'
import './gravity.css'

const G = 6.674e-11

const BODIES = {
  earth: { name: 'Earth', mass: 5.97e24, colors: ['#4dabf7', '#1c7ed6'], land: '#51cf66' },
  moon: { name: 'Moon', mass: 7.35e22, colors: ['#e9ecef', '#adb5bd'], land: '#ced4da' },
  mars: { name: 'Mars', mass: 6.42e23, colors: ['#ff8a65', '#d9480f'], land: '#e8590c' },
  ceres: { name: 'Ceres (asteroid)', mass: 9.38e20, colors: ['#c9a27e', '#8d6e52'], land: '#a1887f' },
} as const
type BodyId = keyof typeof BODIES

const SUP: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
/** 1.98e20 → "1.98 × 10²⁰" */
export function sci(v: number, digits = 2) {
  if (v === 0) return '0'
  const e = Math.floor(Math.log10(Math.abs(v)))
  const m = v / 10 ** e
  return `${m.toFixed(digits)} × 10${String(e).split('').map((c) => SUP[c]).join('')}`
}

export function gravityForce(m1: number, m2: number, distanceKm: number) {
  const r = distanceKm * 1000
  return (G * m1 * m2) / (r * r)
}

type Mode = 'mass' | 'distance' | 'pull'

function GravityLab({ mode, onReady }: { mode: Mode } & SimProps) {
  const [a, setA] = useState<BodyId>('earth')
  const [b, setB] = useState<BodyId>('moon')
  const [kA, setKA] = useState(1)
  const [kB, setKB] = useState(1)
  const [dist, setDist] = useState(380000)
  const reduce = useReducedMotion()

  const mA = BODIES[a].mass * kA
  const mB = BODIES[b].mass * kB
  const F = gravityForce(mA, mB, dist)
  // Baseline force for "compared with start" — reset when a different body is chosen.
  const [F0, setF0] = useState(F)
  const ratio = F / F0
  const [releasing, setReleasing] = useState(false)

  // Exploration tracking for each activity
  const [seenMass, setSeenMass] = useState<Set<string>>(() => new Set([`${kA}-${kB}`]))
  const [seenDist, setSeenDist] = useState<Set<number>>(() => new Set([dist]))
  const [released, setReleased] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setSeenMass((s) => (s.has(`${kA}-${kB}`) ? s : new Set(s).add(`${kA}-${kB}`))), 200)
    return () => clearTimeout(t)
  }, [kA, kB])
  useEffect(() => {
    const t = setTimeout(() => setSeenDist((s) => (s.has(dist) ? s : new Set(s).add(dist))), 250)
    return () => clearTimeout(t)
  }, [dist])

  const distRange = Math.max(...seenDist) / Math.min(...seenDist)
  useEffect(() => {
    const fx = `F = ${sci(F)} N (×${ratio.toFixed(2)})`
    if (mode === 'mass') onReady(seenMass.size >= 3, `Mass settings tried: ${Math.min(seenMass.size, 3)}/3 · ${fx}`)
    else if (mode === 'distance')
      onReady(seenDist.size >= 3 && distRange >= 2, `Distances tried: ${Math.min(seenDist.size, 3)}/3${distRange < 2 ? ' · try doubling it' : ''} · ${fx}`)
    else onReady(released, released ? 'Watch how far each one moved.' : 'Press Release when ready.')
  }, [mode, seenMass, seenDist, distRange, released, F, ratio, onReady])

  /* ----- layout ----- */
  const px = 160 + ((dist - 50000) / (800000 - 50000)) * 460 // centre-to-centre pixels
  const radius = (m: number) => Math.max(10, Math.min(70, 10 + 9 * Math.log10(m / 1e20)))
  const rA = radius(mA)
  const rB = radius(mB)
  const arrow = Math.max(14, Math.min(200, 80 * ratio))

  /* ----- release animation ----- */
  const [offset, setOffset] = useState({ a: 0, b: 0, hit: false })
  const raf = useRef(0)
  const release = () => {
    if (raf.current) return
    sfx.select()
    setReleasing(true)
    const gap = px - rA - rB
    const fa = mB / (mA + mB) // share of the closing distance each body travels
    let prev = 0
    let closed = 0
    let v = 0
    const tick = (t: number) => {
      const dt = prev ? Math.min(0.05, (t - prev) / 1000) * (reduce ? 4 : 1) : 0
      prev = t
      const d = Math.max(1, px - closed)
      v += (9e5 / (d * d)) * dt * 60
      closed = Math.min(gap, closed + v * dt)
      setOffset({ a: closed * fa, b: closed * (1 - fa), hit: closed >= gap })
      if (closed < gap) raf.current = requestAnimationFrame(tick)
      else {
        sfx.buzz(1)
        setReleased(true)
        setTimeout(() => {
          raf.current = 0
          setReleasing(false)
          setOffset({ a: 0, b: 0, hit: false })
        }, 1800)
      }
    }
    raf.current = requestAnimationFrame(tick)
  }
  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  const cx = 400
  const xA = cx - px / 2 + offset.a
  const xB = cx + px / 2 - offset.b
  const stars = useMemo(() => Array.from({ length: 60 }, (_, i) => ({ x: (i * 137) % 800, y: (i * 89) % 380, r: (i % 3) * 0.6 + 0.6 })), [])

  return (
    <div className="sim">
      <div className="sim-stage gravity-stage">
        <svg viewBox="0 0 800 380" role="img" aria-label={`Gravitational force ${sci(F)} newtons`}>
          <defs>
            {(['A', 'B'] as const).map((k) => {
              const body = BODIES[k === 'A' ? a : b]
              return (
                <radialGradient key={k} id={`planet-${k}`} cx="0.35" cy="0.35" r="0.75">
                  <stop offset="0" stopColor={body.colors[0]} />
                  <stop offset="1" stopColor={body.colors[1]} />
                </radialGradient>
              )
            })}
          </defs>
          {stars.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#8c7ae6" opacity={0.25 + (i % 4) * 0.12} className={i % 5 === 0 ? 'twinkle' : ''} />
          ))}
          {/* distance ruler */}
          <g opacity="0.7">
            <line x1={cx - px / 2} y1="330" x2={cx + px / 2} y2="330" stroke="#7c4dff" strokeWidth="2" />
            <line x1={cx - px / 2} y1="322" x2={cx - px / 2} y2="338" stroke="#7c4dff" strokeWidth="2" />
            <line x1={cx + px / 2} y1="322" x2={cx + px / 2} y2="338" stroke="#7c4dff" strokeWidth="2" />
            <rect x={cx - 70} y="318" width="140" height="24" rx="12" fill="#fff" />
            <text x={cx} y="335" textAnchor="middle" className="grav-label">
              {dist.toLocaleString()} km
            </text>
          </g>
          {/* gravity "threads" */}
          {!offset.hit && (
            <line x1={xA + rA} y1="180" x2={xB - rB} y2="180" stroke="#b197fc" strokeWidth="3" strokeDasharray="2 14" strokeLinecap="round" className="grav-flow" style={{ animationDuration: `${Math.max(0.25, 1.4 / Math.sqrt(ratio))}s` }} />
          )}
          {/* pull arrows */}
          {!offset.hit && (
            <>
              <PullArrow x={xA + rA + 6} length={Math.min(arrow, px / 2 - rA - 10)} />
              <PullArrow x={xB - rB - 6} length={-Math.min(arrow, px / 2 - rB - 10)} />
            </>
          )}
          <Planet x={xA} r={rA} id="A" body={a} />
          <Planet x={xB} r={rB} id="B" body={b} />
          <text x={xA} y={180 + rA + 24} textAnchor="middle" className="grav-name">
            {BODIES[a].name.split(' ')[0]} {kA !== 1 ? `×${kA}` : ''}
          </text>
          <text x={xB} y={180 + rB + 24} textAnchor="middle" className="grav-name">
            {BODIES[b].name.split(' ')[0]} {kB !== 1 ? `×${kB}` : ''}
          </text>
          {offset.hit && (
            <motion.circle cx={xA + rA} cy="180" initial={{ r: 4, opacity: 0.9 }} animate={{ r: 90, opacity: 0 }} transition={{ duration: 0.9 }} fill="#ffd43b" />
          )}
        </svg>
        <span className="sim-hint">F = G × m₁ × m₂ ÷ r²</span>
      </div>

      <div className="sim-controls">
        {mode !== 'distance' && (
          <>
            <BodyPicker label="Object 1" value={a} onChange={(v) => { setA(v); setF0(gravityForce(BODIES[v].mass * kA, mB, dist)) }} />
            <BodyPicker label="Object 2" value={b} onChange={(v) => { setB(v); setF0(gravityForce(mA, BODIES[v].mass * kB, dist)) }} />
          </>
        )}
        {mode === 'mass' && (
          <>
            <Slider label={`${BODIES[a].name.split(' ')[0]} mass`} value={kA} min={0.5} max={4} step={0.5} format={(v) => `× ${v}`} color="#7c4dff" onChange={setKA} />
            <Slider label={`${BODIES[b].name.split(' ')[0]} mass`} value={kB} min={0.5} max={4} step={0.5} format={(v) => `× ${v}`} color="#e64980" onChange={setKB} />
          </>
        )}
        {mode === 'distance' && (
          <Slider label="Distance between centres" value={dist} min={50000} max={800000} step={10000} format={(v) => `${v.toLocaleString()} km`} color="#7c4dff" onChange={setDist} />
        )}
        {mode === 'pull' && (
          <div className="motion-actions">
            <button className="btn btn-primary" onClick={release} disabled={releasing}>
              <Play size={16} /> Release!
            </button>
          </div>
        )}
      </div>

      <div className="sim-readouts">
        <span className="readout">
          <small>Mass 1</small>
          <strong>{sci(mA)} kg</strong>
        </span>
        <span className="readout">
          <small>Mass 2</small>
          <strong>{sci(mB)} kg</strong>
        </span>
        <span className="readout">
          <small>Distance</small>
          <strong>{dist.toLocaleString()} km</strong>
        </span>
        <span className="readout is-key">
          <small>Gravitational force</small>
          <strong>{sci(F)} N</strong>
        </span>
        <span className="readout is-key">
          <small>Compared with start</small>
          <strong>× {ratio >= 0.01 ? ratio.toFixed(2) : ratio.toExponential(1)}</strong>
        </span>
      </div>
    </div>
  )
}

function Planet({ x, r, id, body }: { x: number; r: number; id: 'A' | 'B'; body: BodyId }) {
  const b = BODIES[body]
  return (
    <g transform={`translate(${x} 180)`}>
      <circle r={r + 10} fill={b.colors[0]} opacity="0.15" />
      <circle r={r} fill={`url(#planet-${id})`} />
      {body === 'earth' && (
        <path d={`M${-r * 0.5} ${-r * 0.2} q${r * 0.3} ${-r * 0.4} ${r * 0.6} ${-r * 0.1} q${r * 0.2} ${r * 0.4} ${-r * 0.2} ${r * 0.5} z`} fill={b.land} opacity="0.85" />
      )}
      {(body === 'moon' || body === 'ceres') && (
        <>
          <circle cx={-r * 0.3} cy={-r * 0.2} r={r * 0.18} fill="#000" opacity="0.1" />
          <circle cx={r * 0.25} cy={r * 0.3} r={r * 0.12} fill="#000" opacity="0.1" />
        </>
      )}
      <circle r={r} fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="2" />
    </g>
  )
}

function PullArrow({ x, length }: { x: number; length: number }) {
  const dir = Math.sign(length)
  const tip = x + length
  return (
    <g>
      <line x1={x} y1="180" x2={tip - dir * 12} y2="180" stroke="#7c4dff" strokeWidth="7" strokeLinecap="round" />
      <path d={`M${tip} 180 l${-dir * 16} -11 v22 z`} fill="#7c4dff" />
    </g>
  )
}

function BodyPicker({ label, value, onChange }: { label: string; value: BodyId; onChange: (b: BodyId) => void }) {
  return (
    <div className="full">
      <p className="control-label">{label}</p>
      <div className="chip-row">
        {(Object.keys(BODIES) as BodyId[]).map((id) => (
          <button
            key={id}
            type="button"
            className={`chip${value === id ? ' is-active' : ''}`}
            onClick={() => {
              sfx.click()
              onChange(id)
            }}
          >
            <i style={{ background: BODIES[id].colors[0] }} /> {BODIES[id].name.split(' ')[0]}
          </button>
        ))}
      </div>
    </div>
  )
}

export const MassSim = (p: SimProps) => <GravityLab mode="mass" {...p} />
export const DistanceSim = (p: SimProps) => <GravityLab mode="distance" {...p} />
export const PullSim = (p: SimProps) => <GravityLab mode="pull" {...p} />
