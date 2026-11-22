import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { RotateCcw } from 'lucide-react'
import { phColor } from '../../lib/chemistry'
import './molecule.css'

/**
 * Conceptual (not-to-scale) particle model of ONE indicator dye in solution.
 *  - Acid form (H attached) looks yellow, base form (H removed) looks blue.
 *  - H⁺ ions attach to base-form molecules  → acid form.
 *  - OH⁻ ions pull H⁺ off acid-form molecules → base form + H₂O.
 * The balance of H⁺ vs OH⁻ (set by pH) decides which form wins.
 */

const ACID_FORM = '#ffd23f'
const BASE_FORM = '#4c86ff'
const H_ION = '#ff6f91'
const OH_ION = '#3ee6ff'
const N_IND = 10
const H = 300

type Kind = 'H' | 'OH' | 'H2O'
interface Ion {
  kind: Kind
  x: number
  y: number
  vx: number
  vy: number
  life: number
}
interface Ind {
  x: number
  y: number
  vx: number
  vy: number
  acid: boolean
  flash: number
  angle: number
  spin: number
}

function ionCounts(ph: number) {
  const nH = ph <= 7 ? Math.round(2 + (7 - ph) * 2.2) : Math.max(0, Math.round(2 - (ph - 7) * 0.8))
  const nOH = ph >= 7 ? Math.round(2 + (ph - 7) * 2.2) : Math.max(0, Math.round(2 - (7 - ph) * 0.8))
  return { nH: Math.min(16, nH), nOH: Math.min(16, nOH) }
}

const rand = (a: number, b: number) => a + Math.random() * (b - a)

