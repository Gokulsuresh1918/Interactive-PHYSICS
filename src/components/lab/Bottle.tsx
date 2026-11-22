import { useId } from 'react'

interface BottleProps {
  color: string
  opacity: number
  /** Mystery vials are frosted and show a question mark. */
  mystery?: boolean
  code?: string
}

/** Glass sample bottle drawn in SVG. */
export function Bottle({ color, opacity, mystery, code }: BottleProps) {
  const id = useId().replace(/:/g, '')
  const body = 'M22 34 h26 v6 q12 6 12 20 v50 q0 10 -10 10 h-30 q-10 0 -10 -10 v-50 q0 -14 12 -20z'
  return (
    <svg viewBox="0 0 70 124" className="bottle-svg" aria-hidden="true">
      <defs>
        <clipPath id={`b-${id}`}>
          <path d={body} />
        </clipPath>
        <linearGradient id={`g-${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="0.3" stopColor="#fff" stopOpacity="0.04" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.14" />
        </linearGradient>
      </defs>
      <ellipse cx="35" cy="121" rx="24" ry="3" fill="#000" opacity="0.35" />
      <g clipPath={`url(#b-${id})`}>
        <g className="bottle-liquid">
          <rect x="0" y="62" width="70" height="70" fill={color} fillOpacity={opacity} />
          <path className="bottle-wave" d="M-10 63 q6 -4 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 v6 h-84z" fill={color} fillOpacity={Math.min(1, opacity + 0.15)} />
        </g>
        {mystery && <rect x="0" y="30" width="70" height="100" fill="#cfe3f0" opacity="0.22" />}
      </g>
      <path d={body} fill={`url(#g-${id})`} stroke="#cdeeff" strokeOpacity="0.6" strokeWidth="2" />
      <rect x="20" y="16" width="30" height="20" rx="4" fill={mystery ? '#3b2f6b' : '#21406e'} stroke="#cdeeff" strokeOpacity="0.4" />
      <rect x="20" y="16" width="30" height="5" rx="2" fill="#fff" opacity="0.12" />
      <path d="M17 58 q-2 20 0 46" stroke="#fff" strokeOpacity="0.4" strokeWidth="3" fill="none" strokeLinecap="round" />
      {mystery && (
        <>
          <text x="35" y="96" textAnchor="middle" className="bottle-q">?</text>
          {code && (
            <text x="35" y="31" textAnchor="middle" className="bottle-code">
              #{code}
            </text>
          )}
        </>
      )}
    </svg>
  )
}
