import type { Sample } from '../../data/samples'
import { LITMUS_COLORS, phColor } from '../../lib/chemistry'
import { ObservationLog } from '../lab/ObservationLog'
import type { BenchTests } from '../lab/Workbench'

/**
 * Compact snapshot of what the student observed, shown next to each question
 * so they can answer without going back to the bench.
 */
export function Evidence({ sample, tests, masked }: { sample: Sample; tests: BenchTests; masked?: boolean }) {
  const liquid = tests.indicator ? phColor(sample.ph) : masked ? '#d9e6f2' : sample.liquidColor
  const opacity = tests.indicator ? 0.9 : 0.6
  const strips = (['red', 'blue'] as const).filter((p) => tests[p])

  return (
    <div className="evidence">
      <p className="eyebrow">Your evidence</p>
      <div className="evidence-art">
        <svg viewBox="0 0 120 120" className="evidence-beaker" aria-hidden="true">
          <defs>
            <clipPath id="ev-clip">
              <path d="M24 20 V96 Q24 108 36 108 H84 Q96 108 96 96 V20 Z" />
            </clipPath>
          </defs>
          <g clipPath="url(#ev-clip)">
            <rect x="20" y="52" width="80" height="60" fill={liquid} fillOpacity={opacity} />
            <rect x="20" y="52" width="80" height="3" fill="#ffffff" opacity="0.6" />
          </g>
          <path
            d="M18 16 Q24 18 24 24 V96 Q24 108 36 108 H84 Q96 108 96 96 V24 Q96 18 102 16"
            fill="none"
            stroke="#8fa9c6"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path d="M32 30 V92" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
        </svg>
        {strips.map((p) => {
          const o = tests[p]!
          return (
            <svg key={p} viewBox="0 0 30 120" className="evidence-strip" aria-hidden="true">
              <rect x="4" y="6" width="22" height="108" rx="3" fill={LITMUS_COLORS[p].dry} />
              <rect x="4" y="58" width="22" height="56" rx="3" fill={LITMUS_COLORS[o.resultPaper].wet} />
              <rect x="2" y="2" width="26" height="12" rx="3" fill="#5b6f8c" />
            </svg>
          )
        })}
      </div>
      <ObservationLog tests={tests} sample={sample} />
    </div>
  )
}