export function MoleculeView({ ph }: { ph: number }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()
  const [acidCount, setAcidCount] = useState(N_IND / 2)
  const [run, setRun] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !wrap || !ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let W = wrap.clientWidth

    const size = () => {
      W = wrap.clientWidth
      canvas.width = W * dpr
      canvas.height = H * dpr
      canvas.style.width = `${W}px`
      canvas.style.height = `${H}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    size()
    const ro = new ResizeObserver(size)
    ro.observe(wrap)

    const { nH, nOH } = ionCounts(ph)
    const spawn = (kind: Kind): Ion => ({
      kind,
      x: rand(20, W - 20),
      y: rand(20, H - 20),
      vx: rand(-1, 1),
      vy: rand(-1, 1),
      life: 1,
    })
    const ions: Ion[] = [
      ...Array.from({ length: nH }, () => spawn('H')),
      ...Array.from({ length: nOH }, () => spawn('OH')),
    ]
    // Indicator just added: start as a 50/50 mix, then watch it shift.
    const inds: Ind[] = Array.from({ length: N_IND }, (_, i) => ({
      x: rand(40, W - 40),
      y: rand(40, H - 40),
      vx: rand(-0.5, 0.5),
      vy: rand(-0.5, 0.5),
      acid: i % 2 === 0,
      flash: 0,
      angle: rand(0, Math.PI * 2),
      spin: rand(-0.01, 0.01),
    }))
    const waters = Array.from({ length: 26 }, () => ({ x: rand(0, W), y: rand(0, H), a: rand(0, 6) }))

    if (reduce) {
      // Static end state for reduced motion.
      const frac = 1 / (1 + Math.pow(10, ph - 7))
      inds.forEach((d, i) => (d.acid = i < Math.round(frac * N_IND)))
    }

    const respawn = (kind: Kind) => {
      const ion = spawn(kind)
      const edge = Math.floor(Math.random() * 4)
      if (edge === 0) ion.x = 4
      if (edge === 1) ion.x = W - 4
      if (edge === 2) ion.y = 4
      if (edge === 3) ion.y = H - 4
      ions.push(ion)
    }

    // k = elapsed time in 60fps-frames, so motion speed is frame-rate independent.
    const move = (p: { x: number; y: number; vx: number; vy: number }, jitter: number, max: number, k: number) => {
      p.vx += rand(-jitter, jitter) * k
      p.vy += rand(-jitter, jitter) * k
      const sp = Math.hypot(p.vx, p.vy)
      if (sp > max) {
        p.vx = (p.vx / sp) * max
        p.vy = (p.vy / sp) * max
      }
      p.x += p.vx * k
      p.y += p.vy * k
      if (p.x < 14 || p.x > W - 14) p.vx *= -1
      if (p.y < 14 || p.y > H - 14) p.vy *= -1
      p.x = Math.max(14, Math.min(W - 14, p.x))
      p.y = Math.max(14, Math.min(H - 14, p.y))
    }

    let elapsed = 0
    const step = (k: number) => {
      elapsed += k
      // Brief pause after the indicator is "added" so the starting mix is visible.
      const reacting = elapsed > 70
      for (const w of waters) {
        w.x += 0.15 * k
        if (w.x > W + 10) w.x = -10
        w.a += 0.01 * k
      }
      for (const d of inds) {
        move(d, 0.04, 0.4, k)
        d.angle += d.spin * k
        d.flash = Math.max(0, d.flash - 0.02 * k)
      }
      for (let i = ions.length - 1; i >= 0; i--) {
        const ion = ions[i]
        if (ion.kind === 'H2O') {
          ion.life -= 0.012 * k
          ion.y -= 0.2 * k
          if (ion.life <= 0) ions.splice(i, 1)
          continue
        }
        // Gentle pull toward the nearest molecule this ion can react with,
        // so the reaction story unfolds within a few seconds.
        let target: Ind | null = null
        let best = 320
        for (const d of inds) {
          if ((ion.kind === 'H') === d.acid) continue
          const dist = Math.hypot(d.x - ion.x, d.y - ion.y)
          if (dist < best) {
            best = dist
            target = d
          }
        }
        if (target) {
          ion.vx += ((target.x - ion.x) / best) * 0.02 * k
          ion.vy += ((target.y - ion.y) / best) * 0.02 * k
        }
        move(ion, 0.12, 0.9, k)
        if (!reacting) continue
        for (const d of inds) {
          if (Math.hypot(d.x - ion.x, d.y - ion.y) > 24) continue
          if (ion.kind === 'H' && !d.acid) {
            d.acid = true
            d.flash = 1
            ions.splice(i, 1)
            setTimeout(() => respawn('H'), 500)
            break
          }
          if (ion.kind === 'OH' && d.acid) {
            d.acid = false
            d.flash = 1
            ion.kind = 'H2O'
            ion.life = 1
            setTimeout(() => respawn('OH'), 500)
            break
          }
        }
      }
    }

    const drawIon = (ion: Ion) => {
      ctx.save()
      ctx.translate(ion.x, ion.y)
      if (ion.kind === 'H') {
        ctx.fillStyle = H_ION
        ctx.shadowColor = H_ION
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.arc(0, 0, 6, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.fillStyle = '#2b0614'
        ctx.font = '700 8px "JetBrains Mono Variable", monospace'
        ctx.textAlign = 'center'
        ctx.fillText('H⁺', 0, 3)
      } else {
        ctx.globalAlpha = ion.kind === 'H2O' ? Math.max(0, ion.life) * 0.8 : 1
        const o = ion.kind === 'H2O' ? '#9fc4ff' : OH_ION
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(8, -5, 3.5, 0, Math.PI * 2)
        if (ion.kind === 'H2O') ctx.arc(-8, -5, 3.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = o
        ctx.shadowColor = o
        ctx.shadowBlur = ion.kind === 'OH' ? 10 : 0
        ctx.beginPath()
        ctx.arc(0, 0, 7, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.fillStyle = '#04202a'
        ctx.font = '700 7px "JetBrains Mono Variable", monospace'
        ctx.textAlign = 'center'
        ctx.fillText(ion.kind === 'OH' ? 'OH⁻' : 'H₂O', 0, 2.5)
      }
      ctx.restore()
    }

    const drawInd = (d: Ind) => {
      const c = d.acid ? ACID_FORM : BASE_FORM
      ctx.save()
      ctx.translate(d.x, d.y)
      if (d.flash > 0) {
        ctx.strokeStyle = c
        ctx.globalAlpha = d.flash
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(0, 0, 18 + (1 - d.flash) * 18, 0, Math.PI * 2)
        ctx.stroke()
        ctx.globalAlpha = 1
      }
      ctx.rotate(d.angle)
      // glow
      ctx.fillStyle = c + '33'
      ctx.beginPath()
      ctx.arc(0, 0, 20, 0, Math.PI * 2)
      ctx.fill()
      // hexagon ring (dye molecule core)
      ctx.beginPath()
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2
        const r = 12
        if (k === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r)
        else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r)
      }
      ctx.closePath()
      ctx.fillStyle = c
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.7)'
      ctx.lineWidth = 1.5
      ctx.stroke()
      // side group
      ctx.beginPath()
      ctx.moveTo(12, 0)
      ctx.lineTo(20, 0)
      ctx.stroke()
      if (d.acid) {
        ctx.fillStyle = H_ION
        ctx.beginPath()
        ctx.arc(24, 0, 5, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#2b0614'
        ctx.font = '700 7px "JetBrains Mono Variable", monospace'
        ctx.textAlign = 'center'
        ctx.fillText('H', 24, 2.5)
      } else {
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(23, 0, 4.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#0a1f55'
        ctx.font = '800 9px "JetBrains Mono Variable", monospace'
        ctx.textAlign = 'center'
        ctx.fillText('−', 23, 3)
      }
      ctx.restore()
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = 'rgba(160, 210, 255, 0.12)'
      for (const w of waters) {
        ctx.beginPath()
        ctx.arc(w.x, w.y + Math.sin(w.a) * 4, 2.5, 0, Math.PI * 2)
        ctx.fill()
      }
      inds.forEach(drawInd)
      ions.forEach(drawIon)
    }

    let raf = 0
    let last = 0
    let prev = 0
    const loop = (t: number) => {
      const k = prev ? Math.min(4, (t - prev) / 16.67) : 1
      prev = t
      step(k)
      draw()
      if (t - last > 250) {
        last = t
        setAcidCount(inds.filter((d) => d.acid).length)
      }
      raf = requestAnimationFrame(loop)
    }
    if (reduce) {
      draw()
      setAcidCount(inds.filter((d) => d.acid).length)
    } else raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [ph, reduce, run])

  const env = ph < 6.5 ? 'acid' : ph > 7.5 ? 'base' : 'neutral'
  const baseCount = N_IND - acidCount
  const { nH, nOH } = ionCounts(ph)

  return (
    <div className="mol">
      <div className="mol-stage" ref={wrapRef}>
        <canvas ref={canvasRef} aria-label="Animated particle model of indicator molecules" role="img" />
        <span className="mol-badge">Conceptual model · not to scale</span>
        <button className="btn btn-sm btn-ghost mol-replay" onClick={() => setRun((r) => r + 1)}>
          <RotateCcw size={14} /> Replay
        </button>
      </div>

      <div className="mol-info">
        <div className="mol-legend">
          <span><i className="dot" style={{ background: H_ION }} /> H⁺ ion ({nH})</span>
          <span><i className="dot" style={{ background: OH_ION }} /> OH⁻ ion ({nOH})</span>
          <span><i className="hex" style={{ background: ACID_FORM }} /> Dye — acid form</span>
          <span><i className="hex" style={{ background: BASE_FORM }} /> Dye — base form</span>
        </div>

        <div className="mol-mix">
          <div className="mol-mix-bar" aria-label={`${acidCount} acid form, ${baseCount} base form`}>
            <span style={{ flexGrow: acidCount, background: ACID_FORM }} />
            <span style={{ flexGrow: baseCount, background: BASE_FORM }} />
          </div>
          <div className="mol-mix-labels">
            <span>Acid form: {acidCount}</span>
            <span>Base form: {baseCount}</span>
          </div>
        </div>

        <p className="mol-text">
          {env === 'acid' &&
            'Acidic solution: there are many H⁺ ions (in water they travel as H₃O⁺, hydronium). They latch onto the dye molecules, switching them into their acid form.'}
          {env === 'base' &&
            'Basic solution: OH⁻ ions pull H⁺ off the dye molecules, forming water (H₂O). The molecules switch into their base form.'}
          {env === 'neutral' &&
            'Neutral solution: H⁺ and OH⁻ are balanced, so the dye molecules keep swapping — roughly half end up in each form. A mix of yellow and blue forms looks green.'}
        </p>
        <p className="mol-text">
          <strong>Why the colour changes:</strong> gaining or losing one H⁺ slightly changes a dye molecule's shape, so it
          absorbs different colours of light. Universal indicator is a <em>mix</em> of several dyes like this one, each
          switching at a different pH — together they produce the full rainbow from red to violet.
        </p>
        <div className="mol-result">
          <i style={{ background: phColor(ph) }} />
          <span>
            Universal indicator colour at pH {ph}: what you see in the beaker
          </span>
        </div>
      </div>
    </div>
  )
}
