import { useCallback } from 'react'
import type { RefObject } from 'react'

/** Convert a pointer position on screen to SVG user coordinates. */
export function useSvgPoint(svgRef: RefObject<SVGSVGElement | null>) {
  return useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current
      const ctm = svg?.getScreenCTM()
      if (!svg || !ctm) return { x: 0, y: 0 }
      const p = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse())
      return { x: p.x, y: p.y }
    },
    [svgRef],
  )
}

export const rad = (d: number) => (d * Math.PI) / 180
export const deg = (r: number) => (r * 180) / Math.PI
export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

/** SVG arc path from angle a1 to a2 (degrees, 0 = up, clockwise positive) around (cx, cy). */
export function arcPath(cx: number, cy: number, r: number, a1: number, a2: number) {
  const p = (a: number) => [cx + r * Math.sin(rad(a)), cy - r * Math.cos(rad(a))]
  const [x1, y1] = p(a1)
  const [x2, y2] = p(a2)
  const large = Math.abs(a2 - a1) > 180 ? 1 : 0
  const sweep = a2 > a1 ? 1 : 0
  return `M${x1} ${y1} A${r} ${r} 0 ${large} ${sweep} ${x2} ${y2}`
}

/** Point at angle a (degrees, 0 = up, clockwise) and distance r from (cx, cy). */
export function polar(cx: number, cy: number, r: number, a: number) {
  return { x: cx + r * Math.sin(rad(a)), y: cy - r * Math.cos(rad(a)) }
}
