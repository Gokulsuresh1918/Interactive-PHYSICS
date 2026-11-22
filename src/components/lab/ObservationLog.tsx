import { AnimatePresence, motion } from 'framer-motion'
import { NotebookPen } from 'lucide-react'
import type { Sample } from '../../data/samples'
import { LITMUS_COLORS, describeConductivity, describeLitmus, phColor, phColorName } from '../../lib/chemistry'
import type { BenchTests } from './Workbench'

interface Entry {
  key: string
  text: string
  color: string
}

export function observationsFor(tests: BenchTests, sample: Sample): Entry[] {
  const out: Entry[] = []
  for (const paper of ['red', 'blue'] as const) {
    const o = tests[paper]
    if (o) out.push({ key: paper, text: describeLitmus(o), color: LITMUS_COLORS[o.resultPaper].wet })
  }
  if (tests.indicator) {
    out.push({
      key: 'indicator',
      text: `Universal indicator turned the solution ${phColorName(sample.ph)}`,
      color: phColor(sample.ph),
    })
  }
  if (tests.conductivity) {
    out.push({
      key: 'conductivity',
      text: describeConductivity(tests.conductivity),
      color: tests.conductivity === 'none' ? '#55657f' : '#ffd25a',
    })
  }
  return out
}

/** Running lab notebook of what the student has observed for this sample. */
export function ObservationLog({ tests, sample }: { tests: BenchTests; sample: Sample }) {
  const entries = observationsFor(tests, sample)
  return (
    <div className="obs">
      <p className="obs-title">
        <NotebookPen size={14} /> Lab notebook
      </p>
      {entries.length === 0 ? (
        <p className="obs-empty">No observations yet — use a tool on the beaker.</p>
      ) : (
        <ul className="obs-list">
          <AnimatePresence initial={false}>
            {entries.map((e) => (
              <motion.li
                key={e.key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
              >
                <i style={{ background: e.color }} />
                {e.text}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  )
}
