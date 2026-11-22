import { useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as RPointerEvent } from 'react'
import { motion } from 'framer-motion'
import { Hand, ScanSearch } from 'lucide-react'
import { Slider } from '../../components/common/Slider'
import { sfx } from '../../lib/sound'
import type { SimProps } from '../types'
import { arcPath, clamp, deg, polar, rad, useSvgPoint } from '../shared/svg'
import './optics.css'

const LASER = '#ff2d55'

/* ---------------- Shared drawing pieces ---------------- */

function Beam({ x1, y1, x2, y2, opacity = 1, width = 4 }: { x1: number; y1: number; x2: number; y2: number; opacity?: number; width?: number }) {
  return (
    <g opacity={opacity} className="beam">
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={LASER} strokeWidth={width * 4} strokeOpacity="0.16" strokeLinecap="round" />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={LASER} strokeWidth={width} strokeLinecap="round" />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeWidth={width * 0.45} strokeLinecap="round" strokeDasharray="3 22" className="beam-photons" />
    </g>
  )
}

function AngleLabel({ cx, cy, r, from, to, label, color }: { cx: number; cy: number; r: number; from: number; to: number; label: string; color: string }) {
  const mid = polar(cx, cy, r + 26, (from + to) / 2)
  return (
    <g>
      <path d={arcPath(cx, cy, r, Math.min(from, to), Math.max(from, to))} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <g transform={`translate(${mid.x} ${mid.y})`}>
        <rect x="-34" y="-13" width="68" height="26" rx="13" fill="#fff" stroke={color} strokeWidth="1.5" />
        <text textAnchor="middle" y="5" className="angle-text" fill={color}>
          {label}
        </text>
      </g>
    </g>
  )
}

