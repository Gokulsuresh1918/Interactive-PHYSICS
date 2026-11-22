import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import './ambient.css'

interface Bubble {
  x: number
  y: number
  r: number
  vy: number
  drift: number
  phase: number
  alpha: number
}

/** Light ambient atmosphere: pastel light blobs + slowly rising soap-like bubbles. */
export function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    let w = 0
    let h = 0
    let raf = 0
    let prev = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const bubbles: Bubble[] = []

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

    const count = Math.round(Math.min(34, (w * h) / 42000))
    for (let i = 0; i < count; i++) {
      bubbles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 2 + Math.random() * 7,
        vy: 0.12 + Math.random() * 0.3,
        drift: 0.3 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.12 + Math.random() * 0.22,
      })
    }

    const rgb = getComputedStyle(document.documentElement).getPropertyValue('--particle').trim()

    const draw = (t: number) => {
      const k = prev ? Math.min(4, (t - prev) / 16.67) : 1
      prev = t
      ctx.clearRect(0, 0, w, h)
      for (const b of bubbles) {
        if (!reduce) {
          b.y -= b.vy * k
          b.x += Math.sin(t / 2600 + b.phase) * 0.15 * b.drift * k
          if (b.y < -12) {
            b.y = h + 12
            b.x = Math.random() * w
          }
        }
        ctx.beginPath()
        ctx.strokeStyle = `rgba(${rgb}, ${b.alpha})`
        ctx.lineWidth = 1.2
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
        ctx.stroke()
        ctx.beginPath()
        ctx.fillStyle = `rgba(255, 255, 255, ${b.alpha * 2.5})`
        ctx.arc(b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.25, 0, Math.PI * 2)
        ctx.fill()
      }
      if (!reduce && !document.hidden) raf = requestAnimationFrame(draw)
    }

    const onVisible = () => {
      cancelAnimationFrame(raf)
      prev = 0
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
  }, [reduce])

  return (
    <div className="ambient" aria-hidden="true">
      <div className="ambient-blob ambient-blob-a" />
      <div className="ambient-blob ambient-blob-b" />
      <div className="ambient-blob ambient-blob-c" />
      <canvas ref={canvasRef} className="ambient-canvas" />
    </div>
  )
}
