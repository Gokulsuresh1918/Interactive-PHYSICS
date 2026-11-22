import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useSettings } from '../../state/settings'
import './ambient.css'

interface Mote {
  x: number
  y: number
  r: number
  vy: number
  drift: number
  phase: number
  alpha: number
}

/** Full-screen ambient lab atmosphere: soft light blobs + slow rising motes. */
export function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()
  const { theme } = useSettings()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    let w = 0
    let h = 0
    let raf = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const motes: Mote[] = []

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const count = Math.round(Math.min(55, (w * h) / 26000))
    for (let i = 0; i < count; i++) {
      motes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.6 + Math.random() * 2.2,
        vy: 0.08 + Math.random() * 0.25,
        drift: 0.3 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.15 + Math.random() * 0.45,
      })
    }

    const rgb = getComputedStyle(document.documentElement).getPropertyValue('--particle').trim()

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h)
      for (const m of motes) {
        if (!reduce) {
          m.y -= m.vy
          m.x += Math.sin(t / 2400 + m.phase) * 0.12 * m.drift
          if (m.y < -10) {
            m.y = h + 10
            m.x = Math.random() * w
          }
        }
        const twinkle = 0.65 + 0.35 * Math.sin(t / 900 + m.phase)
        ctx.beginPath()
        ctx.fillStyle = `rgba(${rgb}, ${m.alpha * twinkle})`
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2)
        ctx.fill()
        if (m.r > 1.8) {
          ctx.beginPath()
          ctx.fillStyle = `rgba(${rgb}, ${0.06 * twinkle})`
          ctx.arc(m.x, m.y, m.r * 4, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      if (!reduce && !document.hidden) raf = requestAnimationFrame(draw)
    }

    const onVisible = () => {
      cancelAnimationFrame(raf)
      if (!document.hidden) raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [reduce, theme])

  return (
    <div className="ambient" aria-hidden="true">
      <div className="ambient-blob ambient-blob-a" />
      <div className="ambient-blob ambient-blob-b" />
      <div className="ambient-grid" />
      <canvas ref={canvasRef} className="ambient-canvas" />
      <div className="ambient-vignette" />
    </div>
  )
}
