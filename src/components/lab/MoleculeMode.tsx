import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { SAMPLES } from '../../data/samples'
import type { Sample } from '../../data/samples'
import { formatPhRange, phColor } from '../../lib/chemistry'
import { sfx } from '../../lib/sound'
import { MoleculeView } from './MoleculeView'

/** Free-exploration tab: pick a substance and watch the indicator molecules respond. */
export function MoleculeMode() {
  const [selected, setSelected] = useState('lemon')
  const sample = SAMPLES.find((s) => s.id === selected)!
  return (
    <div className="mode">
      <section className="glass panel">
        <p className="eyebrow">Microscope view</p>
        <h3 className="panel-title">Why do indicators change colour?</h3>
        <p className="muted">
          Zoom into a drop of solution with indicator added. Choose an environment and watch how H⁺ and OH⁻ ions change
          the dye molecules. Exploring here does not affect your score.
        </p>
        <div className="env-chips" role="radiogroup" aria-label="Choose a solution">
          {SAMPLES.map((s) => (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={s.id === selected}
              className={`env-chip${s.id === selected ? ' is-selected' : ''}`}
              onClick={() => {
                sfx.click()
                setSelected(s.id)
              }}
            >
              <i style={{ background: phColor(s.ph) }} />
              {s.name}
              <span>pH {formatPhRange(s.phRange).replace('≈ ', '')}</span>
            </button>
          ))}
        </div>
      </section>
      <section className="glass panel">
        <MoleculeView key={sample.id} ph={sample.ph} />
      </section>
    </div>
  )
}

/** Modal version opened from a pH result ("Why this colour?"). */
export function MoleculeModal({ sample, onClose }: { sample: Sample | null; onClose: () => void }) {
  useEffect(() => {
    if (!sample) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sample, onClose])

  return (
    <AnimatePresence>
      {sample && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal glass"
            role="dialog"
            aria-modal="true"
            aria-label={`Molecular view of ${sample.name}`}
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <p className="eyebrow">Microscope view</p>
                <h3 className="panel-title">
                  Inside {sample.name.toLowerCase()} (pH {formatPhRange(sample.phRange).replace('≈ ', '')})
                </h3>
              </div>
              <button className="btn btn-icon btn-ghost" onClick={onClose} aria-label="Close" autoFocus>
                <X size={18} />
              </button>
            </div>
            <MoleculeView ph={sample.ph} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
