import { PH_COLORS } from '../../lib/chemistry'

/** Decorative animated lab illustration for the welcome screen. */
export function HeroLabScene() {
  const tubes = [1, 3, 5, 7, 9, 11, 13]
  return (
    <svg className="hero-scene" viewBox="0 0 520 440" role="img" aria-label="Animated laboratory glassware">
      <defs>
        <linearGradient id="hero-glass" x1="0" x2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity="0.15" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="hero-flask-liquid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5fd3f5" />
          <stop offset="1" stopColor="#2a8cf0" />
        </linearGradient>
        <linearGradient id="hero-round-liquid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff8a5c" />
          <stop offset="1" stopColor="#e3241c" />
        </linearGradient>
        <radialGradient id="hero-floor" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#2a8cf0" stopOpacity="0.18" />
          <stop offset="1" stopColor="#2a8cf0" stopOpacity="0" />
        </radialGradient>
        <clipPath id="hero-flask-clip">
          <path d="M228 120 h44 v70 l64 118 q10 22 -14 22 h-144 q-24 0 -14 -22 l64 -118z" />
        </clipPath>
        <clipPath id="hero-round-clip">
          <circle cx="400" cy="262" r="58" />
        </clipPath>
        <filter id="hero-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      <ellipse cx="260" cy="350" rx="230" ry="26" fill="url(#hero-floor)" />

      {/* orbiting molecule */}
      <g className="hero-orbit">
        <circle cx="120" cy="96" r="16" fill="#8b7cf6" />
        <circle cx="96" cy="74" r="8" fill="#f2557a" />
        <circle cx="146" cy="78" r="8" fill="#f2557a" />
        <line x1="120" y1="96" x2="96" y2="74" stroke="#8fa9c6" strokeWidth="3" />
        <line x1="120" y1="96" x2="146" y2="78" stroke="#8fa9c6" strokeWidth="3" opacity="0.6" />
      </g>

      {/* Erlenmeyer flask */}
      <g className="hero-bob">
        <g clipPath="url(#hero-flask-clip)">
          <rect x="140" y="220" width="220" height="120" fill="url(#hero-flask-liquid)" opacity="0.85" />
          <path className="hero-wave" d="M100 222 q20 -8 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 v20 h-280z" fill="#9ee6ff" opacity="0.8" />
          {[200, 240, 270, 300].map((x, i) => (
            <circle key={x} className="hero-bubble" cx={x} cy="330" r={3 + (i % 2) * 2} fill="#ffffff" opacity="0.9" style={{ animationDelay: `${i * 0.7}s` }} />
          ))}
        </g>
        <path d="M228 120 h44 v70 l64 118 q10 22 -14 22 h-144 q-24 0 -14 -22 l64 -118z" fill="url(#hero-glass)" stroke="#8fa9c6" strokeWidth="2.5" />
        <rect x="222" y="112" width="56" height="10" rx="5" fill="none" stroke="#8fa9c6" strokeWidth="2.5" />
        <path d="M240 200 l-48 92" stroke="#fff" strokeOpacity="0.9" strokeWidth="5" strokeLinecap="round" />
      </g>

      {/* round-bottom flask */}
      <g className="hero-bob hero-bob-delay">
        <g clipPath="url(#hero-round-clip)">
          <rect x="330" y="258" width="140" height="70" fill="url(#hero-round-liquid)" opacity="0.85" />
          <path className="hero-wave" d="M300 260 q15 -6 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 v12 h-210z" fill="#ffb08a" opacity="0.7" />
        </g>
        <circle cx="400" cy="262" r="58" fill="url(#hero-glass)" stroke="#8fa9c6" strokeWidth="2.5" />
        <rect x="386" y="168" width="28" height="40" fill="url(#hero-glass)" stroke="#8fa9c6" strokeWidth="2.5" />
        <path d="M368 230 a40 40 0 0 0 -6 44" stroke="#fff" strokeOpacity="0.9" strokeWidth="5" fill="none" strokeLinecap="round" />
        <g className="hero-steam">
          <circle cx="400" cy="150" r="6" fill="#ffb59c" opacity="0.6" />
          <circle cx="408" cy="130" r="4" fill="#ffb59c" opacity="0.5" />
        </g>
      </g>

      {/* pH test-tube rack */}
      <g transform="translate(0 200)">
        <rect x="0" y="118" width="156" height="14" rx="4" fill="#c9d9ea" />
        {tubes.map((ph, i) => (
          <g key={ph} transform={`translate(${8 + i * 20} 0)`}>
            <rect x="0" y="40" width="14" height="80" rx="7" fill={PH_COLORS[ph]} opacity="0.85" className="hero-tube" style={{ animationDelay: `${i * 0.25}s` }} />
            <rect x="0" y="0" width="14" height="120" rx="7" fill="url(#hero-glass)" stroke="#8fa9c6" strokeWidth="1.5" />
          </g>
        ))}
      </g>

      {/* glowing drop */}
      <g className="hero-drop">
        <path d="M250 40 q8 14 0 22 q-8 -8 0 -22z" fill="#4cbb47" />
        <circle cx="250" cy="56" r="10" fill="#4cbb47" opacity="0.3" filter="url(#hero-glow)" />
      </g>
    </svg>
  )
}
