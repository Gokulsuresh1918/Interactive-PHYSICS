import { useId } from 'react'

interface BottleProps {
  color: string
  opacity: number
  /** Cap colour — helps tell bottles apart at a glance. */
  cap?: string
  /** Mystery vials are frosted and show a question mark. */
  mystery?: boolean
  code?: string
}

/** Glass sample bottle drawn in SVG. */
export function Bottle({ color, opacity, cap = '#2a8cf0', mystery, code }: BottleProps) {
  const id = useId().replace(/:/g, '')
  const body = 'M22 34 h26 v6 q12 6 12 20 v50 q0 10 -10 10 h-30 q-10 0 -10 -10 v-50 q0 -14 12 -20z'
  return (
    <svg viewBox="0 0 70 124" className="bottle-svg" aria-hidden="true">
      <defs>
        <clipPath id={`b-${id}`}>
          <path d={body} />
        </clipPath>
        <linearGradient id={`g-${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.8" />
          <stop offset="0.3" stopColor="#fff" stopOpacity="0.15" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      <ellipse cx="35" cy="121" rx="24" ry="3" fill="#5c7ea3" opacity="0.18" />
      <path d={body} fill="#f4f9ff" />
      <g clipPath={`url(#b-${id})`}>
        <g className="bottle-liquid">
          <rect x="0" y="62" width="70" height="70" fill={color} fillOpacity={opacity} />
          <path
            className="bottle-wave"
            d="M-10 63 q6 -4 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 v6 h-84z"
            fill={color}
            fillOpacity={Math.min(1, opacity + 0.15)}
          />
          <circle className="bottle-bubble" cx="30" cy="104" r="2" fill="#fff" />
          <circle className="bottle-bubble bottle-bubble-2" cx="42" cy="108" r="1.5" fill="#fff" />
        </g>
        {mystery && <rect x="0" y="30" width="70" height="100" fill="#ffffff" opacity="0.35" />}
      </g>
      <path d={body} fill={`url(#g-${id})`} stroke="#8fa9c6" strokeWidth="2" />
      <rect x="20" y="16" width="30" height="20" rx="5" fill={cap} />
      <rect x="20" y="16" width="30" height="5" rx="2.5" fill="#fff" opacity="0.3" />
      <path d="M17 58 q-2 20 0 46" stroke="#fff" strokeOpacity="0.9" strokeWidth="3" fill="none" strokeLinecap="round" />
      {mystery && (
        <>
          <text x="35" y="96" textAnchor="middle" className="bottle-q">
            ?
          </text>
          {code && (
            <text x="35" y="30" textAnchor="middle" className="bottle-code">
              #{code}
            </text>
          )}
        </>
      )}
    </svg>
  )
}
