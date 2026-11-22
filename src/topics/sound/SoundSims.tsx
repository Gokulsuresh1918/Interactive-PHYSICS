import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { Music, Pause, Play, ScanSearch, Volume1, Volume2, VolumeX } from 'lucide-react'
import { Slider } from '../../components/common/Slider'
import { createTone, onSoundToggle, sfx, soundEnabled } from '../../lib/sound'
import type { SimProps } from '../types'
import './sound.css'

const SPEED = 343 // m/s in air
const WINDOW_M = 3.43 // metres of air shown on screen
const PINK = '#e64980'

type Mode = 'pitch' | 'loudness' | 'match'

const TARGETS = [
  { f: 600, a: 40 },
  { f: 250, a: 80 },
  { f: 800, a: 70 },
  { f: 400, a: 30 },
]

function pitchName(f: number) {
  return f < 300 ? 'Low' : f < 650 ? 'Medium' : 'High'
}

function SoundLab({ mode, onReady, onChallenge, challengeDone }: { mode: Mode } & SimProps) {
  const [freq, setFreq] = useState(mode === 'match' ? 400 : 300)
  const [amp, setAmp] = useState(mode === 'match' ? 60 : 50)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(!soundEnabled())
  const [target] = useState(() => TARGETS[Math.floor(Math.random() * TARGETS.length)])
  const seen = useRef({ low: false, high: false, quiet: false, loud: false })
  const [tick, setTick] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const tone = useRef<ReturnType<typeof createTone>>(null)
  const params = useRef({ freq, amp })
  useEffect(() => {
    params.current = { freq, amp }
  }, [freq, amp])
  const reduce = useReducedMotion()

  // Track exploration
  useEffect(() => {
    const s = seen.current
    if (freq < 300) s.low = true
    if (freq > 700) s.high = true
    if (amp <= 30) s.quiet = true
    if (amp >= 80) s.loud = true
    setTick((t) => t + 1)
  }, [freq, amp])

  const closeness = Math.max(0, 1 - Math.abs(freq - target.f) / 400 - Math.abs(amp - target.a) / 100)
  const matched = Math.abs(freq - target.f) <= 50 && Math.abs(amp - target.a) <= 12

  useEffect(() => {
    const s = seen.current
    const lambda = (SPEED / freq).toFixed(2)
    if (mode === 'pitch') onReady(s.low && s.high, `${freq} Hz · λ = ${lambda} m · ${pitchName(freq)} pitch${!(s.low && s.high) ? ` · tried low ${s.low ? '✓' : '✗'} high ${s.high ? '✓' : '✗'}` : ''}`)
    else if (mode === 'loudness') onReady(s.quiet && s.loud, `Amplitude ${amp}% · tried quiet ${s.quiet ? '✓' : '✗'} loud ${s.loud ? '✓' : '✗'}`)
    else onReady(!!challengeDone, `Match: ${Math.round(closeness * 100)}%`)
  }, [tick, mode, freq, amp, closeness, challengeDone, onReady])

  // Continuous tone (only when the student presses Play)
  useEffect(() => {
    tone.current?.set(freq, amp / 100)
  }, [freq, amp])
  useEffect(
    () =>
      onSoundToggle((on) => {
        setMuted(!on)
        if (!on) {
          tone.current?.stop()
          tone.current = null
          setPlaying(false)
        }
      }),
    [],
  )
  useEffect(() => () => tone.current?.stop(), [])

  const togglePlay = () => {
    if (playing) {
      tone.current?.stop()
      tone.current = null
      setPlaying(false)
      return
    }
    tone.current = createTone(freq, amp / 100)
    setPlaying(!!tone.current)
  }

  // Animated drawing
  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !wrap || !ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let W = 0
    const H = 360
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
    let raf = 0
    let phase = 0
    let prev = 0

    const draw = (t: number) => {
      const dt = prev ? Math.min(0.05, (t - prev) / 1000) : 0
      prev = t
      const { freq: f, amp: a } = params.current
      const cycles = WINDOW_M / (SPEED / f) // waves visible across the screen
      if (!reduce) phase += dt * (f / 220) * Math.PI * 2 // visual slow-motion
      const A = a / 100
      ctx.clearRect(0, 0, W, H)

      // --- air particles (longitudinal view) ---
      const top = 18
      const rows = 5
      const cols = Math.floor(W / 14)
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x0 = (c + 0.5) * (W / cols)
          const k = (x0 / W) * cycles * Math.PI * 2
          const dx = Math.sin(k - phase) * A * 9
          const density = Math.cos(k - phase) * A
          ctx.beginPath()
          ctx.fillStyle = `rgba(230, 73, 128, ${0.35 + 0.45 * (0.5 + density / 2)})`
          ctx.arc(x0 + dx, top + 10 + r * 16, 3.2, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.fillStyle = '#8195ad'
      ctx.font = '700 11px "Manrope Variable", sans-serif'
      ctx.fillText('AIR PARTICLES', 10, top + rows * 16 + 18)

      // --- waveform ---
      const mid = 235
      const amplitudePx = 100
      ctx.strokeStyle = '#e4ecf5'
      ctx.lineWidth = 1
      for (let y = mid - 100; y <= mid + 100; y += 50) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(W, y)
        ctx.stroke()
      }
      const wave = (fq: number, aa: number) => {
        const cy = WINDOW_M / (SPEED / fq)
        ctx.beginPath()
        for (let x = 0; x <= W; x += 2) {
          const y = mid - Math.sin((x / W) * cy * Math.PI * 2 - phase * (fq / f)) * aa * amplitudePx
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
      }
      if (mode === 'match') {
        ctx.setLineDash([8, 8])
        ctx.strokeStyle = 'rgba(124, 77, 255, 0.75)'
        ctx.lineWidth = 3
        wave(target.f, target.a / 100)
        ctx.setLineDash([])
      }
      ctx.strokeStyle = PINK
      ctx.lineWidth = 4
      ctx.shadowColor = 'rgba(230, 73, 128, 0.35)'
      ctx.shadowBlur = 10
      wave(f, A)
      ctx.shadowBlur = 0

      // --- wavelength bracket & amplitude arrow (static positions) ---
      const lambdaPx = W / cycles
      if (lambdaPx < W * 0.9 && mode !== 'match') {
        const x1 = 20
        const x2 = 20 + lambdaPx
        const y = mid + amplitudePx + 18
        ctx.strokeStyle = '#2a8cf0'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(x1, y - 6)
        ctx.lineTo(x1, y + 6)
        ctx.moveTo(x1, y)
        ctx.lineTo(x2, y)
        ctx.moveTo(x2, y - 6)
        ctx.lineTo(x2, y + 6)
        ctx.stroke()
        ctx.fillStyle = '#2a8cf0'
        ctx.font = '800 12px "JetBrains Mono Variable", monospace'
        ctx.fillText(`λ = ${(SPEED / f).toFixed(2)} m`, x1 + 6, y - 8)
      }
      if (mode !== 'match') {
        const ax = W - 40
        ctx.strokeStyle = '#12b3a2'
        ctx.fillStyle = '#12b3a2'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(ax, mid)
        ctx.lineTo(ax, mid - A * amplitudePx)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(ax - 6, mid - A * amplitudePx + 8)
        ctx.lineTo(ax, mid - A * amplitudePx)
        ctx.lineTo(ax + 6, mid - A * amplitudePx + 8)
        ctx.fill()
        ctx.font = '800 12px "JetBrains Mono Variable", monospace'
        ctx.textAlign = 'right'
        ctx.fillText('amplitude', ax - 8, mid - (A * amplitudePx) / 2)
        ctx.textAlign = 'left'
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [mode, target, reduce])

  const check = () => {
    if (!onChallenge || challengeDone) return
    onChallenge({
      correct: matched,
      given: `${freq} Hz, ${amp}%`,
      explain: matched
        ? `Spot on! The mystery sound was ${target.f} Hz at ${target.a}% amplitude — you matched both pitch and loudness.`
        : `The mystery sound was ${target.f} Hz at ${target.a}% amplitude. You chose ${freq} Hz at ${amp}%. ${Math.abs(freq - target.f) > 50 ? 'Count the waves to match the frequency' : 'The frequency was right'}; ${Math.abs(amp - target.a) > 12 ? 'compare the wave heights to match the amplitude.' : 'the amplitude was right.'}`,
    })
  }

  const bars = Math.round((amp / 100) * 8)
  return (
    <div className="sim">
      <div className="sim-stage sound-stage" ref={wrapRef}>
        <canvas ref={canvasRef} role="img" aria-label={`Sound wave at ${freq} hertz and ${amp} percent amplitude`} />
        <div className="sound-meters">
          <span className="meter">
            <Music size={15} /> {pitchName(freq)} pitch
          </span>
          <span className="meter" aria-label={`Loudness ${amp}%`}>
            {amp < 35 ? <Volume1 size={15} /> : <Volume2 size={15} />}
            <span className="meter-bars">
              {Array.from({ length: 8 }, (_, i) => (
                <i key={i} className={i < bars ? 'is-on' : ''} />
              ))}
            </span>
          </span>
          {mode === 'match' && <span className={`meter${matched ? ' is-match' : ''}`}>Match {Math.round(closeness * 100)}%</span>}
        </div>
      </div>
      <div className="sim-controls">
        <Slider label="Frequency (pitch)" value={freq} min={100} max={1000} step={10} unit=" Hz" color={PINK} onChange={setFreq} />
        <Slider label="Amplitude (loudness)" value={amp} min={10} max={100} step={5} unit="%" color="#12b3a2" onChange={setAmp} />
        <div className="motion-actions">
          <button className="btn" onClick={togglePlay} disabled={muted} title={muted ? 'Turn sound on in the top bar to listen' : undefined}>
            {muted ? <VolumeX size={16} /> : playing ? <Pause size={16} /> : <Play size={16} />}
            {muted ? 'Sound is off' : playing ? 'Stop sound' : 'Play sound'}
          </button>
          {mode === 'match' && (
            <button className="btn btn-primary" onClick={() => { sfx.click(); check() }} disabled={challengeDone}>
              <ScanSearch size={16} /> {challengeDone ? 'Challenge done' : 'Check match'}
            </button>
          )}
        </div>
      </div>
      <div className="sim-readouts">
        <span className="readout is-key">
          <small>Frequency</small>
          <strong>{freq} Hz</strong>
        </span>
        <span className="readout">
          <small>Wavelength</small>
          <strong>{(SPEED / freq).toFixed(2)} m</strong>
        </span>
        <span className="readout is-key">
          <small>Amplitude</small>
          <strong>{amp}%</strong>
        </span>
        <span className="readout">
          <small>Speed of sound</small>
          <strong>343 m/s</strong>
        </span>
      </div>
    </div>
  )
}

export const PitchSim = (p: SimProps) => <SoundLab mode="pitch" {...p} />
export const LoudnessSim = (p: SimProps) => <SoundLab mode="loudness" {...p} />
export const MatchSim = (p: SimProps) => <SoundLab mode="match" {...p} />
