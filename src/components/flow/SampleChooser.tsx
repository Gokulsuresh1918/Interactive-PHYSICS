import { motion } from 'framer-motion'
import { Check, FlaskConical, Search } from 'lucide-react'
import { MYSTERIES } from '../../data/mysteries'
import { SAMPLES, SAMPLE_BY_ID } from '../../data/samples'
import { sfx } from '../../lib/sound'
import { useSession } from '../../state/session'
import { Bottle } from '../lab/Bottle'
import { Stepper } from './Stepper'

export type ChooserTab = 'known' | 'mystery'

interface SampleChooserProps {
  tab: ChooserTab
  onTab: (t: ChooserTab) => void
  onPickSample: (id: string) => void
  onPickMystery: (id: string) => void
}

const grid = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
}
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const } },
}

/** Screen 2 — pick one sample. Nothing else competes for attention here. */
export function SampleChooser({ tab, onTab, onPickSample, onPickMystery }: SampleChooserProps) {
  const { state } = useSession()

  return (
    <div className="flow">
      <Stepper steps={['Choose sample', 'Choose test', 'Observe', 'Predict', 'Result']} current={0} />

      <div className="screen-head">
        <div>
          <h2>Choose a sample to test</h2>
          <p className="muted">Pick a bottle from the shelf. Each one hides a chemistry secret.</p>
        </div>
        <div className="segmented" role="tablist" aria-label="Sample type">
          <button role="tab" aria-selected={tab === 'known'} className={tab === 'known' ? 'is-active' : ''} onClick={() => onTab('known')}>
            <FlaskConical size={16} /> Known samples
          </button>
          <button role="tab" aria-selected={tab === 'mystery'} className={tab === 'mystery' ? 'is-active' : ''} onClick={() => onTab('mystery')}>
            <Search size={16} /> Mystery samples
          </button>
        </div>
      </div>

      {tab === 'known' ? (
        <motion.div key="known" className="chooser-grid" variants={grid} initial="hidden" animate="show">
          {SAMPLES.map((s) => {
            const litmus = !!state.answered[`litmus:${s.id}`]
            const ph = !!state.answered[`ph:${s.id}`]
            return (
              <motion.button
                key={s.id}
                variants={item}
                className={`sample-card sample-card-photo${litmus && ph ? ' is-complete' : ''}`}
                onClick={() => {
                  sfx.select()
                  onPickSample(s.id)
                }}
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.96 }}
              >
                <span className="sample-photo">
                  <img src={`/images/samples/${s.id}.webp`} alt="" loading="lazy" width={480} height={360} draggable={false} />
                  <span className="sample-swatch" style={{ background: s.liquidColor }} aria-hidden="true">
                    <i style={{ background: s.cap }} />
                  </span>
                </span>
                <span className="sample-name">{s.name}</span>
                <span className="sample-progress" aria-label={`Litmus ${litmus ? 'done' : 'not done'}, pH ${ph ? 'done' : 'not done'}`}>
                  <i className={litmus ? 'is-on' : ''}>Litmus</i>
                  <i className={ph ? 'is-on' : ''}>pH</i>
                </span>
                {litmus && ph && (
                  <span className="sample-check" aria-hidden="true">
                    <Check size={13} strokeWidth={3} />
                  </span>
                )}
              </motion.button>
            )
          })}
          <motion.button
            variants={item}
            className="sample-card sample-card-mystery"
            onClick={() => {
              sfx.click()
              onTab('mystery')
            }}
            whileHover={{ y: -6 }}
            whileTap={{ scale: 0.96 }}
          >
            <span className="sample-bottle">
              <Bottle color="#d9e6f2" opacity={0.6} cap="#8b7cf6" mystery />
            </span>
            <span className="sample-name">Mystery Sample</span>
            <span className="sample-sub">Identify the unknown</span>
          </motion.button>
        </motion.div>
      ) : (
        <motion.div key="mystery" className="chooser-grid" variants={grid} initial="hidden" animate="show">
          {MYSTERIES.map((m) => {
            const solved = !!state.answered[`mystery:${m.id}`]
            return (
              <motion.button
                key={m.id}
                variants={item}
                className={`sample-card sample-card-mystery${solved ? ' is-complete' : ''}`}
                onClick={() => {
                  sfx.select()
                  onPickMystery(m.id)
                }}
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.96 }}
              >
                <span className="sample-bottle">
                  <Bottle color="#d9e6f2" opacity={0.6} cap="#8b7cf6" mystery code={m.code} />
                </span>
                <span className="sample-name">Unknown #{m.code}</span>
                <span className="sample-sub">{solved ? `Solved: ${SAMPLE_BY_ID[m.sampleId].name}` : 'Not solved yet'}</span>
                {solved && (
                  <span className="sample-check" aria-hidden="true">
                    <Check size={13} strokeWidth={3} />
                  </span>
                )}
              </motion.button>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