function Laser({ x, y, angle, dragging }: { x: number; y: number; angle: number; dragging: boolean }) {
  // angle: direction the laser points (degrees, 0 = up, clockwise)
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`} className={`laser${dragging ? ' is-dragging' : ''}`}>
      <circle r="30" fill="rgba(255,45,85,0.08)" className="laser-halo" />
      <rect x="-11" y="-6" width="22" height="46" rx="7" fill="#2f3b52" />
      <rect x="-11" y="-6" width="22" height="10" rx="4" fill={LASER} />
      <rect x="-7" y="10" width="14" height="4" rx="2" fill="#5b6f8c" />
      <circle cy="-6" r="4" fill="#fff" />
    </g>
  )
}

function useDrag(onMove: (x: number, y: number) => void) {
  const svgRef = useRef<SVGSVGElement>(null)
  const toSvg = useSvgPoint(svgRef)
  const [dragging, setDragging] = useState(false)
  const handlers = {
    onPointerDown: (e: RPointerEvent<SVGSVGElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId)
      setDragging(true)
      const p = toSvg(e.clientX, e.clientY)
      onMove(p.x, p.y)
    },
    onPointerMove: (e: RPointerEvent<SVGSVGElement>) => {
      if (!dragging) return
      const p = toSvg(e.clientX, e.clientY)
      onMove(p.x, p.y)
    },
    onPointerUp: () => setDragging(false),
    onPointerCancel: () => setDragging(false),
  }
  return { svgRef, dragging, handlers }
}

/* ---------------- Activity 1: reflection ---------------- */

const M = { x: 400, y: 360 }

export function ReflectionSim({ onReady }: SimProps) {
  const [alpha, setAlpha] = useState(-40) // laser position, degrees from vertical (left side)
  const [tilt, setTilt] = useState(0) // mirror tilt
  const [tried, setTried] = useState<Set<number>>(() => new Set())

  const { svgRef, dragging, handlers } = useDrag((x, y) => {
    const a = deg(Math.atan2(x - M.x, M.y - y))
    setAlpha(clamp(Math.round(a), -82 + tilt, tilt - 5))
  })

  const incidence = Math.round(tilt - alpha)

  useEffect(() => {
    const t = setTimeout(() => {
      setTried((s) => (s.has(Math.round(incidence / 5) * 5) ? s : new Set(s).add(Math.round(incidence / 5) * 5)))
    }, 250)
    return () => clearTimeout(t)
  }, [incidence])

  useEffect(() => {
    onReady(tried.size >= 3, `Angles tried: ${Math.min(tried.size, 3)}/3 · i = ${incidence}°, r = ${incidence}°`)
  }, [tried, incidence, onReady])

  const src = polar(M.x, M.y, 300, alpha)
  const out = polar(M.x, M.y, 330, 2 * tilt - alpha)

  return (
    <div className="sim">
      <div className="sim-stage optics-stage">
        <svg ref={svgRef} viewBox="0 0 800 440" {...handlers} role="img" aria-label="Laser reflecting off a mirror">
          <defs>
            <linearGradient id="mirror-g" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.4" stopColor="#cfe3f5" />
              <stop offset="1" stopColor="#7d9ab8" />
            </linearGradient>
          </defs>
          <Protractor cx={M.x} cy={M.y} r={170} tilt={tilt} />
          {/* normal */}
          <line
            x1={M.x}
            y1={M.y}
            x2={polar(M.x, M.y, 250, tilt).x}
            y2={polar(M.x, M.y, 250, tilt).y}
            stroke="#5b6f8c"
            strokeWidth="2"
            strokeDasharray="7 7"
          />
          <text {...polar(M.x, M.y, 262, tilt)} textAnchor="middle" className="svg-label">
            normal
          </text>
          <Beam x1={src.x} y1={src.y} x2={M.x} y2={M.y} />
          <Beam x1={M.x} y1={M.y} x2={out.x} y2={out.y} />
          <AngleLabel cx={M.x} cy={M.y} r={86} from={alpha} to={tilt} label={`i = ${incidence}°`} color="#e8590c" />
          <AngleLabel cx={M.x} cy={M.y} r={86} from={tilt} to={2 * tilt - alpha} label={`r = ${incidence}°`} color="#7c4dff" />
          {/* mirror */}
          <g transform={`rotate(${tilt} ${M.x} ${M.y})`}>
            <rect x={M.x - 230} y={M.y} width="460" height="14" rx="4" fill="url(#mirror-g)" stroke="#7f9bba" strokeWidth="1.5" />
            {Array.from({ length: 23 }, (_, i) => (
              <line key={i} x1={M.x - 224 + i * 20} y1={M.y + 14} x2={M.x - 234 + i * 20} y2={M.y + 26} stroke="#9fb3c9" strokeWidth="2" />
            ))}
          </g>
          <circle cx={M.x} cy={M.y} r="7" fill="#fff" stroke={LASER} strokeWidth="3" />
          <Laser x={src.x} y={src.y} angle={alpha + 180} dragging={dragging} />
        </svg>
        <span className="sim-hint">
          <Hand size={13} /> Drag to move the laser
        </span>
      </div>
      <div className="sim-controls">
        <Slider label="Laser angle (incidence)" value={incidence} min={5} max={80} unit="°" color="#e8590c" onChange={(v) => setAlpha(tilt - v)} />
        <Slider label="Mirror tilt" value={tilt} min={-15} max={15} unit="°" color="#5b6f8c" onChange={(v) => {
          setTilt(v)
          setAlpha((a) => clamp(a + (v - tilt), -82 + v, v - 5))
        }} />
      </div>
    </div>
  )
}

function Protractor({ cx, cy, r, tilt }: { cx: number; cy: number; r: number; tilt: number }) {
  const ticks = useMemo(() => Array.from({ length: 19 }, (_, i) => i * 10 - 90), [])
  return (
    <g transform={`rotate(${tilt} ${cx} ${cy})`} className="protractor">
      <path d={arcPath(cx, cy, r, -90, 90)} fill="rgba(255,255,255,0.7)" stroke="#c8d7e7" strokeWidth="1.5" />
      {ticks.map((t) => {
        const a = polar(cx, cy, r, t)
        const b = polar(cx, cy, r - (t % 30 === 0 ? 14 : 8), t)
        const l = polar(cx, cy, r - 26, t)
        return (
          <g key={t}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#9fb3c9" strokeWidth="1.5" />
            {t % 30 === 0 && (
              <text x={l.x} y={l.y + 4} textAnchor="middle" className="tick-text">
                {Math.abs(t)}
              </text>
            )}
          </g>
        )
      })}
    </g>
  )
}

/* ---------------- Activities 2 & 3: refraction / total internal reflection ---------------- */

const MEDIA = {
  water: { name: 'Water', n: 1.33, fill: '#cfe8ff', edge: '#7fb6e8' },
  glass: { name: 'Glass', n: 1.5, fill: '#d6f4f1', edge: '#6fc8bd' },
  diamond: { name: 'Diamond', n: 2.42, fill: '#ece4ff', edge: '#a68cf0' },
} as const
type MediumId = keyof typeof MEDIA

const P = { x: 400, y: 220 }

export function RefractionSim({ onReady }: SimProps) {
  return <RefractionLab mode="refract" onReady={onReady} />
}

export function TirSim(props: SimProps) {
  return <RefractionLab mode="tir" {...props} />
}

function RefractionLab({ mode, onReady, onChallenge, challengeDone }: SimProps & { mode: 'refract' | 'tir' }) {
  const [medium, setMedium] = useState<MediumId>(mode === 'tir' ? 'glass' : 'water')
  const [theta, setTheta] = useState(mode === 'tir' ? 25 : 40)
  const [mediaTried, setMediaTried] = useState<Set<MediumId>>(() => new Set([medium]))
  const [anglesTried, setAnglesTried] = useState<Set<number>>(() => new Set([theta]))
  const [sawTir, setSawTir] = useState(false)
  const n = MEDIA[medium].n
  const fromBelow = mode === 'tir'

  const { svgRef, dragging, handlers } = useDrag((x, y) => {
    const dx = P.x - x
    const dy = fromBelow ? y - P.y : P.y - y
    if (dy <= 4) return
    setTheta(clamp(Math.round(deg(Math.atan2(dx, dy))), 0, 85))
  })

  // Snell's law: n1 sin θ1 = n2 sin θ2
  const n1 = fromBelow ? n : 1
  const n2 = fromBelow ? 1 : n
  const s2 = (n1 / n2) * Math.sin(rad(theta))
  const tir = s2 > 1
  const theta2 = tir ? null : deg(Math.asin(s2))
  const critical = fromBelow ? deg(Math.asin(1 / n)) : null

  useEffect(() => {
    if (tir) setSawTir(true)
  }, [tir])

  useEffect(() => {
    const t = setTimeout(() => setAnglesTried((s) => (s.has(Math.round(theta / 5)) ? s : new Set(s).add(Math.round(theta / 5)))), 250)
    return () => clearTimeout(t)
  }, [theta])

  useEffect(() => {
    if (mode === 'refract') {
      onReady(
        mediaTried.size >= 2 && anglesTried.size >= 2,
        `Materials tried: ${Math.min(mediaTried.size, 2)}/2 · ${theta}° in air → ${theta2?.toFixed(1)}° in ${MEDIA[medium].name.toLowerCase()}`,
      )
    } else {
      onReady(sawTir, tir ? `Angle ${theta}° — light is trapped!` : `Angle ${theta}° → ${theta2?.toFixed(1)}° in air (critical ≈ ${critical?.toFixed(1)}°)`)
    }
  }, [mode, mediaTried, anglesTried, theta, theta2, medium, tir, sawTir, critical, onReady])

  const R = 260
  const src = fromBelow ? { x: P.x - R * Math.sin(rad(theta)), y: P.y + R * Math.cos(rad(theta)) } : polar(P.x, P.y, R, -theta)
  const reflEnd = fromBelow ? { x: P.x + 300 * Math.sin(rad(theta)), y: P.y + 300 * Math.cos(rad(theta)) } : polar(P.x, P.y, 300, theta)
  const refrEnd =
    theta2 === null
      ? null
      : fromBelow
        ? polar(P.x, P.y, 300, theta2)
        : { x: P.x + 300 * Math.sin(rad(theta2)), y: P.y + 300 * Math.cos(rad(theta2)) }
  const med = MEDIA[medium]

  const check = () => {
    if (!onChallenge || challengeDone) return
    if (tir) sfx.correct()
    onChallenge({
      correct: tir,
      given: `${theta}°`,
      explain: tir
        ? `At ${theta}° the light cannot escape into the air — it is totally internally reflected. Glass's critical angle is about ${critical?.toFixed(1)}°.`
        : `At ${theta}° some light still escapes into the air. Total internal reflection needs an angle bigger than the critical angle (about ${critical?.toFixed(1)}° for glass).`,
    })
  }

  return (
    <div className="sim">
      <div className="sim-stage optics-stage">
        <svg ref={svgRef} viewBox="0 0 800 440" {...handlers} role="img" aria-label="Laser refracting at a boundary">
          <defs>
            <pattern id={`facets-${medium}`} width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
              <rect width="40" height="40" fill={med.fill} />
              {medium === 'diamond' && <path d="M0 0 L20 20 L40 0" stroke="#fff" strokeOpacity="0.6" fill="none" />}
              {medium === 'water' && <path d="M0 20 q10 -6 20 0 t20 0" stroke="#fff" strokeOpacity="0.7" fill="none" strokeWidth="2" />}
              {medium === 'glass' && <line x1="0" y1="0" x2="0" y2="40" stroke="#fff" strokeOpacity="0.55" strokeWidth="6" />}
            </pattern>
          </defs>
          {/* top half */}
          <rect x="-1000" y="-200" width="2800" height={P.y + 200} fill="#f7fbff" />
          <text x="780" y={P.y - 16} textAnchor="end" className="medium-label">
            AIR  n = 1.00
          </text>
          {/* bottom half: medium */}
          <motion.rect
            key={medium}
            x="-1000"
            y={P.y}
            width="2800"
            height={440 - P.y + 200}
            fill={`url(#facets-${medium})`}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
          />
          <line x1="-1000" y1={P.y} x2="1800" y2={P.y} stroke={med.edge} strokeWidth="3" />
          <text x="780" y={P.y + 30} textAnchor="end" className="medium-label">
            {med.name.toUpperCase()}  n = {med.n.toFixed(2)}
          </text>
          {/* normal */}
          <line x1={P.x} y1={P.y - 200} x2={P.x} y2={P.y + 200} stroke="#5b6f8c" strokeWidth="2" strokeDasharray="7 7" />

          {/* incident */}
          <Beam x1={src.x} y1={src.y} x2={P.x} y2={P.y} />
          {/* partial / total reflection */}
          <Beam x1={P.x} y1={P.y} x2={reflEnd.x} y2={reflEnd.y} opacity={tir ? 1 : 0.22} width={tir ? 4 : 3} />
          {/* refracted */}
          {refrEnd && <Beam x1={P.x} y1={P.y} x2={refrEnd.x} y2={refrEnd.y} />}

          {fromBelow ? (
            <>
              <AngleLabel cx={P.x} cy={P.y} r={80} from={180} to={180 + theta} label={`${theta}°`} color="#e8590c" />
              {theta2 !== null && <AngleLabel cx={P.x} cy={P.y} r={80} from={0} to={theta2} label={`${theta2.toFixed(1)}°`} color="#7c4dff" />}
            </>
          ) : (
            <>
              <AngleLabel cx={P.x} cy={P.y} r={80} from={-theta} to={0} label={`${theta}°`} color="#e8590c" />
              {theta2 !== null && <AngleLabel cx={P.x} cy={P.y} r={80} from={180 - theta2} to={180} label={`${theta2.toFixed(1)}°`} color="#7c4dff" />}
            </>
          )}
          {tir && (
            <g transform={`translate(${P.x + 40} ${P.y - 60})`}>
              <rect x="0" y="-18" width="210" height="34" rx="17" fill="#fff" stroke={LASER} />
              <text x="105" y="4" textAnchor="middle" className="tir-text">
                Total internal reflection!
              </text>
            </g>
          )}
          <circle cx={P.x} cy={P.y} r="6" fill="#fff" stroke={LASER} strokeWidth="3" />
          <Laser x={src.x} y={src.y} angle={fromBelow ? theta : 180 - theta} dragging={dragging} />
        </svg>
        <span className="sim-hint">
          <Hand size={13} /> Drag to move the laser
        </span>
      </div>
      <div className="sim-controls">
        <Slider
          label={fromBelow ? 'Angle inside the glass' : 'Angle of incidence'}
          value={theta}
          min={0}
          max={85}
          unit="°"
          color="#e8590c"
          onChange={setTheta}
        />
        {mode === 'refract' ? (
          <div>
            <p className="control-label">Material</p>
            <div className="chip-row">
              {(Object.keys(MEDIA) as MediumId[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  className={`chip${medium === id ? ' is-active' : ''}`}
                  onClick={() => {
                    sfx.click()
                    setMedium(id)
                    setMediaTried((s) => new Set(s).add(id))
                  }}
                >
                  <i style={{ background: MEDIA[id].edge }} /> {MEDIA[id].name}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="tir-check">
            <button className="btn btn-primary" onClick={check} disabled={challengeDone}>
              <ScanSearch size={16} /> {challengeDone ? 'Challenge done' : 'Check: is the light trapped?'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
